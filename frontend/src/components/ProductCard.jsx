import React, { useState } from 'react';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackProductView } from '../lib/analyticsTracker';

/**
 * Product Card matching corporatetechbd.com/shop screenshots
 * - Red pill badge on top-left (-2%, -6%, Sale!, Sold Out)
 * - Centered clean product image
 * - Centered bold title
 * - Centered price (Strikethrough regular + Bold sale price in ৳)
 */
export default function ProductCard({ product, onNavigate }) {
  const { 
    cartItems,
    addToCart, 
    setSelectedProductForModal,
    setIsCartOpen 
  } = useCart();

  const [isJustAdded, setIsJustAdded] = useState(false);

  // Check if product is already in cart & get its count
  const cartItem = cartItems?.find(item => item.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  const isSoldOut = product.stock_quantity === 0;

  // Determine badge text
  const badgeText = isSoldOut 
    ? 'Sold Out' 
    : (product.discount_label || (product.regular_price > product.sale_price ? `-${Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)}%` : 'Sale!'));

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1800);
    addToCart(product, 1, e);
  };

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

  return (
    <div 
      onClick={handleOpenDetails}
      className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer relative p-2.5 sm:p-4"
    >
      {/* Top Left Discount Badge Pill */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
        <span className={`text-white text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs tracking-wide ${
          isSoldOut ? 'bg-slate-800' : 'bg-[#c92127]'
        }`}>
          {badgeText}
        </span>
      </div>

      {/* Product Image Area */}
      <div className="relative pt-2 sm:pt-4 pb-1 sm:pb-2 flex items-center justify-center min-h-[120px] sm:min-h-[180px] bg-white">
        <img
          src={product.image_url}
          alt={product.title}
          className="max-h-28 sm:max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/splashjet_images/about-splashjet.jpg';
          }}
          loading="lazy"
        />

        {/* Hover Quick Action Buttons (Desktop) */}
        <div className="hidden sm:flex absolute inset-x-4 bottom-1 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={isSoldOut}
            className={`text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 ${
              isSoldOut
                ? 'bg-slate-400 cursor-not-allowed'
                : isInCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : 'bg-[#c92127] hover:bg-[#b91c1c] shadow-red-600/30'
            } ${isJustAdded ? 'scale-105 ring-2 ring-white ring-offset-2 ring-offset-emerald-600' : ''}`}
            title={isInCart ? 'কার্টে আরেকটি যোগ করুন' : 'কার্টে নিন'}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>কার্টে আছে ({cartQuantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>কার্টে নিন</span>
              </>
            )}
          </button>
          <button
            onClick={handleOpenDetails}
            className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ডিটেইলস</span>
          </button>
        </div>
      </div>

      {/* Product Details (Centered text matching screenshots) */}
      <div className="pt-2 sm:pt-3 flex-1 flex flex-col justify-between items-center text-center space-y-1 sm:space-y-2">
        
        {/* Title */}
        <h3 className="text-[11px] sm:text-[13px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#c92127] transition-colors leading-snug min-h-[2rem] sm:min-h-[2.4rem]">
          {product.title}
        </h3>

        {/* Variations preview pills (Colors / Sizes) */}
        {product.variations && product.variations.length > 0 && (
          <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5 max-w-full">
            {product.variations.slice(0, 2).map((v, i) => (
              <span 
                key={i} 
                className="text-[9px] sm:text-[10px] bg-slate-50 text-slate-600 px-1 sm:px-1.5 py-0.2 rounded border border-slate-200 font-medium"
              >
                {v.name}
              </span>
            ))}
            {product.variations.length > 2 && (
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                +{product.variations.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Pricing (Centered format: strikethrough regular + bold sale price or price range) */}
        <div className="pt-1 text-[11px] sm:text-sm">
          {product.price_range_label ? (
            <span className="font-bold text-slate-900">
              {product.price_range_label}
            </span>
          ) : (
            <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
              {product.regular_price > product.sale_price && (
                <span className="text-slate-400 line-through text-[10px] sm:text-xs font-normal">
                  {Number(product.regular_price).toLocaleString('en-US', { minimumFractionDigits: 0 })}৳
                </span>
              )}
              <span className="font-bold text-slate-900">
                {Number(product.sale_price || product.regular_price).toLocaleString('en-US', { minimumFractionDigits: 0 })}৳
              </span>
            </div>
          )}
        </div>

        {/* Mobile Quick Add to Cart button with responsive color & state feedback */}
        <button
          onClick={handleQuickAdd}
          disabled={isSoldOut}
          className={`sm:hidden w-full mt-1.5 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs ${
            isSoldOut 
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : isInCart
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-600 shadow-xs'
                : 'bg-red-50 hover:bg-[#c92127] active:bg-[#b91c1c] text-[#c92127] hover:text-white border border-red-200'
          } ${isJustAdded ? 'scale-105 ring-2 ring-emerald-300' : ''}`}
        >
          {isInCart ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isJustAdded ? 'যুক্ত হয়েছে' : 'কার্টে আছে'} ({cartQuantity})</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3" />
              <span>কার্টে নিন</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
