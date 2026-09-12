import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchFlashSaleSettings } from '../lib/flashSaleService';

export default function FlashSaleUrgencyBox({ product }) {
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    async function load() {
      const s = await fetchFlashSaleSettings();
      setSettings(s);
    }
    load();

    const handleUpdate = (e) => {
      if (e?.detail) setSettings(e.detail);
    };
    window.addEventListener('ct_flash_sale_updated', handleUpdate);
    return () => window.removeEventListener('ct_flash_sale_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!settings || !settings.end_time) return;

    function tick() {
      const diff = new Date(settings.end_time).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours: totalHours, minutes, seconds, isExpired: false });
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  if (!settings?.is_active || timeLeft.isExpired) return null;

  const realStock = product?.stock_quantity ?? 15;
  const isLowStock = realStock <= 5;

  return (
    <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
      
      {/* Countdown Timer Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#c92127]">
          <Flame className="w-4 h-4 fill-[#c92127] text-[#c92127] animate-bounce" />
          <span className="uppercase tracking-wider">ফ্ল্যাশ ডিল শেষ হতে বাকি:</span>
        </div>

        {/* Clock Pills */}
        <div className="flex items-center gap-1 font-mono font-black text-xs">
          <div className="bg-[#c92127] text-white px-2 py-1 rounded-md shadow-xs">
            {String(timeLeft.hours).padStart(2, '0')}h
          </div>
          <span className="text-[#c92127] font-bold">:</span>
          <div className="bg-[#c92127] text-white px-2 py-1 rounded-md shadow-xs">
            {String(timeLeft.minutes).padStart(2, '0')}m
          </div>
          <span className="text-[#c92127] font-bold">:</span>
          <div className="bg-slate-900 text-amber-300 px-2 py-1 rounded-md shadow-xs animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}s
          </div>
        </div>
      </div>

      {/* Real Stock Status Row */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-red-200/60 text-slate-700">
        <div className="flex items-center gap-1.5 font-medium">
          {isLowStock ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-700 font-bold">
                স্টক সীমিত: ইন স্টক মাত্র {realStock} টি রেডি আছে!
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                ইন স্টক: <strong>{realStock} টি</strong> অবিলম্বে ডেলিভারির জন্য প্রস্তুত
              </span>
            </>
          )}
        </div>

        <span className="text-[10px] font-bold text-[#c92127] bg-white px-2 py-0.5 rounded-full border border-red-200 shadow-2xs">
          বিশেষ ডিসকাউন্ট অফার
        </span>
      </div>

    </div>
  );
}
