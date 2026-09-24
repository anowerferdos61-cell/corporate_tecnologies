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
  Award,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import ProductCard from '../ProductCard';
import ImagePickerField from './ImagePickerField';
import CategoryFormModal from './modals/CategoryFormModal';
import { CATEGORY_DEFAULT_IMAGES } from './adminConstants';
import { getCategoriesTree, saveCategory, getAvailableCategories } from '../../lib/categoryService';
import { uploadProductImage } from '../../lib/supabaseClient';
import { fetchShippingTiers } from '../../lib/shippingService';

// Quick Brand suggestions per category
const POPULAR_BRANDS = [
  'Epson', 'Canon', 'Brother', 'HP', 'Toshiba', 'Splashjet', 'Xprinter', 'Sunmi', 'Pantum'
];

const CATEGORY_BRAND_SUGGESTIONS = {
  'Splashjet Inks': ['Splashjet', 'Epson', 'Canon', 'Brother', 'HP'],
  'Toner & Inks': ['Splashjet', 'HP', 'Canon', 'Toshiba', 'Brother', 'Pantum'],
  'Printers': ['Epson', 'Canon', 'Brother', 'HP', 'Pantum'],
  'Photocopy Machines': ['Toshiba', 'Canon', 'Ricoh', 'Konica Minolta', 'Sharp'],
  'POS & Barcode': ['Xprinter', 'Sunmi', 'Zebra', 'Honeywell', 'Gprinter'],
  'Machinery': ['Audley', 'Locor', 'Galaxy', 'Epson', 'Mutoh', 'Mimaki'],
  'Accessories & Parts': ['Original OEM', 'Corporate Tech', 'Epson', 'Canon', 'Toshiba']
};

const CATEGORY_WARRANTY_DEFAULTS = {
  'Splashjet Inks': '100% Genuine Quality & 24 Months Shelf Life',
  'Toner & Inks': '100% Genuine Quality Seal & Test Guarantee',
  'Printers': '1 Year Official Service Warranty',
  'Photocopy Machines': '1 Year Free Servicing & Technical Support',
  'POS & Barcode': '1 Year Official Warranty',
  'Machinery': '1 Year On-site Installation & Technical Support',
  'Accessories & Parts': '7 Days Testing & Replacement Guarantee'
};

