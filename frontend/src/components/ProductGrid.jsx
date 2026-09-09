import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Curates a balanced, engaging mixture of:
 * - Photocopiers (Toshiba e-Studio models)
 * - Printers (Epson, Canon, HP)
 * - Splashjet Inks (Epson, Canon, HP, Sublimation/DTF)
 * - Toners, Machinery & POS equipment
 */
function createPopularMixture(allProducts = []) {
  if (!allProducts || allProducts.length === 0) return [];

  const photocopiers = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return cat.includes('photocopy') || title.includes('photocopier') || title.includes('e-studio') || title.includes('toshiba');
  });

  const printers = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return cat.includes('printer') && !cat.includes('photocopy') && !title.includes('feed');
  });

  const inks = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return cat.includes('splashjet') || (cat.includes('ink') && !cat.includes('printer')) || title.includes('splashjet') || title.includes('bottle ink');
  });

  const others = allProducts.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('machinery') || cat.includes('toner') || cat.includes('pos') || cat.includes('equipment');
  });

  const mixture = [];
  const targetCount = 24; // 24 products (perfect 4-col desktop and 2-col mobile grid)
  const maxLoops = Math.max(photocopiers.length, printers.length, inks.length, others.length, 15);

  // Interleave evenly: [Photocopier, Printer, Splashjet Ink, Other / Toner]
  for (let i = 0; i < maxLoops && mixture.length < targetCount; i++) {
    if (photocopiers[i] && !mixture.some(m => m.id === photocopiers[i].id)) {
      mixture.push(photocopiers[i]);
    }
    if (printers[i] && !mixture.some(m => m.id === printers[i].id)) {
      mixture.push(printers[i]);
    }
    if (inks[i] && !mixture.some(m => m.id === inks[i].id)) {
      mixture.push(inks[i]);
    }
    if (others[i] && !mixture.some(m => m.id === others[i].id)) {
      mixture.push(others[i]);
    } else if (inks[i + 1] && !mixture.some(m => m.id === inks[i + 1].id)) {
      mixture.push(inks[i + 1]);
    }
  }

  // Fallback if mixture is smaller than desired
  if (mixture.length < targetCount) {
    allProducts.forEach(p => {
      if (mixture.length < targetCount && !mixture.some(m => m.id === p.id)) {
        mixture.push(p);
      }
    });
  }

  return mixture.slice(0, targetCount);
}

export default function ProductGrid({ products = [], loading = false, onNavigate }) {
  // Generate the curated popular mixture of inks, photocopiers, printers, etc.
  const displayProducts = useMemo(() => {
    return createPopularMixture(products);
  }, [products]);

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
      ) : displayProducts.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-sm text-slate-600">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <>
          {/* Direct, clean product grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>

          {/* Bottom View All Products CTA */}
          <div className="mt-10 flex flex-col items-center justify-center">
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
            <p className="text-slate-400 text-[11px] font-medium mt-2.5">
              ১০০% আসল প্রোডাক্ট • ১ বছর অফিসিয়াল সার্ভিস সাপোর্ট • সারা দেশে দ্রুত ডেলিভারি
            </p>
          </div>
        </>
      )}
    </div>
  );
}
