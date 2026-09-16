import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Phone,
  Layers,
  Sparkles,
  Image as ImageIcon,
  FileText,
  SlidersHorizontal,
  FolderPlus,
  X,
  Tag,
  ShieldCheck,
  Check,
  Zap,
  HelpCircle,
  Copy,
  Printer,
  Copy as CopyIcon,
  Droplets,
  AlertCircle
} from 'lucide-react';
import ImagePickerField from './ImagePickerField';
import CategoryFormModal from './modals/CategoryFormModal';
import { CATEGORY_DEFAULT_IMAGES } from './adminConstants';
import { getCategoriesTree, saveCategory, getAvailableCategories } from '../../lib/categoryService';
import { uploadProductImage } from '../../lib/supabaseClient';

// Quick Brand suggestions
const POPULAR_BRANDS = [
  'Epson', 'Canon', 'Brother', 'HP', 'Toshiba', 'Splashjet', 'Xprinter', 'Sunmi', 'Pantum'
];

// Pre-configured Specification Templates
const SPEC_TEMPLATES = {
  printer: [
    { key: 'Functions', value: 'Print, Scan, Copy' },
    { key: 'Printer Type', value: 'Ink Tank / Multi-function' },
    { key: 'Print Speed', value: 'Up to 33 ppm (Black) / 15 ppm (Color)' },
    { key: 'Print Resolution', value: '5760 x 1440 dpi' },
    { key: 'Duplex Printing', value: 'Yes (Manual / Auto)' },
    { key: 'Connectivity', value: 'USB 2.0, Wi-Fi, Wi-Fi Direct' },
    { key: 'Paper Sizes', value: 'A4, Letter, Legal, Envelopes' },
    { key: 'Warranty', value: '1 Year Official Warranty' }
  ],
  photocopier: [
    { key: 'Machine Type', value: 'Monochrome / Color Multifunction Photocopier' },
    { key: 'Copy / Print Speed', value: '25 to 30 Pages / Minute' },
    { key: 'Warm-up Time', value: 'Approx. 15 Seconds' },
    { key: 'Paper Capacity', value: 'Standard: 350 Sheets, Max: 600 Sheets' },
    { key: 'Zoom Range', value: '25% to 400%' },
    { key: 'Memory / Storage', value: '4 GB RAM + 128 GB SSD' },
    { key: 'Toner Model', value: 'Original High Yield Toner' }
  ],
  splashjet: [
    { key: 'Ink Type', value: 'Dye / Pigment / Sublimation' },
    { key: 'Bottle Volume', value: '70ml / 100ml / 1000ml' },
    { key: 'Compatible Brands', value: 'Epson EcoTank Series' },
    { key: 'Color Options', value: 'Black, Cyan, Magenta, Yellow' },
    { key: 'Shelf Life', value: '24 Months' },
    { key: 'Origin', value: 'Splashjet Premium Quality' }
  ]
};

