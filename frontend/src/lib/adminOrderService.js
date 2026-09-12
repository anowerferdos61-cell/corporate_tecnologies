import { supabase } from './supabaseClient';

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
 * 1-Click Update Order Status (Pending -> Confirmed -> Shipped -> Delivered -> Cancelled)
 */
export async function updateOrderStatus(orderId, newStatus, adminNotes = null) {
  if (!orderId || !newStatus) throw new Error('Order ID and status are required');

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

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', orderId)
    .select(`*, order_items (*)`)
    .single();

  if (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
  return data;
}

/**
 * Assign / Update Courier Dispatch Details
 */
export async function updateCourierDispatch(orderId, {
  courierName,
  trackingCode,
  consignmentId,
  courierStatus
}) {
  if (!orderId) throw new Error('Order ID is required');

  const payload = {
    courier_name: courierName || 'Steadfast',
    tracking_code: trackingCode || null,
    consignment_id: consignmentId || null,
    courier_status: courierStatus || 'In Transit',
    updated_at: new Date().toISOString()
  };

  // If assigning courier, automatically move status to 'shipped' if currently pending/confirmed
  if (courierName && trackingCode) {
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
export async function fetchStoreSettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*');

    if (error || !data) return null;
    const settings = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });
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
