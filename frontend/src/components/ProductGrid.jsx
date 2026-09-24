import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import {
  ArrowRight,
  Droplet,
  Printer,
  Flame,
  Zap,
  Sparkles,
  ShoppingBag,
  Layers,
  Package,
  Award,
  Tag,
  ShieldCheck,
  Box
} from 'lucide-react';
import {
  fetchPopularCategoriesSettings,
  filterProductsForSlot,
  DEFAULT_POPULAR_CATEGORIES_SETTINGS
} from '../lib/popularCategoriesService';

// Icon Map for flexible Admin selection
const ICON_MAP = {
  Droplet,
  Printer,
  Flame,
  Zap,
  Sparkles,
  ShoppingBag,
  Layers,
  Package,
  Award,
  Tag,
  ShieldCheck,
  Box
};

export default function ProductGrid({ products = [], loading = false, onNavigate }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_POPULAR_CATEGORIES_SETTINGS);

  // Load Popular Categories Settings from DB / Local
  useEffect(() => {
    async function loadSettings() {
      const config = await fetchPopularCategoriesSettings();
      setSettings(config);
    }
    loadSettings();

    const handleUpdate = (e) => {
      if (e?.detail) setSettings(e.detail);
    };
    window.addEventListener('ct_popular_categories_updated', handleUpdate);
    return () => window.removeEventListener('ct_popular_categories_updated', handleUpdate);
  }, []);

  // Compute products for each active category slot
  const slotData = useMemo(() => {
    const rawCategories = settings?.categories || DEFAULT_POPULAR_CATEGORIES_SETTINGS.categories;
    return rawCategories
      .filter((slot) => slot && slot.enabled !== false)
      .map((slot) => {
        const slotProducts = filterProductsForSlot(products, slot);
        return {
          ...slot,
          products: slotProducts
        };
      });
  }, [products, settings]);

  const totalProducts = slotData.reduce((acc, slot) => acc + slot.products.length, 0);

  if (!settings?.is_active) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse space-y-3">
              <div className="h-44 bg-slate-100 rounded-xl"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : totalProducts === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-sm text-slate-600">কোন প্রোডাক্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-12">
          {slotData.map((slot, index) => {
            if (!slot.products || slot.products.length === 0) return null;

            const IconComponent = ICON_MAP[slot.icon] || Sparkles;

            return (
              <div key={slot.id || index} className="space-y-6">
                {/* Category Header Box with Thin Red Border & Rich Aesthetics */}
                <div className="border border-[#c92127]/60 bg-gradient-to-r from-red-50/40 via-white to-red-50/40 rounded-2xl p-4 sm:p-5 text-center shadow-2xs">
                  <div className="inline-flex items-center gap-1.5 bg-[#c92127] text-white px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                    <IconComponent className="w-3 h-3 fill-current" />
                    <span>ক্যাটাগরি {index + 1}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {slot.display_title || slot.category_name}
                    </h3>
                    <span className="text-xs font-bold bg-red-100 text-[#c92127] px-2.5 py-0.5 rounded-full border border-red-200">
                      {slot.products.length} {slot.badge_text || 'টি প্রোডাক্ট'}
                    </span>
                  </div>

                  {slot.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto font-medium">
                      {slot.subtitle}
                    </p>
                  )}
                </div>

                {/* Product Grid: 2 cols on mobile, 3 on sm, 4 on lg */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {slot.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Bottom View All CTA */}
          <div className="pt-6 flex flex-col items-center justify-center border-t border-slate-100">
            <button
              onClick={() => {
                const targetLink = settings.explore_button_link || '/shop';
                if (onNavigate) {
                  onNavigate(targetLink, 'Shop');
                } else {
                  navigate(targetLink);
                }
              }}
              className="inline-flex items-center gap-2.5 bg-[#c92127] hover:bg-[#b91c1c] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{settings.explore_button_text || 'Explore All Products'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-slate-400 text-xs font-medium mt-2.5 text-center">
              100% Authentic Products • 1 Year Official Support • Nationwide Fast Delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
