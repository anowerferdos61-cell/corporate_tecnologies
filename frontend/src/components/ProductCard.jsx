import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { trackProductView } from '../lib/analyticsTracker';

/**
 * Filter helper: Compare is applicable for Inks, Printers, and Photocopiers
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
 * Formats title cleanly if needed
 */
export function formatCardTitle(title = '', maxLength = 45) {
  if (!title) return '';
  let cleanTitle = String(title)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();

  if (cleanTitle.length <= maxLength) {
    return cleanTitle;
  }

  let truncated = cleanTitle.slice(0, maxLength).trim();
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 14) {
    truncated = truncated.slice(0, lastSpace);
  }
  truncated = truncated.replace(/[,|\-–/]\s*$/, '').trim();
  return truncated + '...';
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
      { transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate3d(${destX * 0.4}px, ${destY * 0.25 - 75}px, 0) scale(1.15) rotate(-15deg)`, opacity: 0.95, offset: 0.35 },
      { transform: `translate3d(${destX}px, ${destY}px, 0) scale(0.2) rotate(15deg)`, opacity: 0.2 }
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
 * Ultra-Clean Product Card:
 * - Red pill badge on top-left (-X% discount badge, Sold Out, Call for Price)
 * - Large product image & spacious card layout
 * - Centered bold title
 * - Centered pricing (Strikethrough regular + Bold red price in ৳)
 * - Desktop hover: Clean "View Details" button
 * - Clean card click: Opens Product Details page (where full specs & compare are located)
 */
export default function ProductCard({ product, onNavigate }) {
  const navigate = useNavigate();

  if (!product) return null;

  const isCallForPrice = Boolean(
    product.call_for_price === true || 
    product.call_for_price === 'true' || 
    product.call_for_price === 1 || 
    (Number(product.sale_price || 0) === 0 && Number(product.regular_price || 0) === 0)
  );

  const isSoldOut = Boolean(
    product.stock_status === 'outofstock' || 
    product.is_sold_out === true || 
    product.is_sold_out === 'true' || 
    product.stock_quantity === 0
  );

  // Calculate discount percentage
  const discountPercent = (product.regular_price > product.sale_price)
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  // Determine badge text (-X% in Red badge)
  const badgeText = isSoldOut
    ? 'Sold Out'
    : isCallForPrice
      ? 'Call For Price'
      : discountPercent > 0
        ? `-${discountPercent}%`
        : product.discount_label || null;

  const handleOpenDetails = (e) => {
    if (e) e.stopPropagation();
    trackProductView(product);
    const targetSlug = product.slug || product.id;
    const targetUrl = `/product/${targetSlug}/`;

    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      navigate(targetUrl);
    }
  };

  return (
    <div 
      onClick={handleOpenDetails}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative p-3 sm:p-4 md:p-5 hover:-translate-y-1"
    >
      {/* Top Left Discount / Status Badge Pill */}
      {badgeText && (
        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none">
          <span className={`text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wide ${
            isSoldOut ? 'bg-slate-800' : 'bg-[#c92127]'
          }`}>
            {badgeText}
          </span>
        </div>
      )}

      {/* Product Image Area (Tall & Spacious) */}
      <div className="relative pt-4 sm:pt-6 pb-2 flex items-center justify-center min-h-[170px] sm:min-h-[210px] md:min-h-[230px] bg-white">
        <img
          src={product.image_url}
          alt={product.title}
          className="max-h-36 sm:max-h-48 md:max-h-52 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/splashjet_images/about-splashjet.jpg';
          }}
          loading="lazy"
        />

        {/* Hover Action Button (Desktop Only) */}
        <div className="hidden sm:flex absolute inset-x-2 bottom-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-10">
          <button
            onClick={handleOpenDetails}
            className="bg-slate-900 hover:bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Details (Centered text layout with comfortable sizing) */}
      <div className="pt-3 sm:pt-4 flex-1 flex flex-col justify-between items-center text-center space-y-2">
        
        {/* Title */}
        <h3 
          className="text-[13px] sm:text-[15px] font-black text-slate-900 line-clamp-2 group-hover:text-[#c92127] transition-colors leading-snug min-h-[2.4rem] sm:min-h-[2.8rem]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Variations preview pills (Colors / Sizes) */}
        {product.variations && product.variations.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5 max-w-full">
            {product.variations.slice(0, 2).map((v, i) => (
              <span 
                key={i} 
                className="text-[10px] sm:text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-semibold"
              >
                {v.name}
              </span>
            ))}
            {product.variations.length > 2 && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">
                +{product.variations.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Pricing (Centered format: strikethrough regular + bold red price in ৳) */}
        <div className="pt-1 text-xs sm:text-base">
          {isCallForPrice ? (
            <span className="font-black text-[#c92127] text-xs sm:text-sm">
              Call For Price
            </span>
          ) : product.price_range_label ? (
            <span className="font-black text-slate-900">
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
