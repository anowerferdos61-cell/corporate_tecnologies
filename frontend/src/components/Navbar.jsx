import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  SlidersHorizontal,
  Menu, 
  X, 
  Phone,
  Flame,
  Layers,
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CorporateLogo from './CorporateLogo';

export default function Navbar({ 
  allProducts = [], 
  onNavigate, 
  currentRoute, 
  onSelectCategory, 
  onOpenInkFinder, 
  onOpenAdmin 
}) {
  const {
    cartCount,
    subtotal,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setSelectedProductForModal
  } = useCart();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);

  // Live filtered search suggestions matching Title, Brand, Category, SKU, and Variations
  const searchSuggestions = searchQuery.trim() === '' 
    ? [] 
    : allProducts
        .filter(p => {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchCat = (p.category || '').toLowerCase().includes(q);
          const matchSub = (p.sub_category || '').toLowerCase().includes(q);
          const matchSku = (p.sku || '').toLowerCase().includes(q);
          const matchVars = Array.isArray(p.variations) && p.variations.some(v => 
            (v.name || '').toLowerCase().includes(q) || 
            (v.sku || '').toLowerCase().includes(q) ||
            (v.variant || '').toLowerCase().includes(q)
          );
          return matchTitle || matchBrand || matchCat || matchSub || matchSku || matchVars;
        })
        .slice(0, 8);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setIsSearchModalOpen(false);
    setSelectedCategory('All');
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    { name: 'All', label: 'All Products' },
    { name: 'Printers', label: 'Printers' },
    { name: 'Photocopy Machines', label: 'Photocopy Machines' },
    { name: 'Splashjet Inks', label: 'Splashjet Inks' },
    { name: 'Machinery', label: 'Machinery & DTF' },
    { name: 'POS & Barcode', label: 'POS & Barcode' },
    { name: 'Toner & Inks', label: 'Toner & Inks' },
    { name: 'Accessories & Parts', label: 'Accessories & Parts' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* 1. TOP RED ANNOUNCEMENT BAR (Exact match to corporatetechbd.com) */}
      <div className="bg-[#c92127] text-white py-1.5 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 text-xs text-red-100">
            <span>অফিসিয়াল ডিস্ট্রিবিউটর: Splashjet Digital Inks</span>
            <span>|</span>
            <span>সারাদেশে দ্রুততম হোম ডেলিভারি</span>
          </div>

          <div className="flex-1 text-center font-medium tracking-wider text-xs sm:text-sm">
            Quality Products at Better Price
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-red-100">
            <a href="tel:+8801777277740" className="hover:underline flex items-center gap-1">
              <span>হটলাইন: 01777-277740</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Clean White Background matching corporatetechbd.com) */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/', 'Home');
                else {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center group cursor-pointer"
            >
              <CorporateLogo />
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/', 'Home');
                else {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`${currentRoute?.type === 'home' ? 'text-[#c92127]' : 'text-slate-700 hover:text-[#c92127]'} transition-colors relative py-1 cursor-pointer`}
            >
              Home
              {currentRoute?.type === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c92127] rounded-full"></span>
              )}
            </a>

            <a
              href="/shop/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/shop/', 'Shop');
              }}
              className={`${currentRoute?.path === '/shop' || (currentRoute?.type === 'category' && currentRoute?.categorySlug === 'shop') ? 'text-[#c92127]' : 'text-slate-700 hover:text-[#c92127]'} transition-colors py-1 cursor-pointer`}
            >
              Shop
            </a>

            <a
              href="/product-category/splashjet-ink/"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('/product-category/splashjet-ink/', 'Splashjet Ink');
              }}
              className={`${currentRoute?.categorySlug === 'splashjet-ink' ? 'text-[#c92127]' : 'text-slate-700 hover:text-[#c92127]'} transition-colors py-1 cursor-pointer`}
            >
              Splashjet Ink
            </a>

            <button
              onClick={onOpenInkFinder}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#c92127] transition-colors py-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ইঙ্ক ফাইন্ডার</span>
            </button>
          </nav>

          {/* Search Bar with Live Instant Suggestions */}
          <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="প্রোডাক্ট বা ইঙ্ক কোড লিখে সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-4 pr-16 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] text-xs sm:text-sm transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button 
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#c92127] hover:bg-[#b91c1c] text-white p-1.5 rounded-full transition-all shadow-sm cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Live Search Suggestion Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                  <span>প্রোডাক্ট সাজেশন</span>
                  <span className="text-[#c92127] cursor-pointer text-xs font-semibold" onClick={() => setIsSearchFocused(false)}>বন্ধ করুন</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchFocused(false);
                        const targetUrl = `/product/${product.slug || product.id}/`;
                        if (onNavigate) {
                          onNavigate(targetUrl, product);
                        } else {
                          window.history.pushState({}, '', targetUrl);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }}
                      className="p-3 hover:bg-red-50/60 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-11 h-11 object-contain rounded-lg bg-white p-1 border border-slate-200"
                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {product.category}
                          </span>
                          <span className="text-xs font-extrabold text-[#c92127]">
                            ৳{product.sale_price || product.regular_price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer"
                  >
                    সকল সার্চ ফলাফল দেখুন ({allProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length}) →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Icons (Search, User, Cart with Red Badge 0) */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-slate-700">
            {/* Search Icon Trigger for Mobile */}
            <button
              onClick={() => setIsSearchModalOpen(!isSearchModalOpen)}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Drawer Trigger (Cart Icon with circular red badge matching Screenshot 3) */}
            <button
              id="navbar-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-2 group cursor-pointer"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-slate-800 group-hover:text-[#c92127] transition-colors" />
                <span 
                  id="navbar-cart-badge"
                  className="absolute -top-1.5 -right-2 bg-[#c92127] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200"
                >
                  {cartCount}
                </span>
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-800">
                ৳{subtotal.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expandable */}
        {isSearchModalOpen && (
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="প্রোডাক্ট বা কালি সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 pl-4 pr-16 py-2 rounded-full border border-slate-300 text-xs focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#c92127] text-white p-1.5 rounded-full hover:bg-[#b91c1c] transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white text-slate-800 border-b border-slate-200 p-4 space-y-2 animate-fadeIn shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            ন্যাভিগেশন মেনু
          </div>
          
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onNavigate) onNavigate('/', 'Home');
              else {
                setSelectedCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#c92127] hover:bg-red-50"
          >
            Home
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onNavigate) onNavigate('/shop/', 'Shop');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Shop (সকল প্রোডাক্ট)
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onNavigate) onNavigate('/product-category/splashjet-ink/', 'Splashjet Ink');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Splashjet Inks
          </button>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenInkFinder();
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-[#c92127] text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              প্রিন্টার অনুযায়ী ইঙ্ক ফাইন্ডার
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
