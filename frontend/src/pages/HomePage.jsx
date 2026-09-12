import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import HeroBanner from '../components/HeroBanner';
import ShopByCategories from '../components/ShopByCategories';
import ProductGrid from '../components/ProductGrid';
import SplashjetPromoBanner from '../components/SplashjetPromoBanner';
import InkScrollSection from '../components/InkScrollSection';
import TrustAndBrandsSection from '../components/TrustAndBrandsSection';
import SeoAuthoritySection from '../components/SeoAuthoritySection';
import HomeInfoSections from '../components/HomeInfoSections';
import FlashSaleSection from '../components/FlashSaleSection';

export default function HomePage({ products = [], loading = false }) {
  const navigate = useNavigate();
  const { setSelectedCategory, setSearchQuery } = useCart();
  const productsSectionRef = useRef(null);

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
      <div 
        id="products-section" 
        ref={productsSectionRef} 
        className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full border-t border-slate-100"
      >
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

          <button
            onClick={() => navigateTo('/shop', 'All')}
            className="text-xs sm:text-sm font-extrabold text-[#c92127] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>সব প্রোডাক্ট দেখুন →</span>
          </button>
        </div>

        {/* Direct Product Grid */}
        <ProductGrid 
          products={products} 
          loading={loading}
          onNavigate={navigateTo}
        />
      </div>

      {/* 4. Official Splashjet 70% Savings Banner */}
      <SplashjetPromoBanner 
        onExploreInks={() => navigateTo('/product-category/splashjet-ink', 'Splashjet Ink')}
      />

      {/* 5. Dedicated 1-Row Infinite Continuous Scrolling Ink Showcase */}
      <InkScrollSection 
        allProducts={products}
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
