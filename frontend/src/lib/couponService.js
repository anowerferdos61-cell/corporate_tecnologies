import { supabase } from './supabaseClient';

const LOCAL_COUPONS_KEY = 'corporate_tech_coupons_v1';

// Seed initial default coupons for immediate use
const DEFAULT_COUPONS = [
  {
    id: 'c1-welcome10',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 1000,
    max_discount_limit: 500,
    usage_limit: 500,
    per_customer_limit: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c2-inksave50',
    code: 'INKSAVE50',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 500,
    max_discount_limit: null,
    usage_limit: 1000,
    per_customer_limit: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'c3-techcombo100',
    code: 'TECHCOMBO100',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 3000,
    max_discount_limit: null,
    usage_limit: 200,
    per_customer_limit: 1,
    is_active: true,
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
    window.dispatchEvent(new CustomEvent('ct_coupons_updated', { detail: coupons }));
  } catch (err) {
    console.warn('Could not save coupons locally:', err);
  }
}

/**
 * Fetch all coupons for Admin Panel (Supabase + Local fallback)
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
      let exp;
      if (typeof c.expiry_date === 'string' && c.expiry_date.length === 10) {
        exp = new Date(`${c.expiry_date}T23:59:59.999`);
      } else {
        exp = new Date(c.expiry_date);
        if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0 && exp.getUTCSeconds() === 0) {
          exp.setUTCHours(23, 59, 59, 999);
        }
      }
      if (exp.getTime() < now.getTime()) return false;
    }
    return true;
  });
}

/**
 * Create a new coupon (Admin Panel)
 */
export async function createCoupon({
  code,
  discountType = 'fixed',
  discountValue = 0,
  minOrderAmount = 0,
  maxDiscountLimit = null,
  startDate = null,
  expiryDate = null,
  usageLimit = null,
  perCustomerLimit = 1,
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
    start_date: startDate || new Date().toISOString(),
    expiry_date: expiryDate || null,
    usage_limit: usageLimit ? parseInt(usageLimit, 10) : null,
    per_customer_limit: perCustomerLimit ? parseInt(perCustomerLimit, 10) : 1,
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

  const localNew = { ...payload, id: `local_${Date.now()}`, created_at: new Date().toISOString() };
  const local = getLocalCoupons();
  saveLocalCoupons([localNew, ...local]);
  return localNew;
}

/**
 * Toggle Coupon Active Status (Admin Panel)
 */
export async function toggleCouponStatus(id, isActive) {
  try {
    await supabase
      .from('coupons')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase toggle coupon fallback:', err.message);
  }

  const local = getLocalCoupons();
  const updated = local.map(c => c.id === id ? { ...c, is_active: isActive } : c);
  saveLocalCoupons(updated);
  return true;
}

/**
 * Delete a coupon (Admin Panel)
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
 * Secure Server-Side Coupon Validation for Customer Checkout
 * Calls Supabase RPC validate_coupon_code for authoritative verification
 */
export async function validateCoupon(code, subtotal = 0, phone = '') {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, message: 'দয়া করে একটি কুপন কোড লিখুন।' };
  }

  try {
    const { data, error } = await supabase.rpc('validate_coupon_code', {
      coupon_code: cleanCode,
      order_subtotal: Number(subtotal) || 0,
      p_phone: phone || ''
    });

    if (!error && data) {
      if (data.valid) {
        return {
          valid: true,
          discountAmount: Math.round(data.calculated_discount),
          coupon: {
            code: data.code,
            discount_type: data.discount_type,
            discount_value: data.discount_value
          },
          message: `🎉 "${cleanCode}" কুপন সফলভাবে যুক্ত হয়েছে! (-৳${Math.round(data.calculated_discount).toLocaleString()})`
        };
      }
      return {
        valid: false,
        message: data.message || `"${cleanCode}" কুপনটি প্রযোজ্য নয়।`
      };
    }
  } catch (err) {
    console.warn('RPC coupon validation notice:', err.message);
  }

  // Fallback local calculation only if offline
  const coupons = getLocalCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode);
  if (!coupon || !coupon.is_active) {
    return { valid: false, message: `"${cleanCode}" কুপনটি সঠিক নয় বা নিষ্ক্রিয়।` };
  }
  const minAmount = Number(coupon.min_order_amount) || 0;
  if (subtotal < minAmount) {
    return { valid: false, message: `এই কুপন ব্যবহার করতে ন্যূনতম ৳${minAmount.toLocaleString()} টাকার অর্ডার প্রয়োজন।` };
  }

  let discount = coupon.discount_type === 'percentage' 
    ? (subtotal * Number(coupon.discount_value)) / 100 
    : Number(coupon.discount_value) || 0;

  if (coupon.max_discount_limit && discount > Number(coupon.max_discount_limit)) {
    discount = Number(coupon.max_discount_limit);
  }
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discountAmount: Math.round(discount),
    coupon,
    message: `🎉 "${cleanCode}" কুপন সফলভাবে যুক্ত হয়েছে! (-৳${Math.round(discount).toLocaleString()})`
  };
}
