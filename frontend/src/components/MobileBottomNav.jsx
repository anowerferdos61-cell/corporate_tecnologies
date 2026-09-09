import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Zap, 
  Headphones,
  User,
  X, 
  PhoneCall, 
  MessageCircle, 
  MapPin,
  Droplet
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MobileBottomNav({ currentRoute, onNavigate, allProducts = [] }) {
  const { setIsAccountOpen, setAccountActiveTab, isAccountOpen } = useCart();
  const [activeModal, setActiveModal] = useState(null); // 'support' | null
  
  // Compare badge count synced with localStorage & custom events
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

  // Listen for compare updates from ProductCards
  useEffect(() => {
    const handleCompareSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCompareList(e.detail);
      }
    };
    window.addEventListener('ct_compare_updated', handleCompareSync);
    return () => window.removeEventListener('ct_compare_updated', handleCompareSync);
  }, []);

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION BAR (RED THEME - MATCHES TOP NAVBAR) */}
      <nav 
        id="mobile-bottom-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#c92127] border-t border-[#a8191e] text-white shadow-2xl pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-15 items-center px-1 text-center">
          
          {/* TAB 1: Offer (Directly navigates to Shop) */}
          <button
            id="bottom-nav-offer-tab"
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
            id="bottom-nav-inks-tab"
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

          {/* TAB 3 (MIDDLE): Call / Support Hotline & Branches */}
          <button
            id="bottom-nav-call-tab"
            onClick={() => setActiveModal(activeModal === 'support' ? null : 'support')}
            className={`flex flex-col items-center justify-center py-1 relative group cursor-pointer transition-colors ${
              activeModal === 'support' ? 'text-white bg-white/25 rounded-xl' : 'text-white/90 hover:text-white'
            }`}
            aria-label="Call Support"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center -mt-1 shadow-xs group-hover:bg-white/30 transition-all">
              <PhoneCall className={`w-4 h-4 ${activeModal === 'support' ? 'text-white fill-current' : 'text-white'}`} />
            </div>
            <span className="text-[10px] font-black mt-0.5 tracking-tight">Call</span>
          </button>

          {/* TAB 4: Compare (Navigates to /compare/ page) */}
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

          {/* TAB 5: Account (Customer Dashboard & Orders) */}
          <button
            id="bottom-nav-account-tab"
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
            </div>
            <span className="text-[10px] font-black mt-1 tracking-tight">Account</span>
          </button>

        </div>
      </nav>

      {/* 2. SUPPORT MODAL */}
      {activeModal === 'support' && (
        <div 
          className="md:hidden fixed inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
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
                aria-label="Close modal"
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

            {/* Office Time & Address with Google Maps link */}
            <a 
              href="https://maps.google.com/?q=Noakhali+Tower+Purana+Paltan+Dhaka"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-xs transition-colors group block"
            >
              <MapPin className="w-4 h-4 text-[#c92127] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 group-hover:text-[#c92127] transition-colors">প্রধান শোরুম ও হেড অফিস</p>
                  <span className="text-[10px] text-[#c92127] font-bold">ম্যাপ দেখুন &rarr;</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  55/B Purana Paltan, Noakhali Tower (Lift 9), Dhaka-1000
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">সকাল ৯:০০ - রাত ৮:০০ (শনি - বৃহস্পতি)</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
