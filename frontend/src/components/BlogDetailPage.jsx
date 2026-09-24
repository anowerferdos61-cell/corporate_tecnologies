import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Share2,
  ArrowLeft,
  ChevronRight,
  Eye,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Copy,
  Check,
  CheckCircle2,
  Tag,
  Package,
  Layers
} from 'lucide-react';
import {
  fetchBlogPostBySlug,
  fetchBlogPosts,
  incrementBlogViews
} from '../lib/blogService';
import ProductCard from './ProductCard';

export default function BlogDetailPage({ allProducts = [] }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPost();
  }, [slug]);

  async function loadPost() {
    setLoading(true);
    try {
      const [currentPost, allPosts] = await Promise.all([
        fetchBlogPostBySlug(slug),
        fetchBlogPosts({ onlyPublished: true })
      ]);

      setBlog(currentPost);
      setAllBlogs(allPosts || []);

      if (currentPost?.id) {
        incrementBlogViews(currentPost.id);
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  }

  // Share handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${blog?.title || 'Corporate Tech Blog'}\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  // Find related products
  const relatedProducts = (blog?.related_product_ids || [])
    .map(id => allProducts.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  // Other recent posts
  const otherPosts = allBlogs
    .filter(b => b.slug !== slug && b.id !== blog?.id)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#c92127] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">ব্লগ আর্টিকেল লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">আর্টিকেলটি পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">
            সম্ভবত পোস্টটি সরানো হয়েছে বা লিঙ্কটি সঠিক নয়।
          </p>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-5 py-2.5 bg-[#c92127] text-white text-xs font-bold rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> ব্লগ পেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Simple Markdown-like Renderer for Paragraphs, Headings, Lists, Quotes
  const renderContent = (rawText) => {
    if (!rawText) return null;
    const blocks = rawText.split(/\n\s*\n/);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();

      // Heading 2: ## Title
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 tracking-tight">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Heading 3: ### Title
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Blockquote / Pro Tip: > text
      if (trimmed.startsWith('> ')) {
        const text = trimmed.replace(/^>\s*/gm, '');
        return (
          <div
            key={idx}
            className="my-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-900 text-xs sm:text-sm font-medium leading-relaxed space-y-1 shadow-2xs"
          >
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>গুরুত্বপূর্ণ পরামর্শ (Pro Tip)</span>
            </div>
            <p>{text.replace('**Pro Tip:**', '').replace('**টিপ:**', '').trim()}</p>
          </div>
        );
      }

      // Unordered / Ordered List
      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2.5 text-xs sm:text-sm text-slate-700">
            {lines.map((l, lIdx) => {
              const clean = l.replace(/^\d+\.\s*|^[-*]\s*/, '');
              return (
                <li key={lIdx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{clean}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed sm:leading-loose my-3">
          {trimmed}
        </p>
      );
    });
  };

  const publishDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 1. Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-[#c92127] transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/blog" className="hover:text-[#c92127] transition-colors">ব্লগ ও গাইড</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-xs">{blog.title}</span>
        </nav>

        {/* 2. Main Article Card */}
        <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          
          {/* Article Header */}
          <div className="p-6 sm:p-10 space-y-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#c92127] text-xs font-black uppercase tracking-wider">
                {blog.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{blog.read_time || '5 min read'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{publishDate}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
              {blog.title}
            </h1>

            {/* Author and Social Share Top */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {blog.author ? blog.author.charAt(0) : 'C'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{blog.author || 'Corporate Tech Team'}</div>
                  <div className="text-[11px] text-slate-400">অফিসিয়াল টেকনিক্যাল রিভিউয়ার</div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ফেসবুকে শেয়ার করুন"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="লিংক কপি করুন"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'কপি হয়েছে' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="w-full aspect-[21/9] sm:aspect-[2/1] bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
              />
            </div>
          )}

          {/* Article Summary Box */}
          {blog.summary && (
            <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium leading-relaxed italic border-l-4 border-l-[#c92127]">
                "{blog.summary}"
              </div>
            </div>
          )}

          {/* Article Body Content */}
          <div className="p-6 sm:p-10 space-y-4">
            {renderContent(blog.content)}
          </div>

          {/* Tags */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="p-6 sm:p-10 pt-0 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">ট্যাগসমূহ:</span>
              {blog.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-red-50 hover:text-[#c92127] transition-colors"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

        </article>

        {/* 3. Related Products Section (If linked by admin) */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">আর্টিকেলে উল্লেখিত সংশ্লিষ্ট পণ্য</h3>
                  <p className="text-[11px] text-slate-500">অরিজিনাল ব্র্যান্ড ওয়ারেন্টি সহ এখনই অর্ডার করুন</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} onNavigate={(prod) => navigate(`/product/${prod.slug || prod.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* 4. Consultation & Call to Action Box */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-black text-white">প্রিন্টার বা কালি নিয়ে কোনো জিজ্ঞাসা আছে?</h3>
            <p className="text-xs text-slate-300 max-w-lg">
              আমাদের অফিসিয়াল টেকনিশিয়ান ও সেলস টিম আপনাকে সঠিক গাইডেন্স এবং বেস্ট অফার দিতে প্রস্তুত।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+8801712345678"
              className="px-4 py-2.5 bg-[#c92127] hover:bg-[#b91c1c] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>কল করুন</span>
            </a>
            <a
              href="https://wa.me/8801712345678"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 5. More Articles Grid */}
        {otherPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black text-slate-900">অন্যান্য জনপ্রিয় টেক গাইড</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherPosts.map(p => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#c92127] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#c92127] bg-red-50 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#c92127] transition-colors line-clamp-2">
                      {p.title}
                    </h4>
                  </div>
                  <div className="pt-3 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{p.read_time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
