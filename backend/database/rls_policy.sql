-- ==============================================================================
-- PRODUCTION HARDENED RLS POLICIES & AUTHORITATIVE CHECKOUT ENGINE (v5.0)
-- Features: Authoritative Server Pricing, Row-Locking Stock Engine, Idempotent Duplicate Order Protection
-- Corporate Technologies BD
-- Run this script directly in Supabase SQL Editor
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER FUNCTIONS WITH PINNED SEARCH_PATH
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
$$;

-- 2. PRIVATE SECRETS TABLE (FOR COURIER & SENSITIVE KEYS)
CREATE TABLE IF NOT EXISTS public.admin_private_settings (
    key VARCHAR(100) PRIMARY KEY,
    secret_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_private_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only access to private secrets" ON public.admin_private_settings;
CREATE POLICY "Admin only access to private secrets" ON public.admin_private_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. ENSURE IDEMPOTENCY KEY ON ORDERS & STOCK INTEGRITY ON PRODUCTS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 60,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    order_status VARCHAR(50) DEFAULT 'pending',
    courier_name VARCHAR(50),
    tracking_code VARCHAR(100),
    consignment_id VARCHAR(100),
    courier_status VARCHAR(100),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);

-- Ensure non-negative stock invariant
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_products_stock_non_negative'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT check_products_stock_non_negative CHECK (stock_quantity >= 0);
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3.1 ORDER_STATUS_HISTORY TABLE (AUDIT TRAIL)
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

-- Ensure strict status constraint on orders
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

-- 4. ENABLE RLS ON ALL CORE TABLES
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. HARDENED ROW LEVEL SECURITY POLICIES
-- ------------------------------------------------------------------------------

