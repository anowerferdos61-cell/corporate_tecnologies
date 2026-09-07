import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { 
  CATEGORIES_TREE, 
  productMatchesCategory, 
  findCategoryBySlug 
} from '../data/categoriesData';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  RotateCcw, 
  SlidersHorizontal,
  Home,
  ChevronLeft
} from 'lucide-react';

const PRODUCTS_PER_PAGE = 9; // 9 products per page as requested by user

export default function CategoryPage({ 
  products = [], 
  categorySlug,
  subCategorySlug = null,
  onNavigate 
}) {
  const { 
    addToCart, 
    searchQuery: cartSearchQuery, 
    setSearchQuery: setCartSearchQuery 
  } = useCart();

  // Find active category from slug or fallback
  const resolved = useMemo(() => {
    return findCategoryBySlug(subCategorySlug || categorySlug);
  }, [categorySlug, subCategorySlug]);

  const isShopPage = categorySlug === 'shop' || !categorySlug;

  const [activeParentCat, setActiveParentCat] = useState(
    isShopPage ? 'All Products' : (resolved?.parent?.name || 'Photocopy Machine')
  );
  const [activeSubCat, setActiveSubCat] = useState(resolved?.sub?.name || null);
  const [expandedCategories, setExpandedCategories] = useState({
    [resolved?.parent?.name || 'Photocopy Machine']: true,
    'Machinery': true,
    'Printers': true
  });

  const [searchQuery, setSearchQuery] = useState(cartSearchQuery || '');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state when URL slug changes
  useEffect(() => {
    if (isShopPage) {
      setActiveParentCat('All Products');
      setActiveSubCat(null);
      setCurrentPage(1);
    } else if (resolved) {
      setActiveParentCat(resolved.parent.name);
      setActiveSubCat(resolved.sub ? resolved.sub.name : null);
      setExpandedCategories(prev => ({ ...prev, [resolved.parent.name]: true }));
      setCurrentPage(1);
    }
  }, [resolved, isShopPage]);

  // Sync search query when updated from InkFinder or Navbar
  useEffect(() => {
    if (cartSearchQuery !== undefined && cartSearchQuery !== searchQuery) {
      setSearchQuery(cartSearchQuery);
      setCurrentPage(1);
    }
  }, [cartSearchQuery]);

  // Update page title
  useEffect(() => {
    const pageTitle = activeSubCat 
      ? `${activeSubCat} – ${activeParentCat} – Corporate Technologies BD`
      : `${activeParentCat} – Corporate Technologies BD`;
    document.title = pageTitle;
  }, [activeParentCat, activeSubCat]);

  // Determine category price bounds
  const categoryProductsAll = useMemo(() => {
    return products.filter(p => productMatchesCategory(p, activeParentCat, activeSubCat));
  }, [products, activeParentCat, activeSubCat]);

  // 8 Main Parent Categories for dropdown
  const mainParentCategories = useMemo(() => {
    const prominent = [
      'Printers',
      'Photocopy Machine',
      'Splashjet Ink',
      'Machinery',
      'Office Equipment',
      'Toner & Inks',
      'Accessories & Parts',
      'Ready Business Setup'
    ];
    return prominent.map(name => {
      const found = CATEGORIES_TREE.find(c => c.name.toLowerCase() === name.toLowerCase());
      const count = products.filter(p => productMatchesCategory(p, name, null)).length;
      return {
        name,
        slug: found?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        count: count > 0 ? count : (found?.count || 0)
      };
    }).filter(c => c.count > 0);
  }, [products]);

  const minPriceFound = useMemo(() => {
    if (categoryProductsAll.length === 0) return 300;
    const prices = categoryProductsAll.map(p => p.sale_price || p.regular_price || 0).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : 300;
  }, [categoryProductsAll]);

  const maxPriceFound = useMemo(() => {
    if (categoryProductsAll.length === 0) return 400000;
    const prices = categoryProductsAll.map(p => p.sale_price || p.regular_price || 0).filter(p => p > 0);
    return prices.length > 0 ? Math.max(...prices) : 400000;
  }, [categoryProductsAll]);

  const [sliderPrice, setSliderPrice] = useState(maxPriceFound);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);

  useEffect(() => {
    setSliderPrice(maxPriceFound);
    setIsPriceFilterActive(false);
  }, [maxPriceFound]);

  // Filter products by category, search, and price
  const filteredProducts = useMemo(() => {
    return categoryProductsAll.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        const matchDesc = (p.short_description || p.description || '').toLowerCase().includes(q);
        const matchVars = Array.isArray(p.variations) && p.variations.some(v => 
          (v.name || '').toLowerCase().includes(q) || (v.sku || '').toLowerCase().includes(q)
        );
        if (!matchTitle && !matchBrand && !matchSku && !matchVars && !matchDesc) return false;
      }

      // Price filter
      if (isPriceFilterActive) {
        const price = p.sale_price || p.regular_price || 0;
        if (price > sliderPrice) return false;
      }

      return true;
    });
  }, [categoryProductsAll, searchQuery, isPriceFilterActive, sliderPrice]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
      return (b.id || 0) - (a.id || 0);
    });
  }, [filteredProducts, sortBy]);

  // Pagination (9 items per page matching user request)
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Smart pagination items with ellipsis (...) matching user's Screenshot 2:
  // e.g. [1] 2 3 4 ... 19 20 21 NEXT
  const paginationItems = useMemo(() => {
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 2, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1, totalPages];
  }, [totalPages, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat, sub = null) => {
    setActiveParentCat(cat.name);
    setActiveSubCat(sub ? sub.name : null);
    setSearchQuery('');
    setCartSearchQuery('');
    setCurrentPage(1);
    setIsMobileFilterOpen(false);

    // Expand parent in tree
    setExpandedCategories(prev => ({ ...prev, [cat.name]: true }));

    // Push URL
    const url = (cat.slug === 'shop' || cat.name === 'All Products' || !cat.slug)
      ? '/shop/'
      : sub 
        ? `/product-category/${cat.slug}/${sub.slug}/` 
        : `/product-category/${cat.slug}/`;
    
    if (onNavigate) {
      onNavigate(url, cat.name, sub ? sub.name : null);
    } else {
      window.history.pushState({}, '', url);
    }
  };

  const toggleExpand = (catName, e) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  const startIdx = sortedProducts.length === 0 ? 0 : (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * PRODUCTS_PER_PAGE, sortedProducts.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 w-full">
      
      {/* Breadcrumb matching corporatetechbd.com */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
        <button 
          onClick={() => onNavigate ? onNavigate('/', null) : (window.location.href = '/')}
          className="hover:text-[#c92127] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <span>/</span>
        <button 
          onClick={() => onNavigate ? onNavigate('/shop/', null) : (window.location.href = '/shop/')}
          className="hover:text-[#c92127] cursor-pointer transition-colors"
        >
          Shop
        </button>
        <span>/</span>
        <button
          onClick={() => handleSelectCategory(CATEGORIES_TREE.find(c => c.name === activeParentCat) || { name: activeParentCat, slug: '' })}
          className={`cursor-pointer transition-colors ${!activeSubCat ? 'text-slate-900 font-bold' : 'hover:text-[#c92127]'}`}
        >
          {activeParentCat}
        </button>
        {activeSubCat && (
          <>
            <span>/</span>
            <span className="text-slate-900 font-bold">{activeSubCat}</span>
          </>
        )}
      </nav>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-xs mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#c92127]" />
          <span>ক্যাটাগরি ও ফিল্টার অপশন ({activeParentCat})</span>
        </button>
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="text-xs text-[#c92127] font-bold cursor-pointer hover:underline"
        >
          {isMobileFilterOpen ? 'সংক্ষেপ করুন ▲' : 'ফিল্টার খুলুন ▼'}
        </button>
      </div>

      {/* Main 2-Column Layout matching corporatetechbd.com Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR matching Screenshot 3 */}
        <aside className={`lg:col-span-3 space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          
          {/* Search Input Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 pl-4 pr-10 py-2.5 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 border border-transparent focus:border-slate-300 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full hover:bg-slate-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}
          </div>

          {/* Filter By Price matching Screenshots */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Filter By
              </h3>
              {isPriceFilterActive && (
                <button
                  onClick={() => {
                    setIsPriceFilterActive(false);
                    setSliderPrice(maxPriceFound);
                  }}
                  className="text-[11px] text-[#c92127] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Slider bar with red dots matching screenshot */}
            <div className="relative py-2">
              <div className="h-1 bg-slate-200 rounded-full relative">
                {/* Active red track */}
                <div 
                  className="h-1 bg-[#c92127] rounded-full absolute left-0"
                  style={{ width: `${Math.max(0, Math.min(100, ((sliderPrice - minPriceFound) / (maxPriceFound - minPriceFound || 1)) * 100))}%` }}
                ></div>
                {/* Left fixed dot */}
                <div className="w-2.5 h-2.5 bg-[#c92127] rounded-full absolute -top-0.75 left-0"></div>
                {/* Right movable thumb */}
                <div 
                  className="w-3 h-3 bg-[#c92127] rounded-full absolute -top-1 shadow-xs transform -translate-x-1/2"
                  style={{ left: `${Math.max(0, Math.min(100, ((sliderPrice - minPriceFound) / (maxPriceFound - minPriceFound || 1)) * 100))}%` }}
                ></div>
              </div>
              <input
                type="range"
                min={minPriceFound}
                max={maxPriceFound}
                step={maxPriceFound - minPriceFound > 10000 ? 1000 : 100}
                value={sliderPrice}
                onChange={(e) => setSliderPrice(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => { setIsPriceFilterActive(true); setCurrentPage(1); }}
                className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-semibold px-6 py-2 rounded-full transition-colors shadow-sm cursor-pointer inline-block"
              >
                Filter
              </button>

              <div className="text-xs text-slate-600 font-normal">
                Price: {minPriceFound.toLocaleString()}৳ — {sliderPrice.toLocaleString()}৳
              </div>
            </div>
          </div>

          {/* Categories Tree List matching Screenshot 3 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Categories
              </h3>
              <button 
                onClick={() => onNavigate ? onNavigate('/shop/', null) : (window.location.href = '/shop/')}
                className="text-[11px] text-slate-400 hover:text-[#c92127] hover:underline font-semibold"
              >
                All
              </button>
            </div>

            <ul className="space-y-2 text-xs sm:text-[13px]">
              {CATEGORIES_TREE.map((cat) => {
                const isParentActive = activeParentCat.toLowerCase() === cat.name.toLowerCase() && !activeSubCat;
                const hasActiveChild = activeParentCat.toLowerCase() === cat.name.toLowerCase() && !!activeSubCat;
                const isExpanded = expandedCategories[cat.name] || isParentActive || hasActiveChild;
                const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

                return (
                  <li key={cat.slug} className="space-y-1">
                    <div className="flex items-center justify-between group">
                      <button
                        onClick={() => handleSelectCategory(cat, null)}
                        className={`flex-1 flex items-center justify-between py-1 transition-colors cursor-pointer text-left ${
                          isParentActive 
                            ? 'text-[#c92127] font-bold' 
                            : hasActiveChild
                              ? 'text-slate-900 font-semibold'
                              : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.name}</span>
                      </button>

                      {/* Expand Toggle Arrow */}
                      {hasSubcategories && (
                        <button
                          onClick={(e) => toggleExpand(cat.name, e)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          aria-label="Toggle subcategories"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-600' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasSubcategories && isExpanded && (
                      <ul className="pl-4 space-y-1.5 border-l border-slate-200/80 my-1 py-1 animate-fadeIn">
                        {cat.subcategories.map((sub) => {
                          const isSubActive = activeParentCat.toLowerCase() === cat.name.toLowerCase() && 
                                             activeSubCat?.toLowerCase() === sub.name.toLowerCase();

                          return (
                            <li key={sub.slug}>
                              <button
                                onClick={() => handleSelectCategory(cat, sub)}
                                className={`w-full flex items-center justify-between text-xs py-0.5 transition-colors cursor-pointer text-left ${
                                  isSubActive
                                    ? 'text-[#c92127] font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className="text-slate-300 font-normal">›</span>
                                  <span>{sub.name}</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

        </aside>

        {/* RIGHT MAIN PRODUCTS CONTENT */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Top Filter & Result Counter Bar matching Screenshot 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="text-xs sm:text-sm text-slate-600 font-medium">
              <span>Showing {startIdx}–{endIdx}</span>
            </div>

            {/* Dropdowns Container: Category Filter & Sort Dropdown ALWAYS SIDE-BY-SIDE (flex-row) */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Category Dropdown (8 Main Parent Categories) */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={isShopPage || activeParentCat === 'All Products' ? 'all' : activeParentCat}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'all') {
                      handleSelectCategory({ name: 'All Products', slug: 'shop' }, null);
                    } else {
                      const pCat = CATEGORIES_TREE.find(c => c.name.toLowerCase() === val.toLowerCase()) || { name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
                      handleSelectCategory(pCat, null);
                    }
                  }}
                  className="w-full sm:w-auto bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-lg pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] cursor-pointer appearance-none shadow-xs font-semibold truncate"
                  aria-label="Filter by Category"
                >
                  <option value="all">সকল প্রোডাক্ট</option>
                  {mainParentCategories.map(cat => (
                    <option key={cat.slug || cat.name} value={cat.name}>
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
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
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

          {/* Active Search Banner */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-slate-700">
              <span>সার্চ: <strong>"{searchQuery}"</strong></span>
              <button 
                onClick={() => setSearchQuery('')}
                className="bg-white text-[#c92127] border border-red-200 px-3 py-1 rounded-full font-bold hover:bg-red-50 transition-colors cursor-pointer"
              >
                রিসেট ✕
              </button>
            </div>
          )}

          {/* Empty State */}
          {sortedProducts.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200 space-y-3">
              <h3 className="text-base font-bold text-slate-800">
                এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি!
              </h3>
              <p className="text-xs text-slate-500">
                অন্য কোনো ক্যাটাগরি বেছে নিন অথবা সার্চ ফিল্টার রিসেট করুন।
              </p>
              <button
                onClick={() => { setSearchQuery(''); setIsPriceFilterActive(false); }}
                className="bg-[#c92127] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm hover:bg-[#b91c1c] transition-colors cursor-pointer"
              >
                সব প্রোডাক্ট দেখুন
              </button>
            </div>
          ) : (
            /* Product Cards Grid: 2 cols on mobile, 3 cols on desktop */
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Pagination matching user Screenshots 1 & 2 */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-8 border-t border-slate-100">
                  {/* Previous page button */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#c92127] rounded-full border border-slate-200 hover:border-[#c92127] transition-all cursor-pointer flex items-center gap-1 mr-2"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>
                  )}

                  {/* Numbered Page Buttons & Ellipsis (...) matching Screenshot 2 */}
                  {paginationItems.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span 
                          key={`dots-${idx}`} 
                          className="px-2.5 py-1 text-xs font-bold text-slate-400 select-none"
                        >
                          ...
                        </span>
                      );
                    }

                    const pageNum = Number(item);
                    const isActive = pageNum === currentPage;

                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-[#c92127] text-white shadow-sm'
                            : 'text-slate-700 hover:text-[#c92127] hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next page button matching Screenshot 1 & 2: NEXT > */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-[#c92127] rounded-full border border-slate-200 hover:border-[#c92127] transition-all cursor-pointer flex items-center gap-1 ml-2"
                      aria-label="Next Page"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
