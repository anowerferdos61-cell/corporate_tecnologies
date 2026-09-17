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
  AlertCircle,
  Eye,
  ExternalLink,
  Maximize2,
  ShoppingCart,
  Truck,
  Star,
  CheckCircle2,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Award
} from 'lucide-react';
import ProductCard from '../ProductCard';
import ImagePickerField from './ImagePickerField';
import CategoryFormModal from './modals/CategoryFormModal';
import { CATEGORY_DEFAULT_IMAGES } from './adminConstants';
import { getCategoriesTree, saveCategory, getAvailableCategories } from '../../lib/categoryService';
import { uploadProductImage } from '../../lib/supabaseClient';
import { fetchShippingTiers } from '../../lib/shippingService';

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

  // Initial price mode determination
  const initialPriceMode = product?.call_for_price
    ? 'call'
    : product?.price_range_label
      ? 'range'
      : 'fixed';

  let initMin = '';
  let initMax = '';
  if (product?.price_range_label) {
    const matches = String(product.price_range_label).match(/\d[\d,]*/g);
    if (matches && matches.length >= 2) {
      initMin = matches[0].replace(/,/g, '');
      initMax = matches[1].replace(/,/g, '');
    } else if (product.sale_price || product.regular_price) {
      initMin = product.sale_price || '';
      initMax = product.regular_price || '';
    }
  }

  const initialDiscountPct = (Number(product?.regular_price) > Number(product?.sale_price) && Number(product?.sale_price) > 0)
    ? String(Math.round(((Number(product.regular_price) - Number(product.sale_price)) / Number(product.regular_price)) * 100))
    : '';

  // Main Product Form State
  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    category: product?.category || 'Printers',
    sub_category: product?.sub_category || '',
    brand: product?.brand || 'Epson',
    price_mode: initialPriceMode, // 'fixed' | 'range' | 'call'
    regular_price: product?.regular_price ?? 0,
    sale_price: product?.sale_price ?? 0,
    discount_percent: initialDiscountPct,
    min_price: initMin,
    max_price: initMax,
    price_range_label: product?.price_range_label || '',
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
    warranty_badge: product?.warranty_badge || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি',
    shipping_tier_id: product?.shipping_tier_id || '',
    is_free_delivery: Boolean(product?.is_free_delivery),
    // Card Customization Options
    badge_text: product?.badge_text || '',
    badge_color: product?.badge_color || 'red',
    badge_position: product?.badge_position || 'left',
    card_border: product?.card_border || 'default',
    card_btn_text: product?.card_btn_text || 'View Details',
    show_brand_badge: Boolean(product?.show_brand_badge ?? true),
    show_rating: Boolean(product?.show_rating ?? false),
    rating_score: product?.rating_score || '4.9',
    show_stock_badge: Boolean(product?.show_stock_badge ?? false)
  });

  // Shipping tiers list state
  const [shippingTiersList, setShippingTiersList] = useState([]);

  useEffect(() => {
    fetchShippingTiers().then(tiers => {
      if (tiers) setShippingTiersList(tiers);
    }).catch(() => {});
  }, []);

  // Preview options state
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  // Derive available active categories
  const availableCategories = categoriesTree
    .filter(c => !c.hidden)
    .map(c => c.name);

  // Derive current category object and its subcategories
  const selectedParentCat = categoriesTree.find(
    c => (c.name || '').toLowerCase() === (form.category || '').toLowerCase() || c.id === form.category || c.slug === form.category
  );
  const availableSubcategories = (selectedParentCat?.subcategories || []).filter(s => !s.hidden);

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
    window.addEventListener('storage', handleCatUpdate);
    return () => {
      window.removeEventListener('ct_categories_updated', handleCatUpdate);
      window.removeEventListener('storage', handleCatUpdate);
    };
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
      const effectiveParentId = formData.parentId || null;
      const updatedTree = await saveCategory(formData, effectiveParentId, editingCategoryData?.id || null);
      setCategoriesTree(updatedTree);
      if (effectiveParentId) {
        setForm(prev => ({ ...prev, sub_category: formData.name }));
      } else {
        setForm(prev => ({
          ...prev,
          category: formData.name,
          sub_category: '',
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

    if (form.price_mode === 'fixed') {
      const reg = Number(form.regular_price) || 0;
      const sale = Number(form.sale_price) || 0;
      if (!reg && !sale) {
        setValidationError('দয়া করে প্রোডাক্টের ফিক্সড মূল্য নির্ধারণ করুন অথবা মূল্য পরিসীমা (Price Range) বা Call for Price বেছে নিন।');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (form.price_mode === 'range') {
      if (!form.price_range_label?.trim() && !form.min_price && !form.max_price) {
        setValidationError('দয়া করে প্রোডাক্টের মূল্য পরিসীমা (Price Range) নির্ধারণ করুন (যেমন: ৳১০,০০০ - ৳১২,০০০)।');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const isCall = form.price_mode === 'call';
      const isRange = form.price_mode === 'range';
      
      let finalRegularPrice = 0;
      let finalSalePrice = 0;
      let finalPriceRangeLabel = null;
      let finalDiscountLabel = null;

      if (isCall) {
        finalRegularPrice = 0;
        finalSalePrice = 0;
        finalPriceRangeLabel = null;
        finalDiscountLabel = null;
      } else if (isRange) {
        const minVal = Number(form.min_price) || 0;
        const maxVal = Number(form.max_price) || minVal;
        finalSalePrice = minVal;
        finalRegularPrice = maxVal;
        finalPriceRangeLabel = form.price_range_label?.trim() || (minVal > 0 && maxVal > 0 ? `৳${minVal.toLocaleString('en-US')} - ৳${maxVal.toLocaleString('en-US')}` : (minVal > 0 ? `৳${minVal.toLocaleString('en-US')}+` : null));
        finalDiscountLabel = form.discount_label?.trim() || null;
      } else {
        const reg = Number(form.regular_price) || 0;
        const sale = Number(form.sale_price) || reg;
        finalRegularPrice = reg;
        finalSalePrice = sale;
        finalPriceRangeLabel = null;
        let calculatedDiscount = form.discount_label;
        if (!calculatedDiscount && reg > sale) {
          const pct = Math.round(((reg - sale) / reg) * 100);
          calculatedDiscount = `-${pct}%`;
        }
        finalDiscountLabel = calculatedDiscount || null;
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
        regular_price: finalRegularPrice,
        sale_price: finalSalePrice,
        price_range_label: finalPriceRangeLabel,
        discount_label: finalDiscountLabel,
        call_for_price: isCall,
        stock_quantity: Number(form.stock_quantity) || 0,
        stock_status: form.stock_status,
        image_url: form.image_url || CATEGORY_DEFAULT_IMAGES[form.category] || CATEGORY_DEFAULT_IMAGES['Printers'],
        gallery_images: form.gallery_images.length > 0 ? form.gallery_images : (form.image_url ? [form.image_url] : []),
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        sku: form.sku.trim() || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
        is_featured: form.is_featured,
        warranty_badge: form.warranty_badge.trim(),
        shipping_tier_id: form.shipping_tier_id || null,
        is_free_delivery: Boolean(form.is_free_delivery),
        specifications: specificationsObj,
        key_features: keyFeatures.filter(f => f.trim()),
        // Card Customization Attributes
        badge_text: form.badge_text?.trim() || null,
        badge_color: form.badge_color || 'red',
        badge_position: form.badge_position || 'left',
        card_border: form.card_border || 'default',
        card_btn_text: form.card_btn_text?.trim() || 'View Details',
        show_brand_badge: form.show_brand_badge,
        show_rating: form.show_rating,
        rating_score: form.rating_score || '4.9',
        show_stock_badge: form.show_stock_badge
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

      {/* 2. MAIN FORM WORKSPACE (Left Side: All Forms & Card Design, Right Side: ONLY Live Preview) */}
      <form onSubmit={handleSubmit} className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-8 pt-6 flex flex-col lg:flex-row items-start gap-8">
        
        {/* ================================================================ */}
        {/* LEFT COLUMN: All Product Details, Images, Design & Specs */}
        {/* ================================================================ */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          
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

          {/* Card 2: Pricing & Valuation (Fixed Price, Price Range & Call for Price) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-50 text-[#c92127]">
                  <Tag className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    মূল্য ও প্রাইসিং মোড (Pricing & Valuation)
                  </h2>
                  <p className="text-xs text-slate-400">ফিক্সড মূল্য, রেঞ্জ (যেমন: ৳১০,০০০ - ৳১২,০০০) বা কল ফর প্রাইস নির্ধারণ করুন</p>
                </div>
              </div>

              {/* Price Mode Selector Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, price_mode: 'fixed', call_for_price: false }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.price_mode === 'fixed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ফিক্সড মূল্য (Fixed)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const min = form.sale_price || form.min_price || '';
                    const max = form.regular_price || form.max_price || '';
                    const autoLabel = (min && max) ? `৳${Number(min).toLocaleString('en-US')} - ৳${Number(max).toLocaleString('en-US')}` : form.price_range_label;
                    setForm(prev => ({
                      ...prev,
                      price_mode: 'range',
                      call_for_price: false,
                      min_price: min,
                      max_price: max,
                      price_range_label: autoLabel || prev.price_range_label
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    form.price_mode === 'range'
                      ? 'bg-[#c92127] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>মূল্য পরিসীমা (Range)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, price_mode: 'call', call_for_price: true }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    form.price_mode === 'call'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call for Price</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Price Range Mode */}
            {form.price_mode === 'range' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-red-900">
                  <span className="p-1.5 bg-red-100 text-[#c92127] rounded-xl flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-bold text-[#c92127] block">মূল্য পরিসীমা (Price Range) মোড সক্রিয়</span>
                    <span className="text-slate-600 text-[11px]">প্রোডাক্ট কার্ড ও ডিটেইলস পেজে "৳১০,০০০ - ৳১২,০০০" বা আপনার নির্ধারিত রেঞ্জ সরাসরি প্রদর্শিত হবে।</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Min Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      সর্বনিম্ন মূল্য (Min Price) ৳ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.min_price}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Smart detection if user types "10000-12000" in this single box
                        if (val.includes('-')) {
                          const parts = val.split('-');
                          const minClean = parts[0].replace(/[^0-9]/g, '');
                          const maxClean = parts[1].replace(/[^0-9]/g, '');
                          setForm(prev => ({
                            ...prev,
                            min_price: minClean,
                            max_price: maxClean,
                            price_range_label: (minClean && maxClean) ? `৳${Number(minClean).toLocaleString('en-US')} - ৳${Number(maxClean).toLocaleString('en-US')}` : (minClean ? `৳${Number(minClean).toLocaleString('en-US')}` : '')
                          }));
                          return;
                        }
                        const cleanNum = val.replace(/[^0-9]/g, '');
                        const max = form.max_price;
                        setForm(prev => ({
                          ...prev,
                          min_price: cleanNum,
                          price_range_label: (cleanNum && max) ? `৳${Number(cleanNum).toLocaleString('en-US')} - ৳${Number(max).toLocaleString('en-US')}` : (cleanNum ? `৳${Number(cleanNum).toLocaleString('en-US')}` : '')
                        }));
                      }}
                      placeholder="10000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      সর্বোচ্চ মূল্য (Max Price) ৳ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.max_price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const cleanNum = val.replace(/[^0-9]/g, '');
                        const min = form.min_price;
                        setForm(prev => ({
                          ...prev,
                          max_price: cleanNum,
                          price_range_label: (min && cleanNum) ? `৳${Number(min).toLocaleString('en-US')} - ৳${Number(cleanNum).toLocaleString('en-US')}` : (cleanNum ? `৳${Number(cleanNum).toLocaleString('en-US')}` : '')
                        }));
                      }}
                      placeholder="12000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                    />
                  </div>

                  {/* Formatted Display Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      প্রদর্শিত রেঞ্জ টেক্সট (Display Label)
                    </label>
                    <input
                      type="text"
                      value={form.price_range_label}
                      onChange={(e) => setForm({ ...form, price_range_label: e.target.value })}
                      placeholder="৳10,000 - ৳12,000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-[#c92127] focus:bg-white focus:border-[#c92127] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets for Price Ranges */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-bold">এক-ক্লিকে রেঞ্জ প্রিসেট:</span>
                  {[
                    { min: '300', max: '1500', label: '৳300 - ৳1,500' },
                    { min: '500', max: '3300', label: '৳500 - ৳3,300' },
                    { min: '1000', max: '5000', label: '৳1,000 - ৳5,000' },
                    { min: '5000', max: '15000', label: '৳5,000 - ৳15,000' },
                    { min: '10000', max: '25000', label: '৳10,000 - ৳25,000' },
                    { min: '25000', max: '60000', label: '৳25,000 - ৳60,000' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        min_price: preset.min,
                        max_price: preset.max,
                        price_range_label: preset.label
                      }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                        form.price_range_label === preset.label
                          ? 'bg-[#c92127] text-white border-[#c92127] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: Call for Price */}
            {form.price_mode === 'call' && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>"Call for Price" সক্রিয় রয়েছে</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  এই প্রোডাক্টে ওয়েবসাইটে কোনো ফিক্সড মূল্য বা রেঞ্জ দেখানো হবে না। প্রোডাক্ট কার্ড ও ডিটেইলস পেজে লাল রঙের 
                  <strong> "মূল্যের জন্য কল করুন"</strong> ব্যাজ প্রদর্শিত হবে এবং ক্রেতা সরাসরি আপনার নাম্বারে কল বা হোয়াটসঅ্যাপ করতে পারবেন।
                </p>
              </div>
            )}

            {/* Mode 3: Fixed Regular & Sale Price with Interactive Discount Calculator */}
            {form.price_mode === 'fixed' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Regular MRP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      নিয়মিত মূল্য (Regular MRP) ৳ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.regular_price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('-')) {
                          const parts = val.split('-');
                          const minClean = parts[0].replace(/[^0-9]/g, '');
                          const maxClean = parts[1].replace(/[^0-9]/g, '');
                          setForm(prev => ({
                            ...prev,
                            price_mode: 'range',
                            min_price: minClean,
                            max_price: maxClean,
                            price_range_label: (minClean && maxClean) ? `৳${Number(minClean).toLocaleString('en-US')} - ৳${Number(maxClean).toLocaleString('en-US')}` : (minClean ? `৳${minClean}` : '')
                          }));
                          return;
                        }
                        const cleanNum = val.replace(/[^0-9]/g, '');
                        const regVal = Number(cleanNum) || 0;
                        let newSale = form.sale_price;
                        if (form.discount_percent && regVal > 0) {
                          newSale = Math.round(regVal - (regVal * Number(form.discount_percent) / 100));
                        }
                        setForm(prev => ({
                          ...prev,
                          regular_price: cleanNum,
                          sale_price: newSale
                        }));
                      }}
                      placeholder="25000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                    />
                  </div>

                  {/* Discount Percentage Calculator Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ডিসকাউন্ট শতাংশ (Discount %)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.discount_percent}
                        onChange={(e) => {
                          const cleanPct = e.target.value.replace(/[^0-9]/g, '');
                          const pctNum = Number(cleanPct) || 0;
                          const regVal = Number(form.regular_price) || 0;
                          let newSale = form.sale_price;
                          if (regVal > 0 && pctNum > 0 && pctNum <= 100) {
                            newSale = Math.round(regVal - (regVal * pctNum / 100));
                          } else if (pctNum === 0 && regVal > 0) {
                            newSale = regVal;
                          }
                          setForm(prev => ({
                            ...prev,
                            discount_percent: cleanPct,
                            sale_price: newSale
                          }));
                        }}
                        placeholder="যেমন: 10, 15, 20..."
                        className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-emerald-700 focus:bg-white focus:border-emerald-600 outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-600 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Offer / Sale Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      বিক্রয় মূল্য (Offer Price) ৳
                    </label>
                    <input
                      type="text"
                      value={form.sale_price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes('-')) {
                          const parts = val.split('-');
                          const minClean = parts[0].replace(/[^0-9]/g, '');
                          const maxClean = parts[1].replace(/[^0-9]/g, '');
                          setForm(prev => ({
                            ...prev,
                            price_mode: 'range',
                            min_price: minClean,
                            max_price: maxClean,
                            price_range_label: (minClean && maxClean) ? `৳${Number(minClean).toLocaleString('en-US')} - ৳${Number(maxClean).toLocaleString('en-US')}` : (minClean ? `৳${minClean}` : '')
                          }));
                          return;
                        }
                        const cleanNum = val.replace(/[^0-9]/g, '');
                        const saleVal = Number(cleanNum) || 0;
                        const regVal = Number(form.regular_price) || 0;
                        let newPct = '';
                        if (regVal > saleVal && saleVal > 0) {
                          newPct = String(Math.round(((regVal - saleVal) / regVal) * 100));
                        }
                        setForm(prev => ({
                          ...prev,
                          sale_price: cleanNum,
                          discount_percent: newPct
                        }));
                      }}
                      placeholder="22500"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-[#c92127] focus:bg-white focus:border-[#c92127] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Discount Percentage Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-slate-400 font-bold">এক-ক্লিকে ডিসকাউন্ট %:</span>
                  {['5', '10', '15', '20', '25', '30', '40', '50'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const regVal = Number(form.regular_price) || 0;
                        let newSale = form.sale_price;
                        if (regVal > 0) {
                          newSale = Math.round(regVal - (regVal * Number(pct) / 100));
                        }
                        setForm(prev => ({
                          ...prev,
                          discount_percent: pct,
                          sale_price: newSale
                        }));
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                        form.discount_percent === pct
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {pct}% ছাড়
                    </button>
                  ))}
                  {form.discount_percent && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, discount_percent: '', sale_price: prev.regular_price }))}
                      className="text-[11px] text-red-500 hover:underline font-bold ml-1 cursor-pointer"
                    >
                      ✕ রিসেট
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: 🎨 CARD DESIGN & VISUAL STYLING CUSTOMIZER (Left Column) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Palette className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  কার্ড ডিজাইন ও ভিজ্যুয়াল স্টাইলিং (Card Design & Badges)
                </h2>
                <p className="text-xs text-slate-400">ডানপাশের লাইভ প্রিভিউ দেখে রিয়েলটাইমে কার্ডের ব্যাজ, বর্ডার, বাটন ও অপশন কাস্টমাইজ করুন</p>
              </div>
            </div>

            {/* 1. Badge Display Mode Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  কার্ড ব্যাজ অপশন (Card Badge Options)
                </label>
                {form.badge_text && form.badge_text !== '__none__' && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, badge_text: '__none__' }))}
                    className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer"
                  >
                    ✕ ব্যাজ বন্ধ করুন (Hide Badge)
                  </button>
                )}
              </div>

              {/* Mode Selector Buttons */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, badge_text: prev.badge_text === '__none__' || !prev.badge_text ? 'Hot Deal 🔥' : prev.badge_text }))}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    form.badge_text !== '__none__'
                      ? 'bg-[#c92127] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>কাস্টম ব্যাজ টেক্সট (Custom Badge)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, badge_text: '__none__' }))}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    form.badge_text === '__none__'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>কোনো ব্যাজ নয় (None)</span>
                </button>
              </div>

              {/* If Custom Badge Mode Active */}
              {form.badge_text !== '__none__' ? (
                <div className="space-y-2 animate-fadeIn">
                  <input
                    type="text"
                    value={form.badge_text}
                    onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                    placeholder="যেমন: Hot Deal 🔥, New Arrival ✨, Best Seller, ইত্যাদি..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  {/* Quick Badge Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-bold">এক-ক্লিকে প্রিসেট:</span>
                    {[
                      'Hot Deal 🔥',
                      'New Arrival ✨',
                      'Best Seller 🏆',
                      'Special Offer 🎁',
                      'Mega Sale 💥',
                      'Official 🛡️',
                      'Limited Stock ⏳',
                      'Top Rated ⭐',
                      'Flash Deal ⚡',
                      'Original 💯',
                      'Exclusive 👑',
                      'Wholesale 📦'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setForm({ ...form, badge_text: chip })}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          form.badge_text === chip
                            ? 'bg-[#c92127] text-white border-[#c92127] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 animate-fadeIn">
                  <span className="font-bold text-slate-800">কোনো ব্যাজ নয়:</span> এই প্রোডাক্ট কার্ডে কোনো কর্নার ব্যাজ প্রদর্শিত হবে না। কার্ডটি সম্পূর্ণ ক্লিন দেখাবে।
                </div>
              )}
            </div>

            {/* 2. Badge Color & Position Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
              {/* Badge Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ব্যাজ কালার থিম (Badge Color Theme)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'red', label: 'Classic Red', bg: 'bg-[#c92127]' },
                    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-600' },
                    { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-500' },
                    { id: 'blue', label: 'Royal Blue', bg: 'bg-blue-600' },
                    { id: 'indigo', label: 'Royal Indigo', bg: 'bg-indigo-600' },
                    { id: 'purple', label: 'Deep Purple', bg: 'bg-purple-600' },
                    { id: 'black', label: 'Luxury Black', bg: 'bg-slate-950' },
                    { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-600' }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setForm({ ...form, badge_color: col.id })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        form.badge_color === col.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${col.bg} ring-1 ring-white/50 flex-shrink-0`} />
                      <span className="truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge Position & Card Frame Style */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ব্যাজ অবস্থান (Badge Placement)
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, badge_position: 'left' })}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        form.badge_position === 'left' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      বাম পাশে (Top Left)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, badge_position: 'right' })}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        form.badge_position === 'right' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ডান পাশে (Top Right)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    কার্ড বর্ডার ও ফ্রেম অ্যাকসেন্ট (Card Frame Style)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'default', label: 'Classic Border', border: 'border-slate-200' },
                      { id: 'red', label: 'Red Glow', border: 'border-red-400 bg-red-50/20' },
                      { id: 'gold', label: 'VIP Gold', border: 'border-amber-400 bg-amber-50/20' },
                      { id: 'blue', label: 'Corporate Blue', border: 'border-blue-400 bg-blue-50/20' },
                      { id: 'emerald', label: 'Fresh Green', border: 'border-emerald-400 bg-emerald-50/20' },
                      { id: 'dark', label: 'Luxury Slate', border: 'border-slate-700 bg-slate-900/5' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setForm({ ...form, card_border: b.id })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${b.border} ${
                          form.card_border === b.id
                            ? 'ring-2 ring-slate-900 font-black text-slate-900 shadow-xs bg-white'
                            : 'text-slate-600 font-semibold hover:border-slate-400'
                        }`}
                      >
                        <span className="text-[11px] block">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Hover Button Action Text */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                কার্ড হোভার বাটন টেক্সট (Action Button Text)
              </label>
              <input
                type="text"
                value={form.card_btn_text}
                onChange={(e) => setForm({ ...form, card_btn_text: e.target.value })}
                placeholder="View Details, অর্ডার করুন, Buy Now..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {['View Details', 'অর্ডার করুন', 'বিস্তারিত দেখুন', 'Buy Now', 'কল করুন 📞'].map((btnText) => (
                  <button
                    key={btnText}
                    type="button"
                    onClick={() => setForm({ ...form, card_btn_text: btnText })}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      form.card_btn_text === btnText
                        ? 'bg-slate-900 text-white border-slate-900 font-black'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {btnText}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Display Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">কার্ডে অতিরিক্ত ফিচারসমূহ (Display Features)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">ব্র্যান্ড নাম দেখান</span>
                  <input
                    type="checkbox"
                    checked={form.show_brand_badge}
                    onChange={(e) => setForm({ ...form, show_brand_badge: e.target.checked })}
                    className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">স্টার রেটিং (★ ৪.৯)</span>
                  <input
                    type="checkbox"
                    checked={form.show_rating}
                    onChange={(e) => setForm({ ...form, show_rating: e.target.checked })}
                    className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">ইন-স্টক পিল ব্যাজ</span>
                  <input
                    type="checkbox"
                    checked={form.show_stock_badge}
                    onChange={(e) => setForm({ ...form, show_stock_badge: e.target.checked })}
                    className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

          </div>

          {/* Card 4: 🖼️ মূল থাম্বনেইল ছবি (Primary Featured Image) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    মূল থাম্বনেইল ছবি (Featured Image) <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-400">প্রোডাক্ট কার্ডে ও ডিটেইলস পেজের প্রধান ছবি</p>
                </div>
              </div>
              {form.image_url && (
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ ছবি যুক্ত আছে
                </span>
              )}
            </div>

            <ImagePickerField
              imageUrl={form.image_url}
              onImageChange={handleMainImageChange}
              isUploading={isUploadingMainImage}
              onPresetSelect={(presetOrUrl) => {
                const cleanUrl = typeof presetOrUrl === 'object' && presetOrUrl !== null ? (presetOrUrl.path || '') : presetOrUrl;
                setForm(prev => ({ ...prev, image_url: cleanUrl }));
              }}
            />
          </div>

          {/* Card 5: 🖼️ অতিরিক্ত গ্যালারি ছবি (Multi-Image Gallery) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    অতিরিক্ত গ্যালারি ছবি ({form.gallery_images.length}টি যুক্ত আছে)
                  </h3>
                  <p className="text-xs text-slate-400">প্রোডাক্ট ডিটেইলস পেজে স্লাইড করার জন্য অতিরিক্ত ছবি</p>
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails Grid */}
            {form.gallery_images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {form.gallery_images.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group w-full aspect-square rounded-2xl border border-slate-200 p-1.5 bg-slate-50 overflow-hidden flex items-center justify-center shadow-2xs"
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
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl font-bold text-xs"
                      title="মুছুন"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Gallery URL or Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryUrlInput}
                  onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryUrl())}
                  placeholder="ইমেজ লিংক (URL) পেস্ট করুন..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#c92127] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer hover:bg-slate-800"
                >
                  যোগ
                </button>
              </div>

              {/* Upload file directly to gallery */}
              <label className="py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:text-[#c92127] hover:border-[#c92127] hover:bg-red-50/20 transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-50">
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
                    <span>ডিভাইস থেকে ফাইল আপলোড করুন</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Card 6: 📦 ইনভেন্টরি ও স্ট্যাটাস (Inventory & Status) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  ইনভেন্টরি, ওয়ারেন্টি ও স্ট্যাটাস (Inventory & Status)
                </h3>
                <p className="text-xs text-slate-400">স্টক সংখ্যা, ফিচারড স্ট্যাটাস ও ওয়ারেন্টি টেক্সট</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Featured Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-xs font-bold text-slate-800">ফিচারড প্রোডাক্ট (Homepage Featured)</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                >
                  <option value="instock">ইন স্টক (In Stock)</option>
                  <option value="lowstock">স্টক সীমিত (Low Stock)</option>
                  <option value="outofstock">স্টক শেষ (Out of Stock / Sold Out)</option>
                  <option value="preorder">প্রি-অর্ডার (Pre-Order Available)</option>
                </select>
              </div>

              {/* Warranty Badge Text with Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ওয়ারেন্টি ও নিশ্চয়তা ব্যাজ (Warranty / Assurance Badge)
                </label>
                <input
                  type="text"
                  value={form.warranty_badge}
                  onChange={(e) => setForm({ ...form, warranty_badge: e.target.value })}
                  placeholder="১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">প্রিসেট:</span>
                  {[
                    '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি',
                    '২ বছরের ফ্রি সার্ভিস ওয়ারেন্টি',
                    '১০০% অথেনটিক অফিসিয়াল প্রোডাক্ট',
                    'Splashjet ১০০% জেনুইন কোয়ালিটি',
                    '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি',
                    'অন-সাইট ইনস্টলেশন ও সাপোর্ট'
                  ].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setForm({ ...form, warranty_badge: w })}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        form.warranty_badge === w
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 6.1: Shipping & Delivery Tier */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-50 text-[#c92127]">
                  <Truck className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    ডেলিভারি ও শিপিং টিয়ার (Shipping & Delivery Tier)
                  </h2>
                  <p className="text-xs text-slate-400">এই প্রোডাক্টের জন্য নির্দিষ্ট ডেলিভারি চার্জ অথবা ফ্রি ডেলিভারি সেট করুন</p>
                </div>
              </div>

              {/* Free Delivery Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.is_free_delivery}
                  onChange={(e) => setForm({ ...form, is_free_delivery: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4"
                />
                <span className={`text-xs font-bold ${form.is_free_delivery ? 'text-[#c92127]' : 'text-slate-700'}`}>
                  ফ্রি ডেলিভারি (Free Delivery)
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  শিপিং টিয়ার নির্ধারণ (Select Shipping Tier)
                </label>
                <select
                  value={form.shipping_tier_id}
                  disabled={form.is_free_delivery}
                  onChange={(e) => setForm({ ...form, shipping_tier_id: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer ${
                    form.is_free_delivery ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">ক্যাটাগরি অনুযায়ী অটোমেটিক নির্ধারণ (Auto by Category / Default)</option>
                  {shippingTiersList.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — ঢাকা: ৳{tier.inside_dhaka} / বাইরে: ৳{tier.outside_dhaka} {tier.badge ? `(${tier.badge})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  ফাঁকা রাখলে প্রোডাক্টের ক্যাটাগরি (যেমন: {form.category || 'Printers'}) অনুযায়ী স্বয়ংক্রিয়ভাবে শিপিং রেট গণনা হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Card 7: Key Features & Bullet Highlights */}
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

          {/* Card 8: Technical Specifications Builder (DYNAMIC) */}
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

          {/* Card 9: Detailed Description */}
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
        {/* RIGHT COLUMN: ONLY PURE LIVE CARD PREVIEW (Sticky on desktop) */}
        {/* ================================================================ */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:sticky lg:top-20 z-30 space-y-4">
          
          {/* 🌟 REAL-TIME LIVE PRODUCT CARD PREVIEW CARD */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-emerald-400" />
                    <span>লাইভ প্রোডাক্ট প্রিভিউ (Live Card)</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">রিয়েলটাইম আপডেট</p>
                </div>
              </div>

              {/* Device Preview Switcher */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ডেস্কটপ প্রিভিউ"
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
                  title="মোবাইল প্রিভিউ"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Card Box */}
            <div className="bg-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-700/60 flex items-center justify-center min-h-[360px]">
              <div className={`w-full transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[240px]' : 'max-w-[310px]'}`}>
                <ProductCard
                  product={{
                    id: product?.id || 'live-preview-sample',
                    title: form.title || 'এখানে আপনার প্রোডাক্টের নাম দেখা যাবে (Product Title)',
                    slug: form.slug || 'preview-slug',
                    category: form.category || 'Printers',
                    sub_category: form.sub_category || '',
                    brand: form.brand || 'Corporate Tech',
                    regular_price: form.price_mode === 'range' ? (Number(form.max_price) || 0) : (Number(form.regular_price) || 0),
                    sale_price: form.price_mode === 'range' ? (Number(form.min_price) || 0) : (Number(form.sale_price) || Number(form.regular_price) || 0),
                    price_range_label: form.price_mode === 'range'
                      ? (form.price_range_label || (form.min_price && form.max_price ? `৳${Number(form.min_price).toLocaleString('en-US')} - ৳${Number(form.max_price).toLocaleString('en-US')}` : (form.min_price ? `৳${Number(form.min_price).toLocaleString('en-US')}+` : '৳১০,০০০ - ৳১২,০০০')))
                      : null,
                    discount_label: (form.price_mode === 'fixed' && Number(form.regular_price) > Number(form.sale_price) && !form.call_for_price)
                      ? `-${Math.round(((Number(form.regular_price) - Number(form.sale_price)) / Number(form.regular_price)) * 100)}%`
                      : form.discount_label,
                    call_for_price: form.price_mode === 'call',
                    stock_quantity: Number(form.stock_quantity) || 0,
                    stock_status: form.stock_status,
                    image_url: form.image_url || CATEGORY_DEFAULT_IMAGES[form.category] || CATEGORY_DEFAULT_IMAGES['Printers'],
                    badge_text: form.badge_text,
                    badge_color: form.badge_color,
                    badge_position: form.badge_position,
                    card_border: form.card_border,
                    card_btn_text: form.card_btn_text,
                    show_brand_badge: form.show_brand_badge,
                    show_rating: form.show_rating,
                    rating_score: form.rating_score,
                    show_stock_badge: form.show_stock_badge
                  }}
                  onNavigate={() => {}}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> ওয়েবসাইটে হুবহু এই ডিজাইনে দেখাবে
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase">Live Dynamic</span>
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
