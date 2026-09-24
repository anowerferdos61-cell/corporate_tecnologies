import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  User,
  Tag,
  ExternalLink,
  Layers,
  Check,
  X,
  AlertCircle,
  FileText,
  Sliders,
  TrendingUp,
  Share2,
  Package
} from 'lucide-react';
import {
  fetchBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  DEFAULT_BLOG_CATEGORIES
} from '../../../lib/blogService';
import BlogEditorView from '../BlogEditorView';

export default function BlogsTab({ products = [] }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Full-Page Editor Navigation State
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  // Load blogs on mount
  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    try {
      const data = await fetchBlogPosts();
      setBlogs(data || []);
    } catch (e) {
      console.error('Failed to load blogs:', e);
    } finally {
      setLoading(false);
    }
  }

  // Toggle Published Status inline
  const handleTogglePublish = async (blog) => {
    const updated = !blog.is_published;
    await updateBlogPost(blog.id, { is_published: updated });
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, is_published: updated } : b));
  };

  // Delete Blog
  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    await deleteBlogPost(id);
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  // If user clicked Add New Blog or Edit Blog -> Render Full-Page Dedicated Editor
  if (isAddingBlog || editingBlog) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8fafc]">
        <BlogEditorView
          blog={editingBlog}
          products={products}
          onClose={() => {
            setIsAddingBlog(false);
            setEditingBlog(null);
            loadBlogs();
          }}
          onSaveBlog={async (payload, id) => {
            if (id) {
              await updateBlogPost(id, payload);
            } else {
              await createBlogPost(payload);
            }
            await loadBlogs();
          }}
        />
      </div>
    );
  }

  // Filtering
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch =
      (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && b.is_published) ||
      (statusFilter === 'draft' && !b.is_published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Summary Metrics
  const totalBlogs = blogs.length;
  const publishedCount = blogs.filter(b => b.is_published).length;
  const draftCount = totalBlogs - publishedCount;
  const totalViews = blogs.reduce((acc, b) => acc + (Number(b.views_count) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Summary Stats */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-[#c92127] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Blog & Tech Guides Management</h2>
              <p className="text-xs text-slate-500 font-medium">
                Publish and manage printing tutorials, maintenance guides, and product news articles
              </p>
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Articles</span>
            <span className="text-base font-black text-slate-800">{totalBlogs}</span>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-emerald-600">Published</span>
            <span className="text-base font-black text-emerald-700">{publishedCount}</span>
          </div>
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-amber-600">Drafts</span>
            <span className="text-base font-black text-amber-700">{draftCount}</span>
          </div>
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-indigo-600">Total Views</span>
            <span className="text-base font-black text-indigo-700">{totalViews.toLocaleString('en-US')}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBlog(null);
              setIsAddingBlog(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#c92127] hover:bg-[#b91c1c] text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Blog</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article title or author..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({totalBlogs})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'published' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Published ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'draft' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Category:</span>
          {['All', ...DEFAULT_BLOG_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Blogs Cards List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#c92127] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading blog articles...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No blog articles found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No articles match your current filter. Click the button below to write a new post.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingBlog(null);
              setIsAddingBlog(true);
            }}
            className="px-4 py-2 bg-[#c92127] text-white text-xs font-bold rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Image with Badges */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={b.image_url || '/splashjet_images/about-splashjet.jpg'}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                      {b.category}
                    </span>
                    {b.featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(b)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-xs cursor-pointer transition-all shadow-xs ${
                      b.is_published
                        ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                        : 'bg-amber-500/90 text-white hover:bg-amber-600'
                    }`}
                    title="Click to toggle publish status"
                  >
                    {b.is_published ? '✓ Published' : '○ Draft'}
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {b.read_time || '5 min read'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      <Eye className="w-3 h-3" />
                      {(Number(b.views_count) || 0).toLocaleString()} views
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 group-hover:text-[#c92127] transition-colors leading-snug">
                    {b.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {b.summary || b.content?.slice(0, 120)}
                  </p>

                  {/* Tag Chips */}
                  {Array.isArray(b.tags) && b.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {b.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Toolbar */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`/blog/${b.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Page</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingBlog(b)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#c92127] hover:border-[#c92127] transition-colors cursor-pointer"
                    title="Edit Full Page"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBlog(b.id, b.title)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
