import { supabase } from './supabaseClient';
import { getCurrentCustomer, normalizePhone, registerCustomer, updateCustomerProfile } from './customerAuth';

/**
 * Generate human-readable Unique Order Number format (fallback / helper)
 */
export function generateOrderNumber() {
  const d = new Date();
  const year = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CT-${year}${month}-${randomSuffix}`;
}

/**
 * Place an Authoritative & Tamper-Proof Order via Supabase Checkout RPC
 * Includes Idempotency Key protection to prevent duplicate orders on network retry/double-click.
 */
export async function placeOrder({
  customerName,
  phone,
  address,
  city = 'Dhaka',
  cartItems = [],
  couponCode = null,
  paymentMethod = 'cod',
  notes = '',
  idempotencyKey = null
}) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    throw new Error('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
  }
  if (!customerName || customerName.trim().length < 2) {
    throw new Error('দয়া করে আপনার নাম দিন');
  }
  if (!address || address.trim().length < 5) {
    throw new Error('দয়া করে বিস্তারিত ডেলিভারি ঠিকানা দিন');
  }
  if (!cartItems || cartItems.length === 0) {
    throw new Error('আপনার কার্ট খালি! কোনো প্রোডাক্ট সিলেক্ট করুন।');
  }

  // Generate unique idempotency key for this order attempt to prevent duplicates
  const finalIdempotencyKey = idempotencyKey || (`idem_${cleanPhone}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);

  // 1. Check if user is logged in
  let currentCustomer = getCurrentCustomer();

  // 2. Auto-sync customer profile locally
  if (!currentCustomer) {
    try {
      currentCustomer = await registerCustomer({
        phone: cleanPhone,
        full_name: customerName,
        address,
        city,
        rememberMe: true
      });
    } catch (regErr) {
      console.warn('Auto-registration notice:', regErr.message);
    }
  } else if (currentCustomer && (!currentCustomer.address || currentCustomer.address !== address)) {
    updateCustomerProfile({ address, city }).catch(() => {});
  }

  // 3. Format items payload: Send rich identifiers & quantities for authoritative calculation & fallback
  const itemsPayload = cartItems.map(item => {
    const p = item.product || item;
    return {
      product_id: String(p.id || p.product_id || ''),
      slug: String(p.slug || ''),
      variation_id: String(item.variation_id || p.variation_id || ''),
      variation_name: String(item.variation_name || p.variation_name || item.selectedVariation?.name || ''),
      product_title: String(p.title || p.product_title || ''),
      unit_price: Number(item.price || p.sale_price || p.regular_price || 0),
      image_url: String(item.image || p.image_url || ''),
      quantity: Math.max(1, parseInt(item.quantity || 1, 10))
    };
  });

  // 4. Call authoritative database RPC (create_checkout_order) with Idempotency Key
  const { data: orderResult, error: orderErr } = await supabase.rpc('create_checkout_order', {
    p_customer_name: customerName.trim(),
    p_phone: cleanPhone,
    p_delivery_address: address.trim(),
    p_city: city.trim() || 'Dhaka',
    p_items: itemsPayload,
    p_coupon_code: couponCode ? couponCode.trim() : null,
    p_payment_method: paymentMethod || 'cod',
    p_notes: notes ? notes.trim() : null,
    p_idempotency_key: finalIdempotencyKey
  });

  if (orderErr) {
    console.error('Order creation failed via RPC:', orderErr);
    throw new Error(orderErr.message || 'অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
  }

  if (!orderResult || !orderResult.success) {
    throw new Error('অর্ডার সম্পন্ন করা সম্ভব হয়নি।');
  }

  // 5. Store order locally in customer recent order history
  try {
    const recentOrders = JSON.parse(localStorage.getItem('ct_recent_orders') || '[]');
    const existingIndex = recentOrders.findIndex(o => o.order_number === orderResult.order_number);
    if (existingIndex === -1) {
      recentOrders.unshift({
        id: orderResult.order_id,
        order_number: orderResult.order_number,
        grand_total: orderResult.grand_total,
        order_status: orderResult.order_status,
        created_at: new Date().toISOString(),
        items_count: cartItems.length
      });
      localStorage.setItem('ct_recent_orders', JSON.stringify(recentOrders.slice(0, 10)));
    }
  } catch (e) {
    console.warn('Failed to cache order locally:', e);
  }

  return {
    ...orderResult,
    items: cartItems
  };
}

/**
 * Fetch Customer's Orders list
 */
export async function getCustomerOrders(phoneOrCustomerId) {
  if (!phoneOrCustomerId) return [];

  const cleanPhone = normalizePhone(phoneOrCustomerId);
  const isUuid = typeof phoneOrCustomerId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(phoneOrCustomerId);

  // 1. Try secure DEFINER RPC (bypasses RLS safely for customer phone)
  if (cleanPhone && cleanPhone.length === 11) {
    try {
      const { data: rpcOrders, error: rpcErr } = await supabase.rpc('get_customer_orders', {
        p_phone: cleanPhone
      });
      if (!rpcErr && Array.isArray(rpcOrders) && rpcOrders.length > 0) {
        return rpcOrders;
      }
    } catch (e) {
      console.warn('get_customer_orders RPC attempt:', e);
    }
  }

  // 2. Direct Query Fallback
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (cleanPhone && cleanPhone.length === 11) {
    query = query.eq('phone', cleanPhone);
  } else if (isUuid) {
    query = query.eq('customer_id', phoneOrCustomerId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to load customer orders:', error);
    return [];
  }
  return data || [];
}

/**
 * Track Order Authoritatively by Order Number & Phone via Secure RPC
 */
export async function trackOrder(queryStr, phoneQuery = '') {
  if (!queryStr || !queryStr.trim()) return null;

  const trimmed = queryStr.trim();
  const phoneOnly = phoneQuery ? normalizePhone(phoneQuery) : (trimmed.startsWith('01') ? normalizePhone(trimmed) : null);
  const orderNumOnly = trimmed.toUpperCase().startsWith('CT-') ? trimmed.toUpperCase() : (phoneOnly ? '' : trimmed.toUpperCase());

  try {
    const { data, error } = await supabase.rpc('track_guest_order', {
      p_order_number: orderNumOnly || trimmed.toUpperCase(),
      p_phone: phoneOnly || null
    });

    if (error) {
      console.warn('track_guest_order RPC error:', error);
    } else if (data && data.found) {
      return [data];
    }
  } catch (err) {
    console.error('Track order failed:', err);
  }

  return null;
}

