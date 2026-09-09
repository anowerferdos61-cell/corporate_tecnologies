import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ShoppingCart, 
  Check, 
  Droplet 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackProductView } from '../lib/analyticsTracker';
import fallbackProductsData from '../data/fallbackProducts.json';
import { formatCardTitle } from './ProductCard';

// Strict filter function: ONLY authentic ink & toner bottles / consumables (NO PRINTERS, NO PHOTOCOPIERS)
function isPureInkProduct(p) {
  if (!p) return false;
  const cat = (p.category || '').toLowerCase().trim();
  const sub = (p.sub_category || '').toLowerCase().trim();
  const title = (p.title || '').toLowerCase().trim();

  // 1. Hardware Category Blacklist
  if (
    cat === 'printers' || 
    cat === 'photocopy machines' || 
    cat === 'photocopier' || 
    cat === 'machinery' || 
    cat === 'pos & barcode' || 
    cat === 'accessories & parts'
  ) {
    return false;
  }

  // 2. Hardware Machine Indicators in Title
  if (
    title.includes('multifunction') || 
    title.includes('all-in-one') || 
    title.includes('ecotank') || 
    title.includes('megatank') ||
    title.includes('laserjet') ||
    title.includes('photocopier') ||
    title.includes('heat press') ||
    title.includes('scanner')
  ) {
    return false;
  }

  // Standalone printer machines
  if (
    title.includes('printer') && 
    !title.includes('ink for') && 
    !title.includes('refill ink') && 
    !title.includes('compatible ink') && 
    !title.includes('inks |') && 
    !title.includes('cartridge') &&
    !title.includes('bottle')
  ) {
    return false;
  }

  // 3. Must be Splashjet Inks, Toner & Inks, or explicit ink consumables
  const isInkCategory = cat.includes('splashjet') || cat.includes('toner') || (cat.includes('ink') && !cat.includes('printer'));
  const isInkTitle = (
    title.includes('refill ink') || 
    title.includes('splashjet') || 
    title.includes('sublimation') || 
    title.includes('dtf') || 
    title.includes('bottle') || 
    title.includes('toner') || 
    title.includes('cartridge') ||
    (title.includes('ink') && !title.includes('inkjet printer') && !title.includes('ink tank printer'))
  );

  return isInkCategory || isInkTitle;
}

