import { supabase } from './supabaseClient';

const LOCAL_COUPONS_KEY = 'corporate_tech_coupons_v1';

// Seed initial default coupons for immediate use
const DEFAULT_COUPONS = [
  {
    id: 'cpn-eid2026',
    code: 'EID2026',
    discount_type: 'fixed', // 'fixed' | 'percentage'
    discount_value: 500,
    min_order_amount: 3000,
    max_discount_limit: null,
    expiry_date: '2026-12-31T23:59:59.000Z',
    is_active: true,
    usage_count: 8,
    created_at: new Date().toISOString()
  },
  {
    id: 'cpn-splash10',
    code: 'SPLASH10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1500,
    max_discount_limit: 1000,
    expiry_date: '2026-12-31T23:59:59.000Z',
    is_active: true,
    usage_count: 14,
    created_at: new Date().toISOString()
  },
  {
    id: 'cpn-flat200',
    code: 'FLAT200',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 1000,
    max_discount_limit: null,
    expiry_date: '2026-12-31T23:59:59.000Z',
    is_active: true,
    usage_count: 22,
    created_at: new Date().toISOString()
  }
];

function getLocalCoupons() {
  try {
    const raw = localStorage.getItem(LOCAL_COUPONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COUPONS;
  }
}

function saveLocalCoupons(coupons) {
  try {
    localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons));
  } catch (err) {
    console.warn('Could not save coupons locally:', err);
  }
}

/**
 * Fetch all coupons (Supabase + Local fallback)
 */
export async function fetchCoupons() {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      saveLocalCoupons(data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase coupons query fallback:', err.message);
  }
  return getLocalCoupons();
}

/**
 * Fetch only active & non-expired coupons for customer storefront
 */
export async function fetchActiveCoupons() {
  const list = await fetchCoupons();
  const now = new Date();
  return (list || []).filter(c => {
    if (!c.is_active) return false;
    if (c.expiry_date) {
      const exp = new Date(c.expiry_date);
      if (exp < now) return false;
    }
    return true;
  });
}

/**
 * Create a new coupon
 */
export async function createCoupon({
  code,
  discountType = 'fixed',
  discountValue = 0,
  minOrderAmount = 0,
  maxDiscountLimit = null,
  expiryDate = null,
  isActive = true
}) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) throw new Error('Coupon code is required.');

  const payload = {
    code: cleanCode,
    discount_type: discountType,
    discount_value: Number(discountValue) || 0,
    min_order_amount: Number(minOrderAmount) || 0,
    max_discount_limit: maxDiscountLimit ? Number(maxDiscountLimit) : null,
    expiry_date: expiryDate || null,
    is_active: Boolean(isActive),
    usage_count: 0
  };

  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      const local = getLocalCoupons();
      saveLocalCoupons([data, ...local.filter(c => c.id !== data.id)]);
      return data;
    }
  } catch (err) {
    console.warn('Supabase create coupon fallback:', err.message);
  }

  // Local fallback
  const newCoupon = {
    ...payload,
    id: `cpn-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  const local = getLocalCoupons();
  const updated = [newCoupon, ...local.filter(c => c.code !== cleanCode)];
  saveLocalCoupons(updated);
  return newCoupon;
}

/**
 * Toggle coupon active/inactive status
 */
export async function toggleCouponStatus(id, isActive) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const local = getLocalCoupons();
      saveLocalCoupons(local.map(c => c.id === id ? data : c));
      return data;
    }
  } catch (err) {
    console.warn('Supabase toggle coupon fallback:', err.message);
  }

  const local = getLocalCoupons();
  const updated = local.map(c => c.id === id ? { ...c, is_active: isActive } : c);
  saveLocalCoupons(updated);
  return updated.find(c => c.id === id);
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id) {
  try {
    await supabase.from('coupons').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete coupon fallback:', err.message);
  }

  const local = getLocalCoupons();
  const filtered = local.filter(c => c.id !== id);
  saveLocalCoupons(filtered);
  return true;
}

/**
 * Validate a coupon code for customer checkout
 * Returns { valid: true, discountAmount, coupon, message } or { valid: false, message }
 */
export async function validateCoupon(code, subtotal = 0) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'দয়া করে একটি কুপন কোড লিখুন।' };
  }

  const coupons = await fetchCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, message: `"${cleanCode}" কুপনটি সঠিক নয়।` };
  }

  if (!coupon.is_active) {
    return { valid: false, message: `"${cleanCode}" কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে।` };
  }

  // Check Expiry Date
  if (coupon.expiry_date) {
    const expiry = new Date(coupon.expiry_date);
    if (new Date() > expiry) {
      return { valid: false, message: `"${cleanCode}" কুপনের মেয়াদের তারিখ উত্তীর্ণ হয়ে গেছে।` };
    }
  }

  // Check Minimum Order Amount
  const minAmount = Number(coupon.min_order_amount) || 0;
  if (subtotal < minAmount) {
    return {
      valid: false,
      message: `এই কুপন ব্যবহার করতে ন্যূনতম ৳${minAmount.toLocaleString()} টাকার পণ্য অর্ডার করতে হবে।`
    };
  }

  // Calculate Discount Amount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (subtotal * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_limit && discount > Number(coupon.max_discount_limit)) {
      discount = Number(coupon.max_discount_limit);
    }
  } else {
    discount = Number(coupon.discount_value) || 0;
  }

  discount = Math.min(discount, subtotal); // cannot exceed subtotal

  return {
    valid: true,
    discountAmount: Math.round(discount),
    coupon,
    message: `🎉 "${cleanCode}" কুপন সফলভাবে যুক্ত হয়েছে! (-৳${Math.round(discount).toLocaleString()})`
  };
}
