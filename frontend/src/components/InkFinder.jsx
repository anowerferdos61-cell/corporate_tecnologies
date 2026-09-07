import React, { useState, useMemo } from 'react';
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  Sparkles,
  ShoppingCart,
  Check,
  PackageCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// Real printer brands & series matching real Splashjet and genuine products in database
const PRINTER_BRANDS = [
  { 
    name: 'Canon', 
    series: [
      {
        id: 'canon_g2010',
        name: 'PIXMA G2010 / G3010 / G2020 / G1010',
        recommendedInk: 'Splashjet 790 & Canon GI-790',
        inkType: 'Dye Ink (4-Color Set)',
        searchKeyword: '790',
        keywords: ['790', 'g2010', 'g3010', 'g1010', 'gi-790', 'gi‑790']
      },
      {
        id: 'canon_g2020',
        name: 'PIXMA G2020 / G3020 / G2730 / G3770',
        recommendedInk: 'Splashjet 71 & Canon GI-71',
        inkType: 'Hybrid Pigment Black + Dye Color',
        searchKeyword: '71',
        keywords: ['71', 'g2020', 'g3020', 'g2730', 'g3770']
      },
      {
        id: 'canon_g570',
        name: 'PIXMA G570 / G670 (6-Color Photo)',
        recommendedInk: 'Splashjet 73 & Canon GI-73',
        inkType: '6-Color Photo Dye Ink (Red & Grey)',
        searchKeyword: '73',
        keywords: ['73', 'g570', 'g670']
      },
      {
        id: 'canon_tc20',
        name: 'imagePROGRAF TC-20 / TM-5200 LFP',
        recommendedInk: 'Splashjet 050 Pigment Plotter Ink',
        inkType: 'All Pigment High Resolution Ink',
        searchKeyword: '050',
        keywords: ['050', 'tc20', 'tm-5200']
      }
    ]
  },
  { 
    name: 'Epson', 
    series: [
      {
        id: 'epson_l3110',
        name: 'L3110 / L3210 / L3150 / L3250 EcoTank',
        recommendedInk: 'Splashjet 003 & Epson 003',
        inkType: 'EcoTank 4-Color Dye Ink',
        searchKeyword: '003',
        keywords: ['003', 'l3210', 'l3150', 'l3250', 'l3110']
      },
      {
        id: 'epson_l805',
        name: 'L800 / L805 / L850 / L1800 Photo (6-Color)',
        recommendedInk: 'Splashjet 673 & Epson 673',
        inkType: '6-Color Photo Lab Quality Ink',
        searchKeyword: '673',
        keywords: ['673', 'l805', 'l1800', 'l850', 'l800']
      },
      {
        id: 'epson_l8050',
        name: 'L8050 / L18050 EcoTank (New Gen 6-Color)',
        recommendedInk: 'Splashjet 057 & Epson 057',
        inkType: 'Modern 6-Color EcoTank Photo Ink',
        searchKeyword: '057',
        keywords: ['057', 'l8050', 'l18050']
      },
      {
        id: 'epson_l4260',
        name: 'L4150 / L4260 / L6270 EcoTank',
        recommendedInk: 'Splashjet 001 & Epson 001',
        inkType: 'Pigment Black + Dye Color',
        searchKeyword: '001',
        keywords: ['001', 'l4260', 'l6270']
      },
      {
        id: 'epson_sublimation',
        name: 'F570 / F170 Sublimation & Heat Transfer',
        recommendedInk: 'Splashjet Premium Sublimation Ink',
        inkType: 'Mug, T-Shirt, Fabric Transfer Ink',
        searchKeyword: 'Sublimation',
        keywords: ['sublimation']
      },
      {
        id: 'epson_dtf',
        name: 'SureColor & L1800 DTF Textile Printing',
        recommendedInk: 'Splashjet DTF Textile Inks',
        inkType: 'Direct-To-Film Textile Ink',
        searchKeyword: 'DTF',
        keywords: ['dtf']
      }
    ]
  },
  { 
    name: 'HP', 
    series: [
      {
        id: 'hp_ink_tank',
        name: 'HP Ink Tank 315 / 415 / 515 / 5810 / 5820',
        recommendedInk: 'HP 51 Splashjet Premium Refill Ink',
        inkType: 'HP GT51 & GT52 Compatible Ink',
        searchKeyword: 'HP 51',
        keywords: ['hp 51', 'gt 5810', '315', '415']
      }
    ]
  },
  { 
    name: 'Brother', 
    series: [
      {
        id: 'brother_t_series',
        name: 'Brother DCP-T220 / T420W / T520W / T720DW',
        recommendedInk: 'Brother D60 & BT5000 Splashjet Set',
        inkType: 'High-Yield Dye Ink Full Set',
        searchKeyword: 'Brother D60',
        keywords: ['brother d60', 'bt5000', 't420w', 't520w']
      }
    ]
  }
];

