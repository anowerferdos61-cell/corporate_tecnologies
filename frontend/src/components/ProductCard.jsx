import React, { useState, useEffect } from 'react';
import { Eye, Check, SlidersHorizontal } from 'lucide-react';
import { trackProductView } from '../lib/analyticsTracker';

/**
 * Filter helper: Compare is only applicable for Inks, Printers, and Photocopiers
 */
export function isComparableProduct(product) {
  if (!product) return false;
  const cat = (product.category || '').toLowerCase();
  const sub = (product.sub_category || '').toLowerCase();
  const title = (product.title || '').toLowerCase();

  const isInk = cat.includes('ink') || sub.includes('ink') || title.includes('ink') || title.includes('splashjet') || title.includes('sublimation') || title.includes('dtf');
  const isPrinter = cat.includes('printer') || sub.includes('printer') || title.includes('printer');
  const isPhotocopy = cat.includes('photocopy') || sub.includes('photocopy') || title.includes('photocopier') || title.includes('photocopy') || title.includes('e-studio') || title.includes('toshiba');

  return isInk || isPrinter || isPhotocopy;
}

/**
 * Flying bubble animation from clicked card to bottom nav Compare tab
 */
export function triggerFlyToCompareAnimation(sourceEl, imageUrl) {
  try {
    let targetEl = document.getElementById('bottom-nav-compare-tab');
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        targetEl = null;
      }
    }
    if (!targetEl) {
      targetEl = document.getElementById('navbar-compare-button') || document.getElementById('navbar-cart-button');
    }
    if (!sourceEl || !targetEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    if (targetRect.width === 0 && targetRect.height === 0) return;

    const flyer = document.createElement('div');
    flyer.className = 'fixed z-[99999] pointer-events-none rounded-full bg-white shadow-2xl flex items-center justify-center border-2 border-[#c92127] overflow-hidden';
    flyer.style.width = '52px';
    flyer.style.height = '52px';
    flyer.style.left = `${sourceRect.left + sourceRect.width / 2 - 26}px`;
    flyer.style.top = `${sourceRect.top + sourceRect.height / 2 - 26}px`;

    const img = document.createElement('img');
    img.src = imageUrl || '/splashjet_images/about-splashjet.jpg';
    img.className = 'w-4/5 h-4/5 object-contain';
    flyer.appendChild(img);

    document.body.appendChild(flyer);

    const destX = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
    const destY = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);

    const anim = flyer.animate([
      {
        transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
        opacity: 1
      },
      {
        transform: `translate3d(${destX * 0.4}px, ${destY * 0.25 - 75}px, 0) scale(1.15) rotate(-15deg)`,
        opacity: 0.95,
        offset: 0.35
      },
      {
        transform: `translate3d(${destX}px, ${destY}px, 0) scale(0.2) rotate(15deg)`,
        opacity: 0.2
      }
    ], {
      duration: 650,
      easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      flyer.remove();
      targetEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.4)' },
        { transform: 'scale(0.9)' },
        { transform: 'scale(1)' }
      ], {
        duration: 350,
        easing: 'ease-out'
      });
    };
  } catch (err) {
    console.error('Animation error:', err);
  }
}

/**
 * Product Card matching corporatetechbd.com/shop requirements:
 * - Red pill badge on top-left (-2%, -6%, Sale!, Sold Out)
 * - Taller/Larger display on mobile (2 rows = 4 products comfortably fill mobile viewport)
 * - Compare is active exclusively on Inks, Printers & Photocopiers (up to 3 products)
 * - Laptop: shows both "বিস্তারিত দেখুন" and "কম্পেয়ার" on hover
 * - Mobile: shows dedicated "কম্পেয়ার" button at bottom with animated feedback
 * - Clicking the card navigates directly to product details
 */
