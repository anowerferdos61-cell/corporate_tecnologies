import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Menu,
  X,
  Phone,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Printer,
  Layers,
  Award,
  Zap,
  Flame,
  FileText,
  PhoneCall,
  MessageCircle,
  User,
  Home,
  Truck,
  BookOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import CorporateLogo from './CorporateLogo';
import PromoAnnouncementBar from './PromoAnnouncementBar';
import { getAvailableCategories, getCachedCategoriesTree } from '../lib/categoryService';

const PRODUCT_CATEGORIES = [
  {
    id: 'photocopier',
    name: 'Photocopiers',
    slug: 'photocopy-machine',
    icon: Layers,
    subcategories: [
      { name: 'Color Series Photocopiers', slug: 'photocopy-machine/color-series' },
      { name: 'Heavy Duty Photocopiers', slug: 'photocopy-machine/heavy-duty-machine' },
      { name: 'Light Duty Photocopiers', slug: 'photocopy-machine/light-duty-machine' },
      { name: 'RADF Automatic Document Feeders', slug: 'photocopy-machine/copier-feeders' },
      { name: 'Photocopier Toner & Spares', slug: 'photocopy-machine/photocopier-toner' }
    ]
  },
  {
    id: 'printers',
    name: 'Printers',
    slug: 'printers',
    icon: Printer,
    subcategories: [
      { name: 'Epson EcoTank Ink Tank Printers', slug: 'printers/epson-printers' },
      { name: 'Canon MegaTank & LFP Plotters', slug: 'printers/canon-printers' },
      { name: 'HP LaserJet & All-in-One Printers', slug: 'printers/hp-printers' },
      { name: 'Brother Office Printers', slug: 'printers/brother-printers' }
    ]
  },
  {
    id: 'splashjet-ink',
    name: 'Splashjet Inks',
    slug: 'splashjet-ink',
    icon: Sparkles,
    subcategories: [
      { name: 'Large Format Printer Ink', slug: 'splashjet-ink/large-format-printer-ink' },
      { name: 'Desktop Printer Ink', slug: 'splashjet-ink/desktop-printer-ink' },
      { name: 'Digital Textile Printing Ink', slug: 'splashjet-ink/digital-textile-printing-ink' },
      { name: 'Industrial Inkjet Ink', slug: 'splashjet-ink/industrial-inkjet-ink' },
      { name: 'Splashjet For Epson Printers', slug: 'splashjet-ink/splashjet-for-epson' },
      { name: 'Splashjet For Canon Printers', slug: 'splashjet-ink/splashjet-for-canon' },
      { name: 'Splashjet For HP Printers', slug: 'splashjet-ink/splashjet-for-hp' },
      { name: 'Splashjet For Brother Printers', slug: 'splashjet-ink/splashjet-for-brother' }
    ]
  },
  {
    id: 'toner-inks',
    name: 'Toner & Inks',
    slug: 'toner-inks',
    icon: Zap,
    subcategories: [
      { name: 'Original Inkjet Bottle Inks', slug: 'toner-inks/original-inkjets-inks' },
      { name: 'Laser Toner Cartridges', slug: 'toner-inks' },
      { name: 'Photocopier Bulk Toners', slug: 'toner-inks' }
    ]
  },
  {
    id: 'machinery',
    name: 'Heat Press & Machinery',
    slug: 'heat-press-machine',
    icon: Flame,
    subcategories: [
      { name: 'T-Shirt Heat Press Machines (15x15 / 16x24)', slug: 'heat-press-machine' },
      { name: '5-in-1 Combo Heat Press', slug: 'heat-press-machine/combo-package' },
      { name: 'DTF Printing Packages & Setups', slug: 'heat-press-machine/dtf-combo' },
      { name: 'Sublimation Accessories & Papers', slug: 'heat-press-machine' }
    ]
  },
  {
    id: 'pos-barcode',
    name: 'POS & Barcode',
    slug: 'office-equipment',
    icon: FileText,
    subcategories: [
      { name: 'POS & Thermal Receipt Printers', slug: 'office-equipment/pos-receipt-printer' },
      { name: 'Handheld Barcode Scanners', slug: 'office-equipment/barcode-scanner' },
      { name: 'Label & Sticker Barcode Printers', slug: 'office-equipment/barcode-level-printer' },
      { name: 'Electronic Cash Drawers', slug: 'office-equipment/cash-drawer' }
    ]
  },
  {
    id: 'accessories',
    name: 'Parts & Accessories',
    slug: 'accessories-parts',
    icon: Award,
    subcategories: [
      { name: 'Original Print Heads', slug: 'accessories-parts/printer-parts' },
      { name: 'Maintenance Boxes & Waste Ink Pads', slug: 'accessories-parts/printer-accessories' },
      { name: 'Printer Connecting Cables & Power Adapters', slug: 'accessories-parts' }
    ]
  }
];

