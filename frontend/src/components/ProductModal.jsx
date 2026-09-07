import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  CheckCircle, 
  Check, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Minus,
  Plus,
  Share2
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductModal() {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    cartItems,
    addToCart,
    toggleWishlist,
    wishlist,
    setIsCartOpen,
    showToast
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isJustAdded, setIsJustAdded] = useState(false);

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const isWishlisted = wishlist.includes(product.id);

  // Dynamic pricing based on selected variation or base product
  const activeSalePrice = selectedVariation ? selectedVariation.sale_price : (product.sale_price || product.regular_price);
  const activeRegPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const discountAmount = activeRegPrice > activeSalePrice ? activeRegPrice - activeSalePrice : 0;

  // Check if current product is already in cart
  const cartItem = cartItems?.find(item => item.product.id === product.id);
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
    setSelectedProductForModal(null);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('প্রোডাক্ট লিংক কপি করা হয়েছে!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              SKU: {product.sku || `CT-${product.id}`}
            </span>
            <span className="text-xs font-bold text-[#c92127] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              {product.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedProductForModal(null);
                setSelectedVariation(null);
              }}
              className="p-2 rounded-full hover:bg-red-50 text-slate-500 hover:text-[#c92127] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Image & Badges */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group sticky top-0">
            {product.is_featured && (
              <span className="absolute top-3 left-3 bg-[#c92127] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                FEATURED
              </span>
            )}

            <img
              src={product.image_url}
              alt={product.title}
              className="max-h-64 object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/splashjet_images/about-splashjet.jpg';
              }}
            />

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>১০০% অফিসিয়াল অথেনটিক পণ্য ও ওয়ারেন্টি গ্যারান্টি</span>
            </div>
          </div>

          {/* Details & Action */}
          <div className="space-y-4 text-left">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h2>
              {product.short_description && (
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                <span>{product.rating || '4.9'} ({product.reviews_count || 18} রিভিউ)</span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                স্টকে আছে ({product.stock_quantity || 25} ইউনিট)
              </span>
            </div>

            {/* Pricing Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">
                  {selectedVariation ? `মূল্য (${selectedVariation.name}):` : 'বিশেষ অফার মূল্য:'}
                </span>
                <div className="text-2xl font-black text-[#c92127]">
                  ৳{activeSalePrice.toLocaleString()}
                </div>
              </div>
              {discountAmount > 0 && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 line-through block">
                    রেগুলার: ৳{activeRegPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ৳{discountAmount.toLocaleString()} সাশ্রয়
                  </span>
                </div>
              )}
            </div>

            {/* Product Variations / Options (if any) */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-700 block">
                  ভ্যারিয়েন্ট / কালার অপশন বেছে নিন:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variations.map((v, idx) => {
                    const isSelected = selectedVariation?.name === v.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariation(v)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                          isSelected
                            ? 'bg-[#c92127] text-white border-[#c92127] shadow-sm font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {v.name} (৳{v.sale_price.toLocaleString()})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-800 block mb-1">স্পেসিফিকেশন:</span>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ব্র্যান্ড:</span>
                <span className="font-bold text-slate-800">{product.brand || 'Splashjet'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ক্যাটাগরি:</span>
                <span className="font-bold text-slate-800">{product.category}</span>
              </div>
              {product.specifications && Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{key}:</span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-700">পরিমাণ:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-800 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                onClick={handleAddToCart}
                className={`w-full text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  isInCart
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                } ${isJustAdded ? 'scale-[1.02] ring-2 ring-emerald-300' : ''}`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>{isJustAdded ? 'যোগ হয়েছে!' : 'কার্টে আছে'} ({cartQuantity})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                    <span>কার্টে যুক্ত করুন</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>সরাসরি অর্ডার</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer Guarantee Bar */}
        <div className="bg-slate-900 text-slate-300 p-3 px-6 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>ঢাকা সিটিতে ২৪ ঘণ্টায় ও সারাদেশে ৪৮ ঘণ্টায় ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>১০০% অফিসিয়াল ওয়ারেন্টি</span>
          </div>
        </div>

      </div>
    </div>
  );
}
