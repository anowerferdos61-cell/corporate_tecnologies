import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ShoppingCart, 
  Check, 
  Droplet
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackProductView } from '../lib/analyticsTracker';

/**
 * InkScrollSection
 * Two-row continuously scrolling marquee specifically for Inks (Splashjet, Sublimation, DTF, Epson, Canon, HP, Brother)
 * Features:
 * - Row 1: Continuous infinite scroll from Right to Left (ডান থেকে বামে)
 * - Row 2: Continuous infinite scroll from Left to Right (বাম থেকে ডানে)
 * - Pauses smoothly on hover
 * - Quick Add to Cart and seamless product details navigation
 */
export default function InkScrollSection({ allProducts = [], onNavigate }) {
  const { cartItems, addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  // Filter only ink-related products
  const inkProducts = allProducts.filter((p) => {
    const cat = (p.category || '').toLowerCase();
    const sub = (p.sub_category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return (
      cat.includes('ink') ||
      sub.includes('ink') ||
      title.includes('ink') ||
      title.includes('splashjet') ||
      title.includes('sublimation') ||
      title.includes('dtf')
    );
  });

  const baseList = inkProducts.length >= 8 ? inkProducts : allProducts;

  // Split into 2 distinct diverse sets for Row 1 and Row 2
  const row1Base = baseList.filter((_, idx) => idx % 2 === 0).slice(0, 16);
  const row2Base = baseList.filter((_, idx) => idx % 2 !== 0).slice(0, 16);

  // Fallbacks if data is small
  const safeRow1 = row1Base.length >= 6 ? row1Base : baseList.slice(0, 8);
  const safeRow2 = row2Base.length >= 6 ? row2Base : [...baseList].reverse().slice(0, 8);

  // Duplicate each list for seamless infinite marquee looping
  const loopRow1 = [...safeRow1, ...safeRow1];
  const loopRow2 = [...safeRow2, ...safeRow2];

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
    addToCart(product, 1, e);
  };

  const handleOpenDetails = (product, e) => {
    if (e) e.stopPropagation();
    trackProductView(product);
    const targetSlug = product.slug || product.id;
    const targetUrl = `/product/${targetSlug}/`;

    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Helper to render an individual product card
  const renderProductCard = (product, idx, rowKey) => {
    const cartItem = cartItems?.find(item => item.product.id === product.id);
    const isInCart = Boolean(cartItem);
    const cartQuantity = cartItem?.quantity || 0;
    const isJustAdded = addedId === product.id;

    return (
      <div
        key={`${rowKey}-${product.id}-${idx}`}
        onClick={(e) => handleOpenDetails(product, e)}
        className="w-56 sm:w-64 shrink-0 bg-white rounded-2xl border border-slate-200/90 hover:border-[#c92127]/60 p-3 sm:p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group/card hover:-translate-y-1 relative select-none"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-[#c92127] flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{product.brand || 'Splashjet'}</span>
          </span>

          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Genuine
          </span>
        </div>

        {/* Ink Product Image */}
        <div className="relative py-2 flex items-center justify-center h-32 sm:h-38 bg-white rounded-xl overflow-hidden">
          <img
            src={product.image_url}
            alt={product.title}
            className="max-h-28 sm:max-h-34 w-auto object-contain transition-transform duration-300 group-hover/card:scale-108"
            onError={(e) => {
              e.target.src = '/splashjet_images/about-splashjet.jpg';
            }}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="pt-2 text-center flex-1 flex flex-col justify-between space-y-2">
          <h3 className="text-xs sm:text-[13px] font-extrabold text-slate-900 group-hover/card:text-[#c92127] line-clamp-2 transition-colors leading-snug min-h-[2.2rem]">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            {product.regular_price > product.sale_price && (
              <span className="text-xs text-slate-400 line-through font-medium">
                ৳{Number(product.regular_price).toLocaleString()}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-[#c92127]">
              ৳{Number(product.sale_price || product.regular_price).toLocaleString()}
            </span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={(e) => handleQuickAdd(product, e)}
            className={`w-full text-xs font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
              isInCart
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-red-50 text-[#c92127] hover:bg-[#c92127] hover:text-white border border-red-200/80'
            } ${isJustAdded ? 'scale-105 ring-2 ring-emerald-400' : ''}`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isJustAdded ? 'Added!' : 'In Cart'} ({cartQuantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-10 bg-linear-to-b from-slate-50 via-white to-slate-50/60 border-y border-slate-200/80 overflow-hidden relative">
      
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          
          {/* Section Heading */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c92127] text-xs font-black tracking-wide uppercase mb-2">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Digital Inks Spotlight</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Splashjet & Digital Ink Series</span>
              <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                100% Head Safe
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              প্রিন্টহেডের দীর্ঘস্থায়িত্ব ও নিখুঁত রঙের নিশ্চয়তায় অরিজিনাল কোয়ালিটি ডিজিটাল ইঙ্ক
            </p>
          </div>

          {/* View All Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate ? onNavigate('/product-category/splashjet-ink/', 'Splashjet Ink') : window.location.href = '/product-category/splashjet-ink/'}
              className="inline-flex items-center gap-1 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-extrabold px-4 py-2 rounded-full shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>সব ইঙ্ক কালেকশন দেখুন</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      {/* Dual Continuous Infinite Marquee Rows Container */}
      <div className="relative w-full overflow-hidden space-y-4 sm:space-y-5">
        
        {/* Soft edge gradient fades */}
        <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-20 bg-linear-to-r from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-20 bg-linear-to-l from-slate-50 via-slate-50/80 to-transparent z-20 pointer-events-none" />

        {/* ROW 1: Right-to-Left Continuous Marquee (ডান থেকে বামে) */}
        <div className="w-full overflow-hidden">
          <div
            className="flex items-stretch gap-4 sm:gap-5 py-1 px-4 w-max animate-ink-marquee-left"
            style={{ willChange: 'transform' }}
          >
            {loopRow1.map((product, idx) => renderProductCard(product, idx, 'row1'))}
          </div>
        </div>

        {/* ROW 2: Left-to-Right Continuous Marquee (বাম থেকে ডানে) */}
        <div className="w-full overflow-hidden">
          <div
            className="flex items-stretch gap-4 sm:gap-5 py-1 px-4 w-max animate-ink-marquee-right"
            style={{ willChange: 'transform' }}
          >
            {loopRow2.map((product, idx) => renderProductCard(product, idx, 'row2'))}
          </div>
        </div>

      </div>

      {/* Marquee Animation Keyframes: Row 1 (Right to Left) & Row 2 (Left to Right) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes inkMarqueeLeft {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes inkMarqueeRight {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-ink-marquee-left {
          animation: inkMarqueeLeft 130s linear infinite;
        }

        .animate-ink-marquee-right {
          animation: inkMarqueeRight 130s linear infinite;
        }

        .animate-ink-marquee-left:hover,
        .animate-ink-marquee-right:hover {
          animation-play-state: paused !important;
        }
      `}} />

    </section>
  );
}
