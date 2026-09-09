import React, { useState, useEffect, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Trash2, 
  Plus, 
  X, 
  ShoppingCart, 
  Eye, 
  Check, 
  ChevronRight, 
  Home, 
  Sparkles, 
  ShieldCheck, 
  Droplet, 
  Printer, 
  FileText,
  Search
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { isComparableProduct } from './ProductCard';

export default function ComparePage({ allProducts = [], onNavigate }) {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');

  // Compare list state (persisted in localStorage)
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 3);
      }
    } catch {}
    return [];
  });

  // Sync compare list across window events
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCompareList(e.detail.slice(0, 3));
      }
    };
    window.addEventListener('ct_compare_updated', handleSync);
    return () => window.removeEventListener('ct_compare_updated', handleSync);
  }, []);

  // Update page title
  useEffect(() => {
    document.title = 'পণ্য তুলনা (Product Compare) – Corporate Technologies BD';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Filter only comparable products for the picker (Inks, Printers, Photocopiers)
  const availableToPick = useMemo(() => {
    const comparableOnly = allProducts.filter(isComparableProduct);
    return comparableOnly.filter(p => {
      // Must not already be in compare list
      if (compareList.some(item => item.id === p.id)) return false;

      // Category filter
      if (pickerCategory !== 'all') {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.sub_category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        if (pickerCategory === 'ink') {
          if (!cat.includes('ink') && !sub.includes('ink') && !title.includes('ink') && !title.includes('splashjet')) return false;
        } else if (pickerCategory === 'printer') {
          if (!cat.includes('printer') && !sub.includes('printer') && !title.includes('printer')) return false;
        } else if (pickerCategory === 'photocopy') {
          if (!cat.includes('photocopy') && !sub.includes('photocopy') && !title.includes('toshiba') && !title.includes('e-studio')) return false;
        }
      }

      // Search query filter
      if (pickerSearch.trim()) {
        const q = pickerSearch.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchSku) return false;
      }

      return true;
    });
  }, [allProducts, compareList, pickerCategory, pickerSearch]);

  const handleRemove = (productId) => {
    const updated = compareList.filter(p => p.id !== productId);
    setCompareList(updated);
    try {
      localStorage.setItem('ct_compare_list', JSON.stringify(updated));
      localStorage.setItem('ct_compare_cleared', updated.length === 0 ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: updated }));
    } catch {}
  };

  const handleClearAll = () => {
    setCompareList([]);
    try {
      localStorage.setItem('ct_compare_list', '[]');
      localStorage.setItem('ct_compare_cleared', 'true');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: [] }));
    } catch {}
  };

  const handleAddProduct = (product) => {
    if (compareList.length >= 3) {
      alert('একসাথে সর্বোচ্চ ৩টি পণ্য তুলনা করা যাবে। নতুন পণ্য যোগ করতে যেকোনো একটি পণ্য সরান।');
      return;
    }
    const updated = [...compareList, product];
    setCompareList(updated);
    setIsAddModalOpen(false);
    setPickerSearch('');
    try {
      localStorage.setItem('ct_compare_list', JSON.stringify(updated));
      localStorage.setItem('ct_compare_cleared', 'false');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: updated }));
    } catch {}
  };

  const handleLoadDefaults = () => {
    const defaultInksOrPrinters = allProducts.filter(isComparableProduct).slice(0, 3);
    setCompareList(defaultInksOrPrinters);
    try {
      localStorage.setItem('ct_compare_list', JSON.stringify(defaultInksOrPrinters));
      localStorage.setItem('ct_compare_cleared', 'false');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: defaultInksOrPrinters }));
    } catch {}
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
    addToCart(product, 1, e);
  };

  const handleNavigateProduct = (product) => {
    const targetSlug = product.slug || product.id;
    const targetUrl = `/product/${targetSlug}/`;
    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 pb-24 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/', 'Home');
            }}
            className="hover:text-[#c92127] flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">প্রোডাক্ট কম্পেয়ার (Compare)</span>
        </nav>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c92127] text-xs font-black tracking-wide uppercase mb-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>মডেল ও স্পেসিফিকেশন তুলনা</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                প্রোডাক্ট কম্পেয়ার (Product Compare)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                একসাথে সর্বোচ্চ ৩টি ইঙ্ক, প্রিন্টার বা ফটোকপিয়ারের বিস্তারিত স্পেসিফিকেশন পাশাপাশি তুলনা করুন
              </p>
            </div>

            {compareList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>সব ক্লিয়ার করুন ({compareList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Section */}
        {compareList.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
              আপনার কম্পেয়ার তালিকা বর্তমানে খালি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              তুলনা করার জন্য শপ পেজ বা হোম পেজে গিয়ে যেকোনো ইঙ্ক, প্রিন্টার বা ফটোকপিয়ারের নিচে "কম্পেয়ার" বাটনে ক্লিক করুন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleLoadDefaults}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>৩টি জনপ্রিয় পণ্য দিয়ে তুলনা দেখুন</span>
              </button>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('/shop/', 'Shop');
                  else window.location.href = '/shop/';
                }}
                className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-[#c92127] border border-red-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
              >
                <span>সব প্রোডাক্ট ব্রাউজ করুন</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active 3-Slot Comparison View */
          <div className="space-y-8">
            
            {/* 3 Top Slots Grid (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[0, 1, 2].map((slotIdx) => {
                const prod = compareList[slotIdx];

                if (prod) {
                  return (
                    <div 
                      key={prod.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 hover:border-red-300 p-5 shadow-sm transition-all flex flex-col justify-between relative group"
                    >
                      {/* Top Remove Action Button */}
                      <button
                        onClick={() => handleRemove(prod.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer shadow-xs"
                        title="তুলনা তালিকা থেকে সরান"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => handleNavigateProduct(prod)}
                        className="py-4 flex items-center justify-center h-44 cursor-pointer"
                      >
                        <img
                          src={prod.image_url}
                          alt={prod.title}
                          className="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                        />
                      </div>

                      {/* Title & Brand */}
                      <div className="text-center pt-2">
                        <span className="text-[10px] font-black uppercase text-[#c92127] bg-red-50 px-2 py-0.5 rounded-md">
                          {prod.brand || 'Corporate Tech'}
                        </span>
                        <h3 
                          onClick={() => handleNavigateProduct(prod)}
                          className="text-xs sm:text-sm font-black text-slate-900 hover:text-[#c92127] line-clamp-2 mt-1.5 transition-colors cursor-pointer min-h-[2.4rem]"
                        >
                          {prod.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center justify-center gap-2 mt-2">
                          {prod.regular_price > prod.sale_price && (
                            <span className="text-xs text-slate-400 line-through font-medium">
                              ৳{Number(prod.regular_price).toLocaleString()}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-black text-[#c92127]">
                            ৳{Number(prod.sale_price || prod.regular_price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom CTA Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleNavigateProduct(prod)}
                          className="w-full py-2 px-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>বিস্তারিত</span>
                        </button>

                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className={`w-full py-2 px-2.5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                            addedId === prod.id
                              ? 'bg-emerald-600 scale-105'
                              : 'bg-[#c92127] hover:bg-[#b91c1c]'
                          }`}
                        >
                          {addedId === prod.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>যোগ হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>কার্ট</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }

                {/* Empty Slot Card to Add Product */}
                return (
                  <div
                    key={`empty-${slotIdx}`}
                    onClick={() => setIsAddModalOpen(true)}
                    className="border-2 border-dashed border-slate-300 hover:border-[#c92127] bg-white/70 hover:bg-red-50/20 rounded-2xl sm:rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[340px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-red-100 group-hover:text-[#c92127] text-slate-400 flex items-center justify-center mb-3 transition-colors shadow-xs">
                      <Plus className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-[#c92127] transition-colors">
                      {slotIdx + 1}নং পণ্য যোগ করুন
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      তুলনা করার জন্য অন্য একটি ইঙ্ক, প্রিন্টার বা ফটোকপিয়ার বাছাই করুন
                    </p>
                    <span className="mt-4 text-xs font-extrabold text-[#c92127] bg-red-50 border border-red-200 group-hover:bg-[#c92127] group-hover:text-white px-4 py-2 rounded-xl transition-all shadow-xs">
                      + পণ্য বাছাই করুন
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Exhaustive Specifications Comparison Matrix Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    বিস্তারিত স্পেসিফিকেশন তুলনা তালিকা
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {compareList.length}টি পণ্য প্রদর্শিত হচ্ছে
                </span>
              </div>

              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200 min-w-[650px]">
                  
                  {/* Table Headers */}
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3.5 sm:p-4 font-black uppercase text-[11px] tracking-wider w-44 sticky left-0 bg-slate-100 z-10">
                        স্পেসিফিকেশন
                      </th>
                      {compareList.map((prod) => (
                        <th key={prod.id} className="p-3.5 sm:p-4 font-extrabold text-slate-900 text-center w-1/3">
                          <span className="line-clamp-1">{prod.title}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    
                    {/* Brand */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-white">ব্র্যান্ড (Brand)</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center font-extrabold text-slate-900">
                          {prod.brand || 'Corporate Tech'}
                        </td>
                      ))}
                    </tr>

                    {/* Price & Savings */}
                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-slate-50">বর্তমান মূল্য ও ছাড়</td>
                      {compareList.map((prod) => {
                        const hasDiscount = prod.regular_price > prod.sale_price;
                        const discountPercent = hasDiscount 
                          ? Math.round(((prod.regular_price - prod.sale_price) / prod.regular_price) * 100)
                          : 0;
                        return (
                          <td key={prod.id} className="p-3.5 sm:p-4 text-center">
                            <span className="text-base font-black text-[#c92127] block">
                              ৳{Number(prod.sale_price || prod.regular_price).toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                                ৳{Number(prod.regular_price).toLocaleString()}
                              </span>
                            )}
                            {discountPercent > 0 && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-[#c92127]">
                                -{discountPercent}% ছাড়
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Category & Subcategory */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-white">ক্যাটাগরি</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center font-semibold text-slate-800">
                          <span className="block font-bold">{prod.category}</span>
                          {prod.sub_category && (
                            <span className="text-xs text-slate-500 font-normal">({prod.sub_category})</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Stock Status */}
                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-slate-50">স্টক অবস্থা</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>ইন-স্টক (In Stock)</span>
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* SKU / Product Code */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-white">মডেল / SKU কোড</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center font-mono font-bold text-slate-700">
                          {prod.sku || `CT-${prod.id}`}
                        </td>
                      ))}
                    </tr>

                    {/* Official Warranty */}
                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-slate-50">ওয়ারেন্টি ও সাপোর্ট</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center font-extrabold text-emerald-700">
                          <div className="flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>{prod.warranty_period || '১ বছর ফ্রি সার্ভিস ওয়ারেন্টি'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Product Type & Head Safety */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-white">কোয়ালিটি ও হেড সেফটি</td>
                      {compareList.map((prod) => {
                        const isInk = (prod.category || '').toLowerCase().includes('ink') || (prod.title || '').toLowerCase().includes('ink');
                        return (
                          <td key={prod.id} className="p-3.5 sm:p-4 text-center text-xs font-semibold text-slate-700">
                            {isInk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>১০০% প্রিন্টহেড সেফ (No-Clog)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg font-bold">
                                <Printer className="w-3.5 h-3.5 text-blue-600" />
                                <span>হেভি-ডিউটি কমার্শিয়াল পারফরম্যান্স</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Variations / Colors available */}
                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-slate-50">কালার / ভেরিয়েশন</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center">
                          {prod.variations && prod.variations.length > 0 ? (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {prod.variations.slice(0, 4).map((v, i) => (
                                <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700">
                                  {v.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">স্ট্যান্ডার্ড এডিশন</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Short Description Overview */}
                    <tr className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-white">বিবরণ ও ফিচারস</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-xs text-slate-600 leading-relaxed text-center">
                          <p className="line-clamp-3">
                            {prod.short_description || prod.description || '১০০% অরিজিনাল কর্পোরেট টেকনোলজিস পণ্য। নির্ভরযোগ্য ও দীর্ঘস্থায়ী কোয়ালিটি নিশ্চয়তা।'}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Customer Rating */}
                    <tr className="bg-slate-50/40 hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold text-slate-600 sticky left-0 bg-slate-50">গ্রাহক সন্তুষ্টি (Rating)</td>
                      {compareList.map((prod) => (
                        <td key={prod.id} className="p-3.5 sm:p-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xs">
                            <span>★</span>
                            <span>{prod.rating || '4.9'}</span>
                            <span className="text-slate-400 font-normal">({prod.reviews_count || '12'} রিভিউ)</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Decision Helper Box */}
            <div className="p-5 sm:p-6 bg-red-50 rounded-3xl border border-red-200 text-center max-w-2xl mx-auto">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-1">
                সঠিক পণ্যটি বাছাই করতে দ্বিধায় আছেন?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mb-3">
                আপনার অফিস বা প্রেসের কাজের জন্য কোনটি সবচেয়ে লাভজনক হবে জানতে আমাদের টেকনিক্যাল টিম থেকে ফ্রি কনসালটেশন নিন।
              </p>
              <a
                href="tel:+8801777277740"
                className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-full shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>কল করুন: 01777-277740</span>
              </a>
            </div>

          </div>
        )}

      </div>

      {/* Product Selection Modal (Allows picking from Inks, Printers & Photocopiers) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col animate-scaleUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    তুলনা তালিকায় পণ্য যোগ করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    ইঙ্ক, প্রিন্টার বা ফটোকপিয়ার থেকে যেকোনো একটি বেছে নিন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="py-3 space-y-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'সকল যোগ্য পণ্য' },
                  { id: 'ink', label: 'ডিজিটাল ইঙ্ক' },
                  { id: 'printer', label: 'প্রিন্টার' },
                  { id: 'photocopy', label: 'ফটোকপিয়ার' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPickerCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      pickerCategory === tab.id
                        ? 'bg-[#c92127] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="মডেল বা পণ্যের নাম দিয়ে খুঁজুন..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127]"
                />
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {availableToPick.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  কোনো পণ্য পাওয়া যায়নি।
                </div>
              ) : (
                availableToPick.slice(0, 20).map((prod) => (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image_url}
                        alt={prod.title}
                        className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0"
                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-extrabold text-slate-900 truncate">
                          {prod.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {prod.category}
                          </span>
                          <span className="text-xs font-black text-[#c92127]">
                            ৳{Number(prod.sale_price || prod.regular_price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddProduct(prod)}
                      className="shrink-0 text-xs font-bold text-white bg-[#c92127] hover:bg-[#b91c1c] px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      + যোগ করুন
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
