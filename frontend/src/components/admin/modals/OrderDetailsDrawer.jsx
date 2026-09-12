import React, { useState } from 'react';
import {
  X,
  Phone,
  Copy,
  Check,
  MapPin,
  Truck,
  Send,
  Loader2,
  Printer,
  MessageSquare
} from 'lucide-react';
import { CATEGORY_DEFAULT_IMAGES } from '../adminConstants';

export default function OrderDetailsDrawer({
  order,
  onClose,
  onStatusChange,
  onCourierUpdate,
  onPrintInvoice,
  onDeleteOrder
}) {
  const [copiedText, setCopiedText] = useState(null);
  const [courierName, setCourierName] = useState(order.courier_name || 'Steadfast');
  const [trackingCode, setTrackingCode] = useState(order.tracking_code || '');
  const [consignmentId, setConsignmentId] = useState(order.consignment_id || '');
  const [courierStatus, setCourierStatus] = useState(order.courier_status || 'In Transit');
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [isUpdatingCourier, setIsUpdatingCourier] = useState(false);

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  }

  async function handleCourierSubmit(e) {
    e.preventDefault();
    setIsUpdatingCourier(true);
    try {
      await onCourierUpdate(order.id, {
        courierName,
        trackingCode,
        consignmentId,
        courierStatus,
        adminNotes
      });
      alert('Courier dispatch details updated successfully!');
    } catch (err) {
      alert('Failed to update courier dispatch: ' + err.message);
    } finally {
      setIsUpdatingCourier(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-slideIn">
          
          {/* Drawer Top Bar */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c92127] tracking-wider block">
                Order Details
              </span>
              <h3 className="font-mono font-bold text-lg">{order.order_number}</h3>
              <p className="text-xs text-slate-400">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            
            {/* 1. Quick Status Switcher */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Update Order Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange(order.id, st)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      order.order_status === st
                        ? 'bg-[#c92127] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Customer & Delivery Address */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recipient Information
              </span>
              <h4 className="font-bold text-sm text-slate-900">{order.customer_name}</h4>
              <div className="flex flex-wrap items-center gap-2 font-mono text-slate-800">
                <span className="flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {order.phone}
                </span>

                <button
                  onClick={() => copyToClipboard(order.phone, 'phone')}
                  className="text-slate-400 hover:text-black cursor-pointer p-0.5"
                  title="Copy Phone Number"
                >
                  {copiedText === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={() => {
                    let p = (order.phone || '').replace(/\D/g, '');
                    if (p.startsWith('880')) {}
                    else if (p.startsWith('0')) { p = '88' + p; }
                    else if (p.length === 10) { p = '880' + p; }
                    const itemsText = order.order_items?.map(i => `${i.product_title} (x${i.quantity})`).join(', ') || 'Your order';
                    const text = `Hello ${order.customer_name},\nThis is Corporate Technologies regarding your Order #${order.order_number}.\n\nItems: ${itemsText}\nTotal Due: ৳${Number(order.grand_total).toLocaleString()} (COD)\nDelivery Address: ${order.delivery_address}, ${order.city}\n\nPlease confirm if your delivery address is correct. Thank you!`;
                    window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </button>

                {/* Call Button */}
                <a
                  href={`tel:${order.phone}`}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Customer</span>
                </a>
              </div>
              <p className="text-slate-600 flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{order.delivery_address}, {order.city}</span>
              </p>
            </div>

            {/* 3. Products List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Ordered Products ({order.order_items?.length || 0})
              </span>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {order.order_items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex items-center justify-center flex-shrink-0">
                        <img src={item.product_image || CATEGORY_DEFAULT_IMAGES['Printers']} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{item.product_title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Qty: {item.quantity} × ৳{Number(item.unit_price).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="font-mono font-black text-slate-900 whitespace-nowrap">
                      ৳{Number(item.total_price || item.unit_price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal:</span>
                  <span>৳{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee:</span>
                  <span>৳{Number(order.delivery_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount (COD):</span>
                  <span className="text-[#c92127]">৳{Number(order.grand_total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 4. Courier Dispatch Hub */}
            <form onSubmit={handleCourierSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-700 block flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#c92127]" />
                  Courier Dispatch Form
                </span>
                <span className="text-[10px] text-slate-400">Live syncs to customer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                  >
                    <option value="Steadfast">Steadfast Courier</option>
                    <option value="Pathao">Pathao Courier</option>
                    <option value="RedX">RedX Delivery</option>
                    <option value="Sundarban">Sundarban Courier</option>
                    <option value="SA Paribahan">SA Paribahan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Tracking Code
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="e.g. SF-849202"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Consignment ID (Optional)
                </label>
                <input
                  type="text"
                  value={consignmentId}
                  onChange={(e) => setConsignmentId(e.target.value)}
                  placeholder="e.g. CID-99201"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Special packaging notes, courier handover info..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingCourier}
                className="w-full bg-[#18181b] hover:bg-black text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingCourier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#c92127]" />}
                <span>Save Courier & Dispatch Info</span>
              </button>
            </form>

          </div>

          {/* Drawer Bottom Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              onClick={() => onPrintInvoice(order)}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Packing Slip</span>
            </button>
            <button
              onClick={() => onDeleteOrder(order.id, order.order_number)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
