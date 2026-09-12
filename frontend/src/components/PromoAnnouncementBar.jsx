import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Copy, Check, X, ArrowRight } from 'lucide-react';
import { fetchActiveCoupons } from '../lib/couponService';

export default function PromoAnnouncementBar({ onOpenCheckout }) {
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check session storage
    if (sessionStorage.getItem('corp_tech_promo_dismissed') === 'true') {
      setIsDismissed(true);
      return;
    }

    async function loadCoupons() {
      try {
        const list = await fetchActiveCoupons();
        if (list && list.length > 0) {
          setActiveCoupons(list);
        }
      } catch (e) {
        console.warn('Could not load promo banner coupons:', e);
      }
    }
    loadData();
    async function loadData() {
      await loadCoupons();
    }
  }, []);

  // Rotate between coupons if multiple exist
  useEffect(() => {
    if (activeCoupons.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeCoupons.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeCoupons.length]);

  if (isDismissed || activeCoupons.length === 0) return null;

  const currentCoupon = activeCoupons[currentIndex];
  const discountText = currentCoupon.discount_type === 'percentage'
    ? `${currentCoupon.discount_value}% ছাড়`
    : `৳${Number(currentCoupon.discount_value).toLocaleString()} ফ্ল্যাট ছাড়`;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentCoupon.code);
    setCopiedCode(currentCoupon.code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem('corp_tech_promo_dismissed', 'true');
    } catch {}
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 text-white text-xs border-b border-zinc-800/80 relative z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        
        {/* Left / Center: Announcement Text */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 justify-center sm:justify-start">
          <span className="bg-[#c92127] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden xs:inline">স্পেশাল অফার</span>
            <span className="xs:hidden">অফার</span>
          </span>

          <div className="flex items-center gap-2 truncate text-slate-200">
            <span className="font-semibold truncate">
              {discountText}! অর্ডারে ডিসকাউন্ট পেতে ব্যবহার করুন:
            </span>

            {/* Click to Copy Coupon Code Button */}
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-amber-300 hover:text-amber-200 font-mono font-black px-2.5 py-0.5 rounded-md border border-amber-300/30 text-xs transition-all cursor-pointer shrink-0 shadow-2xs"
              title="ক্লিক করে কোড কপি করুন"
            >
              <span>{currentCoupon.code}</span>
              {copiedCode === currentCoupon.code ? (
                <span className="text-emerald-400 flex items-center gap-0.5 text-[11px] font-bold font-sans">
                  <Check className="w-3 h-3" />
                  কপি হয়েছে!
                </span>
              ) : (
                <Copy className="w-3 h-3 text-amber-300" />
              )}
            </button>
          </div>

          {currentCoupon.min_order_amount > 0 && (
            <span className="text-[11px] text-zinc-400 hidden md:inline">
              (ন্যূনতম ৳{Number(currentCoupon.min_order_amount).toLocaleString()} অর্ডারে)
            </span>
          )}
        </div>

        {/* Right: Dismiss Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title="ব্যানার বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
