import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import AccountModal from '../components/AccountModal';
import InkFinder from '../components/InkFinder';
import ContactWidget from '../components/ContactWidget';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';
import { ChevronUp, CheckCircle2, Info } from 'lucide-react';

export default function Root({ products = [], setProducts = () => {}, loading = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInkFinderOpen, setIsInkFinderOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { 
    toastMessage, 
    setSelectedCategory, 
    isAccountOpen,
    setIsAccountOpen,
    accountActiveTab
  } = useCart();

  // Programmatic URL and route updater (preserving backward compatibility for components)
  const navigateTo = (url, categoryName = null) => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    }
    navigate(url);
  };

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 pb-16 md:pb-0">
      {/* 1. Global Persistent Navigation Bar */}
      <Navbar 
        allProducts={products}
        onNavigate={navigateTo}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (location.pathname !== '/') {
            navigate('/');
          } else {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenInkFinder={() => setIsInkFinderOpen(true)}
      />

      {/* 2. DYNAMIC OUTLET: Active page renders here */}
      <main className="flex-1">
        <Outlet context={{ products, loading, navigateTo }} />
      </main>

      {/* 3. Global Interactive Modals & Drawers */}
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

      {/* 5. Floating Contact Widget */}
      <ContactWidget />

      {/* 6. Mobile Bottom Quick Bar */}
      <MobileBottomNav 
        onNavigate={navigateTo}
        allProducts={products}
      />

      {/* 7. Global Persistent Footer */}
      <Footer onNavigate={navigateTo} />

      {/* 8. Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-[#c92127] text-white p-3 rounded-full shadow-lg hover:bg-[#b91c1c] active:scale-95 transition-all cursor-pointer flex items-center justify-center border-2 border-white/20"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* 9. Global Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold animate-bounce border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
