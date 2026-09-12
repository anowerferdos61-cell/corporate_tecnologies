import { supabase } from './supabaseClient';
import { getCurrentCustomer, normalizePhone, registerCustomer, updateCustomerProfile } from './customerAuth';

/**
 * Generate human-readable Unique Order Number (e.g. CT-2609-4821)
 */
export function generateOrderNumber() {
  const d = new Date();
  const year = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CT-${year}${month}-${randomSuffix}`;
}

/**
 * Place a real order into Supabase orders & order_items tables
 */
export async function placeOrder({
  customerName,
  phone,
  address,
  city = 'Dhaka',
  cartItems = [],
  subtotal = 0,
  deliveryFee = 60,
  grandTotal = 0,
  paymentMethod = 'cod',
  notes = '',
  autoRegisterPassword = ''
}) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    throw new Error('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
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

  // 1. Check if user is logged in
  let currentCustomer = getCurrentCustomer();

  // 2. Always auto-register or sync customer using Phone, Name & Courier Address!
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
    // If logged in, update default courier address for future orders
    updateCustomerProfile({ address, city }).catch(() => {});
  }

  const orderNumber = generateOrderNumber();

  // 3. Insert order record into `orders` table
  const orderPayload = {
    order_number: orderNumber,
    customer_id: currentCustomer?.id || null,
    customer_name: customerName.trim(),
    phone: cleanPhone,
    delivery_address: address.trim(),
    city: city.trim() || 'Dhaka',
    subtotal: Number(subtotal) || 0,
    delivery_fee: Number(deliveryFee) || 0,
    grand_total: Number(grandTotal) || 0,
    payment_method: paymentMethod || 'cod',
    payment_status: 'unpaid',
    order_status: 'pending',
    notes: notes.trim()
  };

  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select()
    .single();

  if (orderErr || !orderData) {
    console.error('Order creation error on Supabase:', orderErr);
    throw new Error(orderErr?.message || 'অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
  }

  // 4. Insert items into `order_items` table
  const itemsPayload = cartItems.map(item => {
    const p = item.product || item;
    const unitPrice = Number(p.sale_price ?? p.unit_price ?? p.regular_price ?? 0);
    const qty = Number(item.quantity || 1);
    return {
      order_id: orderData.id,
      product_id: String(p.id || p.product_id || ''),
      product_title: p.title || p.product_title || 'Product',
      product_image: p.image_url || p.product_image || '',
      unit_price: unitPrice,
      quantity: qty,
      total_price: unitPrice * qty
    };
  });

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(itemsPayload);

  if (itemsErr) {
    console.warn('Items insert notice (order was created):', itemsErr);
  }

  // 5. Store order locally in customer recent order history
  try {
    const recentOrders = JSON.parse(localStorage.getItem('ct_recent_orders') || '[]');
    recentOrders.unshift({
      id: orderData.id,
      order_number: orderData.order_number,
      grand_total: orderData.grand_total,
      order_status: orderData.order_status,
      created_at: orderData.created_at,
      items_count: cartItems.length
    });
    localStorage.setItem('ct_recent_orders', JSON.stringify(recentOrders.slice(0, 10)));
  } catch {}

  return {
    ...orderData,
    items: itemsPayload
  };
}

/**
 * Fetch Customer's Orders list
 */
export async function getCustomerOrders(phoneOrCustomerId) {
  if (!phoneOrCustomerId) return [];

  const cleanPhone = normalizePhone(phoneOrCustomerId);
  const isUuid = typeof phoneOrCustomerId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(phoneOrCustomerId);

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
 * Track Order by Order Number (e.g. CT-2609-4821) or Phone
 */
export async function trackOrder(queryStr) {
  if (!queryStr || !queryStr.trim()) return null;

  const trimmed = queryStr.trim();
  const cleanPhone = normalizePhone(trimmed);

  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (trimmed.toUpperCase().startsWith('CT-')) {
    query = query.eq('order_number', trimmed.toUpperCase());
  } else if (cleanPhone && cleanPhone.length === 11) {
    query = query.eq('phone', cleanPhone);
  } else {
    query = query.ilike('order_number', `%${trimmed}%`);
  }

  const { data, error } = await query.limit(5);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data;
}
