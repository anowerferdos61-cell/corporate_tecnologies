import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ChevronRight, Printer, Sparkles, ShieldCheck } from 'lucide-react';

const BLOG_ARTICLES = [
  {
    id: 1,
    title: '5 Essential Tips to Keep Your Printer Head Clean & Long-Lasting',
    category: 'Printer Maintenance',
    date: 'September 8, 2026',
    readTime: '4 min read',
    author: 'Technical Support Team',
    summary: 'Prevent printhead clogging, nozzle blockages, and streaky prints with simple daily care tips that double your printhead lifespan.',
    image: '/splashjet_images/about-splashjet.jpg',
    tags: ['Epson', 'Canon', 'Printhead Care']
  },
  {
    id: 2,
    title: 'How to Identify Genuine Splashjet Digital Inks & Avoid Counterfeits',
    category: 'Ink Guide',
    date: 'September 5, 2026',
    readTime: '5 min read',
    author: 'Splashjet Distributor Team',
    summary: 'Why 100% authentic Splashjet inks protect your printer and guarantee vibrant colors. Includes barcode verification and QR code scan guides.',
    image: '/splashjet_images/about-splashjet.jpg',
    tags: ['Splashjet', 'Original Ink', 'Security']
  },
  {
    id: 3,
    title: 'Key Factors to Consider Before Buying an Office Photocopier',
    category: 'Photocopiers',
    date: 'September 1, 2026',
    readTime: '6 min read',
    author: 'Sales & Solutions Team',
    summary: 'Heavy-duty vs. light-duty copiers: how Toshiba multifunction series can slash office printing and copying costs by up to 70%.',
    image: '/splashjet_images/about-splashjet.jpg',
    tags: ['Toshiba', 'Photocopier', 'Office Equipment']
  },
  {
    id: 4,
    title: 'Apparel & Fabric Printing: Sublimation vs. DTF Technology',
    category: 'Textile & Machinery',
    date: 'August 28, 2026',
    readTime: '5 min read',
    author: 'Industrial Printing Specialist',
    summary: 'The garment printing revolution: compare DTF ink wash-fastness against traditional sublimation and master proper heat press temperatures.',
    image: '/splashjet_images/about-splashjet.jpg',
    tags: ['DTF Ink', 'Heat Press', 'Sublimation']
  }
];

export default function BlogPage({ onNavigate }) {
  return (
    <div className="min-w-0 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/');
            }}
            className="hover:text-[#c92127] cursor-pointer"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#c92127] font-bold">Blog</span>
        </div>

        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#c92127] to-[#a8191e] rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Corporate Tech Blog & Insights</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Tech Blog, Printing Guides & Expert Advice
            </h1>
            <p className="text-red-100 text-xs sm:text-sm leading-relaxed">
              Essential maintenance tutorials, ink selection guides, and industry insights for printers, photocopiers, and digital printing solutions.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#c92127] text-[11px] font-extrabold">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#c92127] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{article.date}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('/shop/', 'Shop');
                    }}
                    className="text-xs font-black text-[#c92127] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Guide →</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