export default function ProductCard({ product, onNavigate }) {
  const canCompare = isComparableProduct(product);

  const [isCompared, setIsCompared] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const list = JSON.parse(saved);
        return Array.isArray(list) && list.some(item => item.id === product.id);
      }
    } catch {}
    return false;
  });

  const [isJustCompared, setIsJustCompared] = useState(false);

  // Sync isCompared state across multiple cards or when cleared from bottom nav / compare page
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setIsCompared(e.detail.some(item => item.id === product.id));
      }
    };
    window.addEventListener('ct_compare_updated', handleSync);
    return () => window.removeEventListener('ct_compare_updated', handleSync);
  }, [product.id]);

  const isSoldOut = product.stock_quantity === 0;

  // Determine badge text
  const badgeText = isSoldOut 
    ? 'Sold Out' 
    : (product.discount_label || (product.regular_price > product.sale_price ? `-${Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)}%` : 'Sale!'));

  const handleOpenDetails = (e) => {
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

  const handleToggleCompare = (e) => {
    if (e) e.stopPropagation();
    setIsJustCompared(true);
    setTimeout(() => setIsJustCompared(false), 1800);

    try {
      let list = [];
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }

      let updated;
      const exists = list.some(item => item.id === product.id);
      if (exists) {
        // Remove from compare
        updated = list.filter(item => item.id !== product.id);
        setIsCompared(false);
      } else {
        // Add to compare (up to 3 products max as requested)
        if (list.length >= 3) {
          updated = [...list.slice(0, 2), product];
        } else {
          updated = [...list, product];
        }
        setIsCompared(true);

        // Trigger authentic fly-to-compare parabolic animation!
        triggerFlyToCompareAnimation(e.currentTarget, product.image_url);
      }

      localStorage.setItem('ct_compare_list', JSON.stringify(updated));
      localStorage.setItem('ct_compare_cleared', updated.length === 0 ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: updated }));
    } catch (err) {
      console.error('Error updating compare:', err);
    }
  };

  return (
    <div 
      onClick={handleOpenDetails}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-red-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative p-3.5 sm:p-5 md:p-6 hover:-translate-y-1"
    >
      {/* Top Left Discount Badge Pill */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <span className={`text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm tracking-wide ${
          isSoldOut ? 'bg-slate-800' : 'bg-[#c92127]'
        }`}>
          {badgeText}
        </span>
      </div>

      {/* Product Image Area (Enlarged so 2 rows comfortably fill mobile screen without 3rd row peeking) */}
      <div className="relative pt-4 sm:pt-6 pb-2 sm:pb-4 flex items-center justify-center min-h-[175px] sm:min-h-[220px] md:min-h-[240px] bg-white">
        <img
          src={product.image_url}
          alt={product.title}
          className="max-h-40 sm:max-h-48 md:max-h-56 w-auto object-contain transition-transform duration-300 group-hover:scale-108"
          onError={(e) => {
            e.target.src = '/splashjet_images/about-splashjet.jpg';
          }}
          loading="lazy"
        />

        {/* Laptop/Desktop Hover Action Buttons: Both "বিস্তারিত দেখুন" AND "কম্পেয়ার" (if eligible) */}
        <div className="hidden sm:flex absolute inset-x-2 bottom-2 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10">
          <button
            onClick={handleOpenDetails}
            className="bg-slate-900 hover:bg-[#c92127] text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>বিস্তারিত দেখুন</span>
          </button>

          {canCompare && (
            <button
              onClick={handleToggleCompare}
              className={`text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                isCompared 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
              } ${isJustCompared ? 'scale-105 ring-2 ring-blue-400 bg-blue-600 text-white' : ''}`}
            >
              {isJustCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3] animate-bounce" />
                  <span>যোগ হয়েছে!</span>
                </>
              ) : isCompared ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>তুলনায় আছে</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>কম্পেয়ার</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-2 sm:pt-4 flex-1 flex flex-col justify-between items-center text-center space-y-1.5 sm:space-y-2.5">
        
        {/* Title */}
        <h3 className="text-[13px] sm:text-[15px] font-black text-slate-900 line-clamp-2 group-hover:text-[#c92127] transition-colors leading-snug min-h-[2.5rem] sm:min-h-[2.8rem]">
          {product.title}
        </h3>

        {/* Variations preview pills (Colors / Sizes) */}
        {product.variations && product.variations.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5 max-w-full">
            {product.variations.slice(0, 3).map((v, i) => (
              <span 
                key={i} 
                className="text-[10px] sm:text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-semibold"
              >
                {v.name}
              </span>
            ))}
            {product.variations.length > 3 && (
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">
                +{product.variations.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="pt-1 text-xs sm:text-base">
          {product.price_range_label ? (
            <span className="font-extrabold text-slate-900">
              {product.price_range_label}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
              {product.regular_price > product.sale_price && (
                <span className="text-slate-400 line-through text-xs sm:text-sm font-medium">
                  ৳{Number(product.regular_price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              )}
              <span className="font-black text-[#c92127] text-sm sm:text-lg">
                ৳{Number(product.sale_price || product.regular_price).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
