import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Package, 
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  Flame,
  Upload,
  Loader2
} from 'lucide-react';
import { 
  createProductOnSupabase, 
  updateProductOnSupabase, 
  deleteProductFromSupabase,
  uploadProductImage
} from '../lib/supabaseClient';
import { 
  getAnalyticsSummary, 
  resetAnalytics 
} from '../lib/analyticsTracker';

export const CATEGORY_DEFAULT_IMAGES = {
  'Splashjet Inks': 'https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-003-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Splashjet-Epson-003.webp',
  'Printers': 'https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-l3250-a4-wi-fi-multifunction-inktank-printer.Epson-L3250-1.webp',
  'Photocopy Machines': 'https://corporatetechbd.com/wp-content/uploads/2025/07/141_174056278894495.webp',
  'Machinery': 'https://corporatetechbd.com/wp-content/uploads/2025/08/DTFWithoutText.webp',
  'POS & Barcode': 'https://corporatetechbd.com/wp-content/uploads/2026/06/xprinter-xp-365b-thermal-barcode-label-printer-usb-bluetooth-80mm-203dpi-127mms-speed.PRINTER-XPRINTER-XP-365B-USBBT-web-said-Large-1.jpg',
  'Toner & Inks': 'https://corporatetechbd.com/wp-content/uploads/2025/07/splashjet-premium-774-cmybk-compatible-refill-ink-for-epson-l3210-l3250-printer.Epson-774.webp',
  'Accessories & Parts': 'https://corporatetechbd.com/wp-content/uploads/2025/09/original-printhead-for-epson-ecotank-l8050-l18050-reliable-high-quality-solution.product-image.webp'
};

export function getCategoryDefaultImage(catName) {
  if (!catName) return CATEGORY_DEFAULT_IMAGES['Splashjet Inks'];
  const lower = catName.toLowerCase();
  if (lower.includes('printer')) return CATEGORY_DEFAULT_IMAGES['Printers'];
  if (lower.includes('photocopy')) return CATEGORY_DEFAULT_IMAGES['Photocopy Machines'];
  if (lower.includes('splashjet')) return CATEGORY_DEFAULT_IMAGES['Splashjet Inks'];
  if (lower.includes('toner') || lower.includes('original')) return CATEGORY_DEFAULT_IMAGES['Toner & Inks'];
  if (lower.includes('machin') || lower.includes('combo') || lower.includes('setup') || lower.includes('press')) return CATEGORY_DEFAULT_IMAGES['Machinery'];
  if (lower.includes('pos') || lower.includes('barcode') || lower.includes('scanner') || lower.includes('drawer')) return CATEGORY_DEFAULT_IMAGES['POS & Barcode'];
  if (lower.includes('access') || lower.includes('part') || lower.includes('drum')) return CATEGORY_DEFAULT_IMAGES['Accessories & Parts'];
  return CATEGORY_DEFAULT_IMAGES['Splashjet Inks'];
}

/**
 * Image Upload Dropzone & Preset Picker with Real Category Images
 */
