import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroBanner from '../components/HeroBanner';
import ShopByCategories from '../components/ShopByCategories';
import ProductGrid from '../components/ProductGrid';
import SplashjetPromoBanner from '../components/SplashjetPromoBanner';
import SplashjetStickyShowcase from '../components/SplashjetStickyShowcase';
import InkScrollSection from '../components/InkScrollSection';
import TrustAndBrandsSection from '../components/TrustAndBrandsSection';
import SeoAuthoritySection from '../components/SeoAuthoritySection';
import HomeInfoSections from '../components/HomeInfoSections';
import FlashSaleSection from '../components/FlashSaleSection';
import {
  fetchPopularCategoriesSettings,
  DEFAULT_POPULAR_CATEGORIES_SETTINGS
} from '../lib/popularCategoriesService';

export default function HomePage({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { setSelectedCategory, setSearchQuery } = useCart();
  const productsSectionRef = useRef(null);

  const [popularSettings, setPopularSettings] = useState(DEFAULT_POPULAR_CATEGORIES_SETTINGS);

  useEffect(() => {
    async function loadPopSettings() {
      const config = await fetchPopularCategoriesSettings();
      setPopularSettings(config);
    }
    loadPopSettings();

    const handleUpdate = (e) => {
      if (e?.detail) setPopularSettings(e.detail);
    };
    window.addEventListener('ct_popular_categories_updated', handleUpdate);
    return () => window.removeEventListener('ct_popular_categories_updated', handleUpdate);
  }, []);

  const navigateTo = (url, categoryName = null) => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    }
    navigate(url);
  };

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Hero Banner Showcase */}
      <HeroBanner 
        onExploreClick={() => navigateTo('/shop')} 
        onNavigate={navigateTo} 
      />

      {/* 2. Shop By Categories */}
      <ShopByCategories 
        onCategorySelect={scrollToProducts}
        onNavigate={navigateTo} 
      />

      {/* 2.5 Live Flash Sale & Ticking Countdown Section */}
      <FlashSaleSection 
        allProducts={products}
        onNavigate={navigateTo}
      />

      {/* 3. Main Product Catalog Section ("Popular This Week") */}
      {popularSettings?.is_active !== false && (
        <div 
          id="products-section" 
          ref={productsSectionRef} 
          className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full border-t border-slate-100"
        >
          {/* Section Heading */}
          <div className="flex items-end justify-between mb-6 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {popularSettings?.section_title || 'Popular This Week'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {popularSettings?.section_subtitle || 'Explore our best-selling Inks, Photocopiers and Printers'}
              </p>
            </div>

            <button
              onClick={() => navigateTo(popularSettings?.explore_button_link || '/shop', 'All')}
              className="text-xs sm:text-sm font-extrabold text-[#c92127] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{popularSettings?.explore_button_text || 'Explore All Products →'}</span>
            </button>
          </div>

          {/* Direct Product Grid */}
          <ProductGrid 
            products={products} 
            loading={loading}
            onNavigate={navigateTo}
          />
        </div>
      )}

      {/* 4. Official Splashjet 70% Savings Banner */}
      <SplashjetPromoBanner 
        onExploreInks={() => navigateTo('/product-category/splashjet-ink', 'Splashjet Ink')}
      />

      {/* 5. Dedicated 1-Row Infinite Continuous Scrolling Ink Showcase */}
      <InkScrollSection 
        allProducts={products}
        onNavigate={navigateTo}
      />

      {/* 5.5 Laptop/Desktop Full Card Sticky Scroll Animation Showcase (Hidden on Mobile) */}
      <SplashjetStickyShowcase 
        onNavigate={navigateTo}
      />

      {/* 6. Trust Features & Shop by Brands Section */}
      <TrustAndBrandsSection 
        onBrandClick={(brand) => {
          setSearchQuery(brand);
          navigate('/shop');
        }}
      />

      {/* 7. Comprehensive SEO & Authority Pillars Section */}
      <SeoAuthoritySection 
        onKeywordClick={(kw) => {
          setSearchQuery(kw);
          navigate('/shop');
        }}
      />

      {/* 8. Embedded Home Information: About Us, FAQ, Branches & Contacts */}
      <HomeInfoSections />
    </>
  );
}
