import React from 'react';
import { Check } from 'lucide-react';

export default function SeoAuthoritySection({ onKeywordClick }) {
  const searchKeywords = [
    'printer price in bangladesh',
    'photocopier dhaka',
    'epson printer bangladesh',
    'canon printer price',
    'hp printer dhaka',
    'toshiba copier price',
    'original ink bangladesh',
    'brother printer bd',
    'office equipment dhaka',
    'corporate technologies bd'
  ];

  const whyChooseUs = [
    '100% Original Products',
    '1-Year Service Warranty',
    'Nationwide Delivery',
    'Technical Support',
    'Best Price Guaranteed',
    '1000+ Happy Customers'
  ];

  return (
    <section className="w-full bg-[#fafafa] border-t border-slate-200/90 py-14 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        
        {/* Brand Header with Red 'C' Avatar (Matching Screenshot 2) */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#c92127] text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
              C
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Corporate Technologies BD
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Printer, Photocopier & Office Equipment — Bangladesh
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Corporate Technologies BD is one of Bangladesh's most trusted suppliers of printers, photocopiers, original ink, and office equipment. For over a decade, we have served thousands of satisfied customers — from corporate offices and hospitals to schools and home users — with 100% original products and dedicated after-sales support.
          </p>
        </div>

        {/* 4 Pillars Grid (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          
          {/* 1. Best Printer Shop */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              BEST PRINTER SHOP
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Epson, Canon, HP, and Brother printers for every budget. Inkjet, laser, mono, and color — our experts help you choose the right one for your needs.
            </p>
          </div>

          {/* 2. Photocopier Supplier */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              PHOTOCOPIER SUPPLIER
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Brand new Toshiba and Canon digital multifunctional copiers with official warranty and free operator training. Light duty to heavy office use.
            </p>
          </div>

          {/* 3. Original Ink & Toner */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              ORIGINAL INK & TONER
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              100% genuine cartridges from Epson, Canon, HP, Brother, Kodak, Transcend, and Splashjet. Original ink means better quality and longer printer life.
            </p>
          </div>

          {/* 4. Office Equipment */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              OFFICE EQUIPMENT
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scanners, laminators, shredders, binding machines and more. One-stop solution for all office technology needs.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-200/80 pt-8 space-y-8">
          
          {/* Why Choose Us (Matching Screenshot 2) */}
          <div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-3">
              WHY CHOOSE US
            </h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {whyChooseUs.map((item, i) => (
                <div 
                  key={i}
                  className="bg-white border border-slate-200 shadow-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#c92127] stroke-[3]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What People Search For (SEO Keywords matching Screenshot 2) */}
          <div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-3">
              WHAT PEOPLE SEARCH FOR
            </h4>
            <div className="flex flex-wrap gap-2">
              {searchKeywords.map((kw, i) => (
                <button
                  key={i}
                  onClick={() => onKeywordClick && onKeywordClick(kw)}
                  className="bg-white hover:bg-slate-100 hover:border-slate-300 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* 64 Districts Line (Matching Screenshot 2) */}
          <div className="pt-2 text-center text-xs text-slate-400 font-medium">
            Serving customers across all 64 districts of Bangladesh — <span className="text-slate-600 font-bold">Dhaka · Chattogram · Sylhet · Rajshahi · Khulna · Barishal · Rangpur · Mymensingh</span> and everywhere in between.
          </div>

        </div>

      </div>
    </section>
  );
}
