import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { Search, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';

export default function ProductGrid({ products = [], loading = false, onNavigate }) {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy
  } = useCart();

  const [localPriceMax, setLocalPriceMax] = useState(priceRange[1] || 500000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [showAllHomepage, setShowAllHomepage] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Dynamic Categories list based on active products
  const categoryNames = [
    'Printers',
    'Photocopy Machines',
    'Splashjet Inks',
    'Machinery',
    'POS & Barcode',
    'Toner & Inks',
    'Accessories & Parts'
  ];

  const shopCategories = categoryNames.map(cat => ({
    name: cat,
    count: products.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const target = cat.toLowerCase();
      return pCat.includes(target) || target.includes(pCat);
    }).length
  })).filter(c => c.count > 0);

  // Filtering products
  const filteredProducts = products.filter(p => {
    // Category match
    if (selectedCategory !== 'All') {
      const pCat = (p.category || '').toLowerCase();
      const sCat = selectedCategory.toLowerCase();
      const pSub = (p.sub_category || '').toLowerCase();
      
      const matchCat = Boolean(pCat && (pCat === sCat || pCat.includes(sCat) || sCat.includes(pCat)));
      const matchSub = Boolean(pSub && (pSub === sCat || pSub.includes(sCat) || sCat.includes(pSub)));
      
      if (!matchCat && !matchSub) {
        return false;
      }
    }
    // Search query match (Title, Brand, Category, Sub-cat, SKU, Description, and Variations)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchCategory = (p.category || '').toLowerCase().includes(q);
      const matchSub = (p.sub_category || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const matchDesc = (p.short_description || '').toLowerCase().includes(q);
      
      // Match within variations (e.g. searching 'Black', 'Cyan', 'Full Set', etc.)
      const matchVariations = Array.isArray(p.variations) && p.variations.some(v => 
        (v.name || '').toLowerCase().includes(q) || 
        (v.sku || '').toLowerCase().includes(q) ||
        (v.variant || '').toLowerCase().includes(q)
      );

      if (!matchTitle && !matchBrand && !matchCategory && !matchSub && !matchSku && !matchDesc && !matchVariations) {
        return false;
      }
    }
    // Price range - only if explicitly applied by user
    if (isPriceFilterActive) {
      const price = p.sale_price || p.regular_price || 0;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }
    }
    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.sale_price || a.regular_price || 0;
    const priceB = b.sale_price || b.regular_price || 0;
    if (sortBy === 'price_low') return priceA - priceB;
    if (sortBy === 'price_high') return priceB - priceA;
    if (sortBy === 'popularity') {
      const scoreA = (a.is_featured ? 50 : 0) + (a.variations?.length || 0) * 5 + (a.stock_quantity > 0 ? 20 : 0);
      const scoreB = (b.is_featured ? 50 : 0) + (b.variations?.length || 0) * 5 + (b.stock_quantity > 0 ? 20 : 0);
      return scoreB - scoreA;
    }
    if (sortBy === 'rating') {
      const ratingA = a.rating || (a.is_featured ? 5.0 : 4.8);
      const ratingB = b.rating || (b.is_featured ? 5.0 : 4.8);
      return ratingB - ratingA;
    }
    if (sortBy === 'latest') {
      return (b.id || 0) - (a.id || 0);
    }
    if (sortBy === 'name_asc') return (a.title || '').localeCompare(b.title || '');
    // Prioritize featured products on homepage
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.id || 0) - (a.id || 0); // default sorting
  });

  const isHomepageDefault = selectedCategory === 'All' && !searchQuery.trim();
  const displayedProducts = (isHomepageDefault && !showAllHomepage) 
    ? sortedProducts.slice(0, 12) 
    : sortedProducts;

  const applyPriceFilter = () => {
    setIsPriceFilterActive(true);
    setPriceRange([300, localPriceMax]);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setIsPriceFilterActive(false);
    setPriceRange([0, 500000]);
    setLocalPriceMax(500000);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-xs">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#c92127]" />
          <span>ফিল্টার ও সার্চ অপশন {isPriceFilterActive || selectedCategory !== 'All' ? '(অ্যাক্টিভ)' : ''}</span>
        </button>
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="text-xs text-[#c92127] font-bold cursor-pointer hover:underline"
        >
          {isMobileFilterOpen ? 'সংক্ষেপ করুন ▲' : 'ফিল্টার খুলুন ▼'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* 1. LEFT SIDEBAR (Matching corporatetechbd.com/shop Screenshots) */}
        <aside className={`lg:col-span-3 space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
        
        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products, brand, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 pl-4 pr-10 py-2.5 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 border border-transparent focus:border-slate-300 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="w-5 h-5 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer text-xs"
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

        {/* Filter By Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Filter By Price
            </h3>
            {isPriceFilterActive && (
              <button
                onClick={() => {
                  setIsPriceFilterActive(false);
                  setPriceRange([0, 500000]);
                  setLocalPriceMax(500000);
                }}
                className="text-[11px] text-[#c92127] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset Price
              </button>
            )}
          </div>

          {/* Slider track */}
          <div className="space-y-2">
            <input
              type="range"
              min="300"
              max="400000"
              step="1000"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c92127]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={applyPriceFilter}
              className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-semibold px-5 py-1.5 rounded-full transition-colors shadow-sm cursor-pointer"
            >
              Filter
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Price: 300৳ — {Number(localPriceMax).toLocaleString()}৳
            </span>
          </div>
        </div>

        {/* Categories List Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Categories
            </h3>
            {selectedCategory !== 'All' && (
              <button 
                onClick={handleResetFilters}
                className="text-[11px] text-[#c92127] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> All
              </button>
            )}
          </div>

          <ul className="space-y-2 text-xs sm:text-[13px]">
            {shopCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <li key={cat.name}>
                  <button
                    onClick={() => {
                      setIsPriceFilterActive(false);
                      setSearchQuery('');
                      setSelectedCategory(isSelected ? 'All' : cat.name);
                    }}
                    className={`w-full flex items-center justify-between py-1 transition-colors cursor-pointer text-left ${
                      isSelected 
                        ? 'text-[#c92127] font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

      </aside>

      {/* 2. MAIN PRODUCTS SECTION (9 Cols) */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* Top Filter & Result Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap">
            <span>প্রোডাক্ট ক্যাটালগ</span>
            {selectedCategory !== 'All' && (
              <span className="font-bold text-[#c92127] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                ক্যাটাগরি: {selectedCategory}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                সার্চ: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-[#c92127] hover:underline font-bold text-xs ml-1">✕</button>
              </span>
            )}
          </div>

          {/* Dropdowns Container: Category Dropdown & Sort Dropdown ALWAYS SIDE-BY-SIDE (flex-row) */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Category Dropdown (Main Categories) */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setIsPriceFilterActive(false);
                  setSearchQuery('');
                  setSelectedCategory(e.target.value);
                }}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-lg pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] cursor-pointer appearance-none shadow-xs font-semibold truncate"
                aria-label="Filter by Category"
              >
                <option value="All">সকল ক্যাটাগরি</option>
                {shopCategories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-lg pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] cursor-pointer appearance-none shadow-xs font-medium truncate"
                aria-label="Sort products"
              >
                <option value="default">Default sorting</option>
                <option value="popularity">Sort by popularity</option>
                <option value="rating">Sort by rating</option>
                <option value="latest">Sort by latest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search / Filter Active Helper Banner */}
        {searchQuery.trim() && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-red-50/80 border border-red-200/80 rounded-2xl text-xs text-slate-700 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span>
                সার্চ কোয়েরি: <strong className="text-slate-900">"{searchQuery}"</strong>
                {selectedCategory !== 'All' && (
                  <span className="text-slate-600"> (ক্যাটাগরি: <strong className="text-[#c92127]">{selectedCategory}</strong>)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="bg-white text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-semibold hover:bg-slate-100 transition-colors shadow-xs cursor-pointer text-xs"
                >
                  সকল ক্যাটাগরিতে খুঁজুন
                </button>
              )}
              <button
                onClick={() => setSearchQuery('')}
                className="bg-white text-[#c92127] border border-red-200 px-3 py-1 rounded-full font-bold hover:bg-red-50 transition-colors shadow-xs cursor-pointer text-xs"
              >
                {selectedCategory !== 'All' ? `"${selectedCategory}"-এর সব পণ্য দেখুন` : 'সার্চ মুছুন ✕'}
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
                <div className="h-44 bg-slate-100 rounded-xl"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          /* Empty State with Smart Recovery Buttons */
          <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 animate-fadeIn">
            <div className="w-14 h-14 bg-red-50 text-[#c92127] rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-xs">
              <Search className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                কোনো প্রোডাক্ট পাওয়া যায়নি!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {searchQuery.trim() && selectedCategory !== 'All' ? (
                  <>
                    <strong className="text-[#c92127]">{selectedCategory}</strong> ক্যাটাগরির মধ্যে <strong className="text-slate-900">"{searchQuery}"</strong> ফিল্টারে কোনো পণ্য মেলেনি।
                  </>
                ) : (
                  'আপনার নির্বাচিত ক্যাটাগরি বা সার্চ টার্ম অনুযায়ী কোনো প্রোডাক্ট মেলেনি।'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {searchQuery.trim() && selectedCategory !== 'All' && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  "{selectedCategory}"-এর সব পণ্য দেখুন
                </button>
              )}
              {selectedCategory !== 'All' && searchQuery.trim() && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer"
                >
                  সকল ক্যাটাগরিতে "{searchQuery}" খুঁজুন
                </button>
              )}
              <button
                onClick={handleResetFilters}
                className="bg-white hover:bg-red-50 text-[#c92127] border border-red-200 text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                সব ফিল্টার রিসেট করুন
              </button>
            </div>
          </div>
        ) : (
          /* Product Cards Grid (2 cols on mobile, 3 cols on desktop) */
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>

            {/* Homepage 12-Item Limiter Toggle Button */}
            {isHomepageDefault && sortedProducts.length > 12 && (
              <div className="mt-10 flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <p className="text-xs font-medium text-slate-500 mb-3">
                  {showAllHomepage 
                    ? 'সম্পূর্ণ ক্যাটালগ প্রদর্শিত হচ্ছে' 
                    : 'হোমপেজে সেরা জনপ্রিয় পণ্যগুলো দেখানো হচ্ছে'}
                </p>
                <button
                  onClick={() => setShowAllHomepage(!showAllHomepage)}
                  className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>{showAllHomepage ? 'কম প্রোডাক্ট দেখুন' : 'আরও প্রোডাক্ট দেখুন'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllHomepage ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      </div>
    </div>
  );
}
