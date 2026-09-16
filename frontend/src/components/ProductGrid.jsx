import React, { useMemo } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, Droplet, Printer, Flame } from 'lucide-react';
import fallbackProductsData from '../data/fallbackProducts.json';

/**
 * Filter 8 top-selling pure Splashjet & compatible refill inks
 */
function getPopularInks(allProducts = [], count = 8) {
  const sourceList = (allProducts && allProducts.length > 0) ? allProducts : fallbackProductsData;

  const inks = sourceList.filter(p => {
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
  const sourceList = (allProducts && allProducts.length > 0) ? allProducts : fallbackProductsData;

  const printers = sourceList.filter(p => {
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

/**
 * Filter 8 top Heat Press Machines & Machinery
 */
function getPopularHeatPress(allProducts = [], count = 8) {
  const isHeatPress = (p) => {
    if (!p) return false;
    const cat = (p.category || '').toLowerCase();
    const sub = (p.sub_category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();

    return (
      cat.includes('machinery') ||
      cat.includes('heat press') ||
      cat.includes('equipment') ||
      sub.includes('machinery') ||
      sub.includes('heat press') ||
      title.includes('heat press') ||
      title.includes('freesub') ||
      title.includes('combo heat press') ||
      title.includes('combo package') ||
      title.includes('screen protector cutter') ||
      title.includes('cutting machine')
    );
  };

  let list = (allProducts || []).filter(isHeatPress);

  if (list.length < 4) {
    const fallbackList = fallbackProductsData.filter(isHeatPress);
    const combined = [...list];
    fallbackList.forEach(item => {
      if (!combined.some(c => c.id === item.id || c.title.toLowerCase() === item.title.toLowerCase())) {
        combined.push(item);
      }
    });
    list = combined;
  }

  return list.slice(0, count);
}

export default function ProductGrid({ products = [], loading = false, onNavigate }) {
  // Extract curated products for the 3 categories
  const inkProducts = useMemo(() => getPopularInks(products, 8), [products]);
  const printerProducts = useMemo(() => getPopularPrinters(products, 8), [products]);
  const heatPressProducts = useMemo(() => getPopularHeatPress(products, 8), [products]);

  const totalCount = inkProducts.length + printerProducts.length + heatPressProducts.length;

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
          <p className="text-sm text-slate-600">No products found in this collection.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 1. SPLASHJET INKS SECTION */}
          {inkProducts.length > 0 && (
            <div>
              {/* Category Header Box with Thin Red Border */}
              <div className="border border-[#c92127]/60 bg-gradient-to-r from-red-50/40 via-white to-red-50/40 rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-2xs">
                <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                  <Droplet className="w-3 h-3 fill-current" />
                  <span>Category</span>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Splashjet Inks
                  </h3>
                  <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                    {inkProducts.length} Premium Inks
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto font-medium">
                  100% Authentic OEM-grade refill inks for Epson, Canon, HP & Brother
                </p>
              </div>

              {/* Inks 8-Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {inkProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}

          {/* 2. PHOTOCOPIERS & PRINTERS SECTION */}
          {printerProducts.length > 0 && (
            <div>
              {/* Category Header Box with Thin Red Border */}
              <div className="border border-[#c92127]/60 bg-gradient-to-r from-red-50/40 via-white to-red-50/40 rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-2xs">
                <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                  <Printer className="w-3 h-3" />
                  <span>Category</span>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Photocopy Machine & Printers
                  </h3>
                  <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                    {printerProducts.length} Top Models
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto font-medium">
                  Official Brother, Epson, HP Printers and Toshiba Digital Multifunction Copiers
                </p>
              </div>

              {/* Printers 8-Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {printerProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}

          {/* 3. HEAT PRESS & MACHINERY SECTION */}
          {heatPressProducts.length > 0 && (
            <div>
              {/* Category Header Box with Thin Red Border */}
              <div className="border border-[#c92127]/60 bg-gradient-to-r from-red-50/40 via-white to-red-50/40 rounded-2xl p-4 sm:p-5 mb-6 text-center shadow-2xs">
                <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Category</span>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Heat Press & Machinery
                  </h3>
                  <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                    {heatPressProducts.length} Top Equipment
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto font-medium">
                  Professional 5-in-1 Combo Heat Press, T-Shirt Flat Press & Sublimation Machinery Solutions
                </p>
              </div>

              {/* Heat Press Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {heatPressProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}

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
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-slate-400 text-xs font-medium mt-2.5 text-center">
              100% Authentic Products • 1 Year Official Support • Nationwide Fast Delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
