import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Truck, 
  Phone, 
  MapPin, 
  User, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartItems,
    subtotal,
    deliveryFee,
    grandTotal,
    deliveryArea,
    clearCart
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    notes: '',
    paymentMethod: 'cod' // 'cod' | 'bkash'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('দয়া করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = `CT-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccessData({
        orderId,
        ...formData,
        items: cartItems,
        total: grandTotal,
        date: new Date().toLocaleDateString('bn-BD')
      });
      clearCart();
      setIsSubmitting(false);
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderSuccessData(null);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 px-6 bg-[#c92127] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold">
              {orderSuccessData ? 'অর্ডার সফল হয়েছে!' : 'চেকআউট ও ডেলিভারি তথ্য'}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {orderSuccessData ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-5">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  ধন্যবাদ, আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
                </h3>
                <p className="text-xs text-slate-500">
                  Corporate Technologies কাস্টমার কেয়ার প্রতিনিধি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি কনফার্ম করবেন।
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">অর্ডার নম্বর:</span>
                  <span className="font-extrabold text-[#c92127]">{orderSuccessData.orderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                  <span className="font-medium text-slate-800">{orderSuccessData.address}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                  <span>সর্বমোট বিল (ক্যাশ অন ডেলিভারি):</span>
                  <span className="text-[#c92127]">৳{orderSuccessData.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-xs px-8 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                আরো শপিং করুন
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Customer Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ১. প্রাপকের তথ্য
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="সম্পূর্ণ নাম লিখুন"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                      />
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">মোবাইল নম্বর *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="017XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                      />
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
                  <div className="relative">
                    <textarea
                      required
                      rows="2"
                      placeholder="বাড়ি/হোল্ডিং নং, রোড, এলাকা, থানা ও জেলা..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                    ></textarea>
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ২. পেমেন্ট মেথড
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label 
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-[#c92127] bg-red-50/50 text-[#c92127] font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="accent-[#c92127]"
                    />
                    <div>
                      <div>ক্যাশ অন ডেলিভারি</div>
                      <span className="text-[10px] text-slate-500 font-normal">পণ্য হাতে পেয়ে টাকা পরিশোধ</span>
                    </div>
                  </label>

                  <label 
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formData.paymentMethod === 'bkash'
                        ? 'border-[#c92127] bg-red-50/50 text-[#c92127] font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={formData.paymentMethod === 'bkash'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                      className="accent-[#c92127]"
                    />
                    <div>
                      <div>বিকাশ / নগদ পেমেন্ট</div>
                      <span className="text-[10px] text-slate-500 font-normal">কল করে পেমেন্ট ডিটেইলস দেওয়া হবে</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট আইটেম ({cartItems.length} টি):</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ ({deliveryArea === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}):</span>
                  <span className="font-bold text-slate-800">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                  <span>সর্বমোট প্রদেয় মূল্য:</span>
                  <span className="text-[#c92127] text-base">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>অর্ডার নিশ্চিত করুন (৳{grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
