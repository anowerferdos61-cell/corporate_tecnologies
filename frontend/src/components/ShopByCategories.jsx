import React from 'react';
import { 
  Printer, 
  Copy, 
  Droplet, 
  Sparkles, 
  PenTool, 
  Cog, 
  Wrench, 
  LayoutGrid,
  ChevronRight 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

// Specialized Ink Application Categories matching client reference
const INK_APPLICATION_CATEGORIES = [
  {
    id: 'large-format',
    title: 'Large Format Printer Ink',
    desc: 'Wide-format inks for banners, posters and photo albums with vivid, long-lasting colors.',
    image: '/splashjet_images/ink-cat-large-format.png',
    filterCategory: 'Splashjet Ink',
    slug: 'splashjet-ink',
    titleClass: 'text-slate-900 group-hover:text-[#c92127]'
  },
  {
    id: 'desktop-printer',
    title: 'Desktop Printer Ink',
    desc: 'Reliable refill inks for Epson, Canon and HP desktop printers — sharp text and photos.',
    image: '/splashjet_images/ink-cat-desktop-printer.png',
    filterCategory: 'Printers',
    slug: 'printers/epson-printers',
    titleClass: 'text-[#e11d48] group-hover:text-[#be123c]' // Distinct magenta/pink accent matching reference screenshot
  },
  {
    id: 'digital-textile',
    title: 'Digital Textile Printing Ink',
    desc: 'Sublimation, DTF and DTG inks for apparel and fabric with a soft hand and wash-fastness.',
    image: '/splashjet_images/ink-cat-digital-textile.png',
    filterCategory: 'Splashjet Ink',
    slug: 'splashjet-ink/splashjet-for-dtf',
    titleClass: 'text-slate-900 group-hover:text-[#c92127]'
  },
  {
    id: 'industrial-inkjet',
    title: 'Industrial Inkjet Ink',
    desc: 'Coding, marking and packaging inks built for high-speed industrial print heads.',
    image: '/splashjet_images/ink-cat-industrial-inkjet.png',
    filterCategory: 'Office Equipment',
    slug: 'office-equipment',
    titleClass: 'text-slate-900 group-hover:text-[#c92127]'
  }
];

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

  const handleInkCategoryClick = (item) => {
    setSearchQuery('');
    setSelectedCategory(item.filterCategory);
    if (onNavigate) {
      onNavigate(`/product-category/${item.slug}/`, item.title);
    } else if (onCategorySelect) {
      onCategorySelect(item);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* 1. Primary Category Icons Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shop By Categories
          </h2>
          <div className="w-12 h-1 bg-[#c92127] mx-auto mt-2.5 rounded-full"></div>
        </div>

        {/* Categories Grid (3 cols on mobile, 4 on tablet, 8 on desktop) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="group flex flex-col items-center justify-center p-2.5 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#c92127] hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-50 group-hover:bg-red-50/50 transition-colors mb-1.5 sm:mb-2.5 group-hover:scale-105 duration-200">
                {item.icon}
              </div>

              <span className="text-[10px] sm:text-[13px] font-bold text-slate-800 group-hover:text-[#c92127] transition-colors text-center leading-tight">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Specialized Ink Application Cards Showcase (Matching Client Reference) */}
      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {INK_APPLICATION_CATEGORIES.map((card) => (
            <div
              key={card.id}
              onClick={() => handleInkCategoryClick(card)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
            >
              {/* Card Image */}
              <div className="w-full h-44 sm:h-48 flex items-center justify-center overflow-hidden rounded-xl mb-4 bg-slate-50/50 p-2">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Title & Description */}
              <div className="flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold tracking-tight leading-snug transition-colors ${card.titleClass}`}>
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-3 mt-2">
                    {card.desc}
                  </p>
                </div>

                {/* View Details Action Link */}
                <div className="pt-3">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#e11d48] group-hover:text-[#be123c] group-hover:underline">
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3] transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