const CATEGORY_FEATURE_SUGGESTIONS = {
  'Splashjet Inks': [
    '100% Genuine Splashjet Premium Quality Ink',
    '100% Safe and Clog-Free Printhead Protection',
    'Vibrant Colors and Long-Lasting Water-Resistant Prints',
    'Fast Nationwide Home Delivery Available'
  ],
  'Printers': [
    '100% Official Authentic Brand Printer',
    '1 Year Official Free Service & Tech Support',
    'Low-Cost High-Yield Printing Solution',
    'Fast Nationwide Delivery'
  ],
  'Photocopy Machines': [
    'Heavy-Duty Commercial Photocopier',
    'High-Speed Print, Scan & Auto-Duplex Features',
    'Free Installation & On-site Technician Support',
    'Original Toner & Long-Life Drum Unit'
  ],
  'POS & Barcode': [
    'High-Speed Thermal Receipt & Barcode Printing',
    'POS Software & Cash Drawer Compatible',
    '1 Year Warranty & Full Setup Support',
    'Cash on Delivery Available Nationwide'
  ]
};

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
  ],
  pos: [
    { key: 'Print Method', value: 'Direct Thermal Line Printing' },
    { key: 'Print Width / Speed', value: '80mm / 250mm/sec' },
    { key: 'Interfaces', value: 'USB, LAN, Serial, Bluetooth' },
    { key: 'Auto Cutter', value: 'Yes (1.5 Million Cuts)' },
    { key: 'Barcode Support', value: '1D / 2D / QR Code' },
    { key: 'Operating System', value: 'Windows, Android, iOS, Linux' },
    { key: 'Warranty', value: '1 Year Official Warranty' }
  ],
  machinery: [
    { key: 'Machine Category', value: 'Large Format / Industrial Printer' },
    { key: 'Printhead Type', value: 'Epson i3200 / XP600 / Ricoh Gen5' },
    { key: 'Max Print Width', value: '1.6m / 1.8m / 3.2m' },
    { key: 'Ink Compatibility', value: 'Eco-Solvent / Sublimation / UV Ink' },
    { key: 'Media Handling', value: 'Roll to Roll Auto Feeding & Take-up' },
    { key: 'RIP Software', value: 'Maintop / Photoprint / Wasatch' },
    { key: 'Warranty & Support', value: '1 Year On-site Support' }
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
    regular_price: product?.regular_price ?? '',
    sale_price: product?.sale_price ?? '',
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
    warranty_badge: product?.warranty_badge || '1 Year Official Service Warranty',
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
      '100% Official Authentic Product',
      '1 Year Free Servicing & Technical Support',
      'Fast Nationwide Home Delivery Available'
    ];
  });
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Gallery URL input
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  // Product Variants / Color Options State
  const initialVariations = Array.isArray(product?.variations) && product.variations.length > 0
    ? product.variations.map((v, i) => ({
        id: v.id || `var_${Date.now()}_${i}`,
        name: v.name || '',
        color_code: v.color_code || '#c92127',
        regular_price: v.regular_price ?? '',
        sale_price: v.sale_price ?? '',
        stock_quantity: v.stock_quantity ?? 25,
        image_url: v.image_url || ''
      }))
    : [];

  const [hasVariants, setHasVariants] = useState(() => initialVariations.length > 0);
  const [variationsList, setVariationsList] = useState(() => initialVariations);

  // Quick Preset Handlers
  const applyVariantPreset = (presetType) => {
    const baseReg = Number(form.regular_price) || 450;
    const baseSale = Number(form.sale_price) || baseReg;
    let newItems = [];

    if (presetType === 'fourColors') {
      newItems = [
        { id: `var_${Date.now()}_1`, name: 'Black (BK)', color_code: '#111827', regular_price: baseReg, sale_price: baseSale, stock_quantity: 25, image_url: '' },
        { id: `var_${Date.now()}_2`, name: 'Cyan (C)', color_code: '#0284c7', regular_price: baseReg, sale_price: baseSale, stock_quantity: 25, image_url: '' },
        { id: `var_${Date.now()}_3`, name: 'Magenta (M)', color_code: '#e11d48', regular_price: baseReg, sale_price: baseSale, stock_quantity: 25, image_url: '' },
        { id: `var_${Date.now()}_4`, name: 'Yellow (Y)', color_code: '#eab308', regular_price: baseReg, sale_price: baseSale, stock_quantity: 25, image_url: '' },
        { id: `var_${Date.now()}_5`, name: 'Full Set Combo (4 Colors)', color_code: '#10b981', regular_price: baseReg * 4, sale_price: Math.max(0, (baseSale * 4) - 50), stock_quantity: 15, image_url: '' }
      ];
    } else if (presetType === 'sixColors') {
      newItems = [
        { id: `var_${Date.now()}_1`, name: 'Black (BK)', color_code: '#111827', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_2`, name: 'Cyan (C)', color_code: '#0284c7', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_3`, name: 'Magenta (M)', color_code: '#e11d48', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_4`, name: 'Yellow (Y)', color_code: '#eab308', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_5`, name: 'Light Cyan (LC)', color_code: '#38bdf8', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_6`, name: 'Light Magenta (LM)', color_code: '#f43f5e', regular_price: baseReg, sale_price: baseSale, stock_quantity: 20, image_url: '' },
        { id: `var_${Date.now()}_7`, name: 'Full Set Combo (6 Colors)', color_code: '#10b981', regular_price: baseReg * 6, sale_price: Math.max(0, (baseSale * 6) - 100), stock_quantity: 10, image_url: '' }
      ];
    } else if (presetType === 'volumes') {
      newItems = [
        { id: `var_${Date.now()}_1`, name: '70ml Bottle', color_code: '#64748b', regular_price: baseReg, sale_price: baseSale, stock_quantity: 30, image_url: '' },
        { id: `var_${Date.now()}_2`, name: '100ml Bottle', color_code: '#475569', regular_price: Math.round(baseReg * 1.3), sale_price: Math.round(baseSale * 1.3), stock_quantity: 25, image_url: '' },
        { id: `var_${Date.now()}_3`, name: '1000ml (1 Liter Pack)', color_code: '#334155', regular_price: Math.round(baseReg * 7.5), sale_price: Math.round(baseSale * 7), stock_quantity: 10, image_url: '' }
      ];
    }

    setVariationsList(newItems);
    setHasVariants(true);

    // Auto-update price range if prices vary
    if (newItems.length > 0) {
      const prices = newItems.map(i => Number(i.sale_price || i.regular_price || 0)).filter(p => p > 0);
      if (prices.length > 1) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min !== max) {
          setForm(prev => ({
            ...prev,
            price_mode: 'range',
            min_price: String(min),
            max_price: String(max),
            price_range_label: `৳${min.toLocaleString('en-US')} - ৳${max.toLocaleString('en-US')}`
          }));
        }
      }
    }
  };

  const handleAddCustomVariant = () => {
    const baseReg = Number(form.regular_price) || '';
    const baseSale = Number(form.sale_price) || baseReg;
    setVariationsList(prev => [
      ...prev,
      {
        id: `var_${Date.now()}_${prev.length + 1}`,
        name: '',
        color_code: '#c92127',
        regular_price: baseReg,
        sale_price: baseSale,
        stock_quantity: 25,
        image_url: ''
      }
    ]);
    setHasVariants(true);
  };

  const handleUpdateVariant = (id, field, value) => {
    setVariationsList(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (id) => {
    setVariationsList(prev => {
      const filtered = prev.filter(v => v.id !== id);
      if (filtered.length === 0) {
        setHasVariants(false);
      }
      return filtered;
    });
  };

  // Dynamic Category Switch Handler (Smart auto-adaptation)
  const handleCategoryChange = (newCat) => {
    const matchedCat = categoriesTree.find(c => (c.name || '').toLowerCase() === newCat.toLowerCase());
    const firstSub = matchedCat?.subcategories?.find(s => !s.hidden)?.name || '';
    const catImage = matchedCat?.image || CATEGORY_DEFAULT_IMAGES[newCat] || form.image_url;

    const brandSuggestions = CATEGORY_BRAND_SUGGESTIONS[newCat] || POPULAR_BRANDS;
    const defaultBrand = brandSuggestions[0] || form.brand;
    const defaultWarranty = CATEGORY_WARRANTY_DEFAULTS[newCat] || '1 Year Official Service Warranty';

    // Auto-select matching specs template
    let autoSpecs = SPEC_TEMPLATES.printer;
    const lower = newCat.toLowerCase();
    if (lower.includes('ink') || lower.includes('splashjet') || lower.includes('toner')) {
      autoSpecs = SPEC_TEMPLATES.splashjet;
    } else if (lower.includes('photocopy')) {
      autoSpecs = SPEC_TEMPLATES.photocopier;
    } else if (lower.includes('pos') || lower.includes('barcode')) {
      autoSpecs = SPEC_TEMPLATES.pos;
    } else if (lower.includes('machinery')) {
      autoSpecs = SPEC_TEMPLATES.machinery;
    }

    setForm(prev => ({
      ...prev,
      category: newCat,
      sub_category: firstSub || prev.sub_category,
      brand: isEditing ? prev.brand : (prev.brand === 'Epson' || !prev.brand ? defaultBrand : prev.brand),
      warranty_badge: isEditing ? prev.warranty_badge : defaultWarranty,
      image_url: isEditing ? prev.image_url : catImage
    }));

    if (!isEditing) {
      setSpecsList(autoSpecs);
      if (CATEGORY_FEATURE_SUGGESTIONS[newCat]) {
        setKeyFeatures(CATEGORY_FEATURE_SUGGESTIONS[newCat]);
      }
      if (lower.includes('ink') || lower.includes('splashjet')) {
        if (!hasVariants || variationsList.length === 0) {
          applyVariantPreset('fourColors');
        }
      }
    }
  };

  // 1-Click Clean Blank Form
  const handleClearToBlank = () => {
    if (!window.confirm('Are you sure you want to clear all data and start with a blank form?')) return;
    setForm(prev => ({
      ...prev,
      title: '',
      slug: '',
      brand: '',
      sub_category: '',
      regular_price: '',
      sale_price: '',
      discount_percent: '',
      min_price: '',
      max_price: '',
      price_range_label: '',
      discount_label: '',
      call_for_price: false,
      price_mode: 'fixed',
      stock_quantity: 20,
      image_url: '',
      gallery_images: [],
      short_description: '',
      description: '',
      warranty_badge: '',
      badge_text: '__none__'
    }));
    setSpecsList([]);
    setKeyFeatures([]);
    setHasVariants(false);
    setVariationsList([]);
  };

  // 1-Click Load Category Smart Preset
  const handleLoadCategoryPreset = (catName = form.category) => {
    const brandSuggestions = CATEGORY_BRAND_SUGGESTIONS[catName] || POPULAR_BRANDS;
    const defaultBrand = brandSuggestions[0] || 'Corporate Tech';
    const defaultWarranty = CATEGORY_WARRANTY_DEFAULTS[catName] || '1 Year Official Service Warranty';

    let autoSpecs = SPEC_TEMPLATES.printer;
    const lower = catName.toLowerCase();
    if (lower.includes('ink') || lower.includes('splashjet') || lower.includes('toner')) {
      autoSpecs = SPEC_TEMPLATES.splashjet;
    } else if (lower.includes('photocopy')) {
      autoSpecs = SPEC_TEMPLATES.photocopier;
    } else if (lower.includes('pos') || lower.includes('barcode')) {
      autoSpecs = SPEC_TEMPLATES.pos;
    } else if (lower.includes('machinery')) {
      autoSpecs = SPEC_TEMPLATES.machinery;
    }

    setForm(prev => ({
      ...prev,
      brand: defaultBrand,
      warranty_badge: defaultWarranty,
      image_url: CATEGORY_DEFAULT_IMAGES[catName] || prev.image_url
    }));
    setSpecsList(autoSpecs);
    if (CATEGORY_FEATURE_SUGGESTIONS[catName]) {
      setKeyFeatures(CATEGORY_FEATURE_SUGGESTIONS[catName]);
    }
    if (lower.includes('ink') || lower.includes('splashjet')) {
      applyVariantPreset('fourColors');
    }
  };

  const handleClearSpecs = () => {
    setSpecsList([]);
  };

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
      if (specsList.length > 0 && !window.confirm('Do you want to replace the current specifications with this template?')) {
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
      setValidationError('Please enter a product title (Product Title is required)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (form.price_mode === 'fixed') {
      const reg = Number(form.regular_price) || 0;
      const sale = Number(form.sale_price) || 0;
      if (!reg && !sale) {
        setValidationError('Please set a fixed regular or offer price, or choose Price Range / Call for Price.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (form.price_mode === 'range') {
      if (!form.price_range_label?.trim() && !form.min_price && !form.max_price) {
        setValidationError('Please specify the price range values or label (e.g. ৳10,000 - ৳12,000).');
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
        variations: hasVariants ? variationsList.filter(v => v.name && v.name.trim()).map(v => ({
          id: v.id,
          name: v.name.trim(),
          color_code: v.color_code || '#c92127',
          regular_price: Number(v.regular_price) || Number(form.regular_price) || 0,
          sale_price: Number(v.sale_price) || Number(form.sale_price) || 0,
          stock_quantity: Number(v.stock_quantity ?? 20),
          image_url: v.image_url || ''
        })) : [],
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
      setSaveSuccessMsg(isEditing ? 'Product updated successfully!' : 'New product created successfully!');
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
              title="Back to products"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Products</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isEditing ? 'Edit Product' : 'Create New Product'}
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
                {isEditing ? `SKU: ${form.sku} | ${form.title}` : 'Configure details, pricing, variants, and specifications for your catalog'}
              </p>
            </div>
          </div>

          {/* Action Buttons & Quick Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={handleClearToBlank}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Clear all default text and start with a blank form"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Blank Form</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleLoadCategoryPreset(form.category)}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Load smart presets for current category"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Load Preset</span>
            </button>

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
              disabled={isSubmitting}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] active:scale-98 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? 'Save Changes' : 'Save Product'}</span>
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
                  Basic Information
                </h2>
                <p className="text-xs text-slate-400">Set product title, brand, category, and identifiers</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Epson EcoTank L3250 A4 Wi-Fi All-in-One Ink Tank Printer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none transition-all"
              />
            </div>

            {/* Custom URL Slug & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Product URL Slug
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
                  Model Code / SKU
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
                    title="Generate new SKU"
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
                    Category <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenNewCategoryModal}
                    className="text-[11px] text-[#c92127] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus className="w-3 h-3" />
                    + Add Category
                  </button>
                </div>

                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
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
                    Sub-Category
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenNewSubCategoryModal}
                    className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    + Add Sub-Category
                  </button>
                </div>

                {availableSubcategories.length > 0 ? (
                  <div className="space-y-1.5">
                    <select
                      value={form.sub_category}
                      onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                    >
                      <option value="">-- Select Sub-Category --</option>
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
                    placeholder="e.g. Ink Tank Printers, Refill Ink, etc."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none"
                  />
                )}
              </div>
            </div>

            {/* Brand with Quick Pills (Dynamically adapted to category) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Epson, Canon, Brother, Splashjet, etc..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">
                  Popular Brands for {form.category}:
                </span>
                {(CATEGORY_BRAND_SUGGESTIONS[form.category] || POPULAR_BRANDS).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setForm({ ...form, brand: b })}
                    className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                      (form.brand || '').toLowerCase() === b.toLowerCase()
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
                    Pricing & Valuation
                  </h2>
                  <p className="text-xs text-slate-400">Set fixed price, price range (e.g. ৳10,000 - ৳12,000), or Call for Price mode</p>
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
                  Fixed Price
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
                  <span>Price Range</span>
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
                    <span className="font-bold text-[#c92127] block">Price Range Mode Active</span>
                    <span className="text-slate-600 text-[11px]">Displays a formatted range (e.g. "৳10,000 - ৳12,000") directly on product cards and details page.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Min Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Min Price (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.min_price}
                      onChange={(e) => {
                        const val = e.target.value;
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
                      Max Price (৳) <span className="text-red-500">*</span>
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
                      Display Range Label
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
                  <span className="text-[11px] text-slate-400 font-bold">Quick Range Presets:</span>
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
                  <span>"Call for Price" is Active</span>
                </div>
                <p className="text-amber-800/90 leading-relaxed">
                  No fixed price will be shown on the storefront. Product cards and details pages will show a prominent 
                  <strong> "Call for Price"</strong> badge prompting customers to call or WhatsApp for quotes.
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
                      Regular MRP (৳) <span className="text-red-500">*</span>
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
                      Discount (%)
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
                        placeholder="e.g. 10, 15, 20..."
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
                      Offer / Sale Price (৳)
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
                  <span className="text-[11px] text-slate-400 font-bold">Quick Discount %:</span>
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
                      {pct}% OFF
                    </button>
                  ))}
                  {form.discount_percent && (
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, discount_percent: '', sale_price: prev.regular_price }))}
                      className="text-[11px] text-red-500 hover:underline font-bold ml-1 cursor-pointer"
                    >
                      ✕ Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 2.5: 🎨 PRODUCT VARIANTS & COLOR OPTIONS (Left Column) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-pink-50 text-pink-600">
                  <Palette className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Product Variants & Options
                  </h2>
                  <p className="text-xs text-slate-400">Allow customers to choose colors (BK, C, M, Y) or volumes directly on a single product page</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasVariants(checked);
                    if (checked && variationsList.length === 0) {
                      applyVariantPreset('fourColors');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c92127]"></div>
                <span className="ml-3 text-xs font-bold text-slate-700">
                  {hasVariants ? 'Variants Active' : 'Variants Disabled'}
                </span>
              </label>
            </div>

            {/* If Variants Disabled */}
            {!hasVariants && (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700 block">Single Product Mode:</span>
                  This product has no separate color or volume options. It will be sold as a single catalog item.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasVariants(true);
                    if (variationsList.length === 0) {
                      applyVariantPreset('fourColors');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enable Color Variants</span>
                </button>
              </div>
            )}

            {/* If Variants Enabled */}
            {hasVariants && (
              <div className="space-y-4 animate-fadeIn">
                {/* 1-Click Quick Preset Buttons */}
                <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>1-Click Quick Presets:</span>
                    </span>
                    <span className="text-[11px] text-pink-700">Generate full color sets instantly</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyVariantPreset('fourColors')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100/60 border border-pink-200 text-pink-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Droplets className="w-3.5 h-3.5 text-pink-600" />
                      <span>🎨 4-Color Ink Set (BK, C, M, Y + Set)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyVariantPreset('sixColors')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100/60 border border-pink-200 text-pink-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>🌈 6-Color Photo Ink Set</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyVariantPreset('volumes')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100/60 border border-pink-200 text-pink-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>🧴 Volume Pack (70ml, 100ml, 1L)</span>
                    </button>
                  </div>
                </div>

                {/* Variations Table / List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-800">
                      Variant List ({variationsList.length} options)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddCustomVariant}
                      className="text-xs font-bold text-[#c92127] hover:text-[#a8191e] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Custom Option</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {variationsList.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4 transition-all hover:border-slate-300 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Color Dot & Variant Name (4 cols) */}
                          <div className="sm:col-span-4 flex items-center gap-2">
                            {/* Mini Color Picker */}
                            <div className="relative shrink-0">
                              <input
                                type="color"
                                value={v.color_code || '#c92127'}
                                onChange={(e) => handleUpdateVariant(v.id, 'color_code', e.target.value)}
                                className="w-8 h-8 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                                title="Pick Color"
                              />
                            </div>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => handleUpdateVariant(v.id, 'name', e.target.value)}
                              placeholder="Option name (e.g. Black (BK))"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#c92127] outline-none"
                            />
                          </div>

                          {/* Regular Price (2 cols) */}
                          <div className="sm:col-span-2">
                            <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-0.5">
                              Regular Price ৳
                            </label>
                            <input
                              type="number"
                              value={v.regular_price}
                              onChange={(e) => handleUpdateVariant(v.id, 'regular_price', e.target.value)}
                              placeholder="Regular ৳"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 focus:border-[#c92127] outline-none"
                            />
                          </div>

                          {/* Offer / Sale Price (2 cols) */}
                          <div className="sm:col-span-2">
                            <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-0.5">
                              Sale Price ৳
                            </label>
                            <input
                              type="number"
                              value={v.sale_price}
                              onChange={(e) => handleUpdateVariant(v.id, 'sale_price', e.target.value)}
                              placeholder="Sale ৳"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#c92127] focus:border-[#c92127] outline-none"
                            />
                          </div>

                          {/* Stock Quantity (2 cols) */}
                          <div className="sm:col-span-2">
                            <label className="block sm:hidden text-[10px] font-bold text-slate-500 mb-0.5">
                              Stock Qty
                            </label>
                            <input
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) => handleUpdateVariant(v.id, 'stock_quantity', e.target.value)}
                              placeholder="Stock"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-700 focus:border-emerald-600 outline-none"
                            />
                          </div>

                          {/* Actions (2 cols) */}
                          <div className="sm:col-span-2 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Remove this variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Informative Note */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Customers can select colors or pack options and purchase with 1-click checkout directly on the product details page.
                    </span>
                  </div>
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
                  Card Design & Visual Styling
                </h2>
                <p className="text-xs text-slate-400">Customize card badges, border styling, action buttons, and visual tags with live preview</p>
              </div>
            </div>

            {/* 1. Badge Display Mode Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Card Badge Options
                </label>
                {form.badge_text && form.badge_text !== '__none__' && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, badge_text: '__none__' }))}
                    className="text-[11px] text-red-500 hover:underline font-bold cursor-pointer"
                  >
                    ✕ Hide Badge
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
                  <span>Custom Badge</span>
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
                  <span>No Badge (Clean)</span>
                </button>
              </div>

              {/* If Custom Badge Mode Active */}
              {form.badge_text !== '__none__' ? (
                <div className="space-y-2 animate-fadeIn">
                  <input
                    type="text"
                    value={form.badge_text}
                    onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                    placeholder="e.g. Hot Deal 🔥, New Arrival ✨, Best Seller..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  {/* Quick Badge Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-bold">Quick Presets:</span>
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
                  <span className="font-bold text-slate-800">No badge selected:</span> The product card will display cleanly without a corner badge.
                </div>
              )}
            </div>

            {/* 2. Badge Color & Position Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
              {/* Badge Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Badge Color Theme
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
                    Badge Placement
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, badge_position: 'left' })}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        form.badge_position === 'left' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Top Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, badge_position: 'right' })}
                      className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        form.badge_position === 'right' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Top Right
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Card Frame Style
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
                Action Button Text
              </label>
              <input
                type="text"
                value={form.card_btn_text}
                onChange={(e) => setForm({ ...form, card_btn_text: e.target.value })}
                placeholder="View Details, Order Now, Buy Now..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none mb-2"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {['View Details', 'Order Now', 'Buy Now', 'Call Now 📞', 'Add to Cart'].map((btnText) => (
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
              <label className="text-xs font-bold text-slate-700 block">Display Features</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">Show Brand Badge</span>
                  <input
                    type="checkbox"
                    checked={form.show_brand_badge}
                    onChange={(e) => setForm({ ...form, show_brand_badge: e.target.checked })}
                    className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">Star Rating (★ 4.9)</span>
                  <input
                    type="checkbox"
                    checked={form.show_rating}
                    onChange={(e) => setForm({ ...form, show_rating: e.target.checked })}
                    className="accent-[#c92127] w-4 h-4 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">In-Stock Pill Badge</span>
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

          {/* Card 4: 🖼️ Featured Primary Image */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Featured Primary Image <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-slate-400">Main image displayed on product cards and catalog</p>
                </div>
              </div>
              {form.image_url && (
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ Image Attached
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

          {/* Card 5: 🖼️ Multi-Image Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Gallery Images ({form.gallery_images.length} added)
                  </h3>
                  <p className="text-xs text-slate-400">Additional photos for product page gallery slider</p>
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
                      title="Remove"
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
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#c92127] outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer hover:bg-slate-800"
                >
                  Add
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
                  <span className="text-xs text-slate-500 animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload Image from Device</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Card 6: 📦 Inventory & Status */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Inventory & Status
                </h3>
                <p className="text-xs text-slate-400">Stock quantity, featured placement, and warranty information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Featured Switch */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-xs font-bold text-slate-800">Featured Product (Homepage Spotlight)</span>
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
                  Stock Quantity
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
                  Stock Status
                </label>
                <select
                  value={form.stock_status}
                  onChange={(e) => setForm({ ...form, stock_status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
                >
                  <option value="instock">In Stock</option>
                  <option value="lowstock">Low Stock</option>
                  <option value="outofstock">Out of Stock</option>
                  <option value="preorder">Pre-Order</option>
                </select>
              </div>

              {/* Warranty Badge Text with Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Warranty & Assurance Badge
                </label>
                <input
                  type="text"
                  value={form.warranty_badge}
                  onChange={(e) => setForm({ ...form, warranty_badge: e.target.value })}
                  placeholder="1 Year Official Service Warranty"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                  {[
                    '1 Year Official Service Warranty',
                    '2 Years Free Service Warranty',
                    '100% Authentic Official Product',
                    'Splashjet 100% Genuine Quality',
                    '7 Days Replacement Guarantee',
                    'On-site Installation & Support'
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
                    Shipping & Delivery Tier
                  </h2>
                  <p className="text-xs text-slate-400">Assign custom shipping rates or offer free delivery for this product</p>
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
                  Free Delivery
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Shipping Tier
                </label>
                <select
                  value={form.shipping_tier_id}
                  disabled={form.is_free_delivery}
                  onChange={(e) => setForm({ ...form, shipping_tier_id: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer ${
                    form.is_free_delivery ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Auto by Category / Default</option>
                  {shippingTiersList.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — Inside Dhaka: ৳{tier.inside_dhaka} / Outside Dhaka: ৳{tier.outside_dhaka} {tier.badge ? `(${tier.badge})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Leave default to automatically calculate delivery rate based on category ({form.category || 'Printers'}).
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
                    Key Highlights & Bullets
                  </h2>
                  <p className="text-xs text-slate-400">Add key selling points and highlights displayed on the product page</p>
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
                placeholder="e.g. Ultra-high yield ink bottle (4,500 pages black print)"
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none"
              />
              <button
                type="button"
                onClick={handleAddKeyFeature}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Feature
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
                    title="Remove"
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
                    Technical Specifications Builder
                  </h2>
                  <p className="text-xs text-slate-400">Add, edit, or load pre-configured specification tables</p>
                </div>
              </div>

              {/* Template quick loaders */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">Templates:</span>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('printer')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-[#c92127]" />
                  Printers
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('photocopier')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CopyIcon className="w-3 h-3 text-blue-600" />
                  Photocopiers
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('splashjet')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Droplets className="w-3 h-3 text-emerald-600" />
                  Inks & Toners
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('pos')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  POS & Barcode
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSpecTemplate('machinery')}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Machinery
                </button>
                <button
                  type="button"
                  onClick={handleClearSpecs}
                  className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer ml-1"
                  title="Clear all specifications"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
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
                    placeholder="Specification (e.g. Print Speed)"
                    className="w-1/3 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpecRow(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 33 ppm Black / 15 ppm Color)"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove"
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
              + Add Specification Row
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
                  Product Description
                </h2>
                <p className="text-xs text-slate-400">Detailed long-form product description and summary</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Short Summary (Displayed next to product gallery)
              </label>
              <textarea
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="2-3 sentence overview of this product..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c92127] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Detailed Description
              </label>
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detailed product information, usage guidelines, warranty terms, and specifications..."
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
                    <span>Live Product Card Preview</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Real-time updates</p>
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

            {/* Live Interactive Card Box */}
            <div className="bg-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-700/60 flex items-center justify-center min-h-[360px]">
              <div className={`w-full transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[240px]' : 'max-w-[310px]'}`}>
                <ProductCard
                  product={{
                    id: product?.id || 'live-preview-sample',
                    title: form.title || 'Product Title Sample Preview',
                    slug: form.slug || 'preview-slug',
                    category: form.category || 'Printers',
                    sub_category: form.sub_category || '',
                    brand: form.brand || 'Corporate Tech',
                    regular_price: form.price_mode === 'range' ? (Number(form.max_price) || 0) : (Number(form.regular_price) || 0),
                    sale_price: form.price_mode === 'range' ? (Number(form.min_price) || 0) : (Number(form.sale_price) || Number(form.regular_price) || 0),
                    price_range_label: form.price_mode === 'range'
                      ? (form.price_range_label || (form.min_price && form.max_price ? `৳${Number(form.min_price).toLocaleString('en-US')} - ৳${Number(form.max_price).toLocaleString('en-US')}` : (form.min_price ? `৳${Number(form.min_price).toLocaleString('en-US')}+` : '৳10,000 - ৳12,000')))
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
                    show_stock_badge: form.show_stock_badge,
                    variations: hasVariants ? variationsList.filter(v => v.name && v.name.trim()) : []
                  }}
                  onNavigate={() => {}}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live Storefront Rendering
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
