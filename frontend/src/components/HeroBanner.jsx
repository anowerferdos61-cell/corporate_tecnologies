import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Award, 
  ArrowRight, 
  Sparkles, 
  PhoneCall, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Flame, 
  Layers,
  Star,
  CheckCircle2,
  Tag,
  Clock,
  Gift,
  Package,
  Percent,
  Printer,
  Megaphone,
  BadgePercent
} from 'lucide-react';
import { useSettings, DEFAULT_HERO_BANNERS, DEFAULT_HERO_TICKER, DEFAULT_TICKER_ITEMS } from '../context/SettingsContext';

const SLIDE_DURATION = 5000; // 5 seconds auto-scroll per client requirement

export const TICKER_ICONS_MAP = {
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Award,
  Truck,
  Headphones,
  Zap,
  Flame,
  Star,
  CheckCircle2,
  Tag,
  Clock,
  Gift,
  Package,
  Percent,
  Printer,
  Megaphone,
  BadgePercent
};

export const TICKER_COLORS_MAP = {
  red: { bg: 'bg-red-50 text-[#c92127]' },
  sky: { bg: 'bg-sky-50 text-sky-600' },
  emerald: { bg: 'bg-emerald-50 text-emerald-600' },
  amber: { bg: 'bg-amber-50 text-amber-600' },
  purple: { bg: 'bg-purple-50 text-purple-600' },
  indigo: { bg: 'bg-indigo-50 text-indigo-600' },
  rose: { bg: 'bg-rose-50 text-rose-600' },
  slate: { bg: 'bg-slate-100 text-slate-700' }
};