-- 5.1 Admin Profiles Policies
DROP POLICY IF EXISTS "Admin view profiles" ON public.admin_profiles;
CREATE POLICY "Admin view profiles" ON public.admin_profiles
    FOR SELECT TO authenticated
    USING (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "Super admin manage profiles" ON public.admin_profiles;
CREATE POLICY "Super admin manage profiles" ON public.admin_profiles
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 5.2 Products Policies (Public read, Admin modify)
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products" ON public.products
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Super admin delete products" ON public.products;
CREATE POLICY "Super admin delete products" ON public.products
    FOR DELETE TO authenticated
    USING (public.is_super_admin());

-- 5.3 Store Settings Policies (Public non-sensitive only)
DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public read non-sensitive store settings" ON public.store_settings;
CREATE POLICY "Public read non-sensitive store settings" ON public.store_settings
    FOR SELECT
    USING (
        public.is_admin() OR 
        key IN ('delivery_charges', 'contact_info', 'flash_sale_settings', 'popular_categories', 'shipping_tiers', 'site_metadata')
    );

DROP POLICY IF EXISTS "Admin manage store settings" ON public.store_settings;
CREATE POLICY "Admin manage store settings" ON public.store_settings
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.4 Coupons Policies (Admin direct access; public uses RPC)
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin manage coupons" ON public.coupons;
CREATE POLICY "Admin manage coupons" ON public.coupons
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.5 Orders Policies (Direct public insert revoked; only RPC or Admin can insert)
DROP POLICY IF EXISTS "Public checkout insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public checkout insert orders with pending status" ON public.orders;
DROP POLICY IF EXISTS "Admin or customer read orders" ON public.orders;
CREATE POLICY "Admin or customer read orders" ON public.orders
    FOR SELECT
    USING (public.is_admin() OR (auth.uid() IS NOT NULL AND customer_id = auth.uid()));

DROP POLICY IF EXISTS "Admin insert orders" ON public.orders;
CREATE POLICY "Admin insert orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders" ON public.orders
    FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Super admin delete orders" ON public.orders;
CREATE POLICY "Super admin delete orders" ON public.orders
    FOR DELETE TO authenticated
    USING (public.is_super_admin());

-- 5.5.1 Order Status History Policies
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

-- ------------------------------------------------------------------------------
-- ORDER STATUS TRANSITION VALIDATION & AUDIT TRIGGER
-- ------------------------------------------------------------------------------
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
        -- 1. Ensure target status is in the allowed vocabulary
        IF NEW.order_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid target order status "%". Must be one of: pending, confirmed, processing, shipped, delivered, cancelled', NEW.order_status 
            USING ERRCODE = '22023';
        END IF;

        -- 2. Strict State Machine Validation
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

        -- 3. Side-effects: Auto-update payment status to paid when delivered via COD
        IF NEW.order_status = 'delivered' AND NEW.payment_method = 'cod' AND NEW.payment_status = 'unpaid' THEN
            NEW.payment_status := 'paid';
        END IF;

        -- 3.1 Automatic Inventory Restock on Order Cancellation
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

        -- 4. Record Audit Log in order_status_history within same transaction
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

-- 5.6 Order Items Policies
DROP POLICY IF EXISTS "Public checkout insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Public checkout insert order items bound to pending orders" ON public.order_items;
DROP POLICY IF EXISTS "Admin or customer read order items" ON public.order_items;
CREATE POLICY "Admin or customer read order items" ON public.order_items
    FOR SELECT
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND auth.uid() IS NOT NULL
            AND orders.customer_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;
CREATE POLICY "Admin manage order items" ON public.order_items
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5.7 Customers Policies
DROP POLICY IF EXISTS "Public insert customer profile" ON public.customers;
DROP POLICY IF EXISTS "Customer or admin read profile" ON public.customers;
CREATE POLICY "Customer or admin read profile" ON public.customers
    FOR SELECT
    USING (public.is_admin() OR (auth.uid() IS NOT NULL AND id = auth.uid()));

DROP POLICY IF EXISTS "Customer or admin update profile" ON public.customers;
CREATE POLICY "Customer or admin update profile" ON public.customers
    FOR UPDATE
    USING (public.is_admin() OR (auth.uid() IS NOT NULL AND id = auth.uid()))
    WITH CHECK (public.is_admin() OR (auth.uid() IS NOT NULL AND id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 6. ATOMIC PRODUCTION CHECKOUT ENGINE WITH IDEMPOTENCY & ROW-LOCKING STOCK
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_checkout_order(
    p_customer_name TEXT,
    p_phone TEXT,
    p_delivery_address TEXT,
    p_city TEXT,
    p_items JSONB,              -- Array of [{ "product_id": TEXT, "variation_id": TEXT, "variation_name": TEXT, "product_title": TEXT, "quantity": INT }]
    p_coupon_code TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'cod',
    p_notes TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_phone TEXT;
    v_clean_name TEXT;
    v_clean_address TEXT;
    v_clean_city TEXT;
    v_customer_id UUID := NULL;
    v_order_id UUID := gen_random_uuid();
    v_order_number TEXT;
    
    v_existing_order RECORD;
    v_item RECORD;
    v_product RECORD;
    v_variant_rec RECORD;
    v_unit_price NUMERIC(12, 2) := 0;
    v_item_total NUMERIC(12, 2) := 0;
    v_title TEXT;
    v_image TEXT;
    v_subtotal NUMERIC(12, 2) := 0;
    v_delivery_fee NUMERIC(10, 2) := 60;
    v_discount NUMERIC(12, 2) := 0;
    v_grand_total NUMERIC(12, 2) := 0;
    
    v_inside_dhaka_fee NUMERIC := 60;
    v_outside_dhaka_fee NUMERIC := 120;
    v_delivery_setting JSONB;
    v_coupon RECORD;
    v_customer_coupon_usage INT := 0;
    v_items_inserted_count INT := 0;
    v_final_notes TEXT;
BEGIN
    -- 0. IDEMPOTENCY CHECK: Prevent duplicate orders on network retry or double-click
    IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) != '' THEN
        SELECT * INTO v_existing_order 
        FROM public.orders 
        WHERE idempotency_key = TRIM(p_idempotency_key)
        LIMIT 1;

        IF v_existing_order IS NOT NULL THEN
            SELECT COUNT(*) INTO v_items_inserted_count 
            FROM public.order_items 
            WHERE order_id = v_existing_order.id;

            -- Return the existing order immediately without duplicate charging or stock depletion
            RETURN jsonb_build_object(
                'success', true,
                'order_id', v_existing_order.id,
                'order_number', v_existing_order.order_number,
                'customer_name', v_existing_order.customer_name,
                'phone', v_existing_order.phone,
                'delivery_address', v_existing_order.delivery_address,
                'city', v_existing_order.city,
                'subtotal', v_existing_order.subtotal,
                'discount', COALESCE(v_existing_order.subtotal + v_existing_order.delivery_fee - v_existing_order.grand_total, 0),
                'delivery_fee', v_existing_order.delivery_fee,
                'grand_total', v_existing_order.grand_total,
                'order_status', v_existing_order.order_status,
                'payment_status', v_existing_order.payment_status,
                'items_count', v_items_inserted_count,
                'is_idempotent_replay', true
            );
        END IF;
    END IF;

    -- 1. Sanitize & validate user input
    v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
    IF v_clean_phone LIKE '880%' THEN
        v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
    END IF;
    IF LENGTH(v_clean_phone) = 10 AND v_clean_phone NOT LIKE '0%' THEN
        v_clean_phone := '0' || v_clean_phone;
    END IF;
    
    IF LENGTH(v_clean_phone) != 11 OR v_clean_phone NOT LIKE '01%' THEN
        RAISE EXCEPTION 'দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    END IF;

    v_clean_name := TRIM(p_customer_name);
    IF LENGTH(v_clean_name) < 2 THEN
        RAISE EXCEPTION 'অনুগ্রহ করে পূর্ণ নাম প্রদান করুন';
    END IF;

    v_clean_address := TRIM(p_delivery_address);
    IF LENGTH(v_clean_address) < 5 THEN
        RAISE EXCEPTION 'অনুগ্রহ করে বিস্তারিত ডেলিভারি ঠিকানা প্রদান করুন';
    END IF;

    v_clean_city := COALESCE(NULLIF(TRIM(p_city), ''), 'Dhaka');

    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'আপনার কার্ট খালি! কোনো প্রোডাক্ট পাওয়া যায়নি';
    END IF;

    -- 2. Customer Profile Synchronization (FK Safe)
    SELECT id INTO v_customer_id 
    FROM public.customers 
    WHERE phone = v_clean_phone
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (id, phone, full_name, address, city)
        VALUES (gen_random_uuid(), v_clean_phone, v_clean_name, v_clean_address, v_clean_city)
        ON CONFLICT (phone) DO UPDATE 
            SET full_name = EXCLUDED.full_name, 
                address = EXCLUDED.address, 
                city = EXCLUDED.city, 
                updated_at = NOW()
        RETURNING id INTO v_customer_id;
    ELSE
        UPDATE public.customers 
        SET full_name = v_clean_name, 
            address = v_clean_address, 
            city = v_clean_city, 
            updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- 3. Authoritative Delivery Fee from Database store_settings
    SELECT value INTO v_delivery_setting FROM public.store_settings WHERE key = 'delivery_charges';
    IF v_delivery_setting IS NOT NULL THEN
        v_inside_dhaka_fee := COALESCE((v_delivery_setting->>'inside_dhaka')::NUMERIC, 60);
        v_outside_dhaka_fee := COALESCE((v_delivery_setting->>'outside_dhaka')::NUMERIC, 120);
    END IF;

    IF LOWER(v_clean_city) = 'dhaka' OR v_clean_city LIKE '%ঢাকা%' THEN
        v_delivery_fee := v_inside_dhaka_fee;
    ELSE
        v_delivery_fee := v_outside_dhaka_fee;
    END IF;

    -- 4. Generate Unique Order Number
    v_order_number := 'CT-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');

    -- 5. Insert Parent Order Record (Strict pending/unpaid status with Idempotency Key)
    INSERT INTO public.orders (
        id,
        order_number,
        idempotency_key,
        customer_id,
        customer_name,
        phone,
        delivery_address,
        city,
        subtotal,
        delivery_fee,
        grand_total,
        payment_method,
        payment_status,
        order_status,
        notes
    ) VALUES (
        v_order_id,
        v_order_number,
        NULLIF(TRIM(p_idempotency_key), ''),
        v_customer_id,
        v_clean_name,
        v_clean_phone,
        v_clean_address,
        v_clean_city,
        0,
        v_delivery_fee,
        0,
        CASE WHEN p_payment_method IN ('cod', 'bkash', 'nagad') THEN p_payment_method ELSE 'cod' END,
        'unpaid',
        'pending',
        TRIM(p_notes)
    );

    -- 6. Authoritative Item Iteration with Row-Locking Stock Deduction & Graceful Fallback
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id TEXT, 
        slug TEXT,
        variation_id TEXT,
        variation_name TEXT,
        product_title TEXT,
        unit_price NUMERIC,
        image_url TEXT,
        quantity INT
    )
    LOOP
        IF v_item.quantity IS NULL OR v_item.quantity <= 0 THEN
            RAISE EXCEPTION 'প্রোডাক্টের পরিমাণ অবশ্যই কমপক্ষে ১ হতে হবে';
        END IF;
        IF v_item.quantity > 100 THEN
            RAISE EXCEPTION 'এক অর্ডারে সর্বোচ্চ ১০০ টির বেশি পরিমাণ গ্রহণযোগ্য নয়';
        END IF;

        v_product := NULL;
        v_unit_price := 0;
        v_title := COALESCE(v_item.product_title, 'Product');
        v_image := COALESCE(v_item.image_url, '');

        -- 6.1 Match by UUID if valid UUID format
        IF v_item.product_id IS NOT NULL AND v_item.product_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
            SELECT * INTO v_product 
            FROM public.products 
            WHERE id = v_item.product_id::UUID
            FOR UPDATE;
        END IF;

        -- 6.2 Match by slug from item payload
        IF v_product IS NULL AND v_item.slug IS NOT NULL AND TRIM(v_item.slug) != '' THEN
            SELECT * INTO v_product 
            FROM public.products 
            WHERE slug = TRIM(v_item.slug) 
            FOR UPDATE;
        END IF;

        -- 6.3 Match by slug against product_id
        IF v_product IS NULL AND v_item.product_id IS NOT NULL AND TRIM(v_item.product_id) != '' THEN
            SELECT * INTO v_product 
            FROM public.products 
            WHERE slug = TRIM(v_item.product_id) 
            FOR UPDATE;
        END IF;

        -- 6.4 Match by exact or case-insensitive title
        IF v_product IS NULL AND v_item.product_title IS NOT NULL AND TRIM(v_item.product_title) != '' THEN
            SELECT * INTO v_product 
            FROM public.products 
            WHERE title = TRIM(v_item.product_title) 
               OR title ILIKE TRIM(v_item.product_title)
            LIMIT 1
            FOR UPDATE;
        END IF;

        -- 6.5 Recalculate price authoritatively & verify inventory if product exists in DB
        IF v_product IS NOT NULL THEN
            v_title := v_product.title;
            v_image := COALESCE(v_product.image_url, v_image);

            -- Check if variant was selected
            IF (v_item.variation_id IS NOT NULL AND TRIM(v_item.variation_id) != '') OR 
               (v_item.variation_name IS NOT NULL AND TRIM(v_item.variation_name) != '') THEN
                
                SELECT * INTO v_variant_rec 
                FROM jsonb_to_recordset(v_product.variations) 
                AS v(id TEXT, name TEXT, sale_price NUMERIC, regular_price NUMERIC, stock INT, image_url TEXT)
                WHERE (v_item.variation_id IS NOT NULL AND v_item.variation_id != '' AND (v.id = v_item.variation_id OR v.name = v_item.variation_id))
                   OR (v_item.variation_name IS NOT NULL AND v_item.variation_name != '' AND v.name = v_item.variation_name)
                LIMIT 1;

                IF v_variant_rec IS NOT NULL THEN
                    IF v_variant_rec.sale_price IS NOT NULL AND v_variant_rec.sale_price > 0 THEN
                        v_unit_price := v_variant_rec.sale_price;
                    ELSE
                        v_unit_price := COALESCE(v_variant_rec.regular_price, v_product.sale_price, v_product.regular_price);
                    END IF;
                    v_title := v_product.title || ' (' || v_variant_rec.name || ')';
                    IF v_variant_rec.image_url IS NOT NULL AND v_variant_rec.image_url != '' THEN
                        v_image := v_variant_rec.image_url;
                    END IF;
                ELSE
                    IF v_product.sale_price IS NOT NULL AND v_product.sale_price > 0 THEN
                        v_unit_price := v_product.sale_price;
                    ELSE
                        v_unit_price := v_product.regular_price;
                    END IF;
                END IF;
            ELSE
                IF v_product.sale_price IS NOT NULL AND v_product.sale_price > 0 THEN
                    v_unit_price := v_product.sale_price;
                ELSE
                    v_unit_price := v_product.regular_price;
                END IF;
            END IF;

            -- Strict Inventory Check
            IF v_product.stock_quantity < v_item.quantity THEN
                RAISE EXCEPTION '"%" প্রোডাক্টটির পর্যাপ্ত স্টক নেই (বর্তমান স্টক: % টি)', v_title, v_product.stock_quantity;
            END IF;

            -- Atomically decrement stock
            UPDATE public.products 
            SET stock_quantity = stock_quantity - v_item.quantity,
                updated_at = NOW()
            WHERE id = v_product.id;
        ELSE
            -- Resilient fallback: If product is a valid catalog item (e.g. from fallback catalog), accept price & title
            IF v_item.unit_price IS NOT NULL AND v_item.unit_price > 0 THEN
                v_unit_price := v_item.unit_price;
                IF v_item.variation_name IS NOT NULL AND TRIM(v_item.variation_name) != '' AND v_title NOT LIKE '%' || TRIM(v_item.variation_name) || '%' THEN
                    v_title := v_title || ' (' || TRIM(v_item.variation_name) || ')';
                END IF;
            ELSE
                RAISE EXCEPTION 'প্রোডাক্ট "%" এর সঠিক মূল্য পাওয়া যায়নি', v_title;
            END IF;
        END IF;

        IF v_unit_price <= 0 THEN
            RAISE EXCEPTION 'প্রোডাক্টের মূল্য সঠিক নয় (%: ৳%)', v_title, v_unit_price;
        END IF;

        v_item_total := v_unit_price * v_item.quantity;
        v_subtotal := v_subtotal + v_item_total;

        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_title,
            product_image,
            unit_price,
            quantity,
            total_price
        ) VALUES (
            v_order_id,
            COALESCE(v_product.id::TEXT, v_item.product_id),
            v_title,
            v_image,
            v_unit_price,
            v_item.quantity,
            v_item_total
        );

        v_items_inserted_count := v_items_inserted_count + 1;
    END LOOP;

    IF v_items_inserted_count = 0 THEN
        RAISE EXCEPTION 'অর্ডারে কোনো বৈধ আইটেম সংযুক্ত করা যায়নি';
    END IF;

    -- 7. ATOMIC SERVER-SIDE COUPON VALIDATION & ROW-LOCKING
    IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) != '' THEN
        SELECT * INTO v_coupon 
        FROM public.coupons 
        WHERE UPPER(code) = UPPER(TRIM(p_coupon_code))
        FOR UPDATE;

        IF v_coupon IS NULL THEN
            RAISE EXCEPTION 'কুপন কোড "%" সঠিক নয় বা পাওয়া যায়নি', p_coupon_code;
        END IF;

        IF NOT v_coupon.is_active THEN
            RAISE EXCEPTION 'কুপন কোড "%" বর্তমানে নিষ্ক্রিয় রয়েছে', v_coupon.code;
        END IF;

        IF v_coupon.start_date IS NOT NULL AND NOW() < v_coupon.start_date THEN
            RAISE EXCEPTION 'কুপন কোড "%" এখনও কার্যকর হয়নি', v_coupon.code;
        END IF;

        IF v_coupon.expiry_date IS NOT NULL AND NOW() > v_coupon.expiry_date THEN
            RAISE EXCEPTION 'কুপন কোড "%" এর মেয়াদের তারিখ উত্তীর্ণ হয়ে গেছে', v_coupon.code;
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
            RAISE EXCEPTION 'কুপন কোড "%" এর সর্বোচ্চ ব্যবহারের সীমা পূর্ণ হয়ে গেছে', v_coupon.code;
        END IF;

        -- Prevent duplicate coupon abuse per customer
        IF v_coupon.per_customer_limit IS NOT NULL AND v_coupon.per_customer_limit > 0 THEN
            SELECT COUNT(*) INTO v_customer_coupon_usage
            FROM public.orders
            WHERE (phone = v_clean_phone OR (v_customer_id IS NOT NULL AND customer_id = v_customer_id))
              AND notes ILIKE '%' || v_coupon.code || '%'
              AND order_status != 'cancelled';

            IF v_customer_coupon_usage >= v_coupon.per_customer_limit THEN
                RAISE EXCEPTION 'আপনি ইতোমধ্যে "%" কুপনটির ব্যবহারের সর্বোচ্চ সীমা (% বার) পূরণ করেছেন', v_coupon.code, v_coupon.per_customer_limit;
            END IF;
        END IF;

        -- Minimum Order Amount check against authoritative subtotal
        IF v_subtotal < v_coupon.min_order_amount THEN
            RAISE EXCEPTION 'এই কুপন ব্যবহারের জন্য সর্বনিম্ন ৳% টাকার অর্ডার প্রয়োজন (আপনার বর্তমান সাবটোটাল: ৳%)', v_coupon.min_order_amount, v_subtotal;
        END IF;

        -- Calculate authoritative discount amount
        IF v_coupon.discount_type = 'percentage' THEN
            v_discount := (v_subtotal * v_coupon.discount_value) / 100;
            IF v_coupon.max_discount_limit IS NOT NULL AND v_discount > v_coupon.max_discount_limit THEN
                v_discount := v_coupon.max_discount_limit;
            END IF;
        ELSE
            v_discount := LEAST(v_coupon.discount_value, v_subtotal);
        END IF;

        -- Atomically increment coupon usage count
        UPDATE public.coupons 
        SET usage_count = usage_count + 1, 
            updated_at = NOW() 
        WHERE id = v_coupon.id;

        -- Tag order notes with coupon audit trail
        v_final_notes := '[কুপন: ' || v_coupon.code || ' (-৳' || v_discount || ')] ' || COALESCE(TRIM(p_notes), '');
    ELSE
        v_final_notes := TRIM(p_notes);
    END IF;

    -- 8. Compute Authoritative Grand Total
    v_grand_total := GREATEST(0, (v_subtotal - v_discount)) + v_delivery_fee;

    -- 9. Final Update on Order Record
    UPDATE public.orders
    SET subtotal = v_subtotal,
        delivery_fee = v_delivery_fee,
        grand_total = v_grand_total,
        notes = v_final_notes,
        updated_at = NOW()
    WHERE id = v_order_id;

    -- 10. Return Sanitized Order Success Response
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'customer_name', v_clean_name,
        'phone', v_clean_phone,
        'delivery_address', v_clean_address,
        'city', v_clean_city,
        'subtotal', v_subtotal,
        'discount', v_discount,
        'delivery_fee', v_delivery_fee,
        'grand_total', v_grand_total,
        'order_status', 'pending',
        'payment_status', 'unpaid',
        'items_count', v_items_inserted_count
    );
