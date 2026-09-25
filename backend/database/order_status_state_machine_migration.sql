-- ==============================================================================
-- CORPORATE TECHNOLOGIES BD - ORDER STATUS STATE MACHINE & AUDIT LOG MIGRATION
-- Enforcement: Database Trigger & Concurrency-Safe Security Definer RPC
-- Valid Statuses: pending, confirmed, processing, shipped, delivered, cancelled
-- ==============================================================================

-- 1. ORDER_STATUS_HISTORY TABLE (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_by_email TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

-- 2. ENSURE STRICT STATUS CHECK CONSTRAINT ON ORDERS TABLE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_orders_valid_status'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT check_orders_valid_status 
            CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. ENABLE RLS ON ORDER_STATUS_HISTORY
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin view order status history" ON public.order_status_history;
CREATE POLICY "Admin view order status history" ON public.order_status_history
    FOR SELECT TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Customer view own order status history" ON public.order_status_history;
CREATE POLICY "Customer view own order status history" ON public.order_status_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_status_history.order_id
            AND auth.uid() IS NOT NULL
            AND orders.customer_id = auth.uid()
        )
    );

-- 4. STRICT DATABASE-LEVEL STATE MACHINE VALIDATION & AUDIT TRIGGER
CREATE OR REPLACE FUNCTION public.fn_validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_email TEXT;
    v_is_valid BOOLEAN := false;
BEGIN
    -- Only validate and audit when order_status is actually changing
    IF NEW.order_status IS DISTINCT FROM OLD.order_status THEN
        -- 4.1 Ensure target status is in the allowed vocabulary
        IF NEW.order_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid target order status "%". Must be one of: pending, confirmed, processing, shipped, delivered, cancelled', NEW.order_status 
            USING ERRCODE = '22023';
        END IF;

        -- 4.2 Strict State Machine Validation:
        -- Allowed transitions:
        --   pending    -> confirmed | cancelled
        --   confirmed  -> processing | cancelled
        --   processing -> shipped
        --   shipped    -> delivered
        -- Terminal states:
        --   delivered  -> [none]
        --   cancelled  -> [none]
        IF (OLD.order_status = 'pending' AND NEW.order_status IN ('confirmed', 'cancelled')) OR
           (OLD.order_status = 'confirmed' AND NEW.order_status IN ('processing', 'cancelled')) OR
           (OLD.order_status = 'processing' AND NEW.order_status = 'shipped') OR
           (OLD.order_status = 'shipped' AND NEW.order_status = 'delivered') THEN
            v_is_valid := true;
        END IF;

        IF NOT v_is_valid THEN
            RAISE EXCEPTION 'Illegal order status transition from "%" to "%". Allowed transitions: pending -> [confirmed, cancelled], confirmed -> [processing, cancelled], processing -> [shipped], shipped -> [delivered]. Terminal states [delivered, cancelled] cannot be transitioned.', 
                OLD.order_status, NEW.order_status 
            USING ERRCODE = '23514';
        END IF;

        -- 4.3 Side-effects: Auto-update payment status to 'paid' when delivered via COD
        IF NEW.order_status = 'delivered' AND NEW.payment_method = 'cod' AND NEW.payment_status = 'unpaid' THEN
            NEW.payment_status := 'paid';
        END IF;

        -- 4.4 Automatic Inventory Restock on Order Cancellation
        IF NEW.order_status = 'cancelled' AND OLD.order_status != 'cancelled' THEN
            UPDATE public.products p
            SET stock_quantity = p.stock_quantity + oi.quantity,
                updated_at = NOW()
            FROM public.order_items oi
            WHERE oi.order_id = NEW.id
              AND (
                  p.id::TEXT = oi.product_id
                  OR p.slug = oi.product_id
                  OR p.title = oi.product_title
              );
        END IF;

        -- 4.5 Record Audit Log in order_status_history within same transaction
        IF v_caller_id IS NOT NULL THEN
            SELECT email INTO v_caller_email FROM public.admin_profiles WHERE id = v_caller_id;
        END IF;

        INSERT INTO public.order_status_history (
            order_id,
            old_status,
            new_status,
            changed_by,
            changed_by_email,
            notes,
            created_at
        ) VALUES (
            NEW.id,
            OLD.order_status,
            NEW.order_status,
            v_caller_id,
            v_caller_email,
            NEW.admin_notes,
            NOW()
        );
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_order_status_transition ON public.orders;
CREATE TRIGGER trg_validate_order_status_transition
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_validate_order_status_transition();

