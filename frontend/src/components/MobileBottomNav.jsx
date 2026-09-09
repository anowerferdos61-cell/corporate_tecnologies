import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  SlidersHorizontal, 
  Zap, 
  Headphones,
  User,
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  ArrowRight, 
  Flame, 
  Tag, 
  Copy, 
  Check, 
  MessageCircle, 
  MapPin,
  FileText,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  Sparkles,
  Trash2,
  Plus,
  Droplet
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav({ currentRoute, onNavigate, allProducts = [] }) {
  const { setIsAccountOpen, setAccountActiveTab, isAccountOpen } = useCart();
  const [activeModal, setActiveModal] = useState(null); // 'offers' | 'compare' | 'support' | 'track' | 'account' | null
  
  // Tracking state
  const [orderQuery, setOrderQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);

  // Compare state (Pick 2 products from allProducts)
  const [hasUserClearedCompare, setHasUserClearedCompare] = useState(() => {
    try {
      return localStorage.getItem('ct_compare_cleared') === 'true';
    } catch {
      return false;
    }
  });

  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  
  // Coupon copied feedback
  const [copiedCode, setCopiedCode] = useState(null);

  // Countdown timer for Happy Hour deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  // Account state
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize comparison with 2 products when compare modal opens (unless user cleared it)
  useEffect(() => {
    if (activeModal === 'compare' && !hasUserClearedCompare && compareList.length === 0 && allProducts.length >= 2) {
      const initial = [allProducts[0], allProducts[1]];
      setCompareList(initial);
      try {
        localStorage.setItem('ct_compare_list', JSON.stringify(initial));
      } catch {}
    }
  }, [activeModal, allProducts, compareList.length, hasUserClearedCompare]);

  // Listen for compare updates from ProductCards
  useEffect(() => {
    const handleCompareSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCompareList(e.detail);
        setHasUserClearedCompare(e.detail.length === 0);
      }
    };
    window.addEventListener('ct_compare_updated', handleCompareSync);
    return () => window.removeEventListener('ct_compare_updated', handleCompareSync);
  }, []);

  // Handle Order Track search
  const handleTrackOrder = (e) => {
    if (e) e.preventDefault();
    if (!orderQuery.trim()) return;

    setIsSearchingTrack(true);
    setTimeout(() => {
      setIsSearchingTrack(false);
      const query = orderQuery.trim().toUpperCase();
      setTrackResult({
        orderId: query.startsWith('CT-') ? query : `CT-${query}`,
        customerName: 'সম্মানিত গ্রাহক',
        status: 'In Transit',
        statusText: 'ডেলিভারির পথে আছে',
        estDate: 'আগামীকাল বিকালের মধ্যে ডেলিভারি',
        steps: [
          { title: 'অর্ডার নিশ্চিত হয়েছে', date: 'আজ সকাল ১০:৩০', done: true },
          { title: 'প্যাকিং ও কোয়ালিটি চেক সম্পন্ন', date: 'আজ দুপুর ১২:১৫', done: true },
          { title: 'ডেলিভারি পার্টনারের কাছে হস্তান্তরিত', date: 'আজ বিকাল ৩:০০', done: true, current: true },
          { title: 'সফলভাবে ডেলিভারি সম্পন্ন', date: 'প্রত্যাশিত', done: false }
        ]
      });
    }, 600);
  };

  const copyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      const profile = {
        name: loginName.trim() || 'সম্মানিত গ্রাহক',
        phone: loginPhone.trim(),
        joined: new Date().toLocaleDateString('bn-BD'),
        ordersCount: 1
      };
      setUserProfile(profile);
      try {
        localStorage.setItem('ct_user_profile', JSON.stringify(profile));
      } catch {}
      setIsLoggingIn(false);
    }, 600);
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('ct_user_profile');
    } catch {}
  };

  return (
    <>
      {/* 1. STAR TECH STYLE MOBILE BOTTOM NAVIGATION BAR (RED THEME - MATCHES TOP NAVBAR) */}
      <nav 
        id="mobile-bottom-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#c92127] border-t border-[#a8191e] text-white shadow-2xl pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-15 items-center px-1 text-center">
          
          {/* TAB 1: Offer (Directly navigates to Shop with highest discounts on top) */}
          <button
            onClick={() => {
              setActiveModal(null);
              if (onNavigate) {
                onNavigate('/shop/', 'Shop');
              } else {
                window.history.pushState({}, '', '/shop/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-colors ${
              currentRoute?.path === '/shop' || (currentRoute?.type === 'category' && currentRoute?.categorySlug === 'shop')
                ? 'text-white bg-white/20 rounded-xl' 
                : 'text-white/85 hover:text-white'
            }`}
          >
            <div className="relative">
              <Zap className={`w-5 h-5 ${currentRoute?.path === '/shop' || (currentRoute?.type === 'category' && currentRoute?.categorySlug === 'shop') ? 'fill-current text-white' : ''}`} />
              <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-300 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-amber-300 rounded-full"></span>
            </div>
            <span className="text-[10px] font-black mt-1 tracking-tight">Offer</span>
          </button>

          {/* TAB 2: Inks (Directly navigates to Splashjet Inks Collection) */}
          <button
            onClick={() => {
              setActiveModal(null);
              if (onNavigate) {
                onNavigate('/product-category/splashjet-ink/', 'Splashjet Ink');
              } else {
                window.history.pushState({}, '', '/product-category/splashjet-ink/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-colors ${
              currentRoute?.categorySlug === 'splashjet-ink'
                ? 'text-white bg-white/20 rounded-xl' 
                : 'text-white/85 hover:text-white'
            }`}
          >
            <Droplet className={`w-5 h-5 ${currentRoute?.categorySlug === 'splashjet-ink' ? 'fill-current text-white' : ''}`} />
            <span className="text-[10px] font-black mt-1 tracking-tight">Inks</span>
          </button>

          {/* TAB 3: Compare (Target for fly animation, navigates directly to /compare/ page) */}
          <button
            id="bottom-nav-compare-tab"
            onClick={() => {
              setActiveModal(null);
              if (onNavigate) {
                onNavigate('/compare/', 'Product Compare');
              } else {
                window.history.pushState({}, '', '/compare/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-all ${
              currentRoute?.type === 'compare' || currentRoute?.path === '/compare'
                ? 'text-white bg-white/20 rounded-xl' 
                : 'text-white/85 hover:text-white'
            }`}
          >
            <div className="relative">
              <SlidersHorizontal className={`w-5 h-5 ${currentRoute?.type === 'compare' || currentRoute?.path === '/compare' ? 'text-white' : ''}`} />
              {compareList.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-[#c92127] text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {compareList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black mt-1 tracking-tight">Compare</span>
          </button>

          {/* TAB 4: Call (Instant Support Helpline & Branches) */}
          <button
            onClick={() => setActiveModal('support')}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-colors ${
              activeModal === 'support' ? 'text-white bg-white/20 rounded-xl' : 'text-white/85 hover:text-white'
            }`}
          >
            <PhoneCall className={`w-5 h-5 ${activeModal === 'support' ? 'text-white' : ''}`} />
            <span className="text-[10px] font-black mt-1 tracking-tight">Call</span>
          </button>

          {/* TAB 5: Account (Customer Dashboard & Orders) */}
          <button
            onClick={() => {
              setActiveModal(null);
              setAccountActiveTab('account');
              setIsAccountOpen(true);
            }}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-colors ${
              isAccountOpen ? 'text-white bg-white/20 rounded-xl' : 'text-white/85 hover:text-white'
            }`}
          >
            <div className="relative">
              <User className={`w-5 h-5 ${isAccountOpen ? 'text-white' : ''}`} />
              {userProfile && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-300 rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] font-black mt-1 tracking-tight">Account</span>
          </button>

        </div>
      </nav>

      {/* 2. SUPPORT MODAL */}
      {activeModal === 'support' && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-slideUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">কাস্টমার কেয়ার ও সাপোর্ট</h3>
                  <p className="text-[11px] text-slate-500">সরাসরি কথা বলুন অথবা চ্যাট করুন</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a 
                href="tel:+8801777277740"
                className="bg-[#c92127] hover:bg-[#b91c1c] text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md active:scale-95 transition-all"
              >
                <PhoneCall className="w-6 h-6 mb-1" />
                <span className="text-xs font-black">হটলাইনে কল দিন</span>
                <span className="text-[10px] text-red-100 mt-0.5">01777-277740</span>
              </a>

              <a 
                href="https://wa.me/8801777277740?text=Hello%20Corporate%20Technologies,%20I%20need%20assistance"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md active:scale-95 transition-all"
              >
                <MessageCircle className="w-6 h-6 mb-1" />
                <span className="text-xs font-black">হোয়াটসঅ্যাপ চ্যাট</span>
                <span className="text-[10px] text-emerald-100 mt-0.5">তাৎক্ষণিক সমাধান</span>
              </a>
            </div>

            {/* Department Contacts List */}
            <div className="space-y-2 mb-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                বিভাগভিত্তিক হটলাইন
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200 text-xs">
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">সেলস ও অর্ডার ডিপার্টমেন্ট</span>
                    <span className="text-[10px] text-slate-500">প্রোডাক্ট বুকিং ও রেট সংক্রান্ত তথ্য</span>
                  </div>
                  <a href="tel:+8801777177730" className="text-[#c92127] font-black text-xs hover:underline">
                    01777-177730
                  </a>
                </div>

                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">টেকনিক্যাল সার্ভিস ও ইঞ্জিনিয়ার</span>
                    <span className="text-[10px] text-slate-500">প্রিন্টার ও ফটোকপিয়ার সমস্যা সমাধান</span>
                  </div>
                  <a href="tel:+8801793024085" className="text-[#c92127] font-black text-xs hover:underline">
                    01793-024085
                  </a>
                </div>

                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">চট্টগ্রাম ব্রাঞ্চ ম্যানেজার</span>
                    <span className="text-[10px] text-slate-500">আগ্রাবাদ কমার্শিয়াল এরিয়া</span>
                  </div>
                  <a href="tel:+8801897779010" className="text-[#c92127] font-black text-xs hover:underline">
                    01897-779010
                  </a>
                </div>
              </div>
            </div>

            {/* Office Time & Address */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-[#c92127] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">প্রধান শোরুম ও হেড অফিস</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  মতিঝিল বা/এ, ঢাকা-১০০০ (সকাল ৯:০০ - রাত ৮:০০)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCOUNT MODAL */}
      {activeModal === 'account' && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-slideUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">আমার অ্যাকাউন্ট</h3>
                  <p className="text-[11px] text-slate-500">অর্ডার হিস্টোরি ও প্রোফাইল তথ্য</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {userProfile ? (
              /* Logged-In User Dashboard */
              <div className="space-y-4">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#c92127] flex items-center justify-center text-lg font-black text-white">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm">{userProfile.name}</h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{userProfile.phone}</p>
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">● ভেরিফাইড কাস্টমার</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title="লগআউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Account Navigation Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => {
                      setActiveModal('track');
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left hover:bg-red-50 transition-colors"
                  >
                    <Package className="w-4 h-4 text-[#c92127]" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">আমার অর্ডার</span>
                      <span className="text-[10px] text-slate-500">ডেলিভারি স্ট্যাটাস</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setActiveModal(null);
                      if (onNavigate) onNavigate('/shop/', 'Shop');
                    }}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-[#c92127]" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">উইশলিস্ট</span>
                      <span className="text-[10px] text-slate-500">পছন্দের পণ্য</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveModal('offers')}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left hover:bg-red-50 transition-colors"
                  >
                    <Tag className="w-4 h-4 text-[#c92127]" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">আমার ভাউচার</span>
                      <span className="text-[10px] text-slate-500">স্পেশাল ছাড়</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveModal('support')}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-left hover:bg-red-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#c92127]" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">কোটেশন ও বিল</span>
                      <span className="text-[10px] text-slate-500">কর্পোরেট চালান</span>
                    </div>
                  </button>
                </div>

                {/* Customer Support Strip */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#c92127]" />
                    <span className="text-xs font-bold text-slate-800">১ বছর ফ্রি আফটার-সেলস সার্ভিস</span>
                  </div>
                  <a href="tel:+8801777277740" className="text-xs font-black text-[#c92127] hover:underline">
                    হেল্পলাইন →
                  </a>
                </div>
              </div>
            ) : (
              /* Quick Login / Sign In Form */
              <div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/80 rounded-2xl p-4 mb-4">
                  <h4 className="text-xs font-black text-[#c92127] uppercase tracking-wider mb-1">
                    লগইন এর সুবিধাসমূহ
                  </h4>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>✓ ১-ক্লিকে বারবার দ্রুত অর্ডার করার সুবিধা</li>
                    <li>✓ ডিজিটাল ইনভয়েস ও ওয়ারেন্টি ট্র্যাক</li>
                    <li>✓ বিশেষ ছাড় ও মেম্বারশিপ অফার</li>
                  </ul>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      মোবাইল নম্বর
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      আপনার নাম (ঐচ্ছিক)
                    </label>
                    <input 
                      type="text"
                      placeholder="আপনার নাম লিখুন"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginPhone.trim()}
                    className="w-full bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer mt-2"
                  >
                    {isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন / সাইন ইন করুন'}
                  </button>
                </form>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone('01777277740');
                      setLoginName('কর্পোরেট ক্লায়েন্ট');
                    }}
                    className="text-[11px] text-slate-500 hover:text-[#c92127] font-semibold hover:underline"
                  >
                    ডেমো নম্বর অটোফিল করুন
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ORDER TRACKING MODAL */}
      {activeModal === 'track' && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-slideUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">অর্ডার ট্র্যাকিং</h3>
                  <p className="text-[11px] text-slate-500">আপনার অর্ডারের বর্তমান অবস্থা জানুন</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracking Search Input */}
            <form onSubmit={handleTrackOrder} className="mb-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="অর্ডার আইডি (যেমন: CT-584912) বা মোবাইল নম্বর..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded-xl pl-3.5 pr-24 py-2.5 text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isSearchingTrack || !orderQuery.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isSearchingTrack ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>টেস্ট আইডি চেষ্টা করুন:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrderQuery('CT-748921');
                    setTimeout(() => handleTrackOrder(), 50);
                  }}
                  className="text-[#c92127] font-bold hover:underline cursor-pointer"
                >
                  CT-748921 দিয়ে দেখুন →
                </button>
              </div>
            </form>

            {/* Tracking Result View */}
            {trackResult && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">অর্ডার আইডি</span>
                    <span className="text-sm font-black text-slate-900">{trackResult.orderId}</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200">
                    {trackResult.statusText}
                  </span>
                </div>

                {/* Stepper Timeline */}
                <div className="space-y-3 pt-1">
                  {trackResult.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {idx < trackResult.steps.length - 1 && (
                        <div className={`absolute left-3 top-6 bottom-0 w-0.5 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        step.done 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-tight ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Hotline Call Box */}
                <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-[#c92127]" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-800 block">জরুরি তথ্য দরকার?</span>
                      <span className="text-[10px] text-slate-500">আমাদের কাস্টমার কেয়ারে সরাসরি কথা বলুন</span>
                    </div>
                  </div>
                  <a 
                    href="tel:+8801777277740" 
                    className="bg-[#c92127] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#b91c1c] transition-colors"
                  >
                    কল দিন
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. OFFERS / HAPPY HOUR MODAL */}
      {activeModal === 'offers' && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto p-5 pb-8 shadow-2xl animate-slideUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 fill-current text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">হ্যাপি Hour ও অফার</h3>
                  <p className="text-[11px] text-slate-500">আজকের বিশেষ ছাড় ও ভাউচার কোড</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Countdown Flash Deal Banner */}
            <div className="bg-gradient-to-r from-red-600 to-[#c92127] text-white rounded-2xl p-4 shadow-md mb-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-2">
                <Zap className="w-3 h-3 fill-current text-amber-300" />
                <span>Happy Hour Flash Sale</span>
              </div>
              <h4 className="text-sm font-black tracking-tight mb-2">
                Splashjet ইঙ্ক ও নির্বাচিত প্রিন্টারে সর্বোচ্চ ৩০% পর্যন্ত ক্যাশব্যাক!
              </h4>
              
              {/* Timer Boxes */}
              <div className="flex items-center justify-center gap-2 text-slate-900 font-black text-xs">
                <div className="bg-white px-2.5 py-1 rounded-lg shadow-xs">
                  <span className="text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">ঘণ্টা</span>
                </div>
                <span className="text-white font-black">:</span>
                <div className="bg-white px-2.5 py-1 rounded-lg shadow-xs">
                  <span className="text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">মিনিট</span>
                </div>
                <span className="text-white font-black">:</span>
                <div className="bg-white px-2.5 py-1 rounded-lg shadow-xs text-[#c92127]">
                  <span className="text-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[9px] text-slate-400 block font-normal">সেকেন্ড</span>
                </div>
              </div>
            </div>

            {/* Promo Vouchers to Copy */}
            <div className="space-y-3 mb-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#c92127]" />
                <span>অ্যাক্টিভ ডিসকাউন্ট কুপন</span>
              </h4>

              {/* Coupon 1 */}
              <div className="bg-slate-50 border border-dashed border-red-300 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#c92127] bg-red-100/80 px-2 py-0.5 rounded">
                      SPLASHJET10
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600">১০% ছাড়</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">যেকোনো Splashjet ইঙ্ক ক্রয়ে প্রযোজ্য</p>
                </div>
                <button
                  onClick={() => copyCoupon('SPLASHJET10')}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#c92127] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedCode === 'SPLASHJET10' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[10px]">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">কপি</span>
                    </>
                  )}
                </button>
              </div>

              {/* Coupon 2 */}
              <div className="bg-slate-50 border border-dashed border-sky-300 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded">
                      FREESHIP
                    </span>
                    <span className="text-[10px] font-extrabold text-sky-600">ফ্রি ডেলিভারি</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">৩০০০ টাকার বেশি অর্ডারে সারা দেশে ফ্রি ডেলিভারি</p>
                </div>
                <button
                  onClick={() => copyCoupon('FREESHIP')}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#c92127] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedCode === 'FREESHIP' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 text-[10px]">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Link to Shop */}
            <button
              onClick={() => {
                setActiveModal(null);
                if (onNavigate) onNavigate('/shop/', 'Shop');
              }}
              className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <span>সব অফার প্রোডাক্ট দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