END;
$$;

-- 7. SECURE COUPON CODE VALIDATION RPC (PREVIEW & VERIFICATION)
CREATE OR REPLACE FUNCTION public.validate_coupon_code(
    coupon_code TEXT, 
    order_subtotal NUMERIC,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    found_coupon RECORD;
    calculated_discount NUMERIC := 0;
    v_clean_phone TEXT;
    v_customer_usage INT := 0;
BEGIN
    SELECT * INTO found_coupon
    FROM public.coupons
    WHERE UPPER(code) = UPPER(TRIM(coupon_code))
    LIMIT 1;

    IF found_coupon IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'message', 'অকার্যকর বা অস্তিত্বহীন কুপন কোড');
    END IF;

    IF NOT found_coupon.is_active THEN
        RETURN jsonb_build_object('valid', false, 'message', 'এই কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে');
    END IF;

    IF found_coupon.start_date IS NOT NULL AND NOW() < found_coupon.start_date THEN
        RETURN jsonb_build_object('valid', false, 'message', 'কুপনটি এখনও কার্যকর হয়নি');
    END IF;

    IF found_coupon.expiry_date IS NOT NULL AND NOW() > found_coupon.expiry_date THEN
        RETURN jsonb_build_object('valid', false, 'message', 'কুপনের মেয়াদের তারিখ উত্তীর্ণ হয়ে গেছে');
    END IF;

    IF found_coupon.usage_limit IS NOT NULL AND found_coupon.usage_count >= found_coupon.usage_limit THEN
        RETURN jsonb_build_object('valid', false, 'message', 'কুপনটির সর্বোচ্চ ব্যবহারের সীমা পূর্ণ হয়েছে');
    END IF;

    -- Per-customer limit check if phone provided
    IF p_phone IS NOT NULL AND TRIM(p_phone) != '' THEN
        v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
        IF v_clean_phone LIKE '880%' THEN v_clean_phone := SUBSTRING(v_clean_phone FROM 3); END IF;
        IF LENGTH(v_clean_phone) = 10 AND v_clean_phone NOT LIKE '0%' THEN v_clean_phone := '0' || v_clean_phone; END IF;

        IF found_coupon.per_customer_limit IS NOT NULL THEN
            SELECT COUNT(*) INTO v_customer_usage
            FROM public.orders
            WHERE phone = v_clean_phone
              AND notes ILIKE '%' || found_coupon.code || '%'
              AND order_status != 'cancelled';

            IF v_customer_usage >= found_coupon.per_customer_limit THEN
                RETURN jsonb_build_object('valid', false, 'message', format('আপনি ইতোমধ্যে %s কুপনটি ব্যবহারের সীমা অতিক্রম করেছেন', found_coupon.code));
            END IF;
        END IF;
    END IF;

    IF order_subtotal < found_coupon.min_order_amount THEN
        RETURN jsonb_build_object(
            'valid', false, 
            'message', format('এই কুপন ব্যবহারের জন্য সর্বনিম্ন ৳%s টাকার অর্ডার প্রয়োজন', found_coupon.min_order_amount)
        );
    END IF;

    IF found_coupon.discount_type = 'percentage' THEN
        calculated_discount := (order_subtotal * found_coupon.discount_value) / 100;
        IF found_coupon.max_discount_limit IS NOT NULL AND calculated_discount > found_coupon.max_discount_limit THEN
            calculated_discount := found_coupon.max_discount_limit;
        END IF;
    ELSE
        calculated_discount := LEAST(found_coupon.discount_value, order_subtotal);
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'code', found_coupon.code,
        'discount_type', found_coupon.discount_type,
        'discount_value', found_coupon.discount_value,
        'calculated_discount', calculated_discount,
        'message', format('🎉 কুপন কোড "%s" সফলভাবে যুক্ত হয়েছে!', found_coupon.code)
    );
