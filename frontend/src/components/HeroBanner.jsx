import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Award, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Printer
} from 'lucide-react';

export default function HeroBanner({ onExploreClick, onNavigate }) {
  const handleOrderClick = () => {
    if (onNavigate) {
      onNavigate('/shop/');
    } else if (onExploreClick) {
      onExploreClick();
    } else {
      window.history.pushState({}, '', '/shop/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/70 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Main Banner Hero Card (Exact aesthetic of corporatetechbd.com) */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200/90 bg-gradient-to-r from-stone-100 via-amber-50/40 to-slate-100 min-h-[380px] sm:min-h-[440px] flex items-center">
          
          {/* Subtle wooden floor ambient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-25"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/10 to-transparent pointer-events-none"></div>

          {/* Banner Content Container */}
          <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Left / Center Text Typography */}
            <div className="flex-1 text-center lg:text-left space-y-4 max-w-2xl">
              
              {/* Slogan */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 border border-red-200 text-xs sm:text-sm font-bold text-[#c92127]">
                <Sparkles className="w-3.5 h-3.5 text-[#c92127]" />
                এক যুগের বিশ্বাস ও আস্থার নাম
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#c92127] tracking-tight leading-tight">
                কর্পোরেট টেকনোলজিস
              </h1>

              {/* Warranty & Value Proposition */}
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-semibold text-slate-800">
                  সকল ধরণের প্রিন্টারের সাথে থাকছে
                </p>
                <div className="inline-block bg-slate-900 text-white font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-lg shadow-sm">
                  ১ বছরের সার্ভিস ওয়ারেন্টি <span className="text-[10px] font-normal text-slate-300">(*শর্ত প্রযোজ্য)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                ফটোকপিয়ার, প্রিন্টার, আসল কালার ইঙ্ক এবং Splashjet সার্টিফাইড ডিজিটাল ইঙ্কের বিশ্বস্ত পরিবেশক। সেরা দামে নিশ্চিত আসল পণ্য।
              </p>

              {/* CTA Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleOrderClick}
                  className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>অর্ডার করুন এখনই</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="tel:+8801777277740"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm px-6 py-3.5 rounded-full transition-colors flex items-center gap-2 shadow-sm"
                >
                  <PhoneCall className="w-4 h-4 text-[#c92127]" />
                  <span>হটলাইন: 01777-277740</span>
                </a>
              </div>
            </div>

            {/* Right Side Visual (Printer Models & Splashjet Showcases) */}
            <div className="w-full lg:w-auto flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                {/* Visual Frame */}
                <div className="relative bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xl max-w-sm sm:max-w-md">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Printer className="w-4 h-4 text-[#c92127]" />
                      প্রিন্টিং ইকুইপমেন্ট ও ডিজিটাল ইঙ্ক
                    </span>
                    <span className="text-[10px] font-extrabold text-[#c92127] bg-red-50 px-2 py-0.5 rounded-full">
                      Authorized Partner
                    </span>
                  </div>

                  <img 
                    src="/splashjet_images/grow-your-canon-lfp-ink-business.png" 
                    alt="Corporate Technologies Printing Machinery"
                    className="w-full h-48 sm:h-56 object-contain rounded-2xl bg-white p-2"
                    onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700">
                    <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Epson & Canon ফ্রেন্ডলি</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>১০০% অরিজিনাল কালার</span>
                    </div>
                  </div>
                </div>

                {/* Floating Discount Tag */}
                <div className="absolute -top-3 -right-2 sm:-right-4 bg-[#c92127] text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                  Best Price BD!
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TRUST BADGES STRIP (Crisp White Theme) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">১০০% আসল প্রোডাক্ট</h4>
              <p className="text-[11px] text-slate-500">সার্টিফাইড ইঙ্ক ও প্রিন্টার</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">দ্রুততম ডেলিভারি</h4>
              <p className="text-[11px] text-slate-500">ঢাকায় ২৪ ঘণ্টা ও সারাদেশে হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">এক্সপার্ট টেক সাপোর্ট</h4>
              <p className="text-[11px] text-slate-500">প্রিন্টার সমস্যায় সরাসরি এক্সপার্ট গাইড</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">১ বছর সার্ভিস ওয়ারেন্টি</h4>
              <p className="text-[11px] text-slate-500">নিরাপদ পেমেন্ট ও ক্যাশ অন ডেলিভারি</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
