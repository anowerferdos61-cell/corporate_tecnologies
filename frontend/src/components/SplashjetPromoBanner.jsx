import React from 'react';
import { ArrowRight, CheckCircle2, QrCode, ShieldCheck, Sparkles } from 'lucide-react';

export default function SplashjetPromoBanner({ onExploreInks }) {
  return (
    <section className="w-full bg-[#f8f9fa] border-y border-slate-200/80 py-10 sm:py-14 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Visual: QR Verification & Splashjet Box (Matching Screenshot 3) */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-center gap-6 bg-gradient-to-b from-slate-50/50 to-amber-50/20 relative">
            
            {/* Red Heading & Callout */}
            <div className="text-center sm:text-left space-y-2 z-10 max-w-xs">
              <div className="inline-block bg-red-100 text-[#c92127] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                অফিসিয়াল Splashjet গ্যারান্টি
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#c92127] leading-tight">
                স্ক্যান করলে আসল<br />
                <span className="text-slate-900">না করলে নকল</span>
              </h3>
              <div className="bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs sm:text-[13px] font-extrabold px-3 py-2 rounded-xl shadow-xs inline-flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#c92127]" />
                <span>পণ্য ক্রয়ের আগে QR CODE যাচাই করে নিন</span>
              </div>
            </div>

            {/* Product Mockup with Verified Seal */}
            <div className="relative flex-shrink-0">
              <div className="w-48 sm:w-56 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-2xl border border-slate-700 relative overflow-hidden">
                {/* Brand Header */}
                <div className="text-center border-b border-slate-700 pb-2 mb-3">
                  <span className="text-[#c92127] font-black text-sm tracking-wider">▲ SPLASHJET</span>
                  <div className="text-[9px] text-slate-400 font-semibold">Premium Ink</div>
                </div>

                <div className="text-center py-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">PIGMENT INK</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">FOR EPSON & CANON</div>
                </div>

                {/* Golden Shield QR Seal (Matching Screenshot 3) */}
                <div className="my-2 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-300 p-2.5 rounded-xl border-2 border-amber-400 text-slate-900 text-center shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-[9px] font-black tracking-widest text-[#c92127]">SPLASHJET BANGLADESH</div>
                  <div className="text-xs font-black uppercase text-slate-900 tracking-wider">VERIFIED</div>
                  <div className="my-1.5 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white p-1 rounded-lg border border-amber-300 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                  </div>
                  <div className="text-[8px] font-bold text-slate-700">SCAN TO AUTHENTICATE</div>
                </div>

                {/* ISO badges */}
                <div className="flex items-center justify-center gap-2 text-[8px] text-slate-400 font-semibold pt-1">
                  <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800">ISO 9001</span>
                  <span className="bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded border border-sky-800">ISO 14001</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Content: 70% Savings & Details (Matching Screenshot 3) */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:pl-4 space-y-4">
            
            {/* Top Subtitle */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-600">
              <span className="text-[#c92127]">✓</span>
              <span>সাশ্রয়ী দামে, সেরা প্রিন্ট কোয়ালিটি!</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              <span className="text-[#c92127]">Splashjet Ink</span> দিয়ে প্রিন্ট করুন প্রায় <span className="underline decoration-[#c92127] decoration-4">৭০% কম খরচে!</span>
            </h2>

            {/* Value Propositions */}
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
              প্রিমিয়াম প্রিন্টিং, সাশ্রয়ী মূল্য, এবং প্রিন্ট হেড সুরক্ষা – সবকিছু একসাথে!
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ৭০% পর্যন্ত কম খরচে অরিজিনাল কালির মত প্রিন্ট এবং দীর্ঘস্থায়ী কালার ভাইব্রেন্সি।
            </p>

            {/* Category Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs font-bold text-slate-700">
              <span className="bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-full">
                Desktop Ink
              </span>
              <span className="text-slate-300">|</span>
              <span className="bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-full">
                Sublimation & DTF Ink
              </span>
              <span className="text-slate-300">|</span>
              <span className="bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1 rounded-full">
                Plotter Ink
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-3">
              <button
                onClick={onExploreInks}
                className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-xl flex items-center gap-2.5 group cursor-pointer"
              >
                <span>কালি সংগ্রহ করুন</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