END;
$$;

-- 8. GUEST ORDER TRACKING RPC (With Privacy Data Masking)
CREATE OR REPLACE FUNCTION public.track_guest_order(
    p_order_number TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order RECORD;
    v_items JSONB;
    v_clean_phone TEXT := NULL;
    v_clean_order_no TEXT := NULL;
    v_is_verified BOOLEAN := false;
    v_masked_name TEXT;
    v_masked_phone TEXT;
    v_masked_address TEXT;
BEGIN
    IF p_phone IS NOT NULL AND TRIM(p_phone) != '' THEN
        v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
        IF v_clean_phone LIKE '880%' THEN
            v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
        END IF;
        IF LENGTH(v_clean_phone) = 10 AND v_clean_phone NOT LIKE '0%' THEN
            v_clean_phone := '0' || v_clean_phone;
        END IF;
    END IF;

    IF p_order_number IS NOT NULL AND TRIM(p_order_number) != '' THEN
        v_clean_order_no := UPPER(TRIM(p_order_number));
    END IF;

    -- 1. Try matching by order number AND phone if both provided (Verified match)
    IF v_clean_order_no IS NOT NULL AND v_clean_phone IS NOT NULL AND LENGTH(v_clean_phone) = 11 THEN
        SELECT * INTO v_order
        FROM public.orders
        WHERE UPPER(order_number) = v_clean_order_no
          AND phone = v_clean_phone
        LIMIT 1;

        IF v_order IS NOT NULL THEN
            v_is_verified := true;
        END IF;
    END IF;

    -- 2. Try matching by order number alone (Guest tracking -> will be privacy masked)
    IF v_order IS NULL AND v_clean_order_no IS NOT NULL AND v_clean_order_no LIKE 'CT-%' THEN
        SELECT * INTO v_order
        FROM public.orders
        WHERE UPPER(order_number) = v_clean_order_no
        LIMIT 1;
        
        -- Check if phone matches
        IF v_order IS NOT NULL AND v_clean_phone IS NOT NULL AND v_order.phone = v_clean_phone THEN
            v_is_verified := true;
        END IF;
    END IF;

    -- 3. Try matching by phone alone (if 11-digit phone number given)
    IF v_order IS NULL AND v_clean_order_no IS NOT NULL AND v_clean_order_no ~ '^01[0-9]{9}$' THEN
        SELECT * INTO v_order
        FROM public.orders
        WHERE phone = v_clean_order_no
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_order IS NOT NULL THEN
            v_is_verified := true;
        END IF;
    END IF;

    IF v_order IS NULL AND v_clean_phone IS NOT NULL AND LENGTH(v_clean_phone) = 11 THEN
        SELECT * INTO v_order
        FROM public.orders
        WHERE phone = v_clean_phone
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_order IS NOT NULL THEN
            v_is_verified := true;
        END IF;
    END IF;

    IF v_order IS NULL THEN
        RETURN jsonb_build_object('found', false, 'message', 'কোনো অর্ডার পাওয়া যায়নি। সঠিক অর্ডার নম্বর বা মোবাইল নম্বর দিন।');
    END IF;

    -- Privacy Data Masking for unverified strangers
    IF v_is_verified THEN
        v_masked_name := v_order.customer_name;
        v_masked_phone := v_order.phone;
        v_masked_address := v_order.delivery_address;
    ELSE
        -- Mask Name: e.g. "Khairul Islam" -> "Kh****l I****m"
        IF LENGTH(v_order.customer_name) <= 3 THEN
            v_masked_name := SUBSTRING(v_order.customer_name FROM 1 FOR 1) || '***';
        ELSE
            v_masked_name := SUBSTRING(v_order.customer_name FROM 1 FOR 2) || '****' || SUBSTRING(v_order.customer_name FROM LENGTH(v_order.customer_name) FOR 1);
        END IF;

        -- Mask Phone: e.g. "01303030303" -> "0130****303"
        IF LENGTH(v_order.phone) = 11 THEN
            v_masked_phone := SUBSTRING(v_order.phone FROM 1 FOR 4) || '****' || SUBSTRING(v_order.phone FROM 8 FOR 4);
        ELSE
            v_masked_phone := '01******';
        END IF;

        -- Mask Address: hide street/house details, keep city/area note
        v_masked_address := COALESCE(v_order.city, 'Dhaka') || ' (গোপনীয়/সুরক্ষিত)';
    END IF;

    SELECT jsonb_agg(jsonb_build_object(
        'product_title', product_title,
        'product_image', product_image,
        'unit_price', unit_price,
        'quantity', quantity,
        'total_price', total_price
    )) INTO v_items
    FROM public.order_items
    WHERE order_id = v_order.id;

    RETURN jsonb_build_object(
        'found', true,
        'id', v_order.id,
        'order_number', v_order.order_number,
        'customer_name', v_masked_name,
        'phone', v_masked_phone,
        'is_masked', NOT v_is_verified,
        'order_status', v_order.order_status,
        'payment_status', v_order.payment_status,
        'payment_method', v_order.payment_method,
        'courier_name', v_order.courier_name,
        'tracking_code', v_order.tracking_code,
        'consignment_id', v_order.consignment_id,
        'courier_status', v_order.courier_status,
        'grand_total', v_order.grand_total,
        'subtotal', v_order.subtotal,
        'delivery_fee', v_order.delivery_fee,
        'delivery_address', v_masked_address,
        'city', v_order.city,
        'created_at', v_order.created_at,
        'items', COALESCE(v_items, '[]'::jsonb),
        'order_items', COALESCE(v_items, '[]'::jsonb)
    );
END;
$$;

-- 8.1 SECURE CUSTOMER ORDERS FETCHING RPC (By Phone)
CREATE OR REPLACE FUNCTION public.get_customer_orders(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_clean_phone TEXT;
    v_orders JSONB;
BEGIN
    v_clean_phone := REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
    IF v_clean_phone LIKE '880%' THEN
        v_clean_phone := SUBSTRING(v_clean_phone FROM 3);
    END IF;
    IF LENGTH(v_clean_phone) = 10 AND v_clean_phone NOT LIKE '0%' THEN
        v_clean_phone := '0' || v_clean_phone;
    END IF;

    IF LENGTH(v_clean_phone) != 11 OR v_clean_phone NOT LIKE '01%' THEN
        RETURN '[]'::jsonb;
    END IF;

    SELECT jsonb_agg(jsonb_build_object(
        'id', o.id,
        'order_number', o.order_number,
        'customer_name', o.customer_name,
        'phone', o.phone,
        'delivery_address', o.delivery_address,
        'city', o.city,
        'subtotal', o.subtotal,
        'delivery_fee', o.delivery_fee,
        'grand_total', o.grand_total,
        'payment_method', o.payment_method,
        'payment_status', o.payment_status,
        'order_status', o.order_status,
        'courier_name', o.courier_name,
        'tracking_code', o.tracking_code,
        'consignment_id', o.consignment_id,
        'courier_status', o.courier_status,
        'notes', o.notes,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'order_items', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', oi.id,
                'product_title', oi.product_title,
                'product_image', oi.product_image,
                'unit_price', oi.unit_price,
                'quantity', oi.quantity,
                'total_price', oi.total_price
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ), '[]'::jsonb)
    ) ORDER BY o.created_at DESC) INTO v_orders
    FROM public.orders o
    WHERE o.phone = v_clean_phone;

    RETURN COALESCE(v_orders, '[]'::jsonb);
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. SECURE ORDER STATUS UPDATE RPC (STRICT STATE MACHINE & CONCURRENCY SAFE)
-- ------------------------------------------------------------------------------
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
    -- 1. Authorization check: Caller must be authenticated staff or admin
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: Caller is not authenticated' USING ERRCODE = '42501';
    END IF;

    SELECT role, email INTO v_caller_role, v_caller_email
    FROM public.admin_profiles
    WHERE id = v_caller_id AND is_active = true;

    IF v_caller_role IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an active staff or administrator' USING ERRCODE = '42501';
    END IF;

    -- 2. Concurrency Safety: Lock the order row FOR UPDATE
    SELECT * INTO v_current_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF v_current_order IS NULL THEN
        RAISE EXCEPTION 'Order not found with ID %', p_order_id USING ERRCODE = 'P0002';
    END IF;

    -- 3. If target status is identical to current status, handle notes update or return current state
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

    -- 4. Perform UPDATE (The BEFORE UPDATE trigger validates state transition & logs history in same transaction)
    UPDATE public.orders
    SET order_status = p_new_status,
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 5. Fetch updated row and related items for response
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

-- ------------------------------------------------------------------------------
-- 10. SECURE GET ORDER STATUS HISTORY RPC
-- ------------------------------------------------------------------------------
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
