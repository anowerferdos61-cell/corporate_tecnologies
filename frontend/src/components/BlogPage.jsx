import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Sparkles,
  Eye,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  fetchBlogPosts,
  DEFAULT_BLOG_CATEGORIES
} from '../lib/blogService';

export default function BlogPage({ onNavigate }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const data = await fetchBlogPosts({ onlyPublished: true });
      setBlogs(data || []);
    } catch (e) {
      console.error('Error fetching blogs:', e);
    } finally {
      setLoading(false);
    }
  }

  // Filtered blogs
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch =
      (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Top featured post
  const featuredPost = filteredBlogs.find(b => b.featured) || filteredBlogs[0];
  const regularPosts = filteredBlogs.filter(b => b.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#c92127] via-[#b91c1c] to-[#991b1b] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Corporate Tech Blog & Knowledgebase</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              টেক ব্লগ, প্রিন্টিং গাইড ও এক্সপার্ট অ্যাডভাইস
            </h1>
            <p className="text-red-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              প্রিন্টার হেড যত্ন, অরিজিনাল কালির সঠিক ব্যবহার, ফটোকপিয়ার মেইনটেন্যান্স ও টেক্সটাইল প্রিন্টিং টেকনোলজির নির্ভরযোগ্য তথ্যভাণ্ডার।
            </p>
          </div>
        </div>

        {/* 2. Search & Category Filter Toolbar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রিন্টার, কালি বা গাইড খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none transition-colors"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              মোট আর্টিকেল: <strong className="text-slate-800 font-bold">{filteredBlogs.length}</strong> টি
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['All', ...DEFAULT_BLOG_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#c92127] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat === 'All' ? 'সব আর্টিকেল (All)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#c92127] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">ব্লগ আর্টিকেল লোড হচ্ছে...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">কোনো ব্লগ আর্টিকেল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400">ভিন্ন কোনো কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 3. Highlighted / Featured Post (Top Hero Card) */}
            {featuredPost && (
              <div
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-video lg:aspect-auto w-full bg-slate-100 overflow-hidden">
                  <img
                    src={featuredPost.image_url || '/splashjet_images/about-splashjet.jpg'}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-xs text-white text-xs font-black uppercase tracking-wider">
                      {featuredPost.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 fill-current" /> Featured Guide
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.read_time || '5 min read'}
                      </span>
                      <span>•</span>
                      <span>{featuredPost.author || 'Corporate Tech Team'}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#c92127] transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 sm:line-clamp-4">
                      {featuredPost.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {(Number(featuredPost.views_count) || 0).toLocaleString()} views
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#c92127] group-hover:translate-x-1 transition-transform">
                      <span>সম্পূর্ণ পড়ুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Regular Articles Grid */}
            {regularPosts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-800">সর্বশেষ প্রকাশিত গাইডসমূহ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((article) => (
                    <article
                      key={article.id}
                      onClick={() => navigate(`/blog/${article.slug}`)}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                          <img
                            src={article.image_url || '/splashjet_images/about-splashjet.jpg'}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                            {article.category}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {article.read_time || '4 min read'}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Eye className="w-3 h-3" />
                              {(Number(article.views_count) || 0).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#c92127] transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400 font-normal">
                          {article.created_at ? new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </span>
                        <span className="text-[#c92127] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>পড়ুন →</span>
                        </span>
                      </div>

                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