export default function ProductEditorView({
  product = null, // if null -> add new, if object -> edit mode
  allProducts = [],
  onClose,
  onSaveProduct
}) {
  const isEditing = Boolean(product && product.id);

  // Dynamic Categories Tree State
  const [categoriesTree, setCategoriesTree] = useState(() => getCategoriesTree(allProducts));
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalParentId, setModalParentId] = useState(null);
  const [editingCategoryData, setEditingCategoryData] = useState(null);

  // Derive available active categories
  const availableCategories = categoriesTree
    .filter(c => !c.hidden)
    .map(c => c.name);

  // Derive current category object and its subcategories
  const selectedParentCat = categoriesTree.find(
    c => (c.name || '').toLowerCase() === (form.category || '').toLowerCase() || c.id === form.category || c.slug === form.category
  );
  const availableSubcategories = (selectedParentCat?.subcategories || []).filter(s => !s.hidden);

  // Main Product Form State
  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    category: product?.category || 'Printers',
    sub_category: product?.sub_category || '',
    brand: product?.brand || 'Epson',
    regular_price: product?.regular_price ?? 0,
    sale_price: product?.sale_price ?? 0,
    discount_label: product?.discount_label || '',
    call_for_price: Boolean(product?.call_for_price),
    stock_quantity: product?.stock_quantity ?? 25,
    stock_status: product?.stock_status || 'instock', // 'instock' | 'lowstock' | 'outofstock' | 'preorder'
    image_url: product?.image_url || CATEGORY_DEFAULT_IMAGES['Printers'] || '',
    gallery_images: Array.isArray(product?.gallery_images) ? product.gallery_images : [],
    short_description: product?.short_description || '',
    description: product?.description || '',
    sku: product?.sku || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
    is_featured: product?.is_featured ?? false,
    warranty_badge: product?.warranty_badge || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
  });

  // Specifications state: Array of { key, value }
  const [specsList, setSpecsList] = useState(() => {
    if (product?.specifications && typeof product.specifications === 'object') {
      return Object.entries(product.specifications).map(([key, value]) => ({
        key,
        value: String(value)
      }));
    }
    return SPEC_TEMPLATES.printer; // Default starter specs
  });

  // Key Highlights / Feature Bullets
  const [keyFeatures, setKeyFeatures] = useState(() => {
    if (Array.isArray(product?.key_features) && product.key_features.length > 0) {
      return product.key_features;
    }
    return [
      '১০০% অফিসিয়াল অথেনটিক পণ্য',
      '১ বছরের ফ্রি সার্ভিসিং ও টেকনিক্যাল সাপোর্ট',
      'সারাদেশে দ্রুত হোম ডেলিভারি সুবিধা'
    ];
  });
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Gallery URL input
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Listen to category updates
  useEffect(() => {
    const handleCatUpdate = () => {
      setCategoriesTree(getCategoriesTree(allProducts));
    };
    window.addEventListener('ct_categories_updated', handleCatUpdate);
    return () => window.removeEventListener('ct_categories_updated', handleCatUpdate);
  }, [allProducts]);

  // Auto-generate slug when title changes (in add mode)
  const handleTitleChange = (val) => {
    setForm(prev => {
      const updates = { title: val };
      if (!isEditing || !prev.slug) {
        updates.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  // Open modal for new parent category
  const handleOpenNewCategoryModal = () => {
    setEditingCategoryData(null);
    setModalParentId(null);
    setShowCategoryModal(true);
  };

  // Open modal for new subcategory under current parent
  const handleOpenNewSubCategoryModal = () => {
    setEditingCategoryData(null);
    setModalParentId(selectedParentCat?.id || form.category);
    setShowCategoryModal(true);
  };

  // Handle saving new category or subcategory from modal
  const handleSaveCategoryModal = async (formData) => {
    try {
      const updatedTree = await saveCategory(formData, formData.parentId, formData.id);
      setCategoriesTree(updatedTree);
      if (formData.parentId) {
        setForm(prev => ({ ...prev, sub_category: formData.name }));
      } else {
        setForm(prev => ({
          ...prev,
          category: formData.name,
          image_url: formData.image || CATEGORY_DEFAULT_IMAGES[formData.name] || prev.image_url
        }));
      }
      setShowCategoryModal(false);
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    }
  };

  // Specifications management
  const handleAddSpecRow = () => {
    setSpecsList(prev => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpecRow = (index, field, val) => {
    setSpecsList(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleRemoveSpecRow = (index) => {
    setSpecsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadSpecTemplate = (templateKey) => {
    const template = SPEC_TEMPLATES[templateKey];
    if (template) {
      if (specsList.length > 0 && !window.confirm('বর্তমান স্পেসিফিকেশন তালিকাটি এই টেমপ্লেট দিয়ে প্রতিস্থাপন করতে চান?')) {
        return;
      }
      setSpecsList(template);
    }
  };

  // Key Features Management
  const handleAddKeyFeature = () => {
    if (!newFeatureInput.trim()) return;
    setKeyFeatures(prev => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveKeyFeature = (idx) => {
    setKeyFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  // Gallery Images Management
  const handleAddGalleryUrl = () => {
    if (!newGalleryUrlInput.trim()) return;
    setForm(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, newGalleryUrlInput.trim()]
    }));
    setNewGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (idx) => {
    setForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx)
    }));
  };

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setForm(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, url]
        }));
      }
    } catch (err) {
      alert('Gallery upload failed: ' + err.message);
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Main Image Upload
  const handleMainImageChange = async (fileOrUrl) => {
    if (typeof fileOrUrl === 'string') {
      setForm(prev => ({ ...prev, image_url: fileOrUrl }));
      return;
    }

    setIsUploadingMainImage(true);
    try {
      const url = await uploadProductImage(fileOrUrl);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert('Upload notice: ' + err.message);
      const localPreview = URL.createObjectURL(fileOrUrl);
      setForm(prev => ({ ...prev, image_url: localPreview }));
    } finally {
      setIsUploadingMainImage(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!form.title.trim()) {
      setValidationError('দয়া করে প্রোডাক্টের নাম লিখুন (Product Title is required)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!form.call_for_price && (!form.regular_price && !form.sale_price)) {
      setValidationError('দয়া করে প্রোডাক্টের মূল্য নির্ধারণ করুন অথবা "Call for Price" চালু করুন।');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const reg = Number(form.regular_price) || 0;
      const sale = Number(form.sale_price) || reg;
      let calculatedDiscount = form.discount_label;
      if (!calculatedDiscount && reg > sale && !form.call_for_price) {
        const pct = Math.round(((reg - sale) / reg) * 100);
        calculatedDiscount = `-${pct}%`;
      }

      // Convert specs array back to clean key-value object
      const specificationsObj = {};
      specsList.forEach(item => {
        if (item.key.trim()) {
          specificationsObj[item.key.trim()] = item.value.trim();
        }
      });

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: form.category,
        sub_category: form.sub_category.trim(),
        brand: form.brand.trim() || 'Corporate Tech',
        regular_price: form.call_for_price ? 0 : reg,
        sale_price: form.call_for_price ? 0 : sale,
        discount_label: form.call_for_price ? null : calculatedDiscount || null,
        call_for_price: Boolean(form.call_for_price),
        stock_quantity: Number(form.stock_quantity) || 0,
        stock_status: form.stock_status,
        image_url: form.image_url || CATEGORY_DEFAULT_IMAGES[form.category] || CATEGORY_DEFAULT_IMAGES['Printers'],
        gallery_images: form.gallery_images.length > 0 ? form.gallery_images : (form.image_url ? [form.image_url] : []),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        sku: form.sku.trim() || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
        is_featured: form.is_featured,
        warranty_badge: form.warranty_badge.trim(),
        specifications: specificationsObj,
        key_features: keyFeatures.filter(f => f.trim())
      };

      await onSaveProduct(payload, product?.id);
      setSaveSuccessMsg(isEditing ? 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!' : 'নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              title="ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">পণ্য তালিকায় ফিরে যান</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isEditing ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট তৈরি করুন'}
                </h1>
                {form.call_for_price && (
                  <span className="bg-red-50 text-[#c92127] border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> Call for Price
                  </span>
                )}
                {form.is_featured && (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Featured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-md hidden sm:block">
                {isEditing ? `SKU: ${form.sku} | ${form.title}` : 'ক্যাটালগে নতুন পণ্য যোগ করতে বিস্তারিত তথ্য ও স্পেসিফিকেশন ডিজাইন করুন'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] active:scale-98 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'আপডেট সংরক্ষণ করুন' : 'প্রোডাক্ট সেভ করুন'}</span>
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

      {/* 2. MAIN FORM WORKSPACE (2 Columns: Content on Left, Media & Status on Right) */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================================================================ */}
        {/* LEFT COLUMN: Main Product Details & Specs (8 cols) */}
        {/* ================================================================ */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <span className="p-2 rounded-xl bg-slate-900 text-white">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  সাধারণ তথ্য (Basic Information)
                </h2>
                <p className="text-xs text-slate-400">প্রোডাক্টের নাম, ব্র্যান্ড ও ক্যাটাগরি নির্ধারণ করুন</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                প্রোডাক্টের শিরোনাম (Product Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="যেমন: Epson EcoTank L3250 A4 Wi-Fi All-in-One Ink Tank Printer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all"
              />
            </div>

            {/* Custom URL Slug & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL স্লাগ (Product URL Slug)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="epson-ecotank-l3250-printer"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 focus:bg-white focus:border-[#c92127] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মডেল কোড / SKU
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="CT-4821"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sku: `CT-${Math.floor(1000 + Math.random() * 9000)}` })}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                    title="নতুন SKU তৈরি করুন"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            {/* Category with Inline New Category & Subcategory Creator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    ক্যাটাগরি (Category) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenNewCategoryModal}
                    className="text-[11px] text-[#c92127] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus className="w-3 h-3" />
                    + নতুন ক্যাটাগরি তৈরি
                  </button>
                </div>

                <select
                  value={form.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const matchedCat = categoriesTree.find(c => (c.name || '').toLowerCase() === newCat.toLowerCase());
                    const firstSub = matchedCat?.subcategories?.find(s => !s.hidden)?.name || '';
                    setForm({
                      ...form,
                      category: newCat,
                      sub_category: firstSub || form.sub_category,
                      image_url: matchedCat?.image || CATEGORY_DEFAULT_IMAGES[newCat] || form.image_url
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    সাব-ক্যাটাগরি (Sub-Category)
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenNewSubCategoryModal}
                    className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    + নতুন সাব-ক্যাটাগরি
                  </button>
                </div>

                {availableSubcategories.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={form.sub_category}
                      onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                    >
                      <option value="">-- সাব-ক্যাটাগরি নির্বাচন করুন --</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id || sub.slug} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.sub_category}
                    onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                    placeholder="যেমন: Ink Tank Printers, Refill Ink, etc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none"
                  />
                )}
              </div>
            </div>

            {/* Brand with Quick Pills */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ব্র্যান্ড (Brand)
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Epson, Canon, Brother..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">জনপ্রিয় ব্র্যান্ড:</span>
                {POPULAR_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setForm({ ...form, brand: b })}
                    className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      form.brand.toLowerCase() === b.toLowerCase()
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Card 2: Pricing & "Call for Price" Mode */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-50 text-[#c92127]">
                  <Tag className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    মূল্য ও কল ফর প্রাইস (Pricing & Valuation)
                  </h2>
                  <p className="text-xs text-slate-400">দাম নির্ধারণ করুন অথবা সরাসরি ফোনে কথা বলার সুবিধা চালু করুন</p>
                </div>
              </div>

              {/* CALL FOR PRICE TOGGLE BUTTON */}
              <label className="flex items-center gap-2.5 cursor-pointer bg-red-50/70 border border-red-200 px-3.5 py-1.5 rounded-2xl">
                <input
                  type="checkbox"
                  checked={form.call_for_price}
                  onChange={(e) => setForm({ ...form, call_for_price: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-xs font-black text-[#c92127] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  Call for Price (মূল্যের জন্য কল করুন)
                </span>
              </label>
            </div>

            {form.call_for_price ? (
              /* When Call for Price is Active */
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>"Call for Price" সক্রিয় রয়েছে</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  এই প্রোডাক্টে ওয়েবসাইটে কোনো ফিক্সড মূল্য দেখানো হবে না। প্রোডাক্ট কার্ড ও ডিটেইলস পেজে লাল রঙের 
                  <strong> "মূল্যের জন্য কল করুন"</strong> ব্যাজ প্রদর্শিত হবে এবং ক্রেতা সরাসরি আপনার নাম্বারে কল বা হোয়াটসঅ্যাপ করতে পারবেন।
                </p>
              </div>
            ) : (
              /* Standard Regular & Sale Price Inputs */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    নিয়মিত মূল্য (Regular MRP) ৳
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.regular_price}
                    onChange={(e) => setForm({ ...form, regular_price: e.target.value })}
                    placeholder="25000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    বিক্রয় মূল্য (Offer Price) ৳
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    placeholder="23500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-[#c92127] focus:bg-white focus:border-[#c92127] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ডিসকাউন্ট ব্যাজ লেবেল (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={form.discount_label}
                    onChange={(e) => setForm({ ...form, discount_label: e.target.value })}
                    placeholder="যেমন: -6%, Hot Deal, Sale!"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Key Features & Bullet Highlights */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    প্রধান সুবিধাসমূহ (Key Highlights)
                  </h2>
                  <p className="text-xs text-slate-400">প্রোডাক্টের মূল আকর্ষনীয় পয়েন্টগুলো পয়েন্ট আকারে যোগ করুন</p>
                </div>
              </div>
            </div>

            {/* Add Feature input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyFeature())}
                placeholder="যেমন: আল্ট্রা-হাই ইল্ড ইনক বোতল (৪,৫০০ পেজ ব্ল্যাক প্রিন্ট)"
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none"
              />
              <button
                type="button"
                onClick={handleAddKeyFeature}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                যোগ করুন
              </button>
            </div>

            {/* List of features */}
            <div className="space-y-2 pt-1">
              {keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs text-slate-800 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c92127]" />
                    <span className="font-medium">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyFeature(idx)}
                    className="text-slate-400 hover:text-red-600 p-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Technical Specifications Builder (DYNAMIC) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <SlidersHorizontal className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    টেকনিক্যাল স্পেসিফিকেশন ডিজাইনার (Specifications Builder)
                  </h2>
                  <p className="text-xs text-slate-400">এডমিন নিজের ইচ্ছেমতো স্পেসিফিকেশন সারি যোগ ও এডিট করতে পারবেন</p>
                </div>
              </div>

              {/* Template quick loaders */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">টেমপ্লেট:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('printer')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-[#c92127]" />
                  প্রিন্টার
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('photocopier')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CopyIcon className="w-3 h-3 text-blue-600" />
                  ফটোকপিয়ার
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('splashjet')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-3 h-3 text-emerald-600" />
                  কালি
                </button>
              </div>
            </div>

            {/* Specs Table */}
            <div className="space-y-2.5">
              {specsList.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpecRow(idx, 'key', e.target.value)}
                    placeholder="স্পেসিফিকেশন নাম (যেমন: Print Speed)"
                    className="w-1/3 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpecRow(idx, 'value', e.target.value)}
                    placeholder="মান (যেমন: 33 ppm Black / 15 ppm Color)"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSpecRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c92127] hover:underline cursor-pointer pt-2"
            >
              <Plus className="w-4 h-4" />
              + আরও স্পেসিফিকেশন সারি যোগ করুন
            </button>
          </div>

          {/* Card 5: Detailed Description */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  বিস্তারিত বর্ণনা (Product Description)
                </h2>
                <p className="text-xs text-slate-400">প্রোডাক্টের প্যারাগ্রাফ বর্ণনা ও অতিরিক্ত টেক্সট</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সংক্ষিপ্ত বিবরণ (Short Summary - প্রোডাক্ট ইমেজের পাশে দেখাবে)
              </label>
              <textarea
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="প্রোডাক্ট সম্পর্কে ২-৩ লাইনের মূল আকর্ষণ..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                পূর্ণাঙ্গ বিবরণ (Full Long Description)
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="প্রোডাক্টের বিস্তারিত তথ্য, ব্যবহারের নিয়ম, অফিসিয়াল ওয়ারেন্টি ও আফটার সেলস সার্ভিস সম্পর্কে লিখুন..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none font-mono"
              />
            </div>
          </div>

        </div>

        {/* ================================================================ */}
        {/* RIGHT COLUMN: Media, Status, Gallery & Actions (4 cols) */}
        {/* ================================================================ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Visibility & Stock Status */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3">
              ইনভেন্টরি ও স্ট্যাটাস
            </h3>

            {/* Featured Switch */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 cursor-pointer">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 fill-current" />
                <span className="text-xs font-bold text-slate-800">ফিচারড প্রোডাক্ট (Homepage)</span>
              </div>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="accent-[#c92127] w-4 h-4 rounded"
              />
            </label>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                স্টক সংখ্যা (Stock Quantity)
              </label>
              <input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
              />
            </div>

            {/* Stock Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                স্টক অবস্থা (Availability Status)
              </label>
              <select
                value={form.stock_status}
                onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
              >
                <option value="instock">ইন স্টক (In Stock)</option>
                <option value="lowstock">স্টক সীমিত (Low Stock)</option>
                <option value="outofstock">স্টক শেষ (Out of Stock / Sold Out)</option>
                <option value="preorder">প্রি-অর্ডার (Pre-Order Available)</option>
              </select>
            </div>

            {/* Warranty Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ওয়ারেন্টি টেক্সট (Warranty Badge)
              </label>
              <input
                type="text"
                value={form.warranty_badge}
                onChange={(e) => setForm({ ...form, warranty_badge: e.target.value })}
                placeholder="১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
              />
            </div>
          </div>

          {/* Card 2: Primary Featured Image */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>মূল থাম্বনেইল ছবি *</span>
              {form.image_url && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ যুক্ত আছে
                </span>
              )}
            </h3>

            <ImagePickerField
              imageUrl={form.image_url}
              onImageChange={handleMainImageChange}
              isUploading={isUploadingMainImage}
              onPresetSelect={(url) => setForm(prev => ({ ...prev, image_url: url }))}
            />
          </div>

          {/* Card 3: Multi-Image Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                অতিরিক্ত গ্যালারি ছবি ({form.gallery_images.length})
              </h3>
            </div>

            {/* Gallery Thumbnails Grid */}
            {form.gallery_images.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5">
                {form.gallery_images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group w-full aspect-square rounded-xl border border-slate-200 p-1 bg-slate-50 overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Gallery URL or Upload */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrlInput}
                  onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryUrl())}
                  placeholder="ইমেজ লিংক (URL) পেস্ট করুন..."
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#c92127] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  যোগ
                </button>
              </div>

              {/* Upload file directly to gallery */}
              <label className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-[#c92127] hover:border-[#c92127] hover:bg-red-50/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryFileUpload}
                />
                {isUploadingGallery ? (
                  <span className="text-xs text-slate-500 animate-pulse">আপলোড হচ্ছে...</span>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                  </>
                )}
              </label>
            </div>
          </div>

        </div>

      </form>

      {/* 3. MODAL: CREATE / EDIT CATEGORY OR SUBCATEGORY */}
      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        category={editingCategoryData}
        parentId={modalParentId}
        categoriesTree={categoriesTree}
        onSave={handleSaveCategoryModal}
      />

    </div>
  );
}
