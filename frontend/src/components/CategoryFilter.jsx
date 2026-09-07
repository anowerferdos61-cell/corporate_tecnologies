import React from 'react';
import { Layers, Flame, Sparkles, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CategoryFilter({ categories = [], productCounts = {} }) {
  const { 
    selectedCategory, 
    setSelectedCategory,
    setSearchQuery,
    inStockOnly,
    setInStockOnly,
    sortBy,
    setSortBy
  } = useCart();

  const getCategoryIcon = (catName) => {
    switch(catName) {
      case 'DTF Inks':
        return Flame;
      case 'Sublimation Inks':
        return Sparkles;
      case 'Pigment Inks':
        return Award;
      default:
        return Layers;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/80 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#c92127] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সকল প্রোডাক্ট</span>
          </button>

          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#c92127] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Right side Sort & In-Stock toggles */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* In Stock toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-[#c92127] rounded focus:ring-[#c92127] accent-[#c92127] cursor-pointer"
            />
            <span>শুধুমাত্র স্টক আছে</span>
          </label>

          {/* Sort By Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">সর্ট:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#c92127]/30 focus:border-[#c92127] cursor-pointer"
            >
              <option value="featured">ফিচার্ড প্রোডাক্ট</option>
              <option value="price_low">দাম: কম থেকে বেশি</option>
              <option value="price_high">দাম: বেশি থেকে কম</option>
              <option value="name_asc">নাম: A - Z</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