function ImageUploadField({ imageUrl, onImageChange, isUploading, onCategoryPresetSelect }) {
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const presets = [
    { label: 'Splashjet Ink', category: 'Splashjet Inks', path: CATEGORY_DEFAULT_IMAGES['Splashjet Inks'] },
    { label: 'Printers', category: 'Printers', path: CATEGORY_DEFAULT_IMAGES['Printers'] },
    { label: 'Photocopy Machine', category: 'Photocopy Machines', path: CATEGORY_DEFAULT_IMAGES['Photocopy Machines'] },
    { label: 'Machinery & DTF', category: 'Machinery', path: CATEGORY_DEFAULT_IMAGES['Machinery'] },
    { label: 'POS & Barcode', category: 'POS & Barcode', path: CATEGORY_DEFAULT_IMAGES['POS & Barcode'] },
    { label: 'Toner & Inks', category: 'Toner & Inks', path: CATEGORY_DEFAULT_IMAGES['Toner & Inks'] },
    { label: 'Accessories & Parts', category: 'Accessories & Parts', path: CATEGORY_DEFAULT_IMAGES['Accessories & Parts'] },
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          প্রোডাক্ট ছবি *
        </label>
        <button
          type="button"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-[11px] font-semibold text-[#c92127] hover:underline cursor-pointer"
        >
          {useUrlInput ? '📁 ফাইল আপলোড ড্রপজোন' : '🔗 লিঙ্ক/পাথ পেস্ট করুন'}
        </button>
      </div>

      {!useUrlInput ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#c92127] bg-slate-50 hover:bg-red-50/20 rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center text-center relative group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onImageChange(e.target.files[0]);
              }
            }}
          />

          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-[#c92127] animate-spin" />
              <span className="text-xs font-bold text-slate-600">ছবি আপলোড হচ্ছে...</span>
            </div>
          ) : imageUrl ? (
            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Selected"
                  className="w-14 h-14 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-sm"
                  onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ছবি সংযুক্ত আছে</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    অন্য ছবি দিতে ক্লিক করুন বা নিচে রেডিমেড ছবি বাছাই করুন
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#c92127] bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
                ছবি পরিবর্তন
              </span>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#c92127] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                কম্পিউটার থেকে ছবি আপলোড করতে ক্লিক করুন
              </span>
              <span className="text-[11px] text-slate-400">
                অথবা ছবি ড্রপ করুন কিংবা নিচে সব ক্যাটাগরির রেডিমেড ছবি ক্লিক করুন
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="ছবির ওয়েব লিঙ্ক বা পাথ (যেমন: https://...)"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value, true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20 font-mono"
          />
        </div>
      )}

      {/* Preset Quick Picks for ALL Real Categories */}
      <div className="pt-2">
        <span className="text-[11px] font-bold text-slate-500 block mb-2">
          অথবা সকল ক্যাটাগরির রিয়েল রেডিমেড ছবি সিলেক্ট করুন:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {presets.map((preset) => {
            const isCurrent = imageUrl === preset.path;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onImageChange(preset.path, true);
                  if (onCategoryPresetSelect) {
                    onCategoryPresetSelect(preset.category);
                  }
                }}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                  isCurrent
                    ? 'bg-red-50 border-[#c92127] ring-1 ring-[#c92127] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <img
                  src={preset.path}
                  alt={preset.label}
                  className="w-8 h-8 object-contain rounded-lg bg-white p-0.5 border border-slate-100 flex-shrink-0"
                  onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                />
                <div className="min-w-0">
                  <span className={`text-[11px] font-bold block truncate ${
                    isCurrent ? 'text-[#c92127]' : 'text-slate-700'
                  }`}>
                    {preset.label}
                  </span>
                  <span className="text-[9px] text-slate-400 block">ক্লিক করে সিলেক্ট করুন</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ 
  isOpen, 
  onClose, 
  products = [], 
  onProductsUpdate 
}) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'list' | 'add'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Handle image upload from file or direct selection
  const handleImageUpload = async (fileOrUrl, isDirectUrl = false, isEditing = false) => {
    if (isDirectUrl) {
      if (isEditing) {
        setEditingProduct(prev => ({ ...prev, image_url: fileOrUrl }));
      } else {
        setNewProduct(prev => ({ ...prev, image_url: fileOrUrl }));
      }
      return;
    }

    if (!fileOrUrl) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadProductImage(fileOrUrl);
      if (uploadedUrl) {
        if (isEditing) {
          setEditingProduct(prev => ({ ...prev, image_url: uploadedUrl }));
        } else {
          setNewProduct(prev => ({ ...prev, image_url: uploadedUrl }));
        }
        showNotification('ছবি সফলভাবে আপলোড হয়েছে!');
      }
    } catch (err) {
      showNotification('ছবি আপলোড করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Auto-calculate Sale Price from Regular Price & Discount Badge
  const calcSalePrice = (regular, discountStr) => {
    const reg = parseFloat(regular);
    if (isNaN(reg) || reg <= 0) return '';
    const match = String(discountStr).match(/(\d+(\.\d+)?)/);
    if (match) {
      const pct = parseFloat(match[1]);
      if (pct > 0 && pct < 100) {
        return Math.round(reg - (reg * (pct / 100)));
      }
    }
    return reg;
  };

  // Auto-calculate Discount Badge from Regular & Sale Price
  const calcDiscountBadge = (regular, sale) => {
    const reg = parseFloat(regular);
    const s = parseFloat(sale);
    if (isNaN(reg) || isNaN(s) || reg <= 0 || s <= 0) return '';
    if (reg > s) {
      const pct = Math.round(((reg - s) / reg) * 100);
      return `-${pct}%`;
    }
    return 'Sale!';
  };

  // Handle Regular Price Input Change
  const handleRegularPriceChange = (val, isEditing = false) => {
    if (isEditing) {
      setEditingProduct(prev => {
        const discount = prev.discount_label || '-10%';
        const autoSale = calcSalePrice(val, discount);
        return {
          ...prev,
          regular_price: val,
          sale_price: autoSale !== '' ? autoSale : prev.sale_price
        };
      });
    } else {
      setNewProduct(prev => {
        const discount = prev.discount_label || '-10%';
        const autoSale = calcSalePrice(val, discount);
        return {
          ...prev,
          regular_price: val,
          sale_price: autoSale !== '' ? autoSale : prev.sale_price
        };
      });
    }
  };

  // Handle Discount Badge Input Change or Preset Click
  const handleDiscountChange = (discountStr, isEditing = false) => {
    if (isEditing) {
      setEditingProduct(prev => {
        const autoSale = calcSalePrice(prev.regular_price, discountStr);
        return {
          ...prev,
          discount_label: discountStr,
          sale_price: autoSale !== '' ? autoSale : prev.sale_price
        };
      });
    } else {
      setNewProduct(prev => {
        const autoSale = calcSalePrice(prev.regular_price, discountStr);
        return {
          ...prev,
          discount_label: discountStr,
          sale_price: autoSale !== '' ? autoSale : prev.sale_price
        };
      });
    }
  };

  // Handle Sale Price Input Change (reverse calculates discount)
  const handleSalePriceChange = (val, isEditing = false) => {
    if (isEditing) {
      setEditingProduct(prev => {
        const autoDiscount = calcDiscountBadge(prev.regular_price, val);
        return {
          ...prev,
          sale_price: val,
          discount_label: autoDiscount || prev.discount_label
        };
      });
    } else {
      setNewProduct(prev => {
        const autoDiscount = calcDiscountBadge(prev.regular_price, val);
        return {
          ...prev,
          sale_price: val,
          discount_label: autoDiscount || prev.discount_label
        };
      });
    }
  };

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: 'Corporate Tech',
    category: 'Splashjet Inks',
    regular_price: '',
    sale_price: '',
    discount_label: '-10%',
    stock_quantity: 25,
    image_url: CATEGORY_DEFAULT_IMAGES['Splashjet Inks'],
    price_range_label: ''
  });

  const categories = [
    'Splashjet Inks',
    'Printers',
    'Photocopy Machines',
    'Machinery',
    'POS & Barcode',
    'Toner & Inks',
    'Accessories & Parts'
  ];

  // Refresh analytics whenever tab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const summary = getAnalyticsSummary(products);
      setAnalyticsData(summary);
    }
  }, [isOpen, activeTab, products]);

  if (!isOpen) return null;

  const showNotification = (msg, type = 'success') => {
    setStatusMessage({ msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleRefreshAnalytics = () => {
    const summary = getAnalyticsSummary(products);
    setAnalyticsData(summary);
    showNotification('এনালিটিক্স ডেটা রিফ্রেশ করা হয়েছে!');
  };

  const handleResetAnalytics = () => {
    if (window.confirm('আপনি কি ট্র্যাকিং ডেটা রিসেট করতে চান?')) {
      const summary = resetAnalytics();
      setAnalyticsData(summary);
      showNotification('ট্র্যাকিং ডেটা ডিফল্ট অবস্থায় রিসেট করা হয়েছে');
    }
  };

  // 1. Handle Edit Product Submit
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);

    try {
      const updatedItem = {
        ...editingProduct,
        regular_price: Number(editingProduct.regular_price),
        sale_price: Number(editingProduct.sale_price),
        stock_quantity: Number(editingProduct.stock_quantity)
      };

      await updateProductOnSupabase(editingProduct.id, updatedItem);

      const updatedList = products.map(p => p.id === editingProduct.id ? updatedItem : p);
      onProductsUpdate(updatedList);

      showNotification(`প্রোডাক্ট "${updatedItem.title.slice(0, 25)}..." সফলভাবে আপডেট হয়েছে!`);
      setEditingProduct(null);
    } catch (err) {
      showNotification('আপডেট করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.sale_price) {
      alert('দয়া করে প্রোডাক্টের নাম ও বিক্রয় মূল্য লিখুন');
      return;
    }
    setIsSaving(true);

    try {
      const productPayload = {
        title: newProduct.title,
        brand: newProduct.brand || 'Corporate Tech',
        category: newProduct.category || 'Splashjet Ink',
        regular_price: Number(newProduct.regular_price || newProduct.sale_price),
        sale_price: Number(newProduct.sale_price),
        stock_quantity: Number(newProduct.stock_quantity || 20),
        discount_label: newProduct.discount_label,
        image_url: newProduct.image_url || '/splashjet_images/about-splashjet.jpg'
      };

      const created = await createProductOnSupabase(productPayload);
      const productToAdd = created || { ...productPayload, id: `p_${Date.now()}` };

      onProductsUpdate([productToAdd, ...products]);

      showNotification(`নতুন প্রোডাক্ট "${productToAdd.title.slice(0, 25)}..." সফলভাবে যোগ ও লাইভ হয়েছে!`);
      
      setNewProduct({
        title: '',
        brand: 'Corporate Tech',
        category: 'Splashjet Inks',
        regular_price: '',
        sale_price: '',
        discount_label: '-10%',
        stock_quantity: 25,
        image_url: CATEGORY_DEFAULT_IMAGES['Splashjet Inks'],
        price_range_label: ''
      });
      setActiveTab('list');
    } catch (err) {
      showNotification('প্রোডাক্ট তৈরি করতে সমস্যা হয়েছে', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Handle Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${title}" মুছে ফেলতে চান?`)) return;

    try {
      await deleteProductFromSupabase(id);
      const remaining = products.filter(p => p.id !== id);
      onProductsUpdate(remaining);
      showNotification(`প্রোডাক্ট মুছে ফেলা হয়েছে!`);
    } catch (err) {
      showNotification('ডিলিট করতে সমস্যা হয়েছে', 'error');
    }
  };

  // Filter products in admin
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;

    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = (p.stock_quantity ?? 10) > 5;
    if (stockFilter === 'low_stock') matchesStock = (p.stock_quantity ?? 10) > 0 && (p.stock_quantity ?? 10) <= 5;
    if (stockFilter === 'out_of_stock') matchesStock = (p.stock_quantity ?? 10) === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const maxViews = analyticsData?.topViewed?.[0]?.views || 1;
  const maxCarts = analyticsData?.topCart?.[0]?.carts || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[94vh] max-h-[94vh] animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c92127] flex items-center justify-center shadow-lg shadow-red-900/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Corporate Tech কন্ট্রোল প্যানেল
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  পাবলিক অ্যাক্সেস (Auth মুক্ত)
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                প্রোডাক্ট ম্যানেজমেন্ট (CRUD) এবং মার্কেটিং অডিয়েন্স ট্র্যাকিং এনালিটিক্স
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Bar & Notification Area */}
        <div className="p-3 sm:px-6 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Tab 1: Analytics */}
            <button
              onClick={() => { setActiveTab('analytics'); setEditingProduct(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>📊 মার্কেটিং এনালিটিক্স</span>
            </button>

            {/* Tab 2: All Products */}
            <button
              onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'list' && !editingProduct
                  ? 'bg-[#c92127] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>সকল প্রোডাক্ট ({products.length})</span>
            </button>

            {/* Tab 3: Add New Product */}
            <button
              onClick={() => { setActiveTab('add'); setEditingProduct(null); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'add'
                  ? 'bg-[#c92127] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রোডাক্ট যোগ</span>
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn self-start sm:self-auto ${
              statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{statusMessage.msg}</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* ========================================================= */}
          {/* TAB 1: MARKETING & BEHAVIOR ANALYTICS                     */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-6">
              
              {/* Analytics Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>গ্রাহক এনগেজমেন্ট ও মার্কেটিং ড্যাশবোর্ড</span>
                    <span className="bg-red-100 text-[#c92127] text-[10px] font-black px-2 py-0.5 rounded-full">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ভিজিটররা কোন প্রোডাক্টে বেশি ক্লিক করছেন এবং কোনগুলো কার্টে নিচ্ছেন তার রিয়েল-টাইম তথ্য
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshAnalytics}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Refresh Stats"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={handleResetAnalytics}
                    className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Reset Sample Data"
                  >
                    রিসেট
                  </button>
                </div>
              </div>

              {/* KPI Top Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Views / Clicks */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">মোট প্রোডাক্ট ক্লিক/ভিউ</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analyticsData.totalViews}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +18%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">সব ভিজিটরদের সম্মিলিত ক্লিক</p>
                </div>

                {/* 2. Total Add to Cart */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">মোট অ্যাড টু কার্ট</span>
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analyticsData.totalCarts}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">কার্টে প্রোডাক্ট যুক্ত করার সংখ্যা</p>
                </div>

                {/* 3. Conversion Rate */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">কার্ট কনভার্সন রেট</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {analyticsData.overallConversion}%
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      চমৎকার
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">ক্লিককারীদের কতজন কার্টে নিচ্ছেন</p>
                </div>

                {/* 4. Active Catalog Count */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">ক্যাটালগ আইটেম</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {products.length}
                    </span>
                    <span className="text-[11px] text-slate-500">আইটেম লাইভ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">ওয়েবসাইটে প্রদর্শিত মোট পণ্য</p>
                </div>
              </div>

              {/* Marketing Action Recommendations (AI-style suggestions) */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-extrabold text-white">
                    স্মার্ট মার্কেটিং অ্যাকশন ও সুপারিশ (Automated Marketing Insights)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analyticsData.recommendations.map((rec, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/10 hover:bg-white/15 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          rec.color === 'amber' ? 'bg-amber-400 text-slate-950' :
                          rec.color === 'emerald' ? 'bg-emerald-400 text-slate-950' :
                          rec.color === 'rose' ? 'bg-rose-400 text-white' : 'bg-sky-400 text-slate-950'
                        }`}>
                          {rec.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {rec.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Grid: Top Clicked vs Top Add-to-Cart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Top Clicked / Viewed Leaderboard */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        সবচেয়ে বেশি ক্লিক ও ভিউ হওয়া প্রোডাক্ট (Top Viewed)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">ক্লিক সংখ্যা</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {analyticsData.topViewed.map((item, idx) => {
                      const pct = Math.round((item.views / maxViews) * 100);
                      return (
                        <div key={item.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0 ? 'bg-amber-400 text-slate-950 shadow' :
                              idx === 1 ? 'bg-slate-300 text-slate-800' :
                              idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0"
                              onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                                {item.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">{item.category}</span>
                                <span>৳{Number(item.sale_price).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-900">{item.views}</span>
                              <div className="text-[10px] text-slate-400 font-semibold">{item.conversionRate}% কনভার্সন</div>
                            </div>
                          </div>
                          
                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Top Added to Cart Leaderboard */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-[#c92127] flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        সবচেয়ে বেশি কার্টে নেওয়া প্রোডাক্ট (Top Added to Cart)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">কার্ট সংখ্যা</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {analyticsData.topCart.map((item, idx) => {
                      const pct = Math.round((item.carts / maxCarts) * 100);
                      return (
                        <div key={item.id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                              idx === 0 ? 'bg-[#c92127] text-white shadow' :
                              idx === 1 ? 'bg-slate-300 text-slate-800' :
                              idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <img 
                              src={item.image_url} 
                              alt={item.title}
                              className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0"
                              onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                                {item.title}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">{item.category}</span>
                                <span>স্টক: {item.stock_quantity}টি</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-[#c92127]">{item.carts} বার</span>
                              <div className="text-[10px] text-emerald-600 font-bold">{item.conversionRate}% কনভার্ট</div>
                            </div>
                          </div>
                          
                          {/* Visual Progress Bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-[#c92127] h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Category Popularity Share */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>ক্যাটাগরি ভিত্তিক গ্রাহকের আগ্রহ (Category Engagement Breakdown)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(analyticsData.categoryClicks).map(([catName, count]) => (
                    <div key={catName} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-700 truncate">{catName}</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900">{count}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">ক্লিক</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PRODUCT MANAGEMENT & CRUD (List, Edit, Delete)     */}
          {/* ========================================================= */}
          {activeTab === 'list' && !editingProduct && (
            <div className="space-y-4">
              
              {/* Filter Bar: Search, Category, Stock status */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="প্রোডাক্ট নাম, ব্র্যান্ড বা ক্যাটাগরি সার্চ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#c92127]/20 outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto">
                  {/* Category dropdown */}
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="All">সকল ক্যাটাগরি</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Stock status toggle */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="all">সব স্টক</option>
                    <option value="in_stock">স্টকে আছে</option>
                    <option value="low_stock">স্টক কম (≤ 5)</option>
                    <option value="out_of_stock">স্টক শেষ (0)</option>
                  </select>

                  <button
                    onClick={() => setActiveTab('add')}
                    className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন প্রোডাক্ট</span>
                  </button>
                </div>
              </div>

              {/* Product Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-3 px-4">ছবি ও নাম</th>
                        <th className="py-3 px-4">ক্যাটাগরি</th>
                        <th className="py-3 px-4">বিক্রয় মূল্য</th>
                        <th className="py-3 px-4">রেগুলার মূল্য</th>
                        <th className="py-3 px-4">স্টক স্ট্যাটাস</th>
                        <th className="py-3 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400">
                            কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const stock = p.stock_quantity ?? 10;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Title & Thumbnail */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3 max-w-sm">
                                  <img 
                                    src={p.image_url} 
                                    alt={p.title}
                                    className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0"
                                    onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-800 truncate" title={p.title}>
                                      {p.title}
                                    </div>
                                    <div className="text-[11px] text-slate-400">ব্র্যান্ড: {p.brand || 'Corporate Tech'}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-4">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                  {p.category}
                                </span>
                              </td>

                              {/* Sale Price */}
                              <td className="py-3 px-4 font-bold text-slate-900">
                                ৳{Number(p.sale_price).toLocaleString()}
                              </td>

                              {/* Regular Price */}
                              <td className="py-3 px-4 text-slate-400 line-through">
                                {p.regular_price ? `৳${Number(p.regular_price).toLocaleString()}` : '-'}
                              </td>

                              {/* Stock status badge */}
                              <td className="py-3 px-4">
                                {stock === 0 ? (
                                  <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold text-[10px]">
                                    স্টক শেষ
                                  </span>
                                ) : stock <= 5 ? (
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                    স্টক কম ({stock}টি)
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                    স্টকে আছে ({stock}টি)
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingProduct(p)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.title)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* EDIT PRODUCT MODAL FORM                                   */}
          {/* ========================================================= */}
          {editingProduct && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    প্রোডাক্ট এডিট করুন: {editingProduct.title}
                  </h3>
                  <p className="text-xs text-slate-500">মূল্য, স্টক ও তথ্য আপডেট করুন</p>
                </div>
                <button 
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রোডাক্ট নাম
                  </label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-[#c92127]/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setEditingProduct(prev => ({ 
                          ...prev, 
                          category: newCat,
                          image_url: getCategoryDefaultImage(newCat)
                        }));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ব্র্যান্ড</label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                {/* Pricing and Discount with Auto-Calculator */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Regular Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      রেগুলার মূল্য (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="যেমন: ২০০০"
                      value={editingProduct.regular_price || ''}
                      onChange={(e) => handleRegularPriceChange(e.target.value, true)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20 font-bold"
                    />
                  </div>

                  {/* Discount Badge */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ডিসকাউন্ট ব্যাজ (ছাড় %)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: -10%, Sale!"
                      value={editingProduct.discount_label || ''}
                      onChange={(e) => handleDiscountChange(e.target.value, true)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20 font-bold text-slate-800"
                    />
                  </div>

                  {/* Sale Price (Auto Calculated) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        বিক্রয় মূল্য (Sale Price ৳) *
                      </label>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        অটো ক্যালকুলেট
                      </span>
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="যেমন: ১৮০০"
                      value={editingProduct.sale_price}
                      onChange={(e) => handleSalePriceChange(e.target.value, true)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-[#c92127] outline-none focus:ring-2 focus:ring-[#c92127]/20"
                    />
                  </div>
                </div>

                {/* Quick Discount Presets and Savings Banner */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-500 mr-1">কুইক ডিসকাউন্ট:</span>
                    {['-5%', '-10%', '-15%', '-20%', '-25%', '-30%', 'Sale!'].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => handleDiscountChange(badge, true)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          editingProduct.discount_label === badge
                            ? 'bg-[#c92127] text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>

                  {Number(editingProduct.regular_price) > Number(editingProduct.sale_price) && Number(editingProduct.sale_price) > 0 && (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span>💡 সাশ্রয়: ৳{Number(editingProduct.regular_price - editingProduct.sale_price).toLocaleString()}</span>
                      <span>({Math.round(((editingProduct.regular_price - editingProduct.sale_price) / editingProduct.regular_price) * 100)}% ছাড়)</span>
                    </div>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    স্টক সংখ্যা
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity ?? 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>

                {/* Image Upload & Picker */}
                <ImageUploadField
                  imageUrl={editingProduct.image_url || ''}
                  onImageChange={(val, isDirect) => handleImageUpload(val, isDirect, true)}
                  isUploading={isUploadingImage}
                  onCategoryPresetSelect={(cat) => {
                    setEditingProduct(prev => ({
                      ...prev,
                      category: cat,
                      image_url: CATEGORY_DEFAULT_IMAGES[cat] || prev.image_url
                    }));
                  }}
                />

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট সেভ করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ADD NEW PRODUCT WITH LIVE PREVIEW                   */}
          {/* ========================================================= */}
          {activeTab === 'add' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Form */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  নতুন প্রোডাক্ট যোগ করুন
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  প্রয়োজনীয় তথ্য পূরণ করে সাবমিট করুন। ডানের কার্ডে লাইভ দেখতে পারবেন।
                </p>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      প্রোডাক্ট নাম (Title) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: Splashjet Premium DTF White Ink 1000ml"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ক্যাটাগরি *
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setNewProduct(prev => ({ 
                            ...prev, 
                            category: newCat,
                            image_url: getCategoryDefaultImage(newCat)
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ব্র্যান্ড
                      </label>
                      <input
                        type="text"
                        placeholder="Corporate Tech, Splashjet, Canon..."
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing and Discount with Auto-Calculator */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Regular Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        রেগুলার মূল্য (৳)
                      </label>
                      <input
                        type="number"
                        placeholder="যেমন: ২০০০"
                        value={newProduct.regular_price}
                        onChange={(e) => handleRegularPriceChange(e.target.value, false)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20 font-bold"
                      />
                    </div>

                    {/* Discount Badge */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ডিসকাউন্ট ব্যাজ (ছাড় %)
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: -10%, Sale!"
                        value={newProduct.discount_label}
                        onChange={(e) => handleDiscountChange(e.target.value, false)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c92127]/20 font-bold text-slate-800"
                      />
                    </div>

                    {/* Sale Price (Auto Calculated) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          বিক্রয় মূল্য (Sale Price ৳) *
                        </label>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                          অটো ক্যালকুলেট
                        </span>
                      </div>
                      <input
                        type="number"
                        required
                        placeholder="যেমন: ১৮০০"
                        value={newProduct.sale_price}
                        onChange={(e) => handleSalePriceChange(e.target.value, false)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-[#c92127] outline-none focus:ring-2 focus:ring-[#c92127]/20"
                      />
                    </div>
                  </div>

                  {/* Quick Discount Presets and Savings Banner */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">কুইক ডিসকাউন্ট:</span>
                      {['-5%', '-10%', '-15%', '-20%', '-25%', '-30%', 'Sale!'].map((badge) => (
                        <button
                          key={badge}
                          type="button"
                          onClick={() => handleDiscountChange(badge, false)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            newProduct.discount_label === badge
                              ? 'bg-[#c92127] text-white shadow-sm'
                              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {badge}
                        </button>
                      ))}
                    </div>

                    {Number(newProduct.regular_price) > Number(newProduct.sale_price) && Number(newProduct.sale_price) > 0 && (
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <span>💡 সাশ্রয়: ৳{Number(newProduct.regular_price - newProduct.sale_price).toLocaleString()}</span>
                        <span>({Math.round(((newProduct.regular_price - newProduct.sale_price) / newProduct.regular_price) * 100)}% ছাড়)</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      স্টক সংখ্যা
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  {/* Image Upload Dropzone & Preset Picker */}
                  <ImageUploadField
                    imageUrl={newProduct.image_url}
                    onImageChange={(val, isDirect) => handleImageUpload(val, isDirect, false)}
                    isUploading={isUploadingImage}
                    onCategoryPresetSelect={(cat) => {
                      setNewProduct(prev => ({
                        ...prev,
                        category: cat,
                        image_url: CATEGORY_DEFAULT_IMAGES[cat] || prev.image_url
                      }));
                    }}
                  />

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'প্রোডাক্ট সংরক্ষণ করুন'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Col: Live Preview Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                  গ্রাহক সাইটে যেমন দেখাবে (Live Preview)
                </span>

                <div className="w-full max-w-[260px] bg-white rounded-2xl border border-slate-200 shadow-md p-4 flex flex-col justify-between relative overflow-hidden">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#c92127] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {newProduct.discount_label || 'Sale!'}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="h-36 flex items-center justify-center p-2 bg-slate-50 rounded-xl mb-3">
                    <img
                      src={newProduct.image_url || '/splashjet_images/about-splashjet.jpg'}
                      alt="Preview"
                      className="max-h-32 object-contain"
                      onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                    />
                  </div>

                  {/* Title & Price */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      {newProduct.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 min-h-[2rem]">
                      {newProduct.title || 'প্রোডাক্টের নাম এখানে আসবে'}
                    </h5>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {newProduct.regular_price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ৳{Number(newProduct.regular_price).toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm font-black text-[#c92127]">
                        ৳{newProduct.sale_price ? Number(newProduct.sale_price).toLocaleString() : '০'}
                      </span>
                    </div>
                  </div>

                  {/* Mock Button */}
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <div className="w-full py-1.5 bg-[#c92127] text-white text-[11px] font-bold rounded-lg text-center flex items-center justify-center gap-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>কার্টে নিন</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-4">
                  ফর্ম পূরণ করার সাথে সাথেই প্রিভিউ স্বয়ংক্রিয়ভাবে আপডেট হচ্ছে।
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