export default function InkFinder({ 
  isOpen, 
  onClose, 
  allProducts = [], 
  onNavigate 
}) {
  const { 
    setSelectedCategory, 
    setSearchQuery, 
    addToCart, 
    cartItems 
  } = useCart();

  const [selectedBrand, setSelectedBrand] = useState('Canon');
  const [selectedSeriesId, setSelectedSeriesId] = useState('canon_g2010');

  // Active brand data
  const currentBrandData = useMemo(() => {
    return PRINTER_BRANDS.find(b => b.name === selectedBrand) || PRINTER_BRANDS[0];
  }, [selectedBrand]);

  // Active series data
  const currentSeries = useMemo(() => {
    return currentBrandData.series.find(s => s.id === selectedSeriesId) || currentBrandData.series[0];
  }, [currentBrandData, selectedSeriesId]);

  // Find REAL matching products from catalog
  const matchedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0 || !currentSeries) return [];

    const kwList = currentSeries.keywords || [];
    return allProducts.filter(p => {
      const title = (p.title || '').toLowerCase();
      const desc = (p.short_description || p.description || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const full = `${title} ${desc} ${sku}`;

      return kwList.some(k => {
        const kw = k.toLowerCase();
        return title.includes(kw) || sku.includes(kw) || full.includes(kw);
      });
    }).sort((a, b) => {
      // Prioritize ink refill bottles first, then printers
      const aIsInk = (a.title + ' ' + (a.category || '')).toLowerCase().includes('ink');
      const bIsInk = (b.title + ' ' + (b.category || '')).toLowerCase().includes('ink');
      if (aIsInk && !bIsInk) return -1;
      if (!aIsInk && bIsInk) return 1;
      return 0;
    });
  }, [currentSeries, allProducts]);

  if (!isOpen) return null;

  const handleApplyMatch = () => {
    const keyword = currentSeries.searchKeyword || currentSeries.keywords[0];
    
    // Update global search & category filters
    setSearchQuery(keyword);
    setSelectedCategory('All');
    onClose();

    // Navigate to /shop/ with the matched query
    if (onNavigate) {
      onNavigate('/shop/');
    } else {
      window.history.pushState({}, '', '/shop/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    // Also smooth scroll if on homepage
    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleProductClick = (product) => {
    onClose();
    const targetUrl = `/product/${product.slug || product.id}/`;
    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 sm:px-6 bg-[#c92127] text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-white" />
            <h2 className="text-sm sm:text-base font-bold">ইন্টেলিজেন্ট ইঙ্ক ম্যাচিং টুল (Ink Finder)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/15 active:bg-black/25 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            আপনার প্রিন্টারের সঠিক মডেল নির্বাচন করুন। আমাদের অ্যালগরিদম আপনার ডিভাইসের জন্য ১০০% উপযুক্ত ও নিরাপদ Splashjet সোয়াপ-ইন ইঙ্ক ফিল্টার করে দেখাবে।
          </p>

          {/* Step 1: Brand Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">১. প্রিন্টার ব্র্যান্ড সিলেক্ট করুন:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRINTER_BRANDS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => {
                    setSelectedBrand(b.name);
                    setSelectedSeriesId(b.series[0].id);
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBrand === b.name
                      ? 'bg-[#c92127] text-white border-[#c92127] shadow-sm transform scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Model Series Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">২. প্রিন্টার সিরিজ বা মডেল নির্বাচন করুন:</label>
            <div className="space-y-2">
              {currentBrandData.series.map((series) => {
                const isSelected = selectedSeriesId === series.id;
                return (
                  <label
                    key={series.id}
                    onClick={() => setSelectedSeriesId(series.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'border-[#c92127] bg-red-50/60 text-[#c92127] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Printer className={`w-4 h-4 ${isSelected ? 'text-[#c92127]' : 'text-slate-400'}`} />
                      <span>{series.name}</span>
                    </div>
                    <input
                      type="radio"
                      name="printerSeries"
                      checked={isSelected}
                      onChange={() => setSelectedSeriesId(series.id)}
                      className="accent-[#c92127]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>সুপারিশকৃত Splashjet ইঙ্ক:</span>
              </span>
              <span className="text-xs font-black bg-[#c92127] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                {currentSeries.recommendedInk}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              নোজল ক্লগিং প্রিভেনশন ও আসল কালার ডেপথ নিশ্চিত করতে <strong>{currentSeries.name}</strong>-এর জন্য অনুমোদিত।
            </p>
          </div>

          {/* Real Live Matching Products Showcase */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>উপযুক্ত প্রোডাক্টসমূহ ({matchedProducts.length}টি পাওয়া গেছে):</span>
              </span>
            </div>

            {matchedProducts.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                এই মুহূর্তে ক্যাটালগে এই মডেলের পণ্যটি লোড হচ্ছে। নিচে বাটনে ক্লিক করে সব প্রোডাক্ট দেখতে পারেন।
              </div>
            ) : (
              <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {matchedProducts.slice(0, 4).map((p) => {
                  const cartItem = cartItems?.find(item => item.product.id === p.id);
                  const isInCart = Boolean(cartItem);

                  return (
                    <div 
                      key={p.id}
                      onClick={() => handleProductClick(p)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={p.image_url} 
                          alt={p.title} 
                          className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0"
                          onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#c92127] transition-colors">
                            {p.title}
                          </h4>
                          <div className="text-[11px] font-black text-[#c92127] mt-0.5">
                            ৳{Number(p.sale_price || p.regular_price).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1, e);
                        }}
                        className={`text-[10px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                          isInCart
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white hover:bg-[#c92127] text-slate-700 hover:text-white border border-slate-300'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>যুক্ত</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>কার্টে নিন</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={handleApplyMatch}
            className="w-full bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>উপযুক্ত ইঙ্ক ও প্রোডাক্ট দেখুন ({matchedProducts.length}টি পাওয়া গেছে)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
