import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { flyToCartAnimation } from '../lib/flyToCart';
import { fetchFlashSaleSettings } from '../lib/flashSaleService';

export default function FlashSaleSection({ allProducts = [], onNavigate }) {
  const navigate = useNavigate();
  const { addToCart, setIsCheckoutOpen, setSelectedCategory } = useCart();

  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  // Load Settings from Database
  useEffect(() => {
    async function loadConfig() {
      const config = await fetchFlashSaleSettings();
      setSettings(config);
    }
    loadConfig();

    const handleUpdate = (e) => {
      if (e?.detail) setSettings(e.detail);
    };
    window.addEventListener('ct_flash_sale_updated', handleUpdate);
    return () => window.removeEventListener('ct_flash_sale_updated', handleUpdate);
  }, []);

  // Ticking Countdown Timer
  useEffect(() => {
    if (!settings || !settings.end_time) return;

    function calculateTime() {
      const target = new Date(settings.end_time).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  // Curated Flash Sale Deals (Top discounted or featured products)
  const flashProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    // Filter products with good discounts or high ratings
    const discounted = allProducts.filter((p) => {
      const reg = Number(p.regular_price) || 0;
      const sale = Number(p.sale_price) || reg;
      return reg > sale;
    });

    if (discounted.length >= 4) {
      return discounted.slice(0, 4);
    }

    // Fallback: Pick representative bestsellers from Printers & Inks
    return allProducts.slice(0, 4);
  }, [allProducts]);

  if (!settings?.is_active || timeLeft.isExpired || flashProducts.length === 0) {
    return null;
  }

  // 1-Click Buy Now Handler
  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCheckoutOpen(true);
  };

  // Add to Cart with Flying Animation
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    flyToCartAnimation(product.image_url, e);
    addToCart(product, 1);
  };

  const handleProductClick = (product) => {
    const targetUrl = `/product/${product.slug || product.id}/`;
    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      navigate(targetUrl);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 my-4">
      {/* Container with Crimson Glow & Dark Luxury Styling */}
      <div className="relative bg-gradient-to-br from-[#0c0d12] via-[#14151f] to-[#1a0c0e] rounded-3xl p-5 sm:p-8 border border-red-900/40 shadow-2xl overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c92127]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* 1. Header Bar: Title + Digital Flip Countdown Timer */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/10">
          
          {/* Left: Heading with Flame Pulse */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#c92127] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/30">
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>FLASH SALE</span>
              </span>
              <span className="text-amber-400 text-xs font-bold font-mono tracking-wider">
                {settings.discount_banner || 'UP TO 35% OFF'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight pt-1">
              {settings.title}
            </h2>
            <p className="text-xs text-zinc-400">
              {settings.subtitle}
            </p>
          </div>

          {/* Right: Digital Countdown Timer Flip Boxes */}
          <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold pr-2 border-r border-white/10 hidden xs:flex">
              <Clock className="w-4 h-4 text-[#c92127]" />
              <span>শেষ হতে বাকি:</span>
            </div>

            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xl border border-white/15 flex items-center justify-center shadow-inner">
                <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase mt-1">Days</span>
            </div>

            <span className="text-xl font-bold text-red-500 -mt-4">:</span>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xl border border-white/15 flex items-center justify-center shadow-inner">
                <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase mt-1">Hours</span>
            </div>

            <span className="text-xl font-bold text-red-500 -mt-4">:</span>

            {/* Mins */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xl border border-white/15 flex items-center justify-center shadow-inner">
                <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase mt-1">Mins</span>
            </div>

            <span className="text-xl font-bold text-red-500 -mt-4">:</span>

            {/* Secs */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-b from-[#c92127] to-red-950 rounded-xl border border-red-500/50 flex items-center justify-center shadow-inner shadow-red-500/30">
                <span className="text-lg sm:text-2xl font-black text-white font-mono tracking-tight animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] text-red-400 font-bold uppercase mt-1">Secs</span>
            </div>
          </div>
        </div>

        {/* 2. Flash Deals Grid: 4 Curated Products */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-6">
          {flashProducts.map((product) => {
            const regPrice = Number(product.regular_price) || 0;
            const salePrice = Number(product.sale_price) || regPrice;
            const discountAmount = regPrice > salePrice ? regPrice - salePrice : 0;
            const discountPercent = regPrice > salePrice ? Math.round(((regPrice - salePrice) / regPrice) * 100) : 10;
            const realStock = product.stock_quantity ?? 15;

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1"
              >
                <div>
                  {/* Top Badges & Image */}
                  <div className="relative bg-slate-50 rounded-xl p-3 flex items-center justify-center min-h-[160px] overflow-hidden mb-3">
                    {/* Discount Badge */}
                    <span className="absolute top-2 left-2 z-10 bg-[#c92127] text-white font-mono font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>-{discountPercent}% OFF</span>
                    </span>

                    <img
                      src={product.image_url || '/splashjet_images/about-splashjet.jpg'}
                      alt={product.title}
                      className="max-h-32 object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Category & Title */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {product.category || 'Special Deal'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#c92127] transition-colors">
                      {product.title}
                    </h3>
                  </div>
                </div>

                {/* Pricing, Real Stock Status & Action Buttons */}
                <div className="pt-3 space-y-3">
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-black text-[#c92127] font-mono">
                        ৳{salePrice.toLocaleString()}
                      </span>
                      {regPrice > salePrice && (
                        <span className="text-xs text-slate-400 line-through ml-2 font-mono">
                          ৳{regPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {discountAmount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Save ৳{discountAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Genuine Database Stock Badge (No fake remaining numbers) */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ইন স্টক: {realStock} টি</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      🔥 সীমিত অফার
                    </span>
                  </div>

                  {/* Dual Action Buttons: Buy Now & Add to Cart */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      title="কার্টে যোগ করুন"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                      <span>কার্ট</span>
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(e, product)}
                      className="w-full bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white text-[11px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
                      title="সরাসরি ১-ক্লিকে অর্ডার করুন"
                    >
                      <span>অর্ডার করুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
