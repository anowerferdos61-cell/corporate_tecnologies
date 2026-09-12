import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Star,
  CheckCircle2,
  Check,
  Truck,
  ShieldCheck,
  Phone,
  Share2,
  Minus,
  Plus,
  Zap,
  Home,
  ChevronRight,
  Sparkles,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard, { isComparableProduct, triggerFlyToCompareAnimation } from './ProductCard';
import FlashSaleUrgencyBox from './FlashSaleUrgencyBox';

export default function ProductDetailPage({
  productSlug: propProductSlug,
  allProducts = [],
  onNavigate
}) {
  const { productSlug: paramProductSlug } = useParams();
  const navigate = useNavigate();
  const productSlug = propProductSlug || paramProductSlug;

  const handleNav = (url, extra) => {
    if (onNavigate) {
      onNavigate(url, extra);
    } else {
      navigate(url);
    }
  };

  const {
    cartItems,
    addToCart,
    toggleWishlist,
    wishlist,
    setIsCartOpen,
    showToast
  } = useCart();

  // Find product by slug or id
  const product = useMemo(() => {
    if (!productSlug) return null;
    const cleanSlug = String(productSlug).replace(/^\/|\/$/g, '').toLowerCase();
    return allProducts.find(p =>
      (p.slug && p.slug.toLowerCase() === cleanSlug) ||
      String(p.id) === cleanSlug
    ) || null;
  }, [productSlug, allProducts]);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specifications'

  // Initialize selected image and variation when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image_url || '/splashjet_images/about-splashjet.jpg');
      if (product.variations && product.variations.length > 0) {
        setSelectedVariation(product.variations[0]);
      } else {
        setSelectedVariation(null);
      }
      setQuantity(1);
      document.title = `${product.title} – Corporate Technologies BD`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  // Gallery Images
  const gallery = useMemo(() => {
    if (!product) return [];
    const images = Array.isArray(product.gallery_images) && product.gallery_images.length > 0
      ? product.gallery_images
      : [product.image_url];
    // deduplicate
    return Array.from(new Set(images.filter(Boolean)));
  }, [product]);

  // Pricing calculations based on variant or base product
  const activeSalePrice = selectedVariation ? Number(selectedVariation.sale_price) : (Number(product?.sale_price) || Number(product?.regular_price) || 0);
  const activeRegPrice = selectedVariation ? Number(selectedVariation.regular_price) : (Number(product?.regular_price) || activeSalePrice);
  const discountAmount = activeRegPrice > activeSalePrice ? activeRegPrice - activeSalePrice : 0;
  const discountPercent = activeRegPrice > activeSalePrice && activeRegPrice > 0
    ? Math.round(((activeRegPrice - activeSalePrice) / activeRegPrice) * 100)
    : 0;

  const isSoldOut = product?.stock_quantity === 0;
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || (product.raw_categories && p.raw_categories && p.raw_categories[0] === product.raw_categories[0])))
      .slice(0, 4);
  }, [allProducts, product]);

  const [isJustAdded, setIsJustAdded] = useState(false);

  // Compare Support (for Inks, Printers & Photocopiers)
  const canCompare = product ? isComparableProduct(product) : false;

  const [isCompared, setIsCompared] = useState(() => {
    try {
      const saved = localStorage.getItem('ct_compare_list');
      if (saved && product) {
        const list = JSON.parse(saved);
        return Array.isArray(list) && list.some(item => item.id === product.id);
      }
    } catch { }
    return false;
  });

  const [isJustCompared, setIsJustCompared] = useState(false);

  useEffect(() => {
    const handleCompareSync = (e) => {
      if (e?.detail && Array.isArray(e.detail) && product) {
        setIsCompared(e.detail.some(item => item.id === product.id));
      }
    };
    window.addEventListener('ct_compare_updated', handleCompareSync);
    return () => window.removeEventListener('ct_compare_updated', handleCompareSync);
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 max-w-lg mx-auto space-y-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Product Not Found!</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The product you are looking for may have been removed or the link has changed.
          </p>
          <button
            onClick={() => onNavigate ? onNavigate('/shop/') : (window.location.href = '/shop/')}
            className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View All Products (Shop)</span>
          </button>
        </div>
      </div>
    );
  }

  const handleToggleCompare = (e) => {
    if (e) e.stopPropagation();
    if (!product) return;

    setIsJustCompared(true);
    setTimeout(() => setIsJustCompared(false), 1800);

    try {
      let list = [];
      const saved = localStorage.getItem('ct_compare_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) list = parsed;
      }

      let updated;
      const exists = list.some(item => item.id === product.id);
      if (exists) {
        updated = list.filter(item => item.id !== product.id);
        setIsCompared(false);
      } else {
        if (list.length >= 3) {
          updated = [...list.slice(0, 2), product];
        } else {
          updated = [...list, product];
        }
        setIsCompared(true);
        triggerFlyToCompareAnimation(e.currentTarget, selectedImage || product.image_url);
      }

      localStorage.setItem('ct_compare_list', JSON.stringify(updated));
      localStorage.setItem('ct_compare_cleared', updated.length === 0 ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('ct_compare_updated', { detail: updated }));
    } catch (err) {
      console.error('Error updating compare:', err);
    }
  };

  // Check if current product is already in cart
  const cartItem = cartItems?.find(item => (item.product?.id || item.id) === product?.id);
  const isInCart = Boolean(cartItem);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAddToCart = (e) => {
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 2000);

    const itemToAdd = selectedVariation ? {
      ...product,
      title: `${product.title} - ${selectedVariation.name}`,
      sale_price: activeSalePrice,
      regular_price: activeRegPrice,
      variation_name: selectedVariation.name
    } : product;

    addToCart(itemToAdd, quantity, e);
  };

  const handleBuyNow = (e) => {
    handleAddToCart(e);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('প্রোডাক্ট লিংক কপি করা হয়েছে!', 'info');
    }
  };

  return (
    <div className="bg-white min-h-screen pb-36 md:pb-12">
      {/* 1. Breadcrumbs Bar */}
      <div className="bg-slate-50 border-b border-slate-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <button
              onClick={() => onNavigate ? onNavigate('/') : (window.location.href = '/')}
              className="hover:text-[#c92127] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate ? onNavigate('/shop/') : (window.location.href = '/shop/')}
              className="hover:text-[#c92127] cursor-pointer transition-colors"
            >
              Shop
            </button>
            {product.category && (
              <>
                <span>/</span>
                <button
                  onClick={() => {
                    const slug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    if (onNavigate) onNavigate(`/product-category/${slug}/`, product.category);
                  }}
                  className="hover:text-[#c92127] cursor-pointer transition-colors"
                >
                  {product.category}
                </button>
              </>
            )}
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Main Product Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">

        {/* Back Button for mobile & desktop */}
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : (onNavigate ? onNavigate('/shop/') : null)}
          className="mb-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#c92127] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Previous Page</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: Gallery Showcase (5 cols on desktop) */}
          <div className="lg:col-span-6 space-y-4">

            {/* Main Featured Image Card */}
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[420px] shadow-sm overflow-hidden group">

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {product.is_featured && (
                  <span className="bg-slate-900 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>FEATURED</span>
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#c92127] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    -{discountPercent}% OFF
                  </span>
                )}
                {isSoldOut && (
                  <span className="bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    Stock Out
                  </span>
                )}
              </div>

              {/* Wishlist and Share */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-slate-600 hover:text-[#c92127] hover:bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 flex items-center justify-center shadow-sm transition-all cursor-pointer ${isWishlisted ? 'text-[#c92127]' : 'text-slate-600 hover:text-[#c92127]'
                    }`}
                  title="Add to wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* High-res Main Image */}
              <img
                src={selectedImage || product.image_url}
                alt={product.title}
                className="max-h-[280px] sm:max-h-[380px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
              />
            </div>

            {/* Gallery Thumbnail Carousel */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {gallery.map((img, idx) => {
                  const isCurrent = selectedImage === img;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white p-1.5 border transition-all cursor-pointer overflow-hidden ${isCurrent
                          ? 'border-[#c92127] ring-2 ring-[#c92127]/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`thumbnail-${idx}`}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Trust Assurance Card below image */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="text-xs sm:text-[13px] font-semibold">
                <span>100% Official Authentic Product & 1 Year Official Warranty</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Product Details, Variations & Actions (6 cols on desktop) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Badges & Meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  SKU: {product.sku || `CT-${product.id}`}
                </span>
                <span className="text-[11px] font-bold text-[#c92127] bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {product.rating || '4.9'}
                </span>
                <span className="text-xs text-slate-400">
                  ({product.reviews_count || '24'} Reviews)
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-bold text-emerald-600">
                  In Stock (Ready to Ship)
                </span>
              </div>
            </div>

            {/* Live Flash Sale Urgency & Stock Status Box */}
            <FlashSaleUrgencyBox product={product} />

            {/* Pricing Section */}
            <div className="bg-slate-50/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#c92127] tracking-tight">
                  ৳{activeSalePrice.toLocaleString()}
                </span>
                {activeRegPrice > activeSalePrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                    ৳{activeRegPrice.toLocaleString()}
                  </span>
                )}
                {discountAmount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Save ৳{discountAmount.toLocaleString()} (-{discountPercent}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                VAT & Tax included. Cash on Delivery available nationwide.
              </p>
            </div>

            {/* Variations Selector (if available) */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#c92127]" />
                    <span>Select Variant / Color Option:</span>
                  </label>
                  {selectedVariation && (
                    <span className="text-xs font-bold text-[#c92127]">
                      {selectedVariation.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.variations.map((v, idx) => {
                    const isSelected = selectedVariation?.name === v.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVariation(v);
                          if (v.image_url) setSelectedImage(v.image_url);
                        }}
                        className={`text-xs sm:text-sm px-4 py-2.5 rounded-xl border transition-all cursor-pointer font-semibold flex items-center gap-2 ${isSelected
                            ? 'bg-[#c92127] text-white border-[#c92127] shadow-md transform scale-[1.02]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        <span>{v.name}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#c92127]'}`}>
                          ৳{Number(v.sale_price || v.regular_price).toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Short Description */}
            {product.short_description && (
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white rounded-2xl p-4 border border-slate-100 space-y-1">
                {product.short_description.split(/\\n|\n/).filter(Boolean).map((line, idx) => (
                  <p key={idx} className="flex items-start gap-2">
                    <span className="text-[#c92127] font-bold">•</span>
                    <span>{line.trim()}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-bold text-slate-800">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs sm:text-sm font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`w-full font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${isSoldOut
                      ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                      : isInCart
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 hover:border-[#c92127] hover:text-[#c92127]'
                    } ${isJustAdded ? 'scale-[1.02] ring-2 ring-emerald-300' : ''}`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-4 h-4 text-white stroke-[2.5]" />
                      <span>{isJustAdded ? 'Added to Cart!' : 'In Cart'} ({cartQuantity})</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isSoldOut}
                  className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Dedicated Compare Option on Product Details Page (Only for Inks, Printers & Photocopiers) */}
              {canCompare && (
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleCompare}
                      className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border ${isCompared
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                          : 'bg-blue-50/80 hover:bg-blue-100 text-blue-800 border-blue-200'
                        } ${isJustCompared ? 'scale-[1.02] ring-2 ring-blue-400 bg-blue-600 text-white' : ''}`}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>
                        {isJustCompared
                          ? 'যোগ হয়েছে!'
                          : isCompared
                            ? 'তুলনায় যুক্ত আছে'
                            : 'অন্য পণ্যের সাথে তুলনা করুন (Compare)'}
                      </span>
                    </button>

                    {isCompared && (
                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('/compare/', 'Product Compare');
                          else {
                            window.history.pushState({}, '', '/compare/');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                          }
                        }}
                        className="py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                      >
                        <span>তুলনা দেখুন</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Key Delivery & Hotline Info Box */}
            <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
                <Truck className="w-4 h-4 text-[#c92127] flex-shrink-0" />
                <span>24-Hour Delivery in Dhaka & 48-Hour Nationwide Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>1 Year Official Service Support & 100% Genuine Parts Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
                <Phone className="w-4 h-4 text-slate-800 flex-shrink-0" />
                <span>Call to Order: <a href="tel:01777277740" className="font-bold text-[#c92127] hover:underline">01777-277740</a> / <a href="tel:01777177730" className="font-bold text-[#c92127] hover:underline">01777-177730</a></span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Detailed Tabs Section (Description & Specifications) */}
        <div className="mt-14 border-t border-slate-200 pt-8">

          {/* Tabs header */}
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('description')}
              className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all cursor-pointer ${activeTab === 'description'
                  ? 'border-[#c92127] text-[#c92127]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all cursor-pointer ${activeTab === 'specifications'
                  ? 'border-[#c92127] text-[#c92127]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Specifications
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'description' ? (
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                {product.description ? (
                  product.description.split(/\\n\\n|\\n|\n\n|\n/).filter(Boolean).map((para, idx) => (
                    <p key={idx}>{para.trim()}</p>
                  ))
                ) : (
                  <p>For detailed inquiries regarding this product, please contact our hotline directly.</p>
                )}
              </div>
            ) : (
              <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-xs sm:text-sm divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-600 w-1/3">Brand</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{product.brand || 'Splashjet'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Category</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{product.category}</td>
                    </tr>
                    {product.sub_category && (
                      <tr className="bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-600">Sub-Category</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{product.sub_category}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-600">Model / SKU</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{product.sku || `CT-${product.id}`}</td>
                    </tr>
                    {product.specifications && Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="px-4 py-3 font-semibold text-slate-600">{key}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* 4. Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Related Products
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Popular & authentic products in the same category
                </p>
              </div>

              <button
                onClick={() => onNavigate ? onNavigate('/shop/') : (window.location.href = '/shop/')}
                className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer hidden sm:block"
              >
                View All Products →
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 5. Mobile Sticky Bottom Action Bar (stacked right above mobile bottom nav) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={selectedImage || product.image_url}
            alt={product.title}
            className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-0.5 bg-white flex-shrink-0"
          />
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-[#c92127] block truncate">
              ৳{activeSalePrice.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 truncate block">
              {selectedVariation ? selectedVariation.name : 'In Stock'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Mobile compare button on product details page */}
          {canCompare && (
            <button
              onClick={handleToggleCompare}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isCompared
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                }`}
              title={isCompared ? 'তুলনায় যুক্ত আছে' : 'কম্পেয়ার করুন'}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleAddToCart}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-[#c92127] hover:bg-[#b91c1c] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Order Now</span>
          </button>
        </div>
      </div>

    </div>
  );
}
