import React, { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ShopByCategories from './components/ShopByCategories';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import InkFinder from './components/InkFinder';
import AdminDashboard from './components/AdminDashboard';
import SplashjetPromoBanner from './components/SplashjetPromoBanner';
import InkScrollSection from './components/InkScrollSection';
import TrustAndBrandsSection from './components/TrustAndBrandsSection';
import SeoAuthoritySection from './components/SeoAuthoritySection';
import HomeInfoSections from './components/HomeInfoSections';
import ContactWidget from './components/ContactWidget';
import Footer from './components/Footer';
import CategoryPage from './components/CategoryPage';
import ProductDetailPage from './components/ProductDetailPage';
import ComparePage from './components/ComparePage';
import AccountModal from './components/AccountModal';
import MobileBottomNav from './components/MobileBottomNav';
import { getProducts } from './lib/supabaseClient';
import { CheckCircle2, Info, ChevronUp, Settings } from 'lucide-react';

/**
 * Parses browser pathname into route state
 * Matches:
 *  - /product/:productSlug/
 *  - /product-category/:categorySlug/
 *  - /product-category/:categorySlug/:subCategorySlug/
 *  - /shop/
 *  - / (Home)
 */
function parseRoute(pathname = (typeof window !== 'undefined' ? window.location.pathname : '/')) {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  // Product detail page regex: /product/:productSlug/
  const prodMatch = cleanPath.match(/^\/product\/([^\/]+)$/);
  if (prodMatch) {
    return {
      type: 'product',
      productSlug: prodMatch[1],
      path: cleanPath
    };
  }

  // Category page regex
  const catMatch = cleanPath.match(/^\/product-category\/([^\/]+)(?:\/([^\/]+))?$/);
  if (catMatch) {
    return {
      type: 'category',
      categorySlug: catMatch[1],
      subCategorySlug: catMatch[2] || null,
      path: cleanPath
    };
  }

  // Shop page
  if (cleanPath === '/shop') {
    return {
      type: 'category',
      categorySlug: 'shop',
      subCategorySlug: null,
      path: '/shop'
    };
  }

  // Compare page
  if (cleanPath === '/compare') {
    return {
      type: 'compare',
      categorySlug: null,
      subCategorySlug: null,
      path: '/compare'
    };
  }

  return {
    type: 'home',
    categorySlug: null,
    subCategorySlug: null,
    path: '/'
  };
}

function MainApp() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInkFinderOpen, setIsInkFinderOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(() => parseRoute());
  
  const productsSectionRef = useRef(null);
  const { 
    toastMessage, 
    setSelectedCategory, 
    setSearchQuery,
    isAccountOpen,
    setIsAccountOpen,
    accountActiveTab
  } = useCart();

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic URL and route updater
  const navigateTo = (url, categoryName = null) => {
    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
    const newRoute = parseRoute(url);
    setCurrentRoute(newRoute);
    if (categoryName) {
      setSelectedCategory(categoryName);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch Products from Supabase (with fallback)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Distinct categories & product counts for Home page
  const categoriesList = ['Printers', 'Photocopy Machines', 'Splashjet Inks', 'Machinery', 'POS & Barcode', 'Toner & Inks', 'Accessories & Parts'];
  const productCounts = {
    'All': products.length,
    'Printers': products.filter(p => (p.category || '').toLowerCase().includes('printer')).length,
    'Photocopy Machines': products.filter(p => (p.category || '').toLowerCase().includes('photocopy')).length,
    'Splashjet Inks': products.filter(p => (p.category || '').toLowerCase().includes('splashjet')).length,
    'Machinery': products.filter(p => (p.category || '').toLowerCase().includes('machinery')).length,
    'POS & Barcode': products.filter(p => (p.category || '').toLowerCase().includes('pos') || (p.category || '').toLowerCase().includes('barcode') || (p.category || '').toLowerCase().includes('scanner')).length,
    'Toner & Inks': products.filter(p => (p.category || '').toLowerCase().includes('toner') || (p.category || '').toLowerCase().includes('original')).length,
    'Accessories & Parts': products.filter(p => (p.category || '').toLowerCase().includes('accessories') || (p.category || '').toLowerCase().includes('parts')).length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 pb-16 md:pb-0">
      {/* 1. Navigation Bar with Red Announcement Bar & Logo */}
      <Navbar 
        allProducts={products}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (currentRoute.type !== 'home') {
            navigateTo('/');
          } else {
            scrollToProducts();
          }
        }}
        onOpenInkFinder={() => setIsInkFinderOpen(true)}
      />

      {/* 2. DYNAMIC ROUTE RENDERING */}
      {currentRoute.type === 'product' ? (
        /* Dedicated Full Product Details Page (No cramped modal on mobile or desktop) */
        <ProductDetailPage 
          productSlug={currentRoute.productSlug}
          allProducts={products}
          onNavigate={navigateTo}
        />
      ) : currentRoute.type === 'category' ? (
        /* Dedicated Category Page matching corporatetechbd.com /product-category/.../ */
        <CategoryPage 
          products={products}
          categorySlug={currentRoute.categorySlug}
          subCategorySlug={currentRoute.subCategorySlug}
          onNavigate={navigateTo}
        />
      ) : currentRoute.type === 'compare' ? (
        /* Dedicated Product Comparison Page (Side-by-side table for up to 3 products) */
        <ComparePage 
          allProducts={products}
          onNavigate={navigateTo}
        />
      ) : (
        /* Home Page Sections */
        <>
          {/* Hero Banner Showcase (Matching corporatetechbd.com) */}
          <HeroBanner 
            onExploreClick={() => navigateTo('/shop/')} 
            onNavigate={navigateTo} 
          />

          {/* Shop By Categories with dedicated URL links */}
          <ShopByCategories 
            onCategorySelect={scrollToProducts}
            onNavigate={navigateTo} 
          />

          {/* Main Product Catalog Section ("Popular This Week") */}
          <div id="products-section" ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full border-t border-slate-100">
            
            {/* Section Heading */}
            <div className="flex items-end justify-between mb-6 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Popular This Week
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ফটোকপিয়ার, প্রিন্টার ও Splashjet আসল ডিজিটাল ইঙ্কের সেরা কালেকশন
                </p>
              </div>

              <a
                href="/shop/"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/shop/', 'Shop');
                }}
                className="text-xs sm:text-sm font-extrabold text-[#c92127] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>সব প্রোডাক্ট দেখুন →</span>
              </a>
            </div>

            {/* Direct Product Grid (Mixture of Inks, Photocopiers, Printers) */}
            <ProductGrid 
              products={products} 
              loading={loading}
              onNavigate={navigateTo}
            />
          </div>

          {/* Official Splashjet 70% Savings & QR Verification Banner */}
          <SplashjetPromoBanner 
            onExploreInks={() => navigateTo('/product-category/splashjet-ink/', 'Splashjet Ink')}
          />

          {/* Dedicated 1-Row Infinite Continuous Scrolling Ink Showcase */}
          <InkScrollSection 
            allProducts={products}
            onNavigate={navigateTo}
          />

          {/* Trust Features & Shop by Brands Section */}
          <TrustAndBrandsSection 
            onBrandClick={(brand) => {
              setSearchQuery(brand);
              scrollToProducts();
            }}
          />

          {/* Comprehensive SEO & Authority Pillars Section */}
          <SeoAuthoritySection 
            onKeywordClick={(kw) => {
              setSearchQuery(kw);
              scrollToProducts();
            }}
          />

          {/* Embedded Home Information: About Us, FAQ, Branches & Contacts (For SEO, No Popups) */}
          <HomeInfoSections />
        </>
      )}

      {/* Interactive Modals & Drawers */}
      <CartDrawer onNavigate={navigateTo} />
      <CheckoutModal />
      <AccountModal 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        onNavigate={navigateTo}
        initialTab={accountActiveTab}
      />
      <InkFinder 
        isOpen={isInkFinderOpen} 
        onClose={() => setIsInkFinderOpen(false)} 
        allProducts={products}
        onNavigate={navigateTo}
      />

      {/* Admin Management Dashboard */}
      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onProductsUpdate={(updatedList) => setProducts(updatedList)}
      />

      {/* Floating Contact Widget */}
      <ContactWidget />

      {/* Star Tech Style Mobile Down Navbar ("অর্ডার ট্র্যাক, কম্পায়ের, অফার/হ্যাপি hour, Splashjet Ink") */}
      <MobileBottomNav 
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        allProducts={products}
      />

      {/* Footer */}
      <Footer onNavigate={navigateTo} onOpenAdmin={() => setIsAdminOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
