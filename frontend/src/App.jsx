import React, { useState, useEffect, useRef } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ShopByCategories from './components/ShopByCategories';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import InkFinder from './components/InkFinder';
import AdminDashboard from './components/AdminDashboard';
import SplashjetPromoBanner from './components/SplashjetPromoBanner';
import TrustAndBrandsSection from './components/TrustAndBrandsSection';
import SeoAuthoritySection from './components/SeoAuthoritySection';
import HomeInfoSections from './components/HomeInfoSections';
import ContactWidget from './components/ContactWidget';
import Footer from './components/Footer';
import CategoryPage from './components/CategoryPage';
import ProductDetailPage from './components/ProductDetailPage';
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
  const { toastMessage, setSelectedCategory, setSearchQuery } = useCart();

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
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
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
            
            {/* Section Heading matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Popular This Week
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Splashjet প্রিমিয়াম ডিজিটাল ইঙ্ক ও অফিসিয়াল প্রিন্টিং সল্যুশন
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="text-xs font-bold text-slate-700 hover:text-[#c92127] flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  title="Open Admin Dashboard"
                >
                  <Settings className="w-3.5 h-3.5 text-[#c92127]" />
                  <span>অ্যাডমিন ড্যাশবোর্ড (প্রোডাক্ট এডিট)</span>
                </button>

                <button
                  onClick={() => setIsInkFinderOpen(true)}
                  className="text-xs font-bold text-[#c92127] hover:underline flex items-center gap-1 cursor-pointer hidden md:flex"
                >
                  ইঙ্ক ফাইন্ডার সাহায্য দরকার?
                </button>
              </div>
            </div>

            {/* Category Pills & Sorting Bar */}
            <CategoryFilter 
              categories={categoriesList} 
              productCounts={productCounts} 
            />

            {/* Product Grid & Filters Sidebar with full page navigation */}
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
      <ProductModal />
      <CartDrawer onNavigate={navigateTo} />
      <CheckoutModal />
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

      {/* Red Square Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to Top"
          className="fixed bottom-24 right-7 z-40 w-10 h-10 bg-[#c92127] hover:bg-[#b91c1c] text-white rounded-lg flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer animate-fadeIn"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
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
