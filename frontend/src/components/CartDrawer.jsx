import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onNavigate }) {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    deliveryArea,
    setDeliveryArea,
    deliveryFee,
    subtotal,
    grandTotal,
    setIsCheckoutOpen,
    setSelectedCategory,
    setSearchQuery
  } = useCart();

  if (!isCartOpen) return null;

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleViewProducts = () => {
    setIsCartOpen(false);
    setSelectedCategory('All');
    setSearchQuery('');
    if (onNavigate) {
      onNavigate('/shop/', 'All Products');
    } else {
      window.history.pushState({}, '', '/shop/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleProductClick = (product) => {
    setIsCartOpen(false);
    const targetUrl = `/product/${product.slug || product.id}/`;
    if (onNavigate) {
      onNavigate(targetUrl, product);
    } else {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-[420px] max-w-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 h-full overflow-hidden">
          
          {/* Header */}
          <div className="p-4 px-4 sm:px-6 bg-[#c92127] text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-sm sm:text-base font-bold">শপিং কার্ট ({cartItems.length})</h2>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-black/15 active:bg-black/25 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-red-50 text-[#c92127] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  আপনার কার্ট বর্তমানে খালি!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  প্রয়োজনীয় Splashjet ইঙ্ক বা প্রিন্টার সল্যুশন কার্টে যোগ করতে শপিং শুরু করুন।
                </p>
                <button
                  onClick={handleViewProducts}
                  className="bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991c1c] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer transform hover:-translate-y-0.5"
                >
                  প্রোডাক্ট দেখুন
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <span>আইটেম বিবরণ</span>
                  <button 
                    onClick={clearCart} 
                    className="text-[#c92127] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    সব মুছুন
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map(({ product, quantity }) => (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/70 relative group"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={product.image_url}
                        alt={product.title}
                        onClick={() => handleProductClick(product)}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          e.target.src = '/splashjet_images/about-splashjet.jpg';
                        }}
                      />

                      {/* Info & Quantity */}
                      <div className="flex-1 min-w-0">
                        <h4 
                          onClick={() => handleProductClick(product)}
                          className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug cursor-pointer hover:text-[#c92127] transition-colors"
                        >
                          {product.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          ৳{(product.sale_price || product.regular_price).toLocaleString()} / ইউনিট
                        </div>

                        {/* Quantity Buttons & Price */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="p-1 sm:p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 sm:px-2.5 text-xs font-bold text-slate-800 min-w-[20px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-1 sm:p-1.5 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs sm:text-sm font-black text-[#c92127]">
                            ৳{((product.sale_price || product.regular_price) * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-[#c92127] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Area Selection */}
                <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2 mt-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span>ডেলিভারি এরিয়া নির্বাচন করুন:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label 
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        deliveryArea === 'inside_dhaka'
                          ? 'border-[#c92127] bg-red-50/50 text-[#c92127] font-bold'
                          : 'border-slate-200 bg-white text-slate-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="inside_dhaka"
                          checked={deliveryArea === 'inside_dhaka'}
                          onChange={() => setDeliveryArea('inside_dhaka')}
                          className="accent-[#c92127]"
                        />
                        <span className="text-[11px] sm:text-xs">ঢাকার ভিতরে</span>
                      </div>
                      <span className="font-bold text-[11px] sm:text-xs">৳৬০</span>
                    </label>

                    <label 
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        deliveryArea === 'outside_dhaka'
                          ? 'border-[#c92127] bg-red-50/50 text-[#c92127] font-bold'
                          : 'border-slate-200 bg-white text-slate-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="deliveryArea"
                          value="outside_dhaka"
                          checked={deliveryArea === 'outside_dhaka'}
                          onChange={() => setDeliveryArea('outside_dhaka')}
                          className="accent-[#c92127]"
                        />
                        <span className="text-[11px] sm:text-xs">ঢাকার বাইরে</span>
                      </div>
                      <span className="font-bold text-[11px] sm:text-xs">৳১২০</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Checkout Action Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-2.5 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-slate-900">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-base text-[#c92127]">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleProceedCheckout}
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>অর্ডার সম্পন্ন করতে এগিয়ে যান</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>১০০% নিরাপদ ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