-- 5. SECURE ORDER STATUS UPDATE RPC (ROW-LOCKING FOR CONCURRENCY & STRICT RBAC)
CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_caller_role TEXT;
    v_caller_email TEXT;
    v_current_order RECORD;
    v_items JSONB;
BEGIN
    -- 5.1 Authorization Check: Caller must be authenticated staff or admin
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: Caller is not authenticated' USING ERRCODE = '42501';
    END IF;

    SELECT role, email INTO v_caller_role, v_caller_email
    FROM public.admin_profiles
    WHERE id = v_caller_id AND is_active = true;

    IF v_caller_role IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an active staff or administrator' USING ERRCODE = '42501';
    END IF;

    -- 5.2 Concurrency Control: Acquire exclusive row-level lock
    SELECT * INTO v_current_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_current_order IS NULL THEN
        RAISE EXCEPTION 'Order not found with ID %', p_order_id USING ERRCODE = 'P0002';
    END IF;

    -- 5.3 If target status is identical to current status, handle notes update or return current state
    IF v_current_order.order_status = p_new_status THEN
        IF p_admin_notes IS NOT NULL AND p_admin_notes != COALESCE(v_current_order.admin_notes, '') THEN
            UPDATE public.orders
            SET admin_notes = p_admin_notes,
                updated_at = NOW()
            WHERE id = p_order_id;
        END IF;

        SELECT jsonb_agg(jsonb_build_object(
            'id', id, 'product_id', product_id, 'product_title', product_title,
            'product_image', product_image, 'unit_price', unit_price,
            'quantity', quantity, 'total_price', total_price
        )) INTO v_items
        FROM public.order_items WHERE order_id = p_order_id;

        RETURN jsonb_build_object(
            'success', true,
            'order_id', p_order_id,
            'order_number', v_current_order.order_number,
            'old_status', v_current_order.order_status,
            'new_status', p_new_status,
            'order_status', p_new_status,
            'payment_status', v_current_order.payment_status,
            'admin_notes', COALESCE(p_admin_notes, v_current_order.admin_notes),
            'order_items', COALESCE(v_items, '[]'::jsonb),
            'message', 'Status unchanged'
        );
    END IF;

    -- 5.4 Execute atomic update
    -- (The trg_validate_order_status_transition trigger executes BEFORE UPDATE,
    -- validating state transition and logging to order_status_history in same transaction)
    UPDATE public.orders
    SET order_status = p_new_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 5.5 Fetch updated state and related items
    SELECT * INTO v_current_order FROM public.orders WHERE id = p_order_id;

    SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'product_id', product_id, 'product_title', product_title,
        'product_image', product_image, 'unit_price', unit_price,
        'quantity', quantity, 'total_price', total_price
    )) INTO v_items
    FROM public.order_items WHERE order_id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'order_number', v_current_order.order_number,
        'old_status', v_current_order.order_status,
        'new_status', p_new_status,
        'order_status', v_current_order.order_status,
        'payment_status', v_current_order.payment_status,
        'admin_notes', v_current_order.admin_notes,
        'order_items', COALESCE(v_items, '[]'::jsonb),
        'updated_at', v_current_order.updated_at
    );
END;
$$;

-- 6. SECURE GET ORDER STATUS HISTORY RPC
CREATE OR REPLACE FUNCTION public.get_order_status_history(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID := auth.uid();
    v_is_admin BOOLEAN := public.is_admin();
    v_is_owner BOOLEAN := false;
    v_history JSONB;
BEGIN
    IF v_caller_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.orders WHERE id = p_order_id AND customer_id = v_caller_id
        ) INTO v_is_owner;
    END IF;

    IF NOT (v_is_admin OR v_is_owner) THEN
        RAISE EXCEPTION 'Unauthorized access to order status history' USING ERRCODE = '42501';
    END IF;

    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'old_status', old_status,
        'new_status', new_status,
        'changed_by', changed_by,
        'changed_by_email', changed_by_email,
        'notes', notes,
        'created_at', created_at
    ) ORDER BY created_at ASC) INTO v_history
    FROM public.order_status_history
    WHERE order_id = p_order_id;

    RETURN COALESCE(v_history, '[]'::jsonb);
END;
$$;
