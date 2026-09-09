import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, Droplet, Printer } from 'lucide-react';

/**
 * Filter 8 top-selling pure Splashjet & compatible refill inks
 */
function getPopularInks(allProducts = [], count = 8) {
  if (!allProducts || allProducts.length === 0) return [];

  const inks = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Exclude hardware printers
    if (
      title.includes('dcp-') ||
      title.includes('mfc-') ||
      (title.includes('printer') && !title.includes('ink for') && !title.includes('inkjet printer'))
    ) {
      return false;
    }

    const isInkCat = cat.includes('splashjet') || (cat.includes('ink') && !cat.includes('printer'));
    const isInkTitle = title.includes('splashjet') || title.includes('refill ink') || title.includes('bottle') || title.includes('sublimation') || title.includes('dtf') || title.includes('cmybk');

    return isInkCat || isInkTitle;
  });

  return inks.slice(0, count);
}

/**
 * Filter 8 top-rated Printers & Photocopiers (Brother, Toshiba, Epson, POS)
 */
function getPopularPrinters(allProducts = [], count = 8) {
  if (!allProducts || allProducts.length === 0) return [];

  const printers = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    // Exclude consumables
    if (
      title.includes('refill ink') || 
      title.includes('compatible refill') || 
      title.includes('cmybk') ||
      (cat.includes('ink') && !cat.includes('printer'))
    ) {
      return false;
    }

    return (
      cat.includes('printer') || 
      cat.includes('photocopy') || 
      title.includes('printer') || 
      title.includes('photocopier') || 
      title.includes('e-studio') ||
      title.includes('brother') ||
      title.includes('epson')
    );
  });

  // Balanced mix of Brother ink tank printers, Toshiba digital photocopiers, and Epson
  const brother = printers.filter(p => p.title.toLowerCase().includes('brother'));
  const toshiba = printers.filter(p => p.title.toLowerCase().includes('toshiba'));
  const epson = printers.filter(p => p.title.toLowerCase().includes('epson'));
  const others = printers.filter(p => !p.title.toLowerCase().includes('brother') && !p.title.toLowerCase().includes('toshiba') && !p.title.toLowerCase().includes('epson'));

  const selected = [];
  const add = (p) => {
    if (p && !selected.some(s => s.id === p.id) && selected.length < count) {
      selected.push(p);
    }
  };

  brother.slice(0, 3).forEach(add);
  toshiba.slice(0, 3).forEach(add);
  epson.slice(0, 1).forEach(add);
  others.slice(0, 1).forEach(add);

  // Fallback if needed
  printers.forEach(add);

  return selected.slice(0, count);
}

export default function ProductGrid({ products = [], loading = false, onNavigate }) {
  // Extract curated 8 inks and 8 printers
  const inkProducts = useMemo(() => getPopularInks(products, 8), [products]);
  const printerProducts = useMemo(() => getPopularPrinters(products, 8), [products]);

  const totalCount = inkProducts.length + printerProducts.length;

  return (
    <div className="w-full">
      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
              <div className="h-44 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-sm text-slate-600">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 1. INK CATEGORY SECTION */}
          <div>
            {/* Category Header Banner - Centered with Red Border */}
            <div className="border-2 border-[#c92127] bg-gradient-to-r from-red-50/70 via-white to-red-50/70 rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-1 rounded-full text-xs font-black shadow-xs mb-2">
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span className="uppercase tracking-wider">ক্যাটাগরি</span>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Splashjet Inks
                </h3>
                <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                  {inkProducts.length} টি সেরা ইঙ্ক
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                Epson, Canon, HP ও ব্রাদারের জন্য ১০০% আসল প্রিমিয়াম রিফিল ইঙ্ক কালেকশন
              </p>
            </div>

            {/* Inks 8-Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {inkProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* 2. PRINTERS & PHOTOCOPIERS SECTION */}
          <div>
            {/* Category Header Banner - Centered with Red Border */}
            <div className="border-2 border-[#c92127] bg-gradient-to-r from-red-50/70 via-white to-red-50/70 rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-1 rounded-full text-xs font-black shadow-xs mb-2">
                <Printer className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">ক্যাটাগরি</span>
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Printers & Photocopiers
                </h3>
                <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                  {printerProducts.length} টি টপ মডেল
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                Brother ও Epson অফিসিয়াল ইঙ্কট্যাঙ্ক প্রিন্টার এবং Toshiba ডিজিটাল ফটোকপিয়ার কালেকশন
              </p>
            </div>

            {/* Printers 8-Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {printerProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          </div>

          {/* Bottom View All CTA */}
          <div className="pt-6 flex flex-col items-center justify-center border-t border-slate-100">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('/shop/', 'Shop');
                } else {
                  window.history.pushState({}, '', '/shop/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="inline-flex items-center gap-2.5 bg-[#c92127] hover:bg-[#b91c1c] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>সব প্রোডাক্ট ব্রাউজ করুন (View All Products)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-slate-400 text-[11px] font-medium mt-2.5 text-center">
              ১০০% আসল প্রোডাক্ট • ১ বছর অফিসিয়াল সার্ভিস সাপোর্ট • সারা দেশে দ্রুত ডেলিভারি
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
