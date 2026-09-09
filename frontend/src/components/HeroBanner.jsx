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
  Megaphone 
} from 'lucide-react';

const SLIDE_DURATION = 5000; // 5 seconds auto-scroll per client requirement

const SLIDES_DATA = [
  {
    id: 'splashjet-ink',
    badgeText: 'এক যুগের বিশ্বাস ও আস্থার নাম',
    badgeIcon: Sparkles,
    badgeColor: 'bg-red-100/90 border-red-200 text-[#c92127]',
    title: 'কর্পোরেট টেকনোলজিস',
    titleColor: 'text-[#c92127]',
    warrantyBadge: '১ বছরের সার্ভিস ওয়ারেন্টি',
    description: 'ফটোকপিয়ার, প্রিন্টার ও Splashjet সার্টিফাইড ডিজিটাল ইঙ্কের বিশ্বস্ত পরিবেশক। সেরা দামে নিশ্চিত আসল পণ্য।',
    ctaText: 'অর্ডার করুন',
    ctaLink: '/shop/',
    cardImage: '/splashjet_images/grow-your-canon-lfp-ink-business.png',
    cardFallback: '/splashjet_images/about-splashjet.jpg',
    floatingBadge: 'Best Price BD!',
    glowColor: 'bg-red-500/15',
    bgGradient: 'from-amber-50/80 via-stone-50 to-red-50/70'
  },
  {
    id: 'photocopiers',
    badgeText: 'স্মার্ট অফিস সল্যুশন',
    badgeIcon: Layers,
    badgeColor: 'bg-blue-100/90 border-blue-200 text-blue-700',
    title: 'ডিজিটাল ফটোকপিয়ার',
    titleColor: 'text-slate-900',
    warrantyBadge: 'ফ্রি ইনস্টলেশন ও অন-সাইট সাপোর্ট',
    description: 'তোশিবা ও ক্যানন হেভি ডিউটি ফটোকপিয়ার মেশিনে পাচ্ছেন ফ্রি ডেলিভারি ও ১ বছরের ফ্রি অন-সাইট সার্ভিস।',
    ctaText: 'ফটোকপিয়ার দেখুন',
    ctaLink: '/product-category/photocopy-machine/',
    cardImage: 'https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-2523a-photocopy-machine.toshiba-e-studio-2020ac-multifunction-digital-color-photocopier-machine.202-b9196ab5.png',
    cardFallback: '/splashjet_images/about-splashjet.jpg',
    floatingBadge: 'অফিস স্পেশাল!',
    glowColor: 'bg-sky-500/15',
    bgGradient: 'from-sky-50/90 via-slate-50 to-blue-50/70'
  },
  {
    id: 'printers-ecotank',
    badgeText: 'লো-কস্ট হাই-ভলিউম প্রিন্টিং',
    badgeIcon: Zap,
    badgeColor: 'bg-emerald-100/90 border-emerald-200 text-emerald-700',
    title: 'এপসন ও এইচপি প্রিন্টার্স',
    titleColor: 'text-slate-900',
    warrantyBadge: 'সাশ্রয়ী খরচে ক্রিস্টাল ক্লিয়ার প্রিন্ট',
    description: 'বাসা, অফিস বা ফটো স্টুডিওর জন্য ১০০% জেনুইন ওয়াই-ফাই ইঙ্কট্যাঙ্ক ও লেজারজেট প্রিন্টারের বিপুল কালেকশন।',
    ctaText: 'প্রিন্টার দেখুন',
    ctaLink: '/product-category/printers/',
    cardImage: 'https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-m2050-multifunction-monochrome-ink-tank-printer.2050png.png',
    cardFallback: '/splashjet_images/why-splashjet.webp',
    floatingBadge: 'রেডি ডেলিভারি!',
    glowColor: 'bg-emerald-500/15',
    bgGradient: 'from-emerald-50/80 via-slate-50 to-teal-50/60'
  },
  {
    id: 'heat-press-sublimation',
    badgeText: 'প্রিন্টিং বিজনেস প্যাকেজ',
    badgeIcon: Flame,
    badgeColor: 'bg-rose-100/90 border-rose-200 text-rose-700',
    title: 'হিট প্রেস ও সাবলিমেশন',
    titleColor: 'text-[#c92127]',
    warrantyBadge: 'কম খরচে বিজনেস স্টার্টআপ অফার',
    description: 'কাস্টম অ্যাপারেল ও উপহার সামগ্রী প্রিন্টিং ব্যবসার পূর্ণাঙ্গ সেটআপ ও স্প্ল্যাশজেট প্রিমিয়াম সাবলিমেশন ইনক।',
    ctaText: 'প্যাকেজ দেখুন',
    ctaLink: '/product-category/heat-press-machine/',
    cardImage: 'https://corporatetechbd.com/wp-content/uploads/2026/06/freesub-15-x-15-professional-t-shirt-heat-press-machine-high-performance-solution-for-custom-apparel-printing.Untitled-design-5-2.png',
    cardFallback: '/splashjet_images/news-product-launches.webp',
    floatingBadge: 'স্টার্টআপ ডিল!',
    glowColor: 'bg-amber-500/15',
    bgGradient: 'from-amber-50/80 via-stone-50 to-rose-50/70'
  }
];