export default function Navbar({
  allProducts = [],
  onNavigate,
  currentRoute,
  onSelectCategory,
  onOpenInkFinder
}) {
  const {
    cartCount,
    subtotal,
    setIsCartOpen,
    setIsAccountOpen,
    setAccountActiveTab,
    searchQuery,
    setSearchQuery,
    setSelectedCategory
  } = useCart();

  const { branding, headerSettings } = useSettings();

  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCats, setExpandedMobileCats] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Auto-focus mobile search input when mobile search bar is opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setIsMobileSearchFocused(true);
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    } else {
      setIsMobileSearchFocused(false);
    }
  }, [isSearchModalOpen]);

  // Auto-close mobile search on scroll so it returns to the header button, and clear search input
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 20) {
        if (isSearchModalOpen) {
          setIsSearchModalOpen(false);
          setIsMobileSearchFocused(false);
          setSearchQuery('');
        }
        if (isSearchFocused) {
          setIsSearchFocused(false);
        }
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [isSearchModalOpen, isSearchFocused, setSearchQuery]);

  // Dynamic Category & Header Settings Live Revision Listener
  const [categoryRevision, setCategoryRevision] = useState(0);
  useEffect(() => {
    const handleCategoryUpdate = () => {
      setCategoryRevision(prev => prev + 1);
    };
    window.addEventListener('ct_categories_updated', handleCategoryUpdate);
    window.addEventListener('ct_header_settings_updated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);
    return () => {
      window.removeEventListener('ct_categories_updated', handleCategoryUpdate);
      window.removeEventListener('ct_header_settings_updated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, []);

  // Hidden categories excluded by admin ("বাদ দেওয়া")
  const hiddenCategories = useMemo(() => {
    return new Set(
      (headerSettings?.navigation?.hidden_categories || []).map(c => c.toLowerCase().trim())
    );
  }, [headerSettings?.navigation?.hidden_categories]);

  // Combine default categories with custom categories from admin / products, then filter out hidden ones
  const allNavCategories = useMemo(() => {
    const treeCats = getCachedCategoriesTree() || [];
    const savedNavItems = (headerSettings?.navigation?.nav_items && Array.isArray(headerSettings.navigation.nav_items))
      ? headerSettings.navigation.nav_items
      : [];

    const existingKeys = new Set(savedNavItems.map(i => (i.id || i.slug || i.name || '').toLowerCase().trim()));
    const merged = savedNavItems.map(item => {
      const itemKey = (item.id || item.slug || item.name || '').toLowerCase().trim();
      const matchingTreeCat = treeCats.find(c => (c.id || c.slug || c.name || '').toLowerCase().trim() === itemKey);
      if (matchingTreeCat && Array.isArray(matchingTreeCat.subcategories)) {
        const existingSubKeys = new Set((item.subcategories || []).map(s => (s.id || s.slug || s.name || '').toLowerCase().trim()));
        const extraSubs = matchingTreeCat.subcategories
          .filter(s => !existingSubKeys.has((s.id || s.slug || s.name || '').toLowerCase().trim()))
          .map(sub => ({
            id: sub.id || sub.slug,
            name: sub.name,
            slug: sub.slug || `${item.slug}/${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            badge: '',
            hidden: Boolean(sub.hidden)
          }));
        return {
          ...item,
          hidden: matchingTreeCat.hidden !== undefined ? matchingTreeCat.hidden : item.hidden,
          subcategories: [...(item.subcategories || []), ...extraSubs]
        };
      }
      return item;
    });

    // Add any category from treeCats that isn't in savedNavItems
    treeCats.forEach(cat => {
      const key = (cat.id || cat.slug || cat.name || '').toLowerCase().trim();
      if (key && !existingKeys.has(key) && key !== 'human') {
        merged.push({
          id: cat.id || cat.slug,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          badge: '',
          hidden: Boolean(cat.hidden),
          icon: Layers,
          subcategories: (cat.subcategories || []).map(sub => ({
            id: sub.id || sub.slug,
            name: sub.name,
            slug: sub.slug || `${cat.slug}/${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            badge: '',
            hidden: Boolean(sub.hidden)
          }))
        });
        existingKeys.add(key);
      }
    });

    // If still empty, fallback to PRODUCT_CATEGORIES
    if (merged.length === 0) {
      PRODUCT_CATEGORIES.forEach(pc => merged.push(pc));
    }

    // Filter non-hidden and format for Navbar
    return merged
      .filter(item => {
        if (item.hidden) return false;
        const lowerName = (item.name || '').toLowerCase().trim();
        const lowerId = (item.id || '').toLowerCase().trim();
        if (lowerName === 'human' || lowerId === 'human') return false;
        return !hiddenCategories.has(lowerName) && !hiddenCategories.has(lowerId);
      })
      .map(item => ({
        id: item.id || item.slug,
        name: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        badge: item.badge || '',
        icon: Layers,
        subcategories: (item.subcategories || [])
          .filter(sub => !sub.hidden)
          .map(sub => ({
            id: sub.id || sub.slug,
            name: sub.name,
            slug: sub.slug || `${item.slug}/${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            badge: sub.badge || ''
          }))
      }));
  }, [allProducts, categoryRevision, headerSettings?.navigation?.nav_items, headerSettings?.navigation?.hidden_categories, hiddenCategories]);

  // Specific categories to display directly on Laptop / Desktop Navbar strip (Strictly 14 items, 7+7 per row)
  const desktopNavCategories = useMemo(() => {
    const maxItems = 14;
    const pinned = headerSettings?.navigation?.pinned_navbar_categories;

    // If admin specifically selected/pinned categories to show on navbar
    if (Array.isArray(pinned) && pinned.length > 0) {
      const pinnedSet = new Set(pinned.map(id => String(id).toLowerCase().trim()));
      const selected = allNavCategories.filter(cat =>
        pinnedSet.has(String(cat.id).toLowerCase().trim()) ||
        pinnedSet.has(String(cat.slug).toLowerCase().trim()) ||
        pinnedSet.has(String(cat.name).toLowerCase().trim())
      );
      if (selected.length > 0) {
        return selected.slice(0, maxItems);
      }
    }

    // Default: Top 14 categories (7+7)
    return allNavCategories.slice(0, maxItems);
  }, [allNavCategories, headerSettings?.navigation?.pinned_navbar_categories]);

  // User Profile state for desktop navbar account button
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleProfileSync = () => {
      try {
        const saved = localStorage.getItem('ct_user_profile');
        setUserProfile(saved ? JSON.parse(saved) : null);
      } catch { }
    };
    window.addEventListener('ct_user_updated', handleProfileSync);
    return () => window.removeEventListener('ct_user_updated', handleProfileSync);
  }, []);

  // Compare count state for desktop navbar
  const [compareCount, setCompareCount] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch { }
    return 0;
  });

  useEffect(() => {
    const handleCompareSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCompareCount(e.detail.length);
      }
    };
    window.addEventListener('ct_compare_updated', handleCompareSync);
    return () => window.removeEventListener('ct_compare_updated', handleCompareSync);
  }, []);

  // Live filtered search suggestions
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
        return matchTitle || matchBrand || matchCat || matchSub || matchSku;
      })
      .slice(0, 8);

  // Close search suggestions on click outside (support both desktop mousedown and mobile touchstart)
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setIsMobileSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setIsSearchModalOpen(false);
    setSelectedCategory('All');
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleSuggestionClick = (product) => {
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
    setIsSearchModalOpen(false);
    const targetSlug = product.slug || product.id;
    navigate(`/product/${targetSlug}`);
  };

  const handleCategoryClick = (cat) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (cat.name) {
      setSelectedCategory(cat.name);
    }
    navigate(`/product-category/${cat.slug}`);
  };

  const handleSubCategoryClick = (subSlug, subName) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    if (subName) {
      setSelectedCategory(subName);
    }
    navigate(`/product-category/${subSlug}`);
  };

  const toggleMobileCat = (catId) => {
    setExpandedMobileCats(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  return (
    <>
      {/* 0. Top Promo / Coupon Announcement Bar */}
      <PromoAnnouncementBar />

      {/* MAIN HEADER (Logo, Centered Search, Blog, Cart) */}
      <div
        style={{
          backgroundColor: 'var(--brand-primary, #c92127)',
          borderColor: 'var(--brand-primary-hover, #a8191e)'
        }}
        className="border-b px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-50 lg:relative lg:z-50 transition-colors shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">

          {/* Left: Brand Logo */}
          <div className="flex items-center flex-shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('All');
                setSearchQuery('');
                navigate('/');
              }}
              className="flex items-center group cursor-pointer"
            >
              <CorporateLogo inverted={true} />
            </a>
          </div>

          {/* Center: Desktop Search Bar with Live Suggestions */}
          <div ref={searchRef} className="relative flex-1 min-w-[160px] max-w-lg xl:max-w-xl mx-1 sm:mx-2 lg:mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder={headerSettings?.search?.placeholder || "Search products, models, or ink codes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full bg-white text-slate-900 placeholder-slate-400 pl-4 pr-16 py-2.5 rounded-full border border-red-200/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-xs sm:text-sm transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#c92127] text-white p-2 rounded-full transition-all shadow-xs cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Live Search Suggestion Dropdown */}
            {isSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fadeIn">
                <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c92127]"></span>
                    <span>Product Suggestions ({searchSuggestions.length})</span>
                  </span>
                  <button
                    type="button"
                    className="text-[#c92127] cursor-pointer text-xs font-semibold hover:underline"
                    onClick={() => setIsSearchFocused(false)}
                  >
                    Close
                  </button>
                </div>
                {searchSuggestions.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                      {searchSuggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="p-3 hover:bg-red-50/60 cursor-pointer flex items-center gap-3 transition-colors group"
                        >
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0"
                            onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#c92127] transition-colors">
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
                    <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        <span>View All Results ({searchSuggestions.length}+)</span>
                        <span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center text-slate-500">
                    <p className="text-xs font-bold text-slate-700">কোন প্রোডাক্ট পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-1">"{searchQuery}" এর বদলে অন্য মডেল বা কি-ওয়ার্ড দিয়ে চেষ্টা করুন</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons (Call, WhatsApp, Blog, Cart & Mobile Menu) */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-white flex-shrink-0 whitespace-nowrap">

            {/* Direct Call Button (if enabled by admin) */}
            {headerSettings?.action_buttons?.show_call_btn && (
              <a
                href={`tel:${headerSettings?.action_buttons?.call_phone || '01777277740'}`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] sm:text-xs font-black cursor-pointer border border-white/25 hover:border-white/50 shadow-xs whitespace-nowrap flex-shrink-0"
                title="সরাসরি ফোন কল দিন"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                <span className="hidden xl:inline">{headerSettings?.action_buttons?.call_btn_text || 'Call Now'}</span>
                <span className="xl:hidden">Call</span>
              </a>
            )}

            {/* Direct WhatsApp Chat Button (if enabled by admin) */}
            {headerSettings?.action_buttons?.show_whatsapp_btn && (
              <a
                href={`https://wa.me/${(headerSettings?.action_buttons?.whatsapp_number || '8801777277740').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-white bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 transition-all text-[11px] sm:text-xs font-black cursor-pointer border border-emerald-400/40 shadow-xs whitespace-nowrap flex-shrink-0"
                title="WhatsApp এ সরাসরি কথা বলুন"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="hidden xl:inline">{headerSettings?.action_buttons?.whatsapp_btn_text || 'WhatsApp'}</span>
                <span className="xl:hidden">Chat</span>
              </a>
            )}

            {/* Blog Button (Desktop only; if enabled by admin) */}
            {(headerSettings?.action_buttons?.show_blog_btn ?? true) && (
              <button
                onClick={() => navigate('/blog')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white hover:bg-white/15 active:scale-95 transition-all text-xs font-black cursor-pointer border border-white/20 hover:border-white/40 shadow-xs"
                title="Tech Blog & Guides"
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
                <span>Blog</span>
              </button>
            )}

            {/* Splashjet Inks Direct Route Button */}
            {(headerSettings?.action_buttons?.show_splashjet_btn ?? true) && (
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('/product-category/splashjet-inks/', 'Splashjet Inks');
                  else navigate('/product-category/splashjet-inks');
                  setSelectedCategory('Splashjet Inks');
                }}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-black cursor-pointer border border-white/30 hover:border-white/50 shadow-xs whitespace-nowrap"
                title="Splashjet Inks কালেকশন দেখুন"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Splashjet Ink</span>
              </button>
            )}

            {/* Mobile Search Trigger */}
            <button
              onClick={() => {
                if (isSearchModalOpen) {
                  setIsSearchModalOpen(false);
                  setIsMobileSearchFocused(false);
                  setSearchQuery('');
                } else {
                  setIsSearchModalOpen(true);
                }
              }}
              className="md:hidden p-2 rounded-full text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Drawer Trigger with Badge */}
            <button
              id="navbar-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 rounded-full text-white hover:bg-white/15 transition-all flex items-center gap-2 group cursor-pointer border border-white/20 hover:border-white/40 shadow-xs"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white transition-colors" />
                <span
                  id="navbar-cart-badge"
                  className="absolute -top-1.5 -right-2 bg-white text-[#c92127] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                >
                  {cartCount}
                </span>
              </div>
              {(headerSettings?.action_buttons?.show_cart_subtotal ?? true) && (
                <span className="hidden sm:inline text-xs font-bold text-white">
                  ৳{subtotal.toLocaleString()}
                </span>
              )}
            </button>

            {/* Menu Drawer Button (Mobile/Tablet Only) */}
            <button
              id="navbar-menu-button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full text-white hover:bg-white/15 active:scale-95 transition-all group cursor-pointer border border-white/20 hover:border-white/40 shadow-xs"
              aria-label="Open Menu"
              title="প্রধান মেন্যু ও অপশনসমূহ"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="hidden sm:inline text-xs font-black text-white">Menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input Expandable with Live Suggestions */}
        {isSearchModalOpen && (
          <div ref={mobileSearchRef} className="mt-2.5 md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder={headerSettings?.search?.placeholder || "Search products, models, or ink codes..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsMobileSearchFocused(true)}
                className="w-full bg-white text-slate-900 placeholder-slate-400 pl-4 pr-16 py-2.5 rounded-full border border-red-300 text-xs focus:ring-2 focus:ring-white outline-none shadow-sm font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#c92127] text-white p-2 rounded-full hover:bg-[#b91c1c] transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mobile Live Search Suggestion Dropdown */}
            {isMobileSearchFocused && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[60vh] flex flex-col animate-fadeIn">
                <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c92127]"></span>
                    <span>প্রোডাক্ট সাজেশন ({searchSuggestions.length})</span>
                  </span>
                  <button
                    type="button"
                    className="text-[#c92127] cursor-pointer text-xs font-bold hover:underline px-1 py-0.5"
                    onClick={() => {
                      setIsMobileSearchFocused(false);
                      setIsSearchModalOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    Close
                  </button>
                </div>

                {searchSuggestions.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                      {searchSuggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className="p-3 hover:bg-red-50/60 active:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-11 h-11 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0"
                            onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">
                              {product.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium truncate max-w-[120px]">
                                {product.category}
                              </span>
                              <span className="text-xs font-black text-[#c92127]">
                                ৳{product.sale_price || product.regular_price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        <span>সব রেজাল্ট দেখুন ({searchSuggestions.length}+)</span>
                        <span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-5 text-center text-slate-500">
                    <p className="text-xs font-bold text-slate-700">কোন প্রোডাক্ট পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-1">"{searchQuery}" এর বদলে অন্য মডেল বা কি-ওয়ার্ড দিয়ে খুঁজুন</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. STICKY CATEGORY NAVIGATION BAR (Laptop / Desktop only: Dynamic Header with Products for Eye-catching Scroll) */}
      <nav
        style={{
          backgroundColor: 'var(--brand-primary, #c92127)',
          borderColor: 'var(--brand-primary-hover, #a8191e)'
        }}
        className={`hidden lg:block ${(headerSettings?.navigation?.sticky_nav ?? true) ? 'sticky top-0 z-40' : 'relative z-30'} border-b text-xs font-black shadow-md shadow-black/10 transition-all`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between gap-2 xl:gap-3">
            {/* Left/Center Category Buttons (Strictly 2 lines: Exactly 7 items per line, shifted slightly right) */}
            <div className="flex-1 min-w-0 pl-2 sm:pl-4 xl:pl-6 pr-2 flex flex-col justify-center gap-y-1 py-1">
              {/* Line 1 (Strictly First 7 categories in 1 row) */}
              <div className="grid grid-cols-7 gap-1 xl:gap-1.5 items-center w-full">
                {desktopNavCategories.slice(0, 7).map((cat, index) => {
                  const isLastTwo = index >= 5;
                  return (
                    <div
                      key={cat.id || index}
                      className="relative group"
                      onMouseEnter={() => setActiveDropdown(cat.id)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className={`w-full px-1.5 xl:px-2 py-1 rounded-lg text-white font-extrabold hover:bg-white/15 active:bg-white/20 transition-all cursor-pointer text-[11px] xl:text-[12px] tracking-tight whitespace-nowrap flex items-center justify-center gap-1 ${activeDropdown === cat.id ? 'bg-white/20' : ''
                          }`}
                        title={cat.name}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.badge && (
                          <span className="text-[8.5px] font-black bg-white text-[#c92127] px-1 py-0.2 rounded-full shadow-2xs flex-shrink-0">
                            {cat.badge}
                          </span>
                        )}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <ChevronDown className={`w-3 h-3 text-white/80 flex-shrink-0 transition-transform duration-200 ${activeDropdown === cat.id ? 'rotate-180 text-white' : ''
                            }`} />
                        )}
                      </button>

                      {/* Dropdown Menu for Subcategories */}
                      {activeDropdown === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                        <div className={`absolute top-full ${isLastTwo ? 'right-0' : 'left-0'} mt-0.5 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn whitespace-normal text-left`}>
                          <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c92127]"></span>
                            <span>{cat.name} Collection</span>
                          </div>
                          {cat.subcategories.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSubCategoryClick(sub.slug, sub.name)}
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-[#c92127] transition-colors flex items-center justify-between group/sub cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                <span className="truncate group-hover/sub:text-[#c92127]">{sub.name}</span>
                                {sub.badge && (
                                  <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full flex-shrink-0">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#c92127] group-hover/sub:translate-x-0.5 transition-transform stroke-[2] flex-shrink-0" />
                            </button>
                          ))}
                          <div className="p-2 border-t border-slate-100 bg-slate-50/80 mt-1">
                            <button
                              onClick={() => handleCategoryClick(cat)}
                              className="w-full text-center text-xs font-black text-[#c92127] hover:underline cursor-pointer py-1"
                            >
                              View All {cat.name} →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Line 2 (Strictly Second 7 categories in 1 row) */}
              {desktopNavCategories.length > 7 && (
                <div className="grid grid-cols-7 gap-1 xl:gap-1.5 items-center w-full">
                  {desktopNavCategories.slice(7, 14).map((cat, index) => {
                    const isLastTwo = index >= 5;
                    return (
                      <div
                        key={cat.id || index + 7}
                        className="relative group"
                        onMouseEnter={() => setActiveDropdown(cat.id)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className={`w-full px-1.5 xl:px-2 py-1 rounded-lg text-white font-extrabold hover:bg-white/15 active:bg-white/20 transition-all cursor-pointer text-[11px] xl:text-[12px] tracking-tight whitespace-nowrap flex items-center justify-center gap-1 ${activeDropdown === cat.id ? 'bg-white/20' : ''
                            }`}
                          title={cat.name}
                        >
                          <span className="truncate">{cat.name}</span>
                          {cat.badge && (
                            <span className="text-[8.5px] font-black bg-white text-[#c92127] px-1 py-0.2 rounded-full shadow-2xs flex-shrink-0">
                              {cat.badge}
                            </span>
                          )}
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <ChevronDown className={`w-3 h-3 text-white/80 flex-shrink-0 transition-transform duration-200 ${activeDropdown === cat.id ? 'rotate-180 text-white' : ''
                              }`} />
                          )}
                        </button>

                        {/* Dropdown Menu for Subcategories */}
                        {activeDropdown === cat.id && cat.subcategories && cat.subcategories.length > 0 && (
                          <div className={`absolute top-full ${isLastTwo ? 'right-0' : 'left-0'} mt-0.5 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn whitespace-normal text-left`}>
                            <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c92127]"></span>
                              <span>{cat.name} Collection</span>
                            </div>
                            {cat.subcategories.map((sub, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSubCategoryClick(sub.slug, sub.name)}
                                className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-red-50 hover:text-[#c92127] transition-colors flex items-center justify-between group/sub cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                  <span className="truncate group-hover/sub:text-[#c92127]">{sub.name}</span>
                                  {sub.badge && (
                                    <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full flex-shrink-0">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/sub:text-[#c92127] group-hover/sub:translate-x-0.5 transition-transform stroke-[2] flex-shrink-0" />
                              </button>
                            ))}
                            <div className="p-2 border-t border-slate-100 bg-slate-50/80 mt-1">
                              <button
                                onClick={() => handleCategoryClick(cat)}
                                className="w-full text-center text-xs font-black text-[#c92127] hover:underline cursor-pointer py-1"
                              >
                                View All {cat.name} →
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shop / All Products & Desktop Menu Button */}
            <div className="flex items-center gap-2 xl:gap-2.5 flex-shrink-0 self-center">
              <a
                href="/shop/"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('/shop/', 'Shop');
                  else navigate('/shop');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white text-[#c92127] hover:bg-red-50 hover:shadow-sm font-black flex items-center gap-1 cursor-pointer text-[12px] tracking-wide transition-all shadow-xs"
              >
                <span>All Products</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </a>

              <button
                id="navbar-desktop-menu-button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white font-black flex items-center gap-1.5 cursor-pointer text-[12px] tracking-wide border border-white/30 shadow-xs"
                aria-label="Open Menu"
                title="প্রধান মেন্যু ও অপশনসমূহ"
              >
                <Menu className="w-4 h-4 text-white" />
                <span>Menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. SLIDE-OUT MENU DRAWER (Opens from 3-dash button on the right) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">

          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-[88%] sm:w-[380px] max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col animate-slideLeft overflow-hidden text-slate-800">

            {/* Drawer Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center">
                <CorporateLogo />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Quick Access Header inside 3-dash menu */}
            <div className="p-3.5 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              {userProfile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#c92127] text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                      {userProfile.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{userProfile.name}</h4>
                      <span className="text-[10px] text-emerald-600 font-bold block">● ভেরিফাইড মেম্বার</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/my-account');
                    }}
                    className="text-[11px] font-bold text-[#c92127] bg-white border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    ড্যাশবোর্ড
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/my-account');
                  }}
                  className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white py-2.5 px-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>আমার অ্যাকাউন্ট (Dashboard)</span>
                </button>
              )}
            </div>

            {/* Scrollable Links Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-1">

              {/* Primary Nav Links: Home, Compare, Track Order, Shop */}
              <div className="p-2 space-y-1">
                {/* 1. Home */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/', 'Home');
                    else navigate('/');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-[#c92127]" />
                    <span>হোম পেজ (Home)</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 2. Product Compare */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/compare', 'Product Compare');
                    else navigate('/compare');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#c92127]" />
                    <span>প্রোডাক্ট কম্পেয়ার (Compare)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {compareCount > 0 ? (
                      <span className="bg-[#c92127] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {compareCount}টি পণ্য
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">খালি</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

                {/* 3. Order Tracking */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/my-account?tab=track');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-[#c92127]" />
                    <span>অর্ডার ট্র্যাকিং (Order Track)</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 4. Shop / All Products */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/shop', 'Shop');
                    else navigate('/shop');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#c92127]" />
                    <span>সকল প্রোডাক্ট (Shop)</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 5. Splashjet Inks */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate) onNavigate('/product-category/splashjet-ink', 'Splashjet Ink');
                    else navigate('/product-category/splashjet-ink');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Printer className="w-4 h-4 text-[#c92127]" />
                    <span>Splashjet Digital Inks</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 6. Ink Finder */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onOpenInkFinder) onOpenInkFinder();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#c92127]" />
                    <span>ইঙ্ক ফাইন্ডার (Ink Finder)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-red-100 text-[#c92127] font-black px-2 py-0.5 rounded-full">
                      মডেল খুঁজুন
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>

                {/* 7. Blog */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/blog');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-slate-800 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#c92127]" />
                    <span>Tech Blog & Guides</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>



              {/* Product Categories Accordion */}
              <div className="px-1 py-1">
                <div className="px-3 py-2 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Product Categories
                </div>

                {allNavCategories.map((cat) => {
                  const isExpanded = !!expandedMobileCats[cat.id];
                  const CatIcon = cat.icon || Layers;
                  return (
                    <div key={cat.id} className="border-b border-slate-100 last:border-0">

                      {/* Category Header Row with '+' Button */}
                      <div className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors">
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className="flex-1 text-left flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900 hover:text-[#c92127] truncate pr-2 cursor-pointer"
                        >
                          <CatIcon className="w-4 h-4 text-[#c92127] flex-shrink-0" />
                          <span className="truncate text-slate-900 font-bold">{cat.name}</span>
                          {cat.badge && (
                            <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full flex-shrink-0">
                              {cat.badge}
                            </span>
                          )}
                        </button>

                        {/* '+' / '-' Accordion Toggle Button */}
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleMobileCat(cat.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#c92127] hover:bg-slate-100 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                            aria-label={`Toggle ${cat.name} subcategories`}
                          >
                            {isExpanded ? (
                              <Minus className="w-4 h-4 text-[#c92127] stroke-[3]" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-700 stroke-[3]" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Subcategories Accordion Content */}
                      {isExpanded && cat.subcategories && (
                        <div className="bg-slate-50/90 px-4 py-2 space-y-1.5 border-t border-slate-100 animate-fadeIn">
                          {cat.subcategories.map((sub, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSubCategoryClick(sub.slug, sub.name)}
                              className="w-full text-left py-1.5 px-2 text-xs font-semibold text-slate-700 hover:text-[#c92127] hover:bg-red-50/60 rounded flex items-center justify-between gap-2 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#c92127] flex-shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {sub.badge && (
                                <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full flex-shrink-0">
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          ))}

                          <button
                            onClick={() => handleCategoryClick(cat)}
                            className="w-full text-left pt-1.5 pb-1 px-2 text-xs font-black text-[#c92127] hover:underline cursor-pointer"
                          >
                            View All {cat.name} →
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Drawer Footer: Helpline & Quick Actions */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenInkFinder();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Ink Finder by Printer Model</span>
              </button>

              <a
                href="tel:+8801777277740"
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Hotline: 01777-277740</span>
              </a>
            </div>

          </aside>
        </div>
      )}

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </>
  );
}
