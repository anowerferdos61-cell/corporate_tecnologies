import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Package, 
  Truck, 
  Heart, 
  Tag, 
  FileText, 
  PhoneCall, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function AccountModal({ isOpen, onClose, onNavigate, initialTab = 'account' }) {
  const { wishlist, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(initialTab); // 'account' | 'track' | 'wishlist' | 'offers' | 'support'

  // User Profile state (persisted in localStorage)
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

  // Order Tracking state
  const [orderQuery, setOrderQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackResult, setTrackResult] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Sync profile if updated elsewhere
  useEffect(() => {
    const handleProfileSync = () => {
      try {
        const saved = localStorage.getItem('ct_user_profile');
        setUserProfile(saved ? JSON.parse(saved) : null);
      } catch {}
    };
    window.addEventListener('ct_user_updated', handleProfileSync);
    return () => window.removeEventListener('ct_user_updated', handleProfileSync);
  }, []);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (!loginPhone.trim()) return;

    setIsLoggingIn(true);
    setTimeout(() => {
      const profile = {
        name: loginName.trim() || 'সম্মানিত ক্লায়েন্ট',
        phone: loginPhone.trim(),
        joined: new Date().toLocaleDateString('bn-BD'),
        ordersCount: 3,
        tier: 'Gold Member'
      };
      setUserProfile(profile);
      try {
        localStorage.setItem('ct_user_profile', JSON.stringify(profile));
        window.dispatchEvent(new Event('ct_user_updated'));
      } catch {}
      setIsLoggingIn(false);
    }, 500);
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('ct_user_profile');
      window.dispatchEvent(new Event('ct_user_updated'));
    } catch {}
  };

  const handleTrackOrder = (e) => {
    if (e) e.preventDefault();
    if (!orderQuery.trim()) return;

    setIsSearchingTrack(true);
    setTimeout(() => {
      setIsSearchingTrack(false);
      const query = orderQuery.trim().toUpperCase();
      setTrackResult({
        orderId: query.startsWith('CT-') ? query : `CT-${query}`,
        customerName: userProfile ? userProfile.name : 'সম্মানিত গ্রাহক',
        status: 'In Transit',
        statusText: 'ডেলিভারির পথে আছে',
        courier: 'Steadfast Courier Ltd.',
        trackingCode: `STF-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedDelivery: 'আগামীকাল বিকালের মধ্যে',
        items: [
          'Splashjet Premium Ink 100ml Set (4 Color)',
          'High Quality Heat Transfer Sublimation Paper'
        ],
        amount: 2450,
        timeline: [
          { title: 'অর্ডার গৃহীত হয়েছে', time: '০৯ সেপ্টেম্বর ২০২৬, সকাল ১০:১৫', completed: true },
          { title: 'প্যাকেজিং ও কোয়ালিটি চেক সম্পন্ন', time: '০৯ সেপ্টেম্বর ২০২৬, দুপুর ০১:৩০', completed: true },
          { title: 'কুরিয়ারে হস্তান্তর করা হয়েছে', time: '০৯ সেপ্টেম্বর ২০২৬, বিকাল ০৪:০০', completed: true, current: true },
          { title: 'গ্রাহকের নিকট ডেলিভারি সম্পন্ন', time: 'প্রত্যাশিত: ১০ সেপ্টেম্বর', completed: false }
        ]
      });
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-slideUp text-slate-800 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#c92127] flex items-center justify-center font-bold shadow-xs">
              {activeTab === 'track' ? (
                <Truck className="w-5 h-5" />
              ) : activeTab === 'wishlist' ? (
                <Heart className="w-5 h-5" />
              ) : activeTab === 'offers' ? (
                <Tag className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {activeTab === 'track' ? 'অর্ডার ট্র্যাকিং (Track Order)' :
                 activeTab === 'wishlist' ? 'পছন্দের তালিকা (Wishlist)' :
                 activeTab === 'offers' ? 'ভাউচার ও প্রোমো কোড' :
                 'আমার অ্যাকাউন্ট (My Account)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeTab === 'track' ? 'অর্ডারের বর্তমান লাইভ অবস্থা জানুন' :
                 activeTab === 'wishlist' ? `${wishlist.length}টি সংরক্ষিত পণ্য` :
                 activeTab === 'offers' ? 'বিশেষ ছাড় ও মেম্বারশিপ বেনিফিট' :
                 'প্রোফাইল, অর্ডার ও কাস্টমার সেবা'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'account' && (
              <button
                onClick={() => setActiveTab('account')}
                className="text-xs font-bold text-[#c92127] hover:underline px-2 py-1 cursor-pointer"
              >
                ← মেন্যু
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: MAIN ACCOUNT VIEW */}
        {activeTab === 'account' && (
          <div>
            {userProfile ? (
              /* Logged In Dashboard */
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4.5 shadow-md flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-full bg-[#c92127] flex items-center justify-center text-xl font-black text-white shadow-inner border-2 border-white/20">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-black text-base">{userProfile.name}</h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{userProfile.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          ● ভেরিফাইড মেম্বার
                        </span>
                        <span className="text-[10px] text-amber-300 font-medium">
                          {userProfile.tier || 'Regular Client'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="লগআউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => setActiveTab('track')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#c92127] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">অর্ডার ট্র্যাকিং</span>
                      <span className="text-[10px] text-slate-500 truncate block">ডেলিভারি স্ট্যাটাস</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#c92127] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">উইশলিস্ট</span>
                      <span className="text-[10px] text-slate-500 truncate block">{wishlist.length}টি পণ্য সংরক্ষিত</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('offers')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">ভাউচার কোড</span>
                      <span className="text-[10px] text-slate-500 truncate block">স্পেশাল ছাড়সমূহ</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('/shop/', 'Shop');
                      else window.location.href = '/shop/';
                    }}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">সকল প্রোডাক্ট</span>
                      <span className="text-[10px] text-slate-500 truncate block">শপ ব্রাউজ করুন</span>
                    </div>
                  </button>
                </div>

                {/* Direct Helpline Strip */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#c92127]" />
                    <div>
                      <span className="text-xs font-black text-slate-900 block">কর্পোরেট টেক হেল্পলাইন</span>
                      <span className="text-[10px] text-slate-500">শনিবার-বৃহস্পতিবার (সকাল ৯টা - রাত ৮টা)</span>
                    </div>
                  </div>
                  <a 
                    href="tel:+8801777277740" 
                    className="text-xs font-black text-white bg-[#c92127] hover:bg-[#b91c1c] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    কল দিন
                  </a>
                </div>
              </div>
            ) : (
              /* Login / Sign Up Form */
              <div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/80 rounded-2xl p-4 mb-4">
                  <h4 className="text-xs font-black text-[#c92127] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>লগইন বা সাইন-ইন এর সুবিধা</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 mt-1 font-medium">
                    <li>✓ ১-ক্লিকে যেকোনো অর্ডার ও ডেলিভারি ট্র্যাক</li>
                    <li>✓ ডিজিটাল ইনভয়েস ও ওয়ারেন্টি ক্লেইম সুবিধা</li>
                    <li>✓ কর্পোরেট স্পেশাল ডিসকাউন্ট ও ভাউচার</li>
                  </ul>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      আপনার নাম (ঐচ্ছিক)
                    </label>
                    <input 
                      type="text"
                      placeholder="আপনার বা প্রতিষ্ঠানের নাম"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginPhone.trim()}
                    className="w-full bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer mt-2"
                  >
                    {isLoggingIn ? 'লগইন হচ্ছে...' : 'লগইন / সাইন ইন করুন'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone('01777277740');
                      setLoginName('Corporate Client');
                    }}
                    className="text-xs text-slate-500 hover:text-[#c92127] font-bold hover:underline cursor-pointer"
                  >
                    ডেমো নম্বর দিয়ে অটোফিল করুন
                  </button>
                </div>

                {/* Quick Track Order Link for Guests */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">লগইন ছাড়াই অর্ডার ট্র্যাক করতে চান?</span>
                  <button
                    onClick={() => setActiveTab('track')}
                    className="text-xs font-black text-[#c92127] hover:underline cursor-pointer"
                  >
                    অর্ডার ট্র্যাক →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER TRACKING */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            <form onSubmit={handleTrackOrder} className="relative">
              <input 
                type="text"
                placeholder="অর্ডার আইডি দিন (যেমন: CT-10245)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-4 pr-24 py-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isSearchingTrack || !orderQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSearchingTrack ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
              </button>
            </form>

            {/* Default Quick Samples */}
            {!trackResult && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                <Truck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium mb-3">
                  অর্ডারের সময় প্রাপ্ত ইনভয়েস বা SMS-এ থাকা অর্ডার আইডি দিয়ে লাইভ স্ট্যাটাস দেখুন।
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['CT-89241', 'CT-55102', 'CT-10890'].map((sampleId) => (
                    <button
                      key={sampleId}
                      type="button"
                      onClick={() => {
                        setOrderQuery(sampleId);
                      }}
                      className="text-[11px] font-mono font-bold bg-white border border-slate-200 hover:border-[#c92127] text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {sampleId}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking Result Card */}
            {trackResult && (
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">অর্ডার নম্বর</span>
                    <h4 className="text-sm font-black text-slate-900 font-mono">{trackResult.orderId}</h4>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                    {trackResult.statusText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">কুরিয়ার পার্টনার</span>
                    <span className="font-bold text-slate-800">{trackResult.courier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">প্রত্যাশিত ডেলিভারি</span>
                    <span className="font-bold text-emerald-700">{trackResult.estimatedDelivery}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-black text-slate-900 mb-2.5">ডেলিভারি টাইমলাইন</h5>
                  <div className="space-y-3 pl-2">
                    {trackResult.timeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 relative">
                        <div className={`w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 ${
                          step.completed ? 'bg-emerald-500' : 'bg-slate-300'
                        }`} />
                        <div>
                          <p className={`text-xs font-bold leading-tight ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title}
                          </p>
                          <span className="text-[10px] text-slate-400">{step.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-black text-slate-800 mb-1">আপনার পছন্দের তালিকা খালি</h4>
                <p className="text-xs text-slate-500 mb-4">যেকোনো পণ্যের হৃদপিণ্ড (Heart) আইকনে ক্লিক করে সেভ করে রাখুন।</p>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('/shop/', 'Shop');
                  }}
                  className="bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  পণ্য ব্রাউজ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200 flex-shrink-0"
                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                        <span className="text-xs font-black text-[#c92127]">৳{item.sale_price || item.regular_price}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        addToCart(item, 1, e);
                      }}
                      className="bg-slate-900 hover:bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                    >
                      কার্টে নিন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OFFERS & VOUCHERS */}
        {activeTab === 'offers' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-r from-red-500 to-[#c92127] text-white rounded-2xl shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                সক্রিয় কুপন
              </span>
              <h4 className="text-base font-black mt-1">SPLASH10</h4>
              <p className="text-xs text-white/90">Splashjet কালির উপর সরাসরি অতিরিক্ত ১০% ডিসকাউন্ট</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                ফ্রি ডেলিভারি
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1">FREESHIP</h4>
              <p className="text-xs text-slate-600">৩,০০০ টাকার অধিক প্রিন্টার বা কালির অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
