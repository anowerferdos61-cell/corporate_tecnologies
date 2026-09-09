import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '../lib/analyticsTracker';
import { flyToCartAnimation } from '../lib/flyToCart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('corporate_tech_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('corporate_tech_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountActiveTab, setAccountActiveTab] = useState('account');
  const [toastMessage, setToastMessage] = useState(null);
  
  // Delivery Area: 'inside_dhaka' | 'outside_dhaka'
  const [deliveryArea, setDeliveryArea] = useState('inside_dhaka');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('corporate_tech_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('corporate_tech_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Add to cart with smooth flight animation to cart icon
  const addToCart = (product, quantity = 1, eventOrElement = null) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    
    // Marketing Analytics tracking
    trackAddToCart(product, quantity);

    // Trigger visual flight to navbar cart icon
    flyToCartAnimation(product.image_url, eventOrElement);
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast('কার্ট থেকে পণ্য সরানো হয়েছে', 'info');
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('উইশলিস্ট থেকে সরানো হয়েছে', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('উইশলিস্টে যুক্ত হয়েছে!', 'success');
        return [...prev, productId];
      }
    });
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.sale_price || item.product.regular_price) * item.quantity,
    0
  );
  const deliveryFee = cartItems.length === 0 ? 0 : deliveryArea === 'inside_dhaka' ? 60 : 120;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAccountOpen,
        setIsAccountOpen,
        accountActiveTab,
        setAccountActiveTab,
        deliveryArea,
        setDeliveryArea,
        deliveryFee,
        subtotal,
        grandTotal,
        toastMessage,
        showToast,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        inStockOnly,
        setInStockOnly,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
