-- ==============================================================================
-- CORPORATE TECHNOLOGIES BD - SUPABASE DATABASE SCHEMA
-- Tables: customers, orders, order_items
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CUSTOMERS TABLE (কাস্টমার প্রোফাইল ও লগইন)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,       -- মোবাইল নম্বর (ইউনিক, এক নম্বরে ১টি অ্যাকাউন্ট)
    full_name VARCHAR(150) NOT NULL,         -- কাস্টমার বা প্রতিষ্ঠানের নাম
    password_hash TEXT,                      -- ঐচ্ছিক (পাসওয়ার্ডবিহীন ফোন লগইন)
    address TEXT,                            -- কুরিয়ার ডেলিভারি ঠিকানা
    city VARCHAR(100) DEFAULT 'Dhaka',       -- জেলা / শহর
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on phone for lightning-fast customer login
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ------------------------------------------------------------------------------
-- 2. ORDERS TABLE (সব কাস্টমার অর্ডার ও ডেলিভারি ট্র্যাকিং)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Dhaka',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 60,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cod', -- 'cod' | 'bkash' | 'nagad'
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid' | 'paid'
    order_status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    courier_name VARCHAR(50), -- e.g. 'Steadfast' | 'Pathao'
    tracking_code VARCHAR(100), -- Tracking code given by courier
    consignment_id VARCHAR(100), -- Consignment ID given by courier API
    courier_status VARCHAR(100), -- Latest status returned from courier
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering & search
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ORDER_ITEMS TABLE (প্রতিটি অর্ডারের ভেতরের প্রোডাক্টসমূহ)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_title VARCHAR(255) NOT NULL,
    product_image TEXT,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on order_id for instant retrieval of items in an order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- 4. AUTO-UPDATE TRIGGER (স্বয়ংক্রিয়ভাবে updated_at টাইমস্ট্যাম্প আপডেট হওয়া)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Permissive policies for customers table
DROP POLICY IF EXISTS "Allow public read customers" ON customers;
CREATE POLICY "Allow public read customers" ON customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert customers" ON customers;
CREATE POLICY "Allow public insert customers" ON customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update customers" ON customers;
CREATE POLICY "Allow public update customers" ON customers FOR UPDATE USING (true);

-- Permissive policies for orders table
DROP POLICY IF EXISTS "Allow public read orders" ON orders;
CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON orders;
CREATE POLICY "Allow public update orders" ON orders FOR UPDATE USING (true);

-- Permissive policies for order_items table
-- ------------------------------------------------------------------------------
-- 6. ADMIN USERS TABLE (অ্যাডমিন প্যানেল অথেন্টিকেশন)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    pin_or_password VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'super_admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Super Admin Credentials (Username: admin, PIN: 123456)
INSERT INTO admin_users (username, pin_or_password, role)
VALUES ('admin', '123456', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Default Staff / Order Dispatcher Credentials (Username: staff, PIN: 123456)
INSERT INTO admin_users (username, pin_or_password, role)
VALUES ('staff', '123456', 'staff')
ON CONFLICT (username) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. STORE SETTINGS TABLE (ডেলিভারি ফি ও কুরিয়ার সেটিংস)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO store_settings (key, value) VALUES
('delivery_charges', '{"inside_dhaka": 60, "outside_dhaka": 120}'),
('contact_info', '{"hotline": "01777-277740", "email": "info@corporatetechbd.com"}'),
('courier_settings', '{"default_courier": "Steadfast", "steadfast_api_key": "", "steadfast_secret": ""}'),
('flash_sale_settings', '{"is_active": true, "title": "সীমিত সময়ের ফ্ল্যাশ ডিল", "subtitle": "প্রিন্টার ও Splashjet কালিতে আকর্ষণীয় ছাড়!", "end_time": "2026-12-31T23:59:59.000Z", "discount_banner": "UP TO 35% OFF"}')
ON CONFLICT (key) DO NOTHING;

-- Orders admin_notes column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Admin & Delete Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read admin_users" ON admin_users;
CREATE POLICY "Allow public read admin_users" ON admin_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert admin_users" ON admin_users;
CREATE POLICY "Allow public insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update admin_users" ON admin_users;
CREATE POLICY "Allow public update admin_users" ON admin_users FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete admin_users" ON admin_users;
CREATE POLICY "Allow public delete admin_users" ON admin_users FOR DELETE USING (true);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read store_settings" ON store_settings;
CREATE POLICY "Allow public read store_settings" ON store_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public update store_settings" ON store_settings;
CREATE POLICY "Allow public update store_settings" ON store_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public delete orders" ON orders;
CREATE POLICY "Allow public delete orders" ON orders FOR DELETE USING (true);
DROP POLICY IF EXISTS "Allow public delete order_items" ON order_items;
CREATE POLICY "Allow public delete order_items" ON order_items FOR DELETE USING (true);

-- ------------------------------------------------------------------------------
-- 8. COUPONS & PROMOTIONS TABLE (কুপন ও ডিসকাউন্ট কোড)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed' | 'percentage'
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_limit NUMERIC(10, 2),
    expiry_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read coupons" ON coupons;
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all coupons" ON coupons;
CREATE POLICY "Allow public all coupons" ON coupons FOR ALL USING (true);


