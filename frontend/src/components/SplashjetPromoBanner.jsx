import React from 'react';
import { ArrowRight, QrCode, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SplashjetPromoBanner({ onExploreInks }) {
  return (
    <section className="w-full bg-slate-50/80 border-y border-slate-200/80 py-5 sm:py-8 lg:py-10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* POSTER-STYLE PROMO HERO BANNER (Matches Top Hero Banner Structure) */}
        <div 
          onClick={onExploreInks}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-gradient-to-r from-amber-50/80 via-white to-red-50/70 h-[230px] xs:h-[265px] sm:h-[330px] md:h-[380px] lg:h-[410px] flex items-center justify-between pl-4 xs:pl-6 sm:pl-10 md:pl-12 pr-2 xs:pr-3 sm:pr-8 py-2 sm:py-6 cursor-pointer select-none group"
        >
          {/* Subtle Ambient Dots Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none z-10" />

          {/* Ambient Lighting Behind Poster Elements */}
          <div className="absolute right-4 sm:right-16 top-1/2 -translate-y-1/2 w-48 h-48 xs:w-64 xs:h-64 sm:w-88 sm:h-88 bg-gradient-to-tr from-amber-400/20 via-red-500/15 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

          {/* LEFT CONTENT: Compact, high impact typography (never stacks vertically on mobile) */}
          <div className="z-20 w-[52%] xs:w-[50%] sm:w-[48%] md:w-[46%] flex flex-col justify-center space-y-1.5 xs:space-y-2 sm:space-y-3">
            
            {/* Guarantee Badge */}
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-red-200 text-[#c92127] text-[9px] xs:text-[10px] sm:text-xs font-bold shadow-2xs w-fit max-w-full truncate bg-white/95 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c92127] flex-shrink-0" />
              <span className="truncate">অফিসিয়াল Splashjet গ্যারান্টি</span>
            </div>

            {/* Main Punchy Headline */}
            <h2 className="text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900">
              স্ক্যান করলে আসল, <br className="hidden xs:inline" />
              <span className="text-[#c92127]">না করলে নকল!</span>
            </h2>

            {/* 70% Savings Offer Tag */}
            <div className="w-fit max-w-full">
              <span className="inline-block bg-[#c92127] text-white font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-md shadow-2xs truncate">
                Splashjet Ink দিয়ে প্রিন্ট করুন ৭০% কম খরচে!
              </span>
            </div>

            {/* QR Verification Reminder Box */}
            <div className="bg-amber-100/90 border border-amber-300 text-amber-950 text-[8px] xs:text-[9px] sm:text-xs font-extrabold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-2xs inline-flex items-center gap-1.5 w-fit max-w-full">
              <QrCode className="w-3 h-3 sm:w-4 sm:h-4 text-[#c92127] flex-shrink-0" />
              <span className="truncate">পণ্য ক্রয়ের আগে QR CODE যাচাই করে নিন</span>
            </div>

            {/* Description (Visible on sm+ screens) */}
            <p className="hidden sm:block text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              প্রিমিয়াম প্রিন্টিং, সাশ্রয়ী মূল্য এবং প্রিন্ট হেড সুরক্ষা – সবকিছু একসাথে! ১০০% আসল কোয়ালিটির নিশ্চয়তা।
            </p>

            {/* CTA Button */}
            <div className="pt-0.5 sm:pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onExploreInks) onExploreInks();
                }}
                className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-[10px] xs:text-xs sm:text-sm px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span>কালি সংগ্রহ করুন</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT VISUAL: Large Poster Style Visual Showcase */}
          <div className="relative z-20 w-[48%] xs:w-[50%] sm:w-[52%] md:w-[54%] h-full flex items-center justify-end p-1 sm:p-3">
            
            {/* Floating 70% Discount Badge */}
            <div className="absolute top-2 xs:top-3 sm:top-4 right-1 xs:right-2 sm:right-4 bg-[#c92127] text-white text-[8px] xs:text-[9px] sm:text-xs font-black px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-lg border-2 border-white animate-bounce z-30 whitespace-nowrap">
              ৭০% পর্যন্ত সাশ্রয়!
            </div>

            {/* Poster Composition: Bottles + Authentic Hologram QR Card */}
            <div className="w-full h-full flex items-center justify-end relative">
              
              {/* Product Visual Image (Large Poster Scale) */}
              <img 
                src="/splashjet_images/grow-your-canon-lfp-ink-business.png" 
                alt="Splashjet Certified Ink Bottles"
                className="h-[86%] xs:h-[88%] sm:h-[92%] md:h-[95%] w-auto max-w-full object-contain object-right filter drop-shadow-xl sm:drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/splashjet_images/about-splashjet.jpg';
                }}
              />

              {/* Integrated Authenticity Hologram Badge Overlay */}
              <div className="absolute left-0 sm:left-4 bottom-2 sm:bottom-6 z-30 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-amber-400 text-slate-900 shadow-xl max-w-[110px] xs:max-w-[125px] sm:max-w-[160px] transform hover:scale-105 transition-transform backdrop-blur-xs">
                <div className="text-[7px] xs:text-[8px] sm:text-[9px] font-black tracking-wider text-[#c92127] truncate">
                  SPLASHJET BD
                </div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase text-slate-900 tracking-wider">
                  VERIFIED
                </div>
                <div className="my-1 flex items-center justify-center">
                  <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-12 sm:h-12 bg-white p-0.5 sm:p-1 rounded-md sm:rounded-lg border border-amber-300 flex items-center justify-center shadow-xs">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                </div>
                <div className="text-[6px] xs:text-[7px] sm:text-[8px] font-bold text-slate-700 text-center uppercase tracking-tighter truncate">
                  SCAN TO AUTHENTICATE
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
