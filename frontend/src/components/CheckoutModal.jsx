import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Copy,
  Check,
  Ticket,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../lib/orderService';
import { getCurrentCustomer } from '../lib/customerAuth';
import { validateCoupon, fetchActiveCoupons } from '../lib/couponService';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsAccountOpen,
    setAccountActiveTab,
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
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Coupon / Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponStatus, setCouponStatus] = useState('idle'); // 'idle' | 'checking' | 'success' | 'error'
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const effectiveGrandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  // Load active coupons when checkout is opened
  useEffect(() => {
    if (isCheckoutOpen) {
      fetchActiveCoupons()
        .then((list) => setAvailableCoupons(list || []))
        .catch(() => {});
    }
  }, [isCheckoutOpen]);

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponStatus('checking');
    setCouponMessage('');

    try {
      const result = await validateCoupon(couponCodeInput, subtotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discountAmount);
        setCouponMessage(result.message);
        setCouponStatus('success');
      } else {
        setCouponMessage(result.message);
        setCouponStatus('error');
      }
    } catch (err) {
      setCouponMessage('কুপন যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setCouponStatus('error');
    }
  };

  const handleQuickApplyCoupon = async (coupon) => {
    setCouponCodeInput(coupon.code);
    setCouponStatus('checking');
    setCouponMessage('');

    try {
      const result = await validateCoupon(coupon.code, subtotal);
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discountAmount);
        setCouponMessage(result.message);
        setCouponStatus('success');
      } else {
        setCouponMessage(result.message);
        setCouponStatus('error');
      }
    } catch (err) {
      setCouponMessage('কুপন প্রয়োগ করতে সমস্যা হয়েছে।');
      setCouponStatus('error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponMessage('');
    setCouponStatus('idle');
  };

  // Auto-fill logged-in customer info
  useEffect(() => {
    if (isCheckoutOpen) {
      const customer = getCurrentCustomer();
      if (customer) {
        setFormData(prev => ({
          ...prev,
          name: customer.full_name || prev.name,
          phone: customer.phone || prev.phone,
          address: customer.address || prev.address,
          city: customer.city || prev.city || 'Dhaka'
        }));
      }
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('দয়া করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const notesWithCoupon = appliedCoupon
        ? `[কুপন: ${appliedCoupon.code} (-৳${couponDiscount})] ${formData.notes}`.trim()
        : formData.notes;

      const createdOrder = await placeOrder({
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        cartItems,
        subtotal,
        deliveryFee,
        grandTotal: effectiveGrandTotal,
        paymentMethod: formData.paymentMethod,
        notes: notesWithCoupon
      });

      setOrderSuccessData(createdOrder);
      clearCart();
    } catch (err) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderSuccessData(null);
    setErrorMessage('');
  };

  const handleCopyOrderNumber = () => {
    if (orderSuccessData?.order_number) {
      navigator.clipboard.writeText(orderSuccessData.order_number);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleTrackCreatedOrder = () => {
    const orderNum = orderSuccessData?.order_number;
    handleClose();
    if (setAccountActiveTab && setIsAccountOpen) {
      setAccountActiveTab('track');
      setIsAccountOpen(true);
    }
  };

  const isCustomerLoggedIn = !!getCurrentCustomer();

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
                  Corporate Technologies কাস্টমার প্রতিনিধি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি কনফার্ম করবেন।
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-slate-500 font-bold">অর্ডার ট্র্যাকিং নম্বর:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#c92127]">
                      {orderSuccessData.order_number}
                    </span>
                    <button
                      onClick={handleCopyOrderNumber}
                      className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                      title="অর্ডার নম্বর কপি করুন"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">গ্রাহকের নাম:</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.customer_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                  <span className="font-medium text-slate-800">{orderSuccessData.delivery_address}, {orderSuccessData.city}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                  <span>সর্বমোট প্রদেয় বিল:</span>
                  <span className="text-[#c92127] text-base">৳{Number(orderSuccessData.grand_total).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleTrackCreatedOrder}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>অর্ডার লাইভ ট্র্যাক করুন</span>
                </button>

                <button
                  onClick={handleClose}
                  className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  আরো শপিং করুন
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Customer Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ১. প্রাপকের ডেলিভারি তথ্য
                  </h4>
                  {isCustomerLoggedIn && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ✓ সেভ করা তথ্য অটো-ফিল্ড
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">আপনার নাম / প্রতিষ্ঠানের নাম *</label>
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
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                      />
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="বাড়ি নং, রোড, এলাকা, থানা..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                      />
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">জেলা / শহর</label>
                    <input
                      type="text"
                      placeholder="ঢাকা, চট্টগ্রাম..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                    />
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
                      <span className="text-[10px] text-slate-500 font-normal">কল করে মার্চেন্ট একাউন্ট দেওয়া হবে</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Coupon / Promo Code Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                  <Ticket className="w-3.5 h-3.5 text-[#c92127]" />
                  <span>কুপন বা ডিসকাউন্ট কোড আছে?</span>
                </div>

                {!appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="যেমন: EID2026, SPLASH10"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-[#c92127]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponStatus === 'checking' || !couponCodeInput.trim()}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {couponStatus === 'checking' ? 'যাচাই...' : 'প্রয়োগ'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-emerald-700 font-bold">
                        -৳{couponDiscount.toLocaleString()} সাশ্রয়!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-slate-400 hover:text-red-600 cursor-pointer text-xs font-bold px-2 py-0.5 rounded hover:bg-red-50"
                    >
                      বাতিল করুন
                    </button>
                  </div>
                )}

                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${couponStatus === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponMessage}
                  </p>
                )}

                {/* Available Active Coupons Grid */}
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-[#c92127]">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        উপলব্ধ স্পেশাল অফারসমূহ (ক্লিক করে ডিসকাউন্ট উপভোগ করুন):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableCoupons.map((c) => {
                        const minAmt = Number(c.min_order_amount) || 0;
                        const isEligible = minAmt === 0 || subtotal >= minAmt;
                        const discountText = c.discount_type === 'percentage'
                          ? `${c.discount_value}% ছাড়`
                          : `৳${Number(c.discount_value).toLocaleString()} ফ্ল্যাট ছাড়`;

                        return (
                          <div
                            key={c.id || c.code}
                            className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                              isEligible
                                ? 'bg-white border-dashed border-red-300 hover:border-[#c92127] hover:shadow-xs'
                                : 'bg-slate-100/80 border-slate-200 opacity-80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1.5">
                              <div>
                                <span className="font-mono font-black text-slate-900 bg-red-50 text-[#c92127] px-1.5 py-0.5 rounded text-[11px] border border-red-200 tracking-wider">
                                  {c.code}
                                </span>
                                <p className="text-xs font-bold text-slate-800 mt-1">
                                  {discountText}
                                </p>
                              </div>

                              {isEligible ? (
                                <button
                                  type="button"
                                  onClick={() => handleQuickApplyCoupon(c)}
                                  className="text-[10px] font-bold bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991c1c] text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0"
                                >
                                  প্রয়োগ করুন
                                </button>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                                  শর্ত প্রযোজ্য
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-500">
                              {minAmt > 0 ? (
                                isEligible ? (
                                  `ন্যূনতম ৳${minAmt.toLocaleString()} অর্ডারে প্রযোজ্য`
                                ) : (
                                  <span className="text-amber-600 font-medium">
                                    আরও ৳${(minAmt - subtotal).toLocaleString()} টাকার পণ্য লাগবে
                                  </span>
                                )
                              ) : (
                                'যেকোনো অর্ডারে প্রযোজ্য'
                              )}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট আইটেম ({cartItems.length} টি):</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>কুপন ডিসকাউন্ট ({appliedCoupon.code}):</span>
                    <span>-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ ({deliveryArea === 'inside_dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}):</span>
                  <span className="font-bold text-slate-800">৳{deliveryFee}</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                  <span>সর্বমোট প্রদেয় মূল্য:</span>
                  <span className="text-[#c92127] text-base">৳{effectiveGrandTotal.toLocaleString()}</span>
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
                    <span>অর্ডার নিশ্চিত করুন (৳{effectiveGrandTotal.toLocaleString()})</span>
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
