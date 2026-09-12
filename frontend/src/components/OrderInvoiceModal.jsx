import React from 'react';
import { X, Printer, Package, Phone, MapPin, Truck } from 'lucide-react';

export default function OrderInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during printing) */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#c92127]" />
            <h3 className="font-bold text-sm sm:text-base">Official Parcel Packing Slip & Invoice</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#c92127] hover:bg-[#b01b20] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">CORPORATE</span>
                <span className="text-2xl font-black tracking-tight text-[#c92127]">TECHNOLOGIES</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Authorized Importer & IT Printing Solutions Specialist
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Dhaka, Bangladesh | Hotline: 01777-277740 | corporatetechbd.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-slate-100 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-md border border-slate-200">
                PARCEL PACKING SLIP / INVOICE
              </span>
              <p className="font-mono font-black text-lg text-[#c92127]">
                {order.order_number}
              </p>
              <p className="text-xs text-slate-500">
                Date: {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Delivery & Customer Info Grid */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-black uppercase tracking-wider text-slate-500 block text-[10px]">
                CUSTOMER INFO (RECIPIENT)
              </span>
              <h4 className="font-bold text-sm text-slate-900">{order.customer_name}</h4>
              <p className="font-mono font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.phone}
              </p>
              <p className="text-slate-600 leading-relaxed flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{order.delivery_address}, {order.city}</span>
              </p>
            </div>

            <div className="space-y-1.5 border-l border-slate-200 pl-6">
              <span className="font-black uppercase tracking-wider text-slate-500 block text-[10px]">
                DELIVERY & PAYMENT DETAILS
              </span>
              <p className="text-slate-700">
                Courier Partner: <strong>{order.courier_name || 'Steadfast Courier'}</strong>
              </p>
              {order.tracking_code && (
                <p className="font-mono font-bold text-blue-700">
                  Tracking Code: {order.tracking_code}
                </p>
              )}
              {order.consignment_id && (
                <p className="font-mono text-slate-600">
                  Consignment ID: {order.consignment_id}
                </p>
              )}
              <p className="text-slate-700">
                Payment Method: <strong className="uppercase">{order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method}</strong>
              </p>
              <p className="text-slate-700">
                Payment Status: <strong className="uppercase font-bold text-emerald-700">{order.payment_status}</strong>
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase text-[10px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">ITEM DESCRIPTION</th>
                  <th className="py-3 px-4 text-center">QTY</th>
                  <th className="py-3 px-4 text-right">UNIT PRICE</th>
                  <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.order_items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.product_title}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ৳{Number(item.unit_price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      ৳{Number(item.total_price || item.unit_price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Price Summary Calculation */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold">৳{Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-mono font-bold">৳{Number(order.delivery_fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Total Due (COD):</span>
                <span className="font-mono text-[#c92127] text-base">
                  ৳{Number(order.grand_total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Signatures */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Thank you for choosing Corporate Technologies!</p>
              <p className="text-[11px] text-slate-400">For order inquiries or support, call our Hotline: 01777-277740</p>
            </div>

            <div className="text-right">
              <div className="w-32 border-b border-slate-400 pb-1 mb-1" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Authorized Signature</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