export default function InkScrollSection({ allProducts = [], onNavigate }) {
  const { cartItems, addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  const scrollRef = useRef(null);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const scrollPosRef = useRef(0);

  // Filter ONLY ink products from dynamic allProducts
  let filteredInks = (allProducts || []).filter(isPureInkProduct);

  // Fallback to pre-filtered ink catalog if data is still loading
  if (filteredInks.length < 5) {
    const fallbackInks = fallbackProductsData.filter(isPureInkProduct);
    filteredInks = fallbackInks.length > 0 ? fallbackInks : filteredInks;
  }

  // Duplicate 3x for flawless infinite continuous scrolling
  const loopList = useMemo(() => {
    return [...filteredInks, ...filteredInks, ...filteredInks];
  }, [filteredInks]);

  // Pause auto-scroll temporarily and set resume timer
  const pauseAndScheduleResume = useCallback((delay = 2000) => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      const container = scrollRef.current;
      if (container) {
        scrollPosRef.current = container.scrollLeft;
      }
      isInteractingRef.current = false;
    }, delay);
  }, []);

  // Continuous Auto-Scroll Animation Loop
  useEffect(() => {
    let animationFrameId;
    const container = scrollRef.current;
    if (!container) return;

    scrollPosRef.current = container.scrollLeft || 0;
    const speed = 0.8; // Gentle smooth auto-scroll

    const step = () => {
      if (!isInteractingRef.current && !isDraggingRef.current && container) {
        scrollPosRef.current += speed;

        const loopThreshold = container.scrollWidth / 3;
        if (loopThreshold > 0 && scrollPosRef.current >= loopThreshold * 2) {
          scrollPosRef.current -= loopThreshold;
        }

        container.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [filteredInks.length]);

  // Trackpad & Mouse Wheel listener: immediately pause auto-scroll when user swipes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > 0.5 || Math.abs(e.deltaY) > 0.5) {
        pauseAndScheduleResume(2000);
        scrollPosRef.current = container.scrollLeft;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pauseAndScheduleResume]);

  // Native Scroll Event listener (Trackpad, Mobile touch swipe, etc.)
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    // Detect user manual scrolling
    const diff = Math.abs(container.scrollLeft - scrollPosRef.current);
    if (diff > 1.5) {
      scrollPosRef.current = container.scrollLeft;
      pauseAndScheduleResume(2000);
    }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = () => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    const container = scrollRef.current;
    if (container) {
      scrollPosRef.current = container.scrollLeft;
    }
  };

  const handleTouchMove = () => {
    isInteractingRef.current = true;
    const container = scrollRef.current;
    if (container) {
      scrollPosRef.current = container.scrollLeft;
    }
  };

  const handleTouchEnd = () => {
    const container = scrollRef.current;
    if (container) {
      scrollPosRef.current = container.scrollLeft;
    }
    pauseAndScheduleResume(2000);
  };

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    const container = scrollRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    isInteractingRef.current = true;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = container.scrollLeft;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const x = e.pageX;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftStartRef.current - walk;
    scrollPosRef.current = container.scrollLeft;

    const loopThreshold = container.scrollWidth / 3;
    if (loopThreshold > 0) {
      if (container.scrollLeft >= loopThreshold * 2) {
        container.scrollLeft -= loopThreshold;
        scrollLeftStartRef.current -= loopThreshold;
        scrollPosRef.current = container.scrollLeft;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += loopThreshold;
        scrollLeftStartRef.current += loopThreshold;
        scrollPosRef.current = container.scrollLeft;
      }
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      const container = scrollRef.current;
      if (container) {
        scrollPosRef.current = container.scrollLeft;
      }
      pauseAndScheduleResume(2000);
    }
  };

  // Global mouseup in case cursor leaves container
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const container = scrollRef.current;
        if (container) {
          scrollPosRef.current = container.scrollLeft;
        }
        pauseAndScheduleResume(2000);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [pauseAndScheduleResume]);

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
    addToCart(product, 1, e);
  };

  const handleOpenDetails = (product, e) => {
    if (hasDraggedRef.current) return;
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
    <section className="py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-y border-slate-200/80 overflow-hidden relative select-none">
      
      {/* Background Decorative Accents */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c92127] text-xs font-black tracking-wide uppercase mb-2.5">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Splashjet Digital Inks Spotlight</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pure Ink & Refill Series</span>
              <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                100% Printhead Safe
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              প্রিন্টহেডের দীর্ঘস্থায়িত্ব ও নিখুঁত কালার অ্যাকুরেসির আসল ডিজিটাল ইঙ্ক কালেকশন (ডানে-বামে টেনে ব্রাউজ করুন)
            </p>
          </div>

          {/* Action Link: Arrow buttons removed as requested, keeping View All button */}
          <div>
            <button
              onClick={() => onNavigate ? onNavigate('/product-category/splashjet-ink/', 'Splashjet Ink') : window.location.href = '/product-category/splashjet-ink/'}
              className="inline-flex items-center gap-1.5 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>সব ইঙ্ক দেখুন</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      {/* SINGLE-ROW SWIPEABLE / DRAGGABLE AUTO-SCROLL CONTAINER */}
      <div className="relative w-full overflow-hidden">
        
        {/* Soft edge gradient fades - only on desktop to prevent mobile clipping */}
        <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
        <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-stretch gap-3 sm:gap-5 py-3 px-3 sm:px-6 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {loopList.map((product, idx) => {
            const cartItem = cartItems?.find(item => item.product.id === product.id);
            const isInCart = Boolean(cartItem);
            const cartQuantity = cartItem?.quantity || 0;
            const isJustAdded = addedId === product.id;

            return (
              /* RESPONSIVE CARD: w-[215px] on mobile (never clipped), w-[260px] on tablet, w-[280px] on desktop */
              <div
                key={`${product.id}-${idx}`}
                onClick={(e) => handleOpenDetails(product, e)}
                className="w-[215px] sm:w-[260px] md:w-[280px] shrink-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-[#c92127]/60 p-3.5 sm:p-4.5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group/card hover:-translate-y-1 relative"
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-red-100 text-[#c92127] flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-[90px]">{product.brand || 'Splashjet'}</span>
                  </span>

                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Genuine
                  </span>
                </div>

                {/* Ink Product Image */}
                <div className="relative py-2 flex items-center justify-center h-34 sm:h-42 bg-slate-50/60 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none mb-2">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    draggable={false}
                    className="max-h-28 sm:max-h-36 w-auto object-contain transition-transform duration-300 group-hover/card:scale-105 pointer-events-none select-none"
                    onError={(e) => {
                      e.target.src = '/splashjet_images/about-splashjet.jpg';
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="text-center flex-1 flex flex-col justify-between space-y-2.5">
                  <h3 
                    className="text-xs sm:text-sm font-bold text-slate-900 group-hover/card:text-[#c92127] line-clamp-2 transition-colors leading-snug px-1 break-words min-h-[2.4rem] text-center"
                    title={product.title}
                  >
                    {formatCardTitle(product.title, 34)}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    {product.regular_price > product.sale_price && (
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                        ৳{Number(product.regular_price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-black text-[#c92127]">
                      ৳{Number(product.sale_price || product.regular_price).toLocaleString()}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className={`w-full text-xs sm:text-sm font-black py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95 ${
                      isInCart
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-red-50 text-[#c92127] hover:bg-[#c92127] hover:text-white border border-red-200'
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
          })}
        </div>
      </div>

    </section>
  );
}
