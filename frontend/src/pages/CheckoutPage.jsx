import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
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
  Tag,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../lib/orderService';
import { getCurrentCustomer } from '../lib/customerAuth';
import { validateCoupon, fetchActiveCoupons } from '../lib/couponService';
import { calculateCartShipping } from '../lib/shippingService';

// Popular Bangladesh Districts
const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Bogura', 'Brahmanbaria', 'Dinajpur', 'Faridpur', 
  'Feni', 'Jamalpur', 'Jashore', 'Kushtia', 'Noakhali', 'Pabna', 'Tangail', 'Other'
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    shippingInfo,
    shippingTiers,
    deliveryArea,
    setDeliveryArea,
    updateQuantity,
    removeFromCart,
    clearCart,
    setIsAccountOpen,
    setAccountActiveTab
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
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

  // Calculate dynamic delivery fee based on selected area
  const activeDeliveryFee = cartItems.length === 0 ? 0 : (deliveryFee ?? shippingInfo?.fee ?? (deliveryArea === 'inside_dhaka' ? 60 : 120));
  const effectiveGrandTotal = Math.max(0, subtotal - couponDiscount + activeDeliveryFee);

  // Auto-fill logged-in customer info
  useEffect(() => {
    const customer = getCurrentCustomer();
    if (customer) {
      setFormData(prev => ({
        ...prev,
        name: customer.full_name || prev.name,
        phone: customer.phone || prev.phone,
        address: customer.address || prev.address,
        city: customer.city || prev.city || 'Dhaka'
      }));
      if (customer.city && customer.city.toLowerCase() !== 'dhaka') {
        setDeliveryArea('outside_dhaka');
      }
    }
  }, [setDeliveryArea]);

  // Load active coupons
  useEffect(() => {
    fetchActiveCoupons()
      .then((list) => setAvailableCoupons(list || []))
      .catch(() => {});
  }, []);

  // When city changes, intelligently switch delivery area fee if user selects Outside Dhaka
  const handleCityChange = (cityName) => {
    setFormData(prev => ({ ...prev, city: cityName }));
    if (cityName === 'Dhaka') {
      setDeliveryArea('inside_dhaka');
    } else {
      setDeliveryArea('outside_dhaka');
    }
  };

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cartItems.length === 0) {
      setErrorMessage('আপনার কার্ট খালি! অনুগ্রহ করে পণ্য যুক্ত করুন।');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('দয়া করে নাম, ১১ ডিজিটের মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা দিন।');
      return;
    }

    // Validate phone number format (01XXXXXXXXX)
    const rawPhone = formData.phone.replace(/[\s-]/g, '');
    if (!/^01[3-9]\d{8}$/.test(rawPhone)) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalNotes = formData.notes || '';
      if (formData.altPhone && formData.altPhone.trim()) {
        finalNotes = `[বিকল্প নম্বর: ${formData.altPhone.trim()}] ${finalNotes}`.trim();
      }
      const notesWithCoupon = appliedCoupon
        ? `[কুপন: ${appliedCoupon.code} (-৳${couponDiscount})] ${finalNotes}`.trim()
        : finalNotes;

      const createdOrder = await placeOrder({
        customerName: formData.name,
        phone: rawPhone,
        address: formData.address,
        city: formData.city,
        cartItems,
        couponCode: appliedCoupon?.code || null,
        subtotal,
        deliveryFee: activeDeliveryFee,
        grandTotal: effectiveGrandTotal,
        paymentMethod: formData.paymentMethod,
        notes: notesWithCoupon
      });

      setOrderSuccessData(createdOrder);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (orderSuccessData?.order_number) {
      navigator.clipboard.writeText(orderSuccessData.order_number);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleTrackCreatedOrder = () => {
    if (setAccountActiveTab && setIsAccountOpen) {
      setAccountActiveTab('track');
      setIsAccountOpen(true);
    } else {
      navigate('/my-account');
    }
  };

  const isCustomerLoggedIn = !!getCurrentCustomer();

  // --------------------------------------------------------------------------
  // 1. ORDER SUCCESS VIEW (When order is submitted)
  // --------------------------------------------------------------------------
  if (orderSuccessData) {
    return (
      <div className="bg-slate-50 min-h-[85vh] py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Card Container */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden text-center p-6 sm:p-10 space-y-6">
            
            {/* Animated Celebration Icon */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-24 h-24 bg-emerald-100/70 text-emerald-600 rounded-full flex items-center justify-center ring-8 ring-emerald-50 shadow-inner">
                <CheckCircle className="w-12 h-12 stroke-[2.2]" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
                Confirmed
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ধন্যবাদ! আপনার অর্ডারটি সফল হয়েছে
              </h1>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                আপনার অর্ডারটি আমাদের ডাটাবেজে রেকর্ড করা হয়েছে। আমাদের কাস্টমার প্রতিনিধি শীঘ্রই ফোন করে অর্ডার কনফার্ম করবেন এবং দ্রুত কুরিয়ারে পাঠানো হবে।
              </p>
            </div>

            {/* Order Number Box */}
            <div className="bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">অর্ডার ট্র্যাকিং আইডি</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-[#c92127]">
                    {orderSuccessData.order_number}
                  </span>
                  <button
                    onClick={handleCopyOrderNumber}
                    title="কপি করুন"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#c92127] hover:border-[#c92127] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 text-xs font-bold"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">প্রাপকের নাম</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">মোবাইল নম্বর</span>
                  <span className="font-bold text-slate-800 font-mono">{orderSuccessData.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">ডেলিভারি শহর</span>
                  <span className="font-bold text-slate-800">{orderSuccessData.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">মোট প্রদেয় টাকা</span>
                  <span className="font-black text-slate-900 text-sm">৳{Number(orderSuccessData.grand_total).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs">
                <span className="text-slate-400 block font-medium">ঠিকানা</span>
                <span className="font-medium text-slate-700">{orderSuccessData.delivery_address}</span>
              </div>
            </div>

            {/* WhatsApp Direct Help & Correction Box */}
            <div className="bg-emerald-50/90 border-2 border-emerald-200 rounded-2xl p-4 text-left max-w-lg mx-auto space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>অর্ডারে কোনো ভুল বা নম্বর পরিবর্তন করতে চান?</span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-800/90 leading-relaxed">
                ভুলবশত নম্বর বা ঠিকানায় ভুল হয়ে থাকলে চিন্তার কিছু নেই! এখনই নিচের বাটনে ক্লিক করে সরাসরি আমাদের অফিশিয়াল WhatsApp-এ আপনার সঠিক তথ্য পাঠিয়ে দিন:
              </p>
              <a
                href={`https://wa.me/8801777277740?text=${encodeURIComponent(`হ্যালো Corporate Technologies BD, আমি এইমাত্র অর্ডার করেছি (অর্ডার ট্র্যাকিং আইডি: ${orderSuccessData.order_number})। আমার অর্ডারের তথ্যে একটি সংশোধন রয়েছে:`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer"
              >
                <span>WhatsApp-এ তথ্য সংশোধন করুন</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Quick Courier Notice */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 text-left flex items-start gap-3 max-w-lg mx-auto">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-950">দ্রুত ও বিশ্বস্ত কুরিয়ার ডেলিভারি</p>
                <p className="text-blue-700/90 mt-0.5">
                  আমরা সারা বাংলাদেশে স্টিডফাস্ট ও রেডেক্স এক্সপ্রেস কুরিয়ারের মাধ্যমে সরাসরি ক্যাশ অন ডেলিভারিতে পার্সেল পাঠাই। পার্সেল বুক হলে এসএমএস ও ট্র্যাকিং কোড পাবেন।
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
              <button
                onClick={handleTrackCreatedOrder}
                className="w-full sm:w-auto flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>অর্ডার ট্র্যাক করুন</span>
              </button>
              <Link
                to="/shop"
                className="w-full sm:w-auto flex-1 bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>আরও কেনাকাটা করুন</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. EMPTY CART VIEW
  // --------------------------------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-8 sm:p-12 text-center max-w-md w-full space-y-5">
          <div className="w-20 h-20 bg-red-50 text-[#c92127] rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              আপনার কার্ট বর্তমানে খালি!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              চেকআউট করার জন্য প্রথমে আপনার পছন্দের প্রোডাক্টটি কার্টে যুক্ত করুন।
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-md shadow-red-600/20 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>প্রোডাক্ট দেখুন ও শপিং করুন</span>
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. MAIN CHECKOUT PAGE (Two Columns: Form on Left, Order Summary on Right)
  // --------------------------------------------------------------------------
  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="p-2 bg-[#c92127] text-white rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </span>
              চেকআউট ও ডেলিভারি তথ্য
            </h1>
          </div>

          {/* Safe Badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl self-start sm:self-auto">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>১০০% ক্যাশ অন ডেলিভারি সুবিধা</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 font-semibold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Grid */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================================================================ */}
          {/* LEFT COLUMN: Customer Info, Delivery Area & Payment (Cols: 7) */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer & Shipping Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#c92127] text-white flex items-center justify-center font-black text-xs">
                    ১
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    প্রাপকের ডেলিভারি ঠিকানা
                  </h2>
                </div>
                {isCustomerLoggedIn && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    প্রোফাইল থেকে তথ্য লোড হয়েছে
                  </span>
                )}
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    আপনার পূর্ণ নাম / প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ কামরুল ইসলাম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all"
                    />
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    সচল মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all font-mono"
                    />
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    কুরিয়ার ডেলিভারির সময় এই নম্বরে ফোন করা হবে
                  </span>
                </div>
              </div>

              {/* Alternative Phone (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>বিকল্প মোবাইল নম্বর <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span></span>
                  <span className="text-[10px] text-emerald-600 font-medium">জরুরি প্রয়োজনে যোগাযোগের জন্য</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="যেমন: 018XXXXXXXX (যদি অন্য কোনো নম্বর থাকে)"
                    value={formData.altPhone}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono"
                  />
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Delivery Address & City/District */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা/থানা) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      required
                      placeholder="বাড়ি নং, রোড নম্বর, এলাকা, পোস্ট অফিস বা নিকটস্থ ল্যান্ডমার্ক..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all resize-none"
                    />
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  </div>
                </div>

                {/* District Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      জেলা নির্বাচন করুন
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all font-semibold text-slate-800 appearance-none cursor-pointer"
                      >
                        {BANGLADESH_DISTRICTS.map((district) => (
                          <option key={district} value={district}>
                            {district} {district === 'Dhaka' ? '(ঢাকার ভিতরে)' : '(ঢাকার বাইরে)'}
                          </option>
                        ))}
                      </select>
                      <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      অর্ডার সংক্রান্ত কোনো বিশেষ নোট (ঐচ্ছিক)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="যেমন: দ্রুত ডেলিভারি চাই বা নির্দিষ্ট সময়..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all"
                      />
                      <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Zone Selection Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <span className="w-7 h-7 rounded-full bg-[#c92127] text-white flex items-center justify-center font-black text-xs">
                  ২
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  ডেলিভারি এরিয়া ও কুরিয়ার চার্জ
                </h2>
              </div>

              {/* Dynamic Inside/Outside Dhaka calculations */}
              {(() => {
                const insideCalc = calculateCartShipping(cartItems, 'inside_dhaka', shippingTiers);
                const outsideCalc = calculateCartShipping(cartItems, 'outside_dhaka', shippingTiers);
                const activeCalc = deliveryArea === 'inside_dhaka' ? insideCalc : outsideCalc;

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Inside Dhaka */}
                      <label 
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                          deliveryArea === 'inside_dhaka'
                            ? 'border-[#c92127] bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-[#c92127]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input 
                          type="radio"
                          name="deliveryArea"
                          value="inside_dhaka"
                          checked={deliveryArea === 'inside_dhaka'}
                          onChange={() => {
                            setDeliveryArea('inside_dhaka');
                            setFormData(prev => ({ ...prev, city: 'Dhaka' }));
                          }}
                          className="mt-1 accent-[#c92127] w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm">ঢাকার ভেতরে ডেলিভারি</span>
                            <span className="font-black text-[#c92127] text-sm">
                              {insideCalc.isFreeDelivery ? 'Free (৳০)' : `৳${insideCalc.fee}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            ২৪ ঘণ্টার মধ্যে হোম ডেলিভারি
                          </p>
                        </div>
                      </label>

                      {/* Outside Dhaka */}
                      <label 
                        className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                          deliveryArea === 'outside_dhaka'
                            ? 'border-[#c92127] bg-red-50/40 text-slate-900 shadow-xs ring-1 ring-[#c92127]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <input 
                          type="radio"
                          name="deliveryArea"
                          value="outside_dhaka"
                          checked={deliveryArea === 'outside_dhaka'}
                          onChange={() => {
                            setDeliveryArea('outside_dhaka');
                            if (formData.city === 'Dhaka') {
                              setFormData(prev => ({ ...prev, city: 'Chattogram' }));
                            }
                          }}
                          className="mt-1 accent-[#c92127] w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs sm:text-sm">ঢাকার বাইরে (সারাদেশ)</span>
                            <span className="font-black text-[#c92127] text-sm">
                              {outsideCalc.isFreeDelivery ? 'Free (৳০)' : `৳${outsideCalc.fee}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-400" />
                            ২-৩ দিনের মধ্যে হোম ডেলিভারি
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Applied Tier Notice */}
                    {activeCalc.appliedTier && activeCalc.appliedTier.id !== 'tier-standard' && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-medium">
                        <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          আপনার কার্টের পণ্যের জন্য <strong>{activeCalc.tierName}</strong> শিপিং রেট প্রযোজ্য হয়েছে।
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <span className="w-7 h-7 rounded-full bg-[#c92127] text-white flex items-center justify-center font-black text-xs">
                  ৩
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  পেমেন্ট পদ্ধতি নির্বাচন করুন
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Cash on Delivery */}
                <label 
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#c92127] bg-red-50/40 text-slate-900 ring-1 ring-[#c92127]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="mt-1 accent-[#c92127] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm">ক্যাশ অন ডেলিভারি (COD)</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">জনপ্রিয়</span>
                    </div>
                  </div>
                </label>

                {/* bKash / Mobile Banking */}
                <label 
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                    formData.paymentMethod === 'bkash'
                      ? 'border-[#c92127] bg-red-50/40 text-slate-900 ring-1 ring-[#c92127]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={formData.paymentMethod === 'bkash'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                    className="mt-1 accent-[#c92127] w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm">বিকাশ / নগদ পেমেন্ট</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Trust and Assurance Banner */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">১০০% আসল প্রোডাক্ট</p>
                  <p className="text-slate-500">অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">নিরাপদ ডেলিভারি</p>
                  <p className="text-slate-500">স্টিডফাস্ট ও পাঠাও কুরিয়ার</p>
                </div>
              </div>

              {/* <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#c92127] flex-shrink-0" />
                <div className="text-[11px]">
                  <p className="font-bold text-slate-800">সহজ রিটার্ন পলিসি</p>
                  <p className="text-slate-500">পণ্য চেক করে গ্রহণের সুবিধা</p>
                </div>
              </div> */}
            {/* </div> */}

          </div>
          

          {/* ================================================================ */}
          {/* RIGHT COLUMN: Order Summary & Cart Items Review (Cols: 5) */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 sticky top-24 space-y-5">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c92127]" />
                  <h2 className="text-base font-bold text-slate-900">
                    অর্ডার সারসংক্ষেপ ({cartCount}টি আইটেম)
                  </h2>
                </div>
                <Link 
                  to="/shop" 
                  className="text-xs font-bold text-[#c92127] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  আরও যোগ করুন
                </Link>
              </div>

              {/* Items List in Cart */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const p = item.product;
                  const itemKey = p.cart_item_key || p.id;
                  const itemPrice = p.sale_price || p.regular_price || 0;
                  const lineTotal = itemPrice * item.quantity;

                  return (
                    <div key={itemKey} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src={p.image_url || '/placeholder.png'} 
                          alt={p.title} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                        />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={p.title}>
                          {p.title}
                        </h4>
                        {p.variation_name && (
                          <span className="inline-block text-[10px] font-bold text-[#c92127] bg-red-50 px-2 py-0.5 rounded-md border border-red-100 mt-0.5">
                            {p.variation_name}
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ৳{itemPrice.toLocaleString()} × {item.quantity}
                        </div>
                        
                        {/* Inline Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="কমান"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-800 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                              className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="বাড়ান"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(itemKey)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                          ৳{lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon / Promo Code Section */}
              <div className="pt-3 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-mono font-bold text-emerald-800 text-xs">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-700 ml-2 font-bold">(-৳{couponDiscount.toLocaleString()})</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="কুপন বা ডিসকাউন্ট কোড..."
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:bg-white focus:border-[#c92127] outline-none"
                        />
                        <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponStatus === 'checking' || !couponCodeInput.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {couponStatus === 'checking' ? 'যাচাই...' : 'প্রয়োগ'}
                      </button>
                    </div>

                    {/* Quick apply active coupons */}
                    {availableCoupons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400">কুপন:</span>
                        {availableCoupons.slice(0, 3).map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => handleQuickApplyCoupon(cp)}
                            className="text-[10px] bg-red-50 text-[#c92127] hover:bg-red-100 font-mono font-bold px-2 py-0.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {cp.code}
                          </button>
                        ))}
                      </div>
                    )}

                    {couponMessage && (
                      <p className={`text-[11px] font-semibold mt-1 ${couponStatus === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {couponMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল</span>
                  <span className="font-bold text-slate-800 font-mono">৳{subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span className="font-bold font-mono">-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-bold text-slate-800 font-mono">৳{activeDeliveryFee.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm sm:text-base font-black text-slate-900 block">সর্বমোট প্রদেয়</span>
                    <span className="text-[10px] text-slate-400">(ভ্যাট সহ সর্বমোট মূল্য)</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#c92127] font-mono">
                    ৳{effectiveGrandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] active:scale-98 disabled:opacity-60 text-white font-extrabold py-4 px-6 rounded-2xl text-sm sm:text-base transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>অর্ডার গ্রহণ করা হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>অর্ডার কনফার্ম করুন (৳{effectiveGrandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  অর্ডার কনফার্ম করার সাথে সাথেই আপনি এসএমএস ও ট্র্যাকিং নম্বর পাবেন।
                </p>
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