export default function HeroBanner({ onExploreClick, onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES_DATA.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES_DATA.length) % SLIDES_DATA.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 5 seconds auto-scroll timer
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide]);

  const handleActionClick = (link) => {
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
          
          {/* MAIN BANNER SLIDER (Star Tech home-slider) */}
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
                {SLIDES_DATA.map((slide, index) => {
                  const BadgeIcon = slide.badgeIcon;
                  return (
                    <div 
                      key={slide.id}
                      onClick={() => handleActionClick(slide.ctaLink)}
                      className={`min-w-full w-full h-full flex-shrink-0 relative bg-gradient-to-r ${slide.bgGradient} flex items-center justify-between pl-4 xs:pl-6 sm:pl-10 md:pl-12 pr-2 xs:pr-3 sm:pr-8 py-2 sm:py-6 cursor-pointer overflow-hidden`}
                      aria-hidden={currentSlide !== index}
                    >
                      {/* Ambient Poster Lighting Behind Product */}
                      <div className={`absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 w-44 h-44 xs:w-56 xs:h-56 sm:w-80 sm:h-80 ${slide.glowColor} rounded-full blur-3xl pointer-events-none z-0`} />

                      {/* LEFT CONTENT: Compact, high impact poster typography */}
                      <div className="z-20 w-[50%] xs:w-[48%] sm:w-[46%] md:w-[44%] flex flex-col justify-center space-y-1.5 xs:space-y-2 sm:space-y-3">
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[9px] xs:text-[10px] sm:text-xs font-bold shadow-2xs w-fit max-w-full truncate bg-white/95 backdrop-blur-xs">
                          <BadgeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c92127] flex-shrink-0" />
                          <span className="truncate text-slate-800">{slide.badgeText}</span>
                        </div>

                        {/* Poster Title */}
                        <h2 className={`text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight line-clamp-2 ${slide.titleColor}`}>
                          {slide.title}
                        </h2>

                        {/* Warranty / Offer Tag */}
                        <div className="w-fit max-w-full">
                          <span className="inline-block bg-slate-900 text-white font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-2xs truncate">
                            {slide.warrantyBadge}
                          </span>
                        </div>

                        {/* Description (Visible on sm+ screens) */}
                        <p className="hidden sm:block text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {slide.description}
                        </p>

                        {/* CTA Button */}
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
                      </div>

                      {/* RIGHT VISUAL: Big Hero Product Image (Poster Style) */}
                      <div className="relative z-20 w-[50%] xs:w-[52%] sm:w-[54%] md:w-[56%] h-full flex items-center justify-end p-1 sm:p-3">
                        {/* Floating Discount Badge */}
                        <div className="absolute top-2 xs:top-3 sm:top-4 right-1 xs:right-2 sm:right-4 bg-[#c92127] text-white text-[8px] xs:text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-lg border-2 border-white animate-bounce z-30 whitespace-nowrap">
                          {slide.floatingBadge}
                        </div>

                        {/* Poster Product Showcase */}
                        <div className="w-full h-full flex items-center justify-center sm:justify-end relative">
                          <img 
                            src={slide.cardImage} 
                            alt={slide.title}
                            className="h-[86%] xs:h-[88%] sm:h-[92%] md:h-[95%] w-auto max-w-full object-contain object-right filter drop-shadow-xl sm:drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { 
                              if (e.target.src !== slide.cardFallback) {
                                e.target.src = slide.cardFallback;
                              }
                            }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Left Arrow Navigation (Hidden on mobile to avoid overlapping text, visible on desktop hover) */}
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

              {/* Right Arrow Navigation (Hidden on mobile to avoid overlapping photo, visible on desktop hover) */}
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

              {/* Bottom Indicators with 5-Second Animated Progress Bar */}
              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 z-30 flex items-center justify-center gap-1.5 sm:gap-2">
                {SLIDES_DATA.map((slide, idx) => {
                  const isActive = currentSlide === idx;
                  return (
                    <button
                      key={slide.id}
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
            </div>
          </div>

          {/* STAR TECH STYLE 2 SIDE PROMO BANNERS */}
          <div className="lg:col-span-4 xl:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 lg:gap-3.5 h-full">
            
            {/* Side Banner 1: Splashjet Official Partner */}
            <div 
              onClick={() => handleActionClick('/splashjet-ink/')}
              className="group relative rounded-2xl overflow-hidden border border-slate-200/90 bg-gradient-to-br from-amber-50 via-white to-red-50/60 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[135px] xs:h-[145px] sm:h-[155px] lg:h-[198px]"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-extrabold text-[#c92127] bg-red-100/90 px-2 py-0.5 rounded-full">
                  Official Partner
                </span>
                <span className="text-[10px] text-slate-500 font-bold hidden xs:inline">
                  Splashjet Inks
                </span>
              </div>

              <div className="my-auto flex items-center justify-between gap-2">
                <div className="space-y-0.5 sm:space-y-1 max-w-[65%]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#c92127] transition-colors leading-tight line-clamp-2">
                    আসল Splashjet ডিজিটাল ইঙ্ক
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 line-clamp-1">
                    ১০০% জেনুইন নো-ক্লগ কোয়ালিটি
                  </p>
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow-2xs p-1">
                  <img 
                    src="/splashjet_images/grow-your-canon-lfp-ink-business.png" 
                    alt="Splashjet Inks" 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="flex items-center text-[10px] sm:text-xs font-bold text-[#c92127] group-hover:underline gap-1">
                <span>ইঙ্ক কালেকশন দেখুন</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Side Banner 2: Customer Care & Express Support */}
            <a 
              href="tel:+8801777277740"
              className="group relative rounded-2xl overflow-hidden border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-[135px] xs:h-[145px] sm:h-[155px] lg:h-[198px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  সরাসরি হেল্পলাইন
                </span>
                <span className="text-[10px] text-slate-300 hidden xs:inline">
                  সকাল ১০টা - রাত ৮টা
                </span>
              </div>

              <div className="my-auto space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
                  <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c92127] fill-[#c92127]" />
                  <span>01777-277740</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1">
                  প্রিন্টার বা ফটোকপিয়ার সমস্যায় বিশেষজ্ঞ পরামর্শ
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-amber-300">
                <span>কল করুন এখনই</span>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#c92127] group-hover:text-white transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </a>

          </div>

        </div>

        {/* TRUST & BENEFITS SCROLLING TICKER (Left to Right Marquee for Mobile & Laptop) */}
        <div className="mt-3 sm:mt-4 bg-white border border-slate-200/90 rounded-xl py-2.5 px-3 sm:px-4 shadow-2xs overflow-hidden flex items-center">
          <marquee 
            className="text-xs sm:text-sm font-semibold text-slate-800"
            direction="right"
            scrollamount="5"
            onMouseOver={(e) => e.target.stop()}
            onMouseOut={(e) => e.target.start()}
          >
            <span className="inline-flex items-center gap-6 sm:gap-8">
              {[
                {
                  icon: Award,
                  title: '১০০% আসল প্রোডাক্ট',
                  desc: 'সার্টিফাইড ইঙ্ক ও প্রিন্টার',
                  bg: 'bg-red-50 text-[#c92127]'
                },
                {
                  icon: Truck,
                  title: 'দ্রুততম ডেলিভারি',
                  desc: 'ঢাকায় ২৪ ঘণ্টা ও সারাদেশে ডেলিভারি',
                  bg: 'bg-sky-50 text-sky-600'
                },
                {
                  icon: Headphones,
                  title: 'এক্সপার্ট টেক সাপোর্ট',
                  desc: 'প্রিন্টার সমস্যায় এক্সপার্ট গাইড',
                  bg: 'bg-emerald-50 text-emerald-600'
                },
                {
                  icon: ShieldCheck,
                  title: '১ বছর সার্ভিস ওয়ারেন্টি',
                  desc: 'নিরাপদ পেমেন্ট ও সাপোর্ট',
                  bg: 'bg-amber-50 text-amber-600'
                },
                {
                  icon: Sparkles,
                  title: 'Splashjet ডিস্ট্রিবিউটর',
                  desc: '১০০% আসল ডিজিটাল ইঙ্ক',
                  bg: 'bg-purple-50 text-purple-600'
                },
                {
                  icon: PhoneCall,
                  title: 'হটলাইন: 01777-277740',
                  desc: 'সরাসরি কল করে অর্ডার করুন',
                  bg: 'bg-red-50 text-[#c92127]'
                },
                // Repeat set for continuous smooth scroll without gaps
                {
                  icon: Award,
                  title: '১০০% আসল প্রোডাক্ট',
                  desc: 'সার্টিফাইড ইঙ্ক ও প্রিন্টার',
                  bg: 'bg-red-50 text-[#c92127]'
                },
                {
                  icon: Truck,
                  title: 'দ্রুততম ডেলিভারি',
                  desc: 'ঢাকায় ২৪ ঘণ্টা ও সারাদেশে ডেলিভারি',
                  bg: 'bg-sky-50 text-sky-600'
                },
                {
                  icon: Headphones,
                  title: 'এক্সপার্ট টেক সাপোর্ট',
                  desc: 'প্রিন্টার সমস্যায় এক্সপার্ট গাইড',
                  bg: 'bg-emerald-50 text-emerald-600'
                },
                {
                  icon: ShieldCheck,
                  title: '১ বছর সার্ভিস ওয়ারেন্টি',
                  desc: 'নিরাপদ পেমেন্ট ও সাপোর্ট',
                  bg: 'bg-amber-50 text-amber-600'
                },
                {
                  icon: Sparkles,
                  title: 'Splashjet ডিস্ট্রিবিউটর',
                  desc: '১০০% আসল ডিজিটাল ইঙ্ক',
                  bg: 'bg-purple-50 text-purple-600'
                },
                {
                  icon: PhoneCall,
                  title: 'হটলাইন: 01777-277740',
                  desc: 'সরাসরি কল করে অর্ডার করুন',
                  bg: 'bg-red-50 text-[#c92127]'
                }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <React.Fragment key={idx}>
                    <span className="inline-flex items-center gap-2 flex-shrink-0">
                      <span className={`w-6 h-6 rounded-lg ${item.bg} inline-flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm">{item.title}</strong>
                      <span className="text-slate-500 font-medium text-xs hidden sm:inline">({item.desc})</span>
                    </span>
                    <span className="text-slate-300 font-black">•</span>
                  </React.Fragment>
                );
              })}
            </span>
          </marquee>
        </div>

      </div>

      {/* Global Keyframes for Progress Bar */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}} />
    </section>
  );
}
