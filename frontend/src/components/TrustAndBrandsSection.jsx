import React from 'react';
import { Truck, Headphones, ShieldCheck } from 'lucide-react';

export default function TrustAndBrandsSection({ onBrandClick }) {
  const brands = [
    { name: 'Canon', color: 'text-[#cc0000]', subtitle: 'Printers & Copiers' },
    { name: 'Splashjet', color: 'text-[#c92127]', subtitle: 'Premium Digital Inks', badge: 'Official' },
    { name: 'Epson', color: 'text-[#002f87]', subtitle: 'EcoTank & Photo' },
    { name: 'HP', color: 'text-[#0096d6]', subtitle: 'Laser & Office' },
    { name: 'Brother', color: 'text-[#00529b]', subtitle: 'Printers & Toners' },
    { name: 'Toshiba', color: 'text-[#ff0000]', subtitle: 'Photocopiers' },
    { name: 'Kodak', color: 'text-[#ffb700]', subtitle: 'Photo Paper' },
    { name: 'Transcend', color: 'text-[#b91c1c]', subtitle: 'Accessories' },
    { name: 'ViewSonic', color: 'text-[#d9261c]', subtitle: 'Office Display' }
  ];

  return (
    <section className="w-full bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* 1. Trust Features Bar (Matching Screenshot 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-200/80">
          
          {/* Fast Shipping */}
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 flex-shrink-0">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Fast Shipping
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All Over Bangladesh
              </p>
            </div>
          </div>

          {/* Dedicated Support */}
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 flex-shrink-0">
              <Headphones className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Dedicated Support
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick response 24/7
              </p>
            </div>
          </div>

          {/* Money-Back Guarantee */}
          <div className="flex items-center gap-4 justify-center sm:justify-start p-4 rounded-2xl bg-slate-50/60 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white text-slate-800 flex items-center justify-center shadow-xs border border-slate-200 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[1.8] text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Money-Back Guarantee
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Worry-free shopping
              </p>
            </div>
          </div>

        </div>

        {/* 2. Shop Products from Your Favorite Brands (Matching Screenshot 1) */}
        <div className="pt-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8">
            Shop Products from Your Favorite Brands
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4 items-center justify-center">
            {brands.map((b, i) => (
              <div
                key={i}
                onClick={() => onBrandClick && onBrandClick(b.name)}
                className="p-3 py-4 rounded-2xl border border-slate-200 bg-white hover:border-[#c92127] hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center group"
              >
                <span className={`text-sm sm:text-base font-black tracking-tight ${b.color} group-hover:scale-105 transition-transform`}>
                  {b.name}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 mt-1 truncate max-w-full">
                  {b.subtitle}
                </span>
                {b.badge && (
                  <span className="bg-red-100 text-[#c92127] text-[8px] font-black px-1.5 py-0.2 rounded-full mt-1">
                    {b.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
