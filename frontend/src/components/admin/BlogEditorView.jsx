import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  FileText,
  X,
  Tag,
  Check,
  Zap,
  HelpCircle,
  Clock,
  Eye,
  Calendar,
  Layers,
  Layout,
  Smartphone,
  Monitor,
  CheckCircle2,
  Package,
  Share2,
  MessageCircle,
  PhoneCall,
  Copy,
  FolderTree,
  AlertCircle
} from 'lucide-react';
import ImagePickerField from './ImagePickerField';
import { uploadProductImage } from '../../lib/supabaseClient';
import { DEFAULT_BLOG_CATEGORIES } from '../../lib/blogService';
import ProductCard from '../ProductCard';

export default function BlogEditorView({
  blog = null, // if null -> add new, if object -> edit mode
  products = [],
  onClose,
  onSaveBlog
}) {
  const isEditing = Boolean(blog && blog.id);

  // Main Form State
  const [form, setForm] = useState({
    title: blog?.title || '',
    slug: blog?.slug || '',
    category: blog?.category || 'Printer Maintenance',
    author: blog?.author || 'Corporate Tech Support Team',
    read_time: blog?.read_time || '5 min read',
    image_url: blog?.image_url || '/splashjet_images/about-splashjet.jpg',
    summary: blog?.summary || '',
    content: blog?.content || `## Introduction
Provide an engaging overview and background of the topic here.

### Key Highlights & Best Practices:
1. First essential tip or step
2. Second essential tip or step
3. Regular maintenance and care

> **Pro Tip:** For technical assistance, contact our specialized Corporate Tech support team.`,
    tags: Array.isArray(blog?.tags) && blog.tags.length > 0 ? blog.tags : ['Printer', 'Tech Guide', 'Maintenance'],
    is_published: Boolean(blog?.is_published ?? true),
    featured: Boolean(blog?.featured ?? false),
    related_product_ids: Array.isArray(blog?.related_product_ids) ? blog.related_product_ids : []
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm(prev => ({
      ...prev,
      title: val,
      slug: !isEditing || prev.slug === '' ? slugified : prev.slug
    }));
  };

  // Tag Management
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tToRemove)
    }));
  };

  // Image Upload
  const handleImageUpload = async (fileOrUrl) => {
    if (typeof fileOrUrl === 'string') {
      setForm(prev => ({ ...prev, image_url: fileOrUrl }));
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadProductImage(fileOrUrl);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Quick Formatting Helpers
  const insertSnippet = (snippet) => {
    setForm(prev => ({
      ...prev,
      content: (prev.content ? prev.content + '\n\n' : '') + snippet
    }));
  };

  // Form Submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    if (!form.title.trim()) {
      setValidationError('Please enter an Article Title');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || `post-${Date.now()}`
      };

      await onSaveBlog(payload, blog?.id);
      setSaveSuccessMsg(isEditing ? 'Blog post updated successfully!' : 'New blog post published successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      alert('Failed to save blog post: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Render Formatted Content in Live Preview
  const renderPreviewContent = (rawText) => {
    if (!rawText) return <p className="text-slate-400 italic">Article content will appear here...</p>;
    const blocks = rawText.split(/\n\s*\n/);

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base sm:text-lg font-black text-slate-900 mt-5 mb-2.5">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm sm:text-base font-bold text-slate-900 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('> ')) {
        const text = trimmed.replace(/^>\s*/gm, '');
        return (
          <div key={idx} className="my-3 p-3.5 rounded-xl bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pro Tip</span>
            </div>
            <p className="leading-relaxed">{text.replace('**Pro Tip:**', '').trim()}</p>
          </div>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="my-2.5 space-y-1.5 text-xs text-slate-700">
            {lines.map((l, lIdx) => (
              <li key={lIdx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{l.replace(/^\d+\.\s*|^[-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-2">
          {trimmed}
        </p>
      );
    });
  };

  // Find linked related products
  const selectedProducts = (form.related_product_ids || [])
    .map(id => products.find(p => String(p.id) === String(id)))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 text-slate-900">
      
      {/* 1. TOP STICKY APP BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Blog List</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isEditing ? 'Edit Blog Post' : 'Write New Blog Post'}
                </h1>
                {form.is_published ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" /> Published Live
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Draft
                  </span>
                )}
                {form.featured && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 fill-current" /> Featured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-md hidden sm:block">
                {form.title ? form.title : 'Publish tech guides, insights, and customer tutorials'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 sm:px-6 py-2 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] active:scale-98 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Validation Error Notification */}
      {validationError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <form onSubmit={handleSubmit} className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 pt-6 flex flex-col lg:flex-row items-start gap-8">
        
        {/* ================================================================ */}
        {/* LEFT COLUMN: All Writer Controls, Content, Image, Tags */}
        {/* ================================================================ */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          
          {/* Card 1: Article Title & Essential Meta */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-[#c92127]" />
              <span>Article Title & Essential Meta</span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 5 Essential Tips to Keep Your Printer Head Clean & Long-Lasting"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-black text-slate-900 focus:bg-white focus:border-[#c92127] outline-none transition-colors"
              />
            </div>

            {/* Slug, Category, Author, Read Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* URL Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Slug (SEO Friendly Link)
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#c92127]">
                  <span className="text-xs text-slate-400 font-mono select-none">/blog/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="printer-head-care-tips"
                    className="w-full bg-transparent text-xs font-mono text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                >
                  {DEFAULT_BLOG_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Corporate Tech Support Team"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Read Time
                </label>
                <input
                  type="text"
                  value={form.read_time}
                  onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                  placeholder="5 min read"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                />
              </div>

            </div>

            {/* Short Summary Excerpt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Short Summary / Preview Snippet
              </label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="2-3 sentence overview for blog cards and search engine meta description..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 focus:bg-white focus:border-[#c92127] outline-none leading-relaxed"
              />
            </div>

          </div>

          {/* Card 2: Featured Banner Image */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-[#c92127]" />
                <span>Featured Banner Image</span>
              </div>
              {form.image_url && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Image Set
                </span>
              )}
            </div>

            <ImagePickerField
              imageUrl={form.image_url}
              onImageChange={handleImageUpload}
              isUploading={isUploadingImage}
              onPresetSelect={(url) => setForm(prev => ({ ...prev, image_url: url }))}
            />
          </div>

          {/* Card 3: Full Article Content Editor & Quick Formatter */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#c92127]" />
                <span>Full Article Body (Markdown Supported) *</span>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Toolbar:</span>
                <button
                  type="button"
                  onClick={() => insertSnippet('## New Section Heading')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] cursor-pointer"
                  title="Insert H2 Heading"
                >
                  H2 Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('### Sub-Section Heading')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] cursor-pointer"
                  title="Insert H3 Subheading"
                >
                  H3 Subheading
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('> **Pro Tip:** Write actionable advice or important notice here.')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[10px] cursor-pointer flex items-center gap-1"
                  title="Insert Highlighted Pro Tip Box"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Pro Tip Box</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet('1. Step One\n2. Step Two\n3. Step Three')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] cursor-pointer"
                  title="Insert Ordered List"
                >
                  List (1, 2, 3)
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the full article body with paragraphs, headlines, bullet lists, and guides..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-[#c92127] outline-none leading-relaxed"
            />
          </div>

          {/* Card 4: Tags & Related Products Picker */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
            
            {/* Tags Manager */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-[#c92127]" />
                <span>Article Tags</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g. Splashjet, EcoTank, Inkjet, Maintenance..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#c92127] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Add Tag
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 text-[#c92127] text-xs font-bold border border-red-200 shadow-2xs"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Related Products Picker */}
            {products.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Package className="w-4 h-4 text-[#c92127]" />
                    <span>Featured Related Products ({form.related_product_ids.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Customers can directly buy these items beneath the article</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {products.slice(0, 20).map((p) => {
                    const isSelected = form.related_product_ids.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-red-50/80 border-red-300 text-[#c92127] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({ ...prev, related_product_ids: [...prev.related_product_ids, p.id] }));
                              } else {
                                setForm(prev => ({ ...prev, related_product_ids: prev.related_product_ids.filter(id => id !== p.id) }));
                              }
                            }}
                            className="accent-[#c92127] w-4 h-4 rounded"
                          />
                          <span className="truncate font-semibold">{p.title}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0 ml-2 font-mono">
                          ৳{(p.sale_price || p.regular_price)?.toLocaleString()}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visibility & Status Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4 rounded"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Publish Live</span>
                  <span className="text-[11px] text-slate-500">Uncheck to save as an unpublished Draft</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4 rounded"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Pin as Featured Guide</span>
                  <span className="text-[11px] text-slate-500">Highlights this article at the top of the blog page</span>
                </div>
              </label>
            </div>

          </div>

        </div>

        {/* ================================================================ */}
        {/* RIGHT COLUMN: Real-Time Interactive Live Article Reader & Preview */}
        {/* ================================================================ */}
        <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0 sticky top-20 space-y-4">
          
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            
            {/* Header with Device Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">Live Reader Preview</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Screen Box */}
            <div className="bg-slate-100 p-3.5 sm:p-4 rounded-2xl border border-slate-700/60 max-h-[580px] overflow-y-auto">
              <div className={`mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 text-slate-900 shadow-xs space-y-3 transition-all ${
                previewDevice === 'mobile' ? 'max-w-[280px]' : 'w-full'
              }`}>
                
                {/* Category & Read Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#c92127] text-[10px] font-black uppercase tracking-wider">
                    {form.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{form.read_time}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {form.title || 'Your Article Title will appear here...'}
                </h2>

                {/* Author Info */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium pb-2 border-b border-slate-100">
                  <span>Author: <strong>{form.author}</strong></span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {/* Banner Image */}
                {form.image_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={form.image_url}
                      alt="Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                    />
                  </div>
                )}

                {/* Summary Quote */}
                {form.summary && (
                  <div className="p-2.5 bg-slate-50 border-l-3 border-[#c92127] rounded-lg text-[11px] italic text-slate-700 leading-relaxed">
                    "{form.summary}"
                  </div>
                )}

                {/* Article Content Rendered */}
                <div className="pt-2 text-slate-800 leading-relaxed">
                  {renderPreviewContent(form.content)}
                </div>

                {/* Related Products in Preview */}
                {selectedProducts.length > 0 && (
                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Related Products:</span>
                    <div className="space-y-1.5">
                      {selectedProducts.slice(0, 2).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[10px]">
                          <span className="truncate font-semibold text-slate-800">{p.title}</span>
                          <span className="font-bold text-[#c92127] shrink-0 ml-2">৳{(p.sale_price || p.regular_price)?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer Badge */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matches live website layout
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Live Preview</span>
            </div>

          </div>

        </div>

      </form>

    </div>
  );
}