export default function HeroBanner({ onExploreClick, onNavigate }) {
  const { heroBanners } = useSettings();

  const slidesData = heroBanners?.slides?.length > 0 ? heroBanners.slides : DEFAULT_HERO_BANNERS.slides;
  const side1Data = heroBanners?.sideBanner1 || DEFAULT_HERO_BANNERS.sideBanner1;
  const side2Data = heroBanners?.sideBanner2 || DEFAULT_HERO_BANNERS.sideBanner2;
  const tickerData = heroBanners?.ticker || DEFAULT_HERO_TICKER;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  // Ensure currentSlide is within bounds if slides count changes
  useEffect(() => {
    if (currentSlide >= slidesData.length) {
      setCurrentSlide(0);
    }
  }, [slidesData.length, currentSlide]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
  }, [slidesData.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
  }, [slidesData.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 5 seconds auto-scroll timer
  useEffect(() => {
    if (isHovered || slidesData.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide, slidesData.length]);

  const handleActionClick = (link) => {
    if (!link) return;
    if (link.startsWith('tel:') || link.startsWith('http')) {
      window.location.href = link;
      return;
    }
    if (onNavigate) {
      onNavigate(link || '/shop/');
    } else if (onExploreClick) {
      onExploreClick();
    } else {
      window.history.pushState({}, '', link || '/shop/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <section className="relative w-full bg-slate-50/80 border-b border-slate-200/70 py-3 sm:py-5 lg:py-7">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* STAR TECH STYLE HERO GRID (Main Slider on Left, 2 Side Banners on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 items-stretch">
          
          {/* OPTION 1: MAIN BANNER SLIDER (Star Tech home-slider) */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
            <div 
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-white group h-[220px] xs:h-[250px] sm:h-[320px] md:h-[375px] lg:h-[410px] flex items-center select-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Subtle ambient texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none z-10"></div>

              {/* Carousel Track */}
              <div 
                className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slidesData.map((slide, index) => {
                  const isCustom = Boolean(slide.isCustomGraphic && slide.customGraphicUrl);
                  
                  return (
                    <div 
                      key={slide.id || index}
                      onClick={() => handleActionClick(slide.ctaLink)}
                      className={`min-w-full w-full h-full flex-shrink-0 relative bg-gradient-to-r ${slide.bgGradient || 'from-amber-50/80 via-stone-50 to-red-50/70'} flex items-center justify-between cursor-pointer overflow-hidden ${
                        isCustom ? 'p-0' : 'pl-4 xs:pl-6 sm:pl-10 md:pl-12 pr-2 xs:pr-3 sm:pr-8 py-2 sm:py-6'
                      }`}
                      aria-hidden={currentSlide !== index}
                    >
                      {/* IF FULL CUSTOM GRAPHIC BANNER */}
                      {isCustom ? (
                        <div className="w-full h-full relative">
                          <img
                            src={slide.customGraphicUrl}
                            alt={slide.title || 'Banner'}
                            className="w-full h-full object-cover sm:object-fill"
                          />
                        </div>
                      ) : (
                        /* POSTER LAYOUT */
                        <>
                          {/* Ambient Lighting Behind Product */}
                          <div className={`absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-44 h-44 xs:w-56 xs:h-56 sm:w-80 sm:h-80 ${slide.glowColor || 'bg-red-500/15'} rounded-full blur-3xl pointer-events-none z-0`} />

                          {/* LEFT CONTENT: Poster typography */}
                          <div className="z-20 w-[50%] xs:w-[48%] sm:w-[46%] md:w-[44%] flex flex-col justify-center space-y-1.5 xs:space-y-2 sm:space-y-3">
                            
                            {/* Badge */}
                            {slide.badgeText && (
                              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[9px] xs:text-[10px] sm:text-xs font-bold shadow-2xs w-fit max-w-full truncate bg-white/95 backdrop-blur-xs">
                                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c92127] flex-shrink-0" />
                                <span className="truncate text-slate-800">{slide.badgeText}</span>
                              </div>
                            )}

                            {/* Poster Title */}
                            <h2 className={`text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight line-clamp-2 ${slide.titleColor || 'text-slate-900'}`}>
                              {slide.title}
                            </h2>

                            {/* Warranty / Offer Tag */}
                            {slide.warrantyBadge && (
                              <div className="w-fit max-w-full">
                                <span className="inline-block bg-slate-900 text-white font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-2xs truncate">
                                  {slide.warrantyBadge}
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {slide.description && (
                              <p className="hidden sm:block text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                {slide.description}
                              </p>
                            )}

                            {/* CTA Button */}
                            {slide.ctaText && (
                              <div className="pt-0.5 sm:pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleActionClick(slide.ctaLink);
                                  }}
                                  className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-[10px] xs:text-xs sm:text-sm px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all cursor-pointer"
                                >
                                  <span>{slide.ctaText}</span>
                                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* RIGHT VISUAL: Big Hero Product Image */}
                          <div className="relative z-20 w-[50%] xs:w-[52%] sm:w-[54%] md:w-[56%] h-full flex items-center justify-end p-1 sm:p-3">
                            {/* Floating Discount Badge */}
                            {slide.floatingBadge && (
                              <div className="absolute top-2 xs:top-3 sm:top-4 right-1 xs:right-2 sm:right-4 bg-[#c92127] text-white text-[8px] xs:text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-lg border-2 border-white animate-bounce z-30 whitespace-nowrap">
                                {slide.floatingBadge}
                              </div>
                            )}

                            {/* Poster Product Showcase */}
                            <div className="w-full h-full flex items-center justify-center sm:justify-end relative">
                              <img 
                                src={slide.cardImage || '/splashjet_images/grow-your-canon-lfp-ink-business.png'} 
                                alt={slide.title || 'Product'}
                                className="h-[86%] xs:h-[88%] sm:h-[92%] md:h-[95%] w-auto max-w-full object-contain object-right filter drop-shadow-xl sm:drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { 
                                  if (e.target.src !== (slide.cardFallback || '/splashjet_images/about-splashjet.jpg')) {
                                    e.target.src = slide.cardFallback || '/splashjet_images/about-splashjet.jpg';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Left Arrow Navigation */}
              {slidesData.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  aria-label="Previous Slide"
                  className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#c92127] shadow-lg border border-slate-200/90 items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Right Arrow Navigation */}
              {slidesData.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  aria-label="Next Slide"
                  className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#c92127] shadow-lg border border-slate-200/90 items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Bottom Indicators */}
              {slidesData.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-1.5 sm:gap-2">
                  {slidesData.map((slide, idx) => {
                    const isActive = currentSlide === idx;
                    return (
                      <button
                        key={slide.id || idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSlide(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                          isActive 
                            ? 'w-8 sm:w-12 bg-slate-300/80 shadow-2xs' 
                            : 'w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      >
                        {isActive && (
                          <div 
                            key={`progress-${idx}-${isHovered ? 'paused' : 'running'}`}
                            className="absolute inset-y-0 left-0 bg-[#c92127] rounded-full"
                            style={{
                              animation: isHovered 
                                ? 'none' 
                                : `heroProgress ${SLIDE_DURATION}ms linear forwards`
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* STAR TECH STYLE 2 SIDE PROMO BANNERS */}
          <div className="lg:col-span-4 xl:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 lg:gap-3.5 h-full">
            
            {/* OPTION 2: Side Banner 1 (Top-Right) */}
            <div 
              onClick={() => handleActionClick(side1Data.ctaLink || '/product-category/splashjet-ink/')}
              className={`group relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[135px] xs:h-[145px] sm:h-[155px] lg:h-[198px] ${
                side1Data.isCustomGraphic && side1Data.customGraphicUrl 
                  ? 'p-0 bg-white' 
                  : `bg-gradient-to-br ${side1Data.bgGradient || 'from-amber-50 via-white to-red-50/60'} p-3 sm:p-4`
              }`}
            >
              {side1Data.isCustomGraphic && side1Data.customGraphicUrl ? (
                <img 
                  src={side1Data.customGraphicUrl} 
                  alt={side1Data.title || 'Side Banner 1'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold text-[#c92127] bg-red-100/90 px-2 py-0.5 rounded-full">
                      {side1Data.badgeText || 'Official Partner'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold hidden xs:inline">
                      {side1Data.subBadge || 'Splashjet Inks'}
                    </span>
                  </div>

                  <div className="my-auto flex items-center justify-between gap-2">
                    <div className="space-y-0.5 sm:space-y-1 max-w-[65%]">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#c92127] transition-colors leading-tight line-clamp-2">
                        {side1Data.title || 'Genuine Splashjet Inks'}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 line-clamp-1">
                        {side1Data.subtitle || '100% Clog-Free OEM Formula'}
                      </p>
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow-2xs p-1">
                      <img 
                        src={side1Data.image || '/splashjet_images/grow-your-canon-lfp-ink-business.png'} 
                        alt="Side Banner" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-[10px] sm:text-xs font-bold text-[#c92127] group-hover:underline gap-1">
                    <span>{side1Data.ctaText || 'Explore Inks Collection'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </>
              )}
            </div>

            {/* OPTION 3: Side Banner 2 (Bottom-Right) */}
            <div 
              onClick={() => handleActionClick(side2Data.ctaLink || 'tel:+8801777277740')}
              className={`group relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[135px] xs:h-[145px] sm:h-[155px] lg:h-[198px] ${
                side2Data.isCustomGraphic && side2Data.customGraphicUrl
                  ? 'p-0 bg-white'
                  : `bg-gradient-to-br ${side2Data.bgGradient || 'from-slate-900 via-slate-800 to-slate-900'} text-white p-3 sm:p-4`
              }`}
            >
              {side2Data.isCustomGraphic && side2Data.customGraphicUrl ? (
                <img 
                  src={side2Data.customGraphicUrl} 
                  alt={side2Data.title || 'Side Banner 2'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                      {side2Data.badgeText || 'Direct Helpline'}
                    </span>
                    <span className="text-[10px] text-slate-300 hidden xs:inline">
                      {side2Data.subBadge || '10:00 AM - 8:00 PM'}
                    </span>
                  </div>

                  <div className="my-auto space-y-1">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
                      <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c92127] fill-[#c92127]" />
                      <span>{side2Data.phone || '01777-277740'}</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1">
                      {side2Data.desc || 'Expert Support for Printers & Copiers'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-amber-300">
                    <span>{side2Data.ctaText || 'Call Us Now'}</span>
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#c92127] group-hover:text-white transition-colors">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* TRUST & BENEFITS INSTANT CSS MARQUEE */}
        {tickerData?.enabled !== false && (
          <div className="mt-3 sm:mt-4 bg-white border border-slate-200/90 rounded-xl py-2.5 px-3 sm:px-4 shadow-2xs overflow-hidden relative select-none">
            <div className="flex overflow-hidden w-full group">
              <div 
                className="flex items-center gap-6 sm:gap-8 flex-shrink-0 animate-marquee-infinite"
                style={{ animationDuration: `${tickerData?.speed === 'fast' ? 18 : tickerData?.speed === 'slow' ? 48 : 30}s` }}
              >
                {/* Mode: custom_text */}
                {tickerData?.mode === 'custom_text' ? (
                  <>
                    {[1, 2, 3].map((k) => (
                      <div key={k} className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="w-6 h-6 rounded-lg bg-red-50 text-[#c92127] inline-flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-3.5 h-3.5" />
                        </span>
                        <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                          {tickerData?.customText || 'Corporate Technologies BD - 100% Genuine Splashjet Inks & Printer Supplies'}
                        </strong>
                        <span className="text-slate-300 font-black ml-4">•</span>
                      </div>
                    ))}
                  </>
                ) : tickerData?.mode === 'both' ? (
                  <>
                    {tickerData?.customText && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-lg flex-shrink-0">
                        <Megaphone className="w-3.5 h-3.5 text-[#c92127]" />
                        <strong className="text-[#c92127] font-black text-xs sm:text-sm whitespace-nowrap">
                          {tickerData.customText}
                        </strong>
                        <span className="text-red-300 font-black ml-2">•</span>
                      </div>
                    )}
                    {(tickerData?.items?.length > 0 ? tickerData.items : DEFAULT_TICKER_ITEMS).map((item, idx) => {
                      const IconComponent = TICKER_ICONS_MAP[item.iconName] || Award;
                      const colorObj = TICKER_COLORS_MAP[item.badgeColor] || TICKER_COLORS_MAP.red;
                      return (
                        <div key={item.id || idx} className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                            {item.title}
                          </strong>
                          {item.desc && (
                            <span className="text-slate-500 font-medium text-xs hidden sm:inline whitespace-nowrap">
                              ({item.desc})
                            </span>
                          )}
                          <span className="text-slate-300 font-black ml-3 sm:ml-4">•</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* Mode: badges (Default) */}
                    {(tickerData?.items?.length > 0 ? tickerData.items : DEFAULT_TICKER_ITEMS).map((item, idx) => {
                      const IconComponent = TICKER_ICONS_MAP[item.iconName] || Award;
                      const colorObj = TICKER_COLORS_MAP[item.badgeColor] || TICKER_COLORS_MAP.red;
                      return (
                        <div key={item.id || idx} className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                            {item.title}
                          </strong>
                          {item.desc && (
                            <span className="text-slate-500 font-medium text-xs hidden sm:inline whitespace-nowrap">
                              ({item.desc})
                            </span>
                          )}
                          <span className="text-slate-300 font-black ml-3 sm:ml-4">•</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Duplicated track for seamless loop */}
              <div 
                className="flex items-center gap-6 sm:gap-8 flex-shrink-0 animate-marquee-infinite" 
                aria-hidden="true"
                style={{ animationDuration: `${tickerData?.speed === 'fast' ? 18 : tickerData?.speed === 'slow' ? 48 : 30}s` }}
              >
                {tickerData?.mode === 'custom_text' ? (
                  <>
                    {[1, 2, 3].map((k) => (
                      <div key={`dup-${k}`} className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="w-6 h-6 rounded-lg bg-red-50 text-[#c92127] inline-flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-3.5 h-3.5" />
                        </span>
                        <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                          {tickerData?.customText || 'Corporate Technologies BD - 100% Genuine Splashjet Inks & Printer Supplies'}
                        </strong>
                        <span className="text-slate-300 font-black ml-4">•</span>
                      </div>
                    ))}
                  </>
                ) : tickerData?.mode === 'both' ? (
                  <>
                    {tickerData?.customText && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-lg flex-shrink-0">
                        <Megaphone className="w-3.5 h-3.5 text-[#c92127]" />
                        <strong className="text-[#c92127] font-black text-xs sm:text-sm whitespace-nowrap">
                          {tickerData.customText}
                        </strong>
                        <span className="text-red-300 font-black ml-2">•</span>
                      </div>
                    )}
                    {(tickerData?.items?.length > 0 ? tickerData.items : DEFAULT_TICKER_ITEMS).map((item, idx) => {
                      const IconComponent = TICKER_ICONS_MAP[item.iconName] || Award;
                      const colorObj = TICKER_COLORS_MAP[item.badgeColor] || TICKER_COLORS_MAP.red;
                      return (
                        <div key={`dup-${item.id || idx}`} className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                            {item.title}
                          </strong>
                          {item.desc && (
                            <span className="text-slate-500 font-medium text-xs hidden sm:inline whitespace-nowrap">
                              ({item.desc})
                            </span>
                          )}
                          <span className="text-slate-300 font-black ml-3 sm:ml-4">•</span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {(tickerData?.items?.length > 0 ? tickerData.items : DEFAULT_TICKER_ITEMS).map((item, idx) => {
                      const IconComponent = TICKER_ICONS_MAP[item.iconName] || Award;
                      const colorObj = TICKER_COLORS_MAP[item.badgeColor] || TICKER_COLORS_MAP.red;
                      return (
                        <div key={`dup-${item.id || idx}`} className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap">
                            {item.title}
                          </strong>
                          {item.desc && (
                            <span className="text-slate-500 font-medium text-xs hidden sm:inline whitespace-nowrap">
                              ({item.desc})
                            </span>
                          )}
                          <span className="text-slate-300 font-black ml-3 sm:ml-4">•</span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Keyframes for Progress Bar & Instant Marquee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes marqueeInfinite {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }

        .animate-marquee-infinite {
          display: flex;
          align-items: center;
          animation: marqueeInfinite 30s linear infinite;
          will-change: transform;
        }

        ${tickerData?.pauseOnHover !== false ? `
          .group:hover .animate-marquee-infinite {
            animation-play-state: paused;
          }
        ` : ''}
      `}} />
    </section>
  );
}
