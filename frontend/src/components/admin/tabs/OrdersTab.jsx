import React, { useState, useRef } from 'react';
import {
  Search,
  Package,
  Printer,
  Trash2,
  MapPin,
  Loader2,
  Phone,
  MessageSquare,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { exportToCsv, parseCsv, downloadSampleOrderCsv } from '../../../lib/csvHelper';

export default function OrdersTab({
  orders = [],
  ordersLoading = false,
  globalSearch = '',
  onSelectOrder,
  onPrintInvoice,
  onDeleteOrder,
  onImportOrders = () => {},
  isSuperAdmin = true
}) {
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;
  const shippedOrdersCount = orders.filter((o) => o.order_status === 'shipped').length;

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== 'all' && order.order_status !== orderStatusFilter) {
      return false;
    }
    const query = (orderSearchQuery || globalSearch).trim().toLowerCase();
    if (query) {
      const matchNum = order.order_number?.toLowerCase().includes(query);
      const matchPhone = order.phone?.toLowerCase().includes(query);
      const matchName = order.customer_name?.toLowerCase().includes(query);
      const matchCourier = order.tracking_code?.toLowerCase().includes(query);
      if (!matchNum && !matchPhone && !matchName && !matchCourier) return false;
    }
    return true;
  });

  // 1-Click WhatsApp Quick Action
  function openWhatsApp(order) {
    let p = (order.phone || '').replace(/\D/g, '');
    if (p.startsWith('880')) {
      // already 880
    } else if (p.startsWith('0')) {
      p = '88' + p;
    } else if (p.length === 10) {
      p = '880' + p;
    }

    const itemsText = order.order_items?.map(i => `${i.product_title} (x${i.quantity})`).join(', ') || 'Your ordered items';
    const text = `Hello ${order.customer_name},\nThis is Corporate Technologies regarding your Order #${order.order_number}.\n\nItems: ${itemsText}\nTotal COD Amount: ৳${Number(order.grand_total).toLocaleString()}\nDelivery Address: ${order.delivery_address}, ${order.city}\n\nPlease confirm if your delivery address is correct. Thank you!`;

    window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, '_blank');
  }

  // Export Orders to CSV
  function handleExportCsv() {
    if (filteredOrders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const columns = [
      { key: 'order_number', label: 'Order Number' },
      { key: 'created_at', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'delivery_address', label: 'Delivery Address' },
      { key: 'items', label: 'Items Description' },
      { key: 'subtotal', label: 'Subtotal' },
      { key: 'delivery_fee', label: 'Delivery Fee' },
      { key: 'grand_total', label: 'Grand Total (COD)' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'courier_name', label: 'Courier' },
      { key: 'tracking_code', label: 'Tracking Code' },
      { key: 'order_status', label: 'Status' }
    ];

    const rows = filteredOrders.map(o => ({
      order_number: o.order_number,
      created_at: o.created_at ? new Date(o.created_at).toLocaleString() : '',
      customer_name: o.customer_name,
      phone: o.phone,
      city: o.city || 'Dhaka',
      delivery_address: o.delivery_address,
      items: o.order_items?.map(i => `${i.product_title} (x${i.quantity})`).join('; ') || '',
      subtotal: o.subtotal,
      delivery_fee: o.delivery_fee,
      grand_total: o.grand_total,
      payment_method: o.payment_method,
      courier_name: o.courier_name || '',
      tracking_code: o.tracking_code || '',
      order_status: o.order_status
    }));

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`corporate_tech_orders_${dateStr}.csv`, columns, rows);
  }

  // Import Orders from CSV
  async function handleCsvFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const parsedRows = await parseCsv(file);
      if (parsedRows.length === 0) {
        alert('No data found in uploaded CSV file.');
        return;
      }

      // Format parsed rows into order objects
      const importedOrders = parsedRows.map((r, idx) => ({
        id: `imp-${Date.now()}-${idx}`,
        order_number: r['Order Number'] || r['order_number'] || `CT-IMP-${Date.now().toString().slice(-4)}`,
        customer_name: r['Customer Name'] || r['customer_name'] || 'Imported Customer',
        phone: r['Phone'] || r['phone'] || '',
        delivery_address: r['Delivery Address'] || r['delivery_address'] || 'Dhaka',
        city: r['City'] || r['city'] || 'Dhaka',
        subtotal: Number(r['Subtotal'] || r['subtotal'] || 0),
        delivery_fee: Number(r['Delivery Fee'] || r['delivery_fee'] || 60),
        grand_total: Number(r['Grand Total (COD)'] || r['grand_total'] || 0),
        payment_method: r['Payment Method'] || r['payment_method'] || 'cod',
        order_status: r['Status'] || r['order_status'] || 'pending',
        courier_name: r['Courier'] || r['courier_name'] || '',
        tracking_code: r['Tracking Code'] || r['tracking_code'] || '',
        created_at: new Date().toISOString(),
        order_items: [
          {
            product_title: r['Items Description'] || r['items'] || 'Imported Order Items',
            quantity: 1,
            unit_price: Number(r['Grand Total (COD)'] || r['grand_total'] || 0)
          }
        ]
      }));

      onImportOrders(importedOrders);
      alert(`Successfully imported ${importedOrders.length} orders from CSV!`);
    } catch (err) {
      alert('Failed to parse CSV file: ' + err.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Orders Management</h2>
          <p className="text-xs text-slate-500">
            Manage customer orders, update delivery status, and dispatch couriers
          </p>
        </div>

        {/* Action Buttons: Export & Import CSV */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvFileChange}
          />

          <button
            onClick={downloadSampleOrderCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted sample orders CSV template for Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sample CSV</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Import orders from a CSV spreadsheet"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export current orders list to CSV Excel file"
          >
            <Download className="w-3.5 h-3.5 text-[#c92127]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Filter Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto max-w-full no-scrollbar sm:flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending', count: pendingOrdersCount },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped', count: shippedOrdersCount },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOrderStatusFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                orderStatusFilter === tab.id
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  orderStatusFilter === tab.id ? 'bg-[#c92127] text-white' : 'bg-red-100 text-[#c92127]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Order Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            placeholder="Search Order #, Name, Phone..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c92127]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {ordersLoading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#c92127] animate-spin mx-auto" />
            <span className="text-xs text-slate-500 font-medium">Loading orders database...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No orders found matching criteria.</p>
            <p className="text-[11px] text-slate-400">Try changing status filter or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer & Quick Contact</th>
                  <th className="py-3.5 px-4">Delivery City</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Courier Status</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {order.payment_method === 'cod' ? 'COD' : order.payment_method}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Customer & Quick WhatsApp / Call */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {order.customer_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 font-mono text-[11px]">
                          {order.phone}
                        </span>

                        {/* WhatsApp Button */}
                        <button
                          onClick={() => openWhatsApp(order)}
                          title="Open WhatsApp Chat with Order Details"
                          className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>

                        {/* Call Button */}
                        <a
                          href={`tel:${order.phone}`}
                          title={`Call ${order.phone}`}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {order.city || 'Dhaka'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-slate-900 block">
                        ৳{Number(order.grand_total).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {order.order_items?.length || 1} items
                      </span>
                    </td>

                    {/* Courier Info */}
                    <td className="py-3.5 px-4">
                      {order.tracking_code ? (
                        <div>
                          <span className="font-semibold text-slate-800 block text-[11px]">
                            {order.courier_name || 'Steadfast'}
                          </span>
                          <span className="font-mono text-[10px] text-blue-600 font-medium">
                            {order.tracking_code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        order.order_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : order.order_status === 'confirmed'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : order.order_status === 'processing'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : order.order_status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.order_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onPrintInvoice(order)}
                          title="Print Packing Slip / Invoice"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-black hover:border-slate-400 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectOrder(order)}
                          title="View Details & Courier Dispatch"
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => onDeleteOrder(order.id, order.order_number)}
                            title="Delete Order (Super Admin Only)"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
