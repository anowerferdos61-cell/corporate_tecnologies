import React from 'react';
import { 
  Printer, 
  Copy, 
  Droplet, 
  Sparkles, 
  PenTool, 
  Cog, 
  Wrench, 
  LayoutGrid 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ShopByCategories({ onCategorySelect, onNavigate }) {
  const { setSelectedCategory, setSearchQuery } = useCart();

  const categories = [
    {
      id: 'photocopier',
      name: 'Photocopier',
      bengali: 'ফটোকপিয়ার',
      slug: 'photocopy-machine',
      filterCategory: 'Photocopy Machine',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="14" width="32" height="24" rx="3" />
          <path d="M14 14V8h20v6" />
          <line x1="8" y1="24" x2="40" y2="24" />
          <circle cx="16" cy="19" r="1.5" fill="currentColor" />
          <circle cx="22" cy="19" r="1.5" fill="currentColor" />
          <rect x="14" y="28" width="20" height="12" rx="1.5" />
        </svg>
      )
    },
    {
      id: 'printer',
      name: 'Printer',
      bengali: 'প্রিন্টার',
      slug: 'printers',
      filterCategory: 'Printers',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="16" width="32" height="18" rx="3" />
          <path d="M14 16V8h20v8" />
          <path d="M14 26v14h20V26" />
          <line x1="18" y1="33" x2="30" y2="33" />
          <circle cx="34" cy="22" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'original-ink',
      name: 'Original Ink',
      bengali: 'অরিজিনাল ইঙ্ক',
      slug: 'toner-inks',
      filterCategory: 'Toner & Inks',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 3 bottles */}
          <rect x="6" y="18" width="10" height="22" rx="2" />
          <path d="M9 18v-6h4v6" />
          <rect x="19" y="14" width="10" height="26" rx="2" />
          <path d="M22 14V8h4v6" />
          <rect x="32" y="18" width="10" height="22" rx="2" />
          <path d="M35 18v-6h4v6" />
        </svg>
      )
    },
    {
      id: 'splashjet-ink',
      name: 'Splashjet Ink',
      bengali: 'স্প্ল্যাশজেট ইঙ্ক',
      slug: 'splashjet-ink',
      filterCategory: 'Splashjet Ink',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
          {/* Stylized Splashjet Prism Logo */}
          <polygon points="24,6 40,38 8,38" stroke="#c92127" strokeWidth="3" strokeLinejoin="round" fill="none" />
          <polygon points="24,16 34,35 14,35" fill="#c92127" fillOpacity="0.15" stroke="#c92127" strokeWidth="2" />
          <circle cx="24" cy="27" r="3" fill="#c92127" />
        </svg>
      )
    },
    {
      id: 'equipment',
      name: 'POS & Barcode',
      bengali: 'ইকুইপমেন্ট ও পিওএস',
      slug: 'office-equipment',
      filterCategory: 'Office Equipment',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="10" width="28" height="28" rx="3" />
          <line x1="10" y1="20" x2="38" y2="20" />
          <line x1="20" y1="20" x2="20" y2="38" />
          <path d="M26 28l6 6" />
          <path d="M32 28l-6 6" />
        </svg>
      )
    },
    {
      id: 'machinery',
      name: 'Machinery',
      bengali: 'মেশিনারি',
      slug: 'machinery',
      filterCategory: 'Machinery',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="8" />
          <path d="M24 6v4m0 28v4m18-18h-4M10 24H6m25.5-12.5l-2.8 2.8m-17.4 17.4l-2.8 2.8m23 0l-2.8-2.8m-17.4-17.4l-2.8-2.8" />
        </svg>
      )
    },
    {
      id: 'accessories',
      name: 'Accessories',
      bengali: 'এক্সেসরিজ',
      slug: 'accessories-parts',
      filterCategory: 'Accessories & Parts',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="12" width="32" height="24" rx="3" />
          <path d="M16 20l4 8" />
          <path d="M24 18v12" />
          <circle cx="32" cy="24" r="3" />
        </svg>
      )
    },
    {
      id: 'show-more',
      name: 'Show More',
      bengali: 'সকল ক্যাটাগরি',
      slug: '',
      filterCategory: 'All',
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10 stroke-slate-800 fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="10" width="11" height="11" rx="2.5" />
          <rect x="27" y="10" width="11" height="11" rx="2.5" />
          <rect x="10" y="27" width="11" height="11" rx="2.5" />
          <rect x="27" y="27" width="11" height="11" rx="2.5" />
        </svg>
      )
    },
  ];

  const handleSelect = (cat) => {
    setSearchQuery('');
    setSelectedCategory(cat.filterCategory);
    if (onNavigate) {
      if (cat.slug) {
        onNavigate(`/product-category/${cat.slug}/`, cat.filterCategory);
      } else {
        onNavigate('/shop/', 'All');
      }
    } else if (onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shop By Categories
        </h2>
        <div className="w-12 h-1 bg-[#c92127] mx-auto mt-2.5 rounded-full"></div>
      </div>

      {/* Categories Grid (3 cols on mobile as requested, 4 on tablet, 8 on desktop) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="group flex flex-col items-center justify-center p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#c92127] hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            {/* Icon Container */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-50 group-hover:bg-red-50/50 transition-colors mb-1.5 sm:mb-2.5 group-hover:scale-105 duration-200">
              {item.icon}
            </div>

            {/* Title */}
            <span className="text-[10px] sm:text-[13px] font-bold text-slate-800 group-hover:text-[#c92127] transition-colors text-center leading-tight">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
