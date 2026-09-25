import { supabase } from './supabaseClient';
import { generateOrderNumber } from './orderService';
import { normalizePhone, registerCustomer } from './customerAuth';

/**
 * Fetch all customer orders with order_items
 */
export async function fetchAdminOrders({ statusFilter = 'all', searchQuery = '' } = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('order_status', statusFilter);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim();
    query = query.or(`order_number.ilike.%${q}%,phone.ilike.%${q}%,customer_name.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to fetch admin orders:', error);
    throw error;
  }
  return data || [];
}

/**
 * State Machine Allowed Transitions Map
 */
export const ALLOWED_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

/**
 * Check if a status transition is valid according to the state machine
 */
export function isValidStatusTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Secure Database/RPC Enforced Order Status Update (Strict State Machine)
 */
export async function updateOrderStatus(orderIdOrNumber, newStatus, adminNotes = null) {
  if (!orderIdOrNumber || !newStatus) throw new Error('Order ID and status are required');

  let orderId = orderIdOrNumber;
  const isUuid = typeof orderIdOrNumber === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);

  // If provided an order_number rather than UUID, resolve the UUID first
  if (!isUuid) {
    try {
      const { data: matched } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderIdOrNumber)
        .maybeSingle();
      if (matched?.id) {
        orderId = matched.id;
      }
    } catch (e) {
      console.warn('Could not resolve order UUID by order_number:', e);
    }
  }

  // 1. First attempt authoritative RPC execution
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_admin_notes: adminNotes
    });

    if (!rpcError && rpcData) {
      // Ensure order_items are loaded with the order
      if (!rpcData.order_items || rpcData.order_items.length === 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        rpcData.order_items = items || [];
      }
      return rpcData;
    }

    if (rpcError) {
      // If error is from DB state machine violation or auth, surface immediately
      if (rpcError.message && (
        rpcError.message.includes('Illegal order status transition') || 
        rpcError.message.includes('Unauthorized') ||
        rpcError.message.includes('Terminal states') ||
        rpcError.code === '23514' ||
        rpcError.code === '42501'
      )) {
        throw new Error(rpcError.message);
      }
      console.warn('RPC update_order_status notice, checking direct update fallback:', rpcError.message);
    }
  } catch (err) {
    if (err.message && (err.message.includes('Illegal order status transition') || err.message.includes('Unauthorized') || err.message.includes('Terminal states'))) {
      throw err;
    }
  }

  // 2. Fallback to direct UPDATE (Trigger will enforce transition validity at DB level)
  const payload = {
    order_status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (newStatus === 'delivered') {
    payload.payment_status = 'paid';
  }

  if (adminNotes !== null) {
    payload.admin_notes = adminNotes;
  }

  const query = supabase
    .from('orders')
    .update(payload);

  const { data, error } = isUuid
    ? await query.eq('id', orderId).select(`*, order_items (*)`).single()
    : await query.or(`id.eq.${orderId},order_number.eq.${orderIdOrNumber}`).select(`*, order_items (*)`).single();

  if (error) {
    console.error('Failed to update order status:', error);
    throw new Error(error.message || 'Database rejected status update');
  }
  return data;
}

/**
 * Fetch Order Status Transition Audit History
 */
export async function fetchOrderStatusHistory(orderId) {
  if (!orderId) return [];

  // Try RPC first
  try {
    const { data, error } = await supabase.rpc('get_order_status_history', {
      p_order_id: orderId
    });
    if (!error && Array.isArray(data)) return data;
  } catch (e) {
    console.warn('get_order_status_history RPC note:', e.message);
  }

  // Fallback to direct SELECT on order_status_history table
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (!error && data) return data;
  } catch (e) {
    console.warn('Direct order_status_history fetch note:', e.message);
  }

  return [];
}

/**
 * Assign / Update Courier Dispatch Details
 */
export async function updateCourierDispatch(orderId, {
  courierName,
  trackingCode,
  consignmentId,
  courierStatus,
  currentStatus = null
}) {
  if (!orderId) throw new Error('Order ID is required');

  const payload = {
    courier_name: courierName || 'Steadfast',
    tracking_code: trackingCode || null,
    consignment_id: consignmentId || null,
    courier_status: courierStatus || 'In Transit',
    updated_at: new Date().toISOString()
  };

  // Only advance status to 'shipped' if currently in 'processing' state
  // (State machine forbids jumping directly from pending/confirmed to shipped)
  if (currentStatus === 'processing' && courierName && trackingCode) {
    payload.order_status = 'shipped';
  }

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    console.error('Failed to update courier dispatch:', error);
    throw error;
  }
  return data;
}

/**
 * Delete Order (for test orders or cancellations)
 */
export async function deleteOrder(orderId) {
  if (!orderId) throw new Error('Order ID is required');

  // Cascade delete order_items first if not cascaded by DB
  try {
    await supabase.from('order_items').delete().eq('order_id', orderId);
  } catch {}

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
  return true;
}

/**
 * Fetch All Customers with purchase history aggregates
 */
export async function fetchAdminCustomers() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch customers:', error);
    throw error;
  }

  // Fetch orders to calculate totals per customer
  const { data: allOrders } = await supabase
    .from('orders')
    .select('customer_id, phone, grand_total, order_status');

  const ordersByPhone = {};
  if (allOrders) {
    allOrders.forEach(ord => {
      const p = ord.phone;
      if (!ordersByPhone[p]) {
        ordersByPhone[p] = { count: 0, totalSpend: 0 };
      }
      ordersByPhone[p].count += 1;
      ordersByPhone[p].totalSpend += Number(ord.grand_total || 0);
    });
  }

  return (customers || []).map(c => ({
    ...c,
    ordersCount: ordersByPhone[c.phone]?.count || 0,
    totalSpent: ordersByPhone[c.phone]?.totalSpend || 0
  }));
}

/**
 * Fetch Store Settings from store_settings table
 */
export async function fetchStoreSettings(specificKey = null) {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');

    if (error || !data) return null;
    const settings = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });
    if (specificKey) {
      return settings[specificKey] || null;
    }
    return settings;
  } catch {
    return null;
  }
}

/**
 * Update Store Setting in Supabase
 */
export async function updateStoreSetting(key, value) {
  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to update store setting:', err);
    throw err;
  }
}

/**
 * Admin Manual Order Creator (e.g. for Phone Calls, WhatsApp orders, or Walk-in customers)
 */
export async function createManualOrder({
  customerName,
  phone,
  address,
  city = 'Dhaka',
  items = [],
  subtotal = 0,
  deliveryFee = 60,
  discount = 0,
  grandTotal = 0,
  paymentMethod = 'cod',
  paymentStatus = 'unpaid',
  orderStatus = 'pending',
  courierName = null,
  trackingCode = null,
  consignmentId = null,
  adminNotes = '',
  customerNotes = ''
}) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    throw new Error('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
  }
  if (!customerName || customerName.trim().length < 2) {
    throw new Error('দয়া করে গ্রাহকের নাম দিন');
  }
  if (!address || address.trim().length < 3) {
    throw new Error('দয়া করে গ্রাহকের ডেলিভারি ঠিকানা দিন');
  }
  if (!items || items.length === 0) {
    throw new Error('অর্ডারে অন্তত একটি প্রোডাক্ট যোগ করুন');
  }

  // 1. Check or auto register customer in customers table
  let customerId = null;
  try {
    const cust = await registerCustomer({
      phone: cleanPhone,
      full_name: customerName,
      address,
      city,
      rememberMe: false
    });
    customerId = cust?.id || null;
  } catch (err) {
    console.warn('Customer auto sync note:', err.message);
  }

  const orderNumber = generateOrderNumber();

  // 2. Insert into orders table
  const orderPayload = {
    order_number: orderNumber,
    customer_id: customerId,
    customer_name: customerName.trim(),
    phone: cleanPhone,
    delivery_address: address.trim(),
    city: city.trim() || 'Dhaka',
    subtotal: Number(subtotal) || 0,
    delivery_fee: Number(deliveryFee) || 0,
    grand_total: Number(grandTotal) || 0,
    payment_method: paymentMethod || 'cod',
    payment_status: paymentStatus || 'unpaid',
    order_status: orderStatus || 'pending',
    courier_name: courierName || null,
    tracking_code: trackingCode || null,
    consignment_id: consignmentId || null,
    courier_status: trackingCode ? 'In Transit' : 'Not assigned',
    admin_notes: adminNotes?.trim() || null,
    notes: customerNotes?.trim() || ''
  };

  let createdOrder = null;

  try {
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderErr) throw orderErr;
    createdOrder = orderData;
  } catch (dbErr) {
    console.warn('Supabase direct order insert fallback to local object:', dbErr);
    createdOrder = {
      ...orderPayload,
      id: 'ord_' + Date.now(),
      created_at: new Date().toISOString()
    };
  }

  // 3. Insert order_items
  const itemsPayload = items.map(item => {
    const unitPrice = Number(item.unit_price ?? item.sale_price ?? item.regular_price ?? 0);
    const qty = Number(item.quantity || 1);
    return {
      order_id: createdOrder.id,
      product_id: String(item.id || item.product_id || ''),
      product_title: item.title || item.product_title || 'Product',
      product_image: item.image_url || item.product_image || '',
      unit_price: unitPrice,
      quantity: qty,
      total_price: unitPrice * qty
    };
  });

  try {
    const { data: insertedItems } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select();

    createdOrder.order_items = insertedItems || itemsPayload;
  } catch (itemErr) {
    console.warn('Order items insert notice:', itemErr);
    createdOrder.order_items = itemsPayload;
  }

  // Always save locally so admin list updates even in offline/demo mode
  try {
    const localOrders = JSON.parse(localStorage.getItem('corp_tech_local_orders') || '[]');
    localOrders.unshift(createdOrder);
    localStorage.setItem('corp_tech_local_orders', JSON.stringify(localOrders));
  } catch {}

  return createdOrder;
}
