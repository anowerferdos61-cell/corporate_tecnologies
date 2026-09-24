import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Phone,
  User,
  MapPin,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Printer,
  MessageSquare,
  Sparkles,
  Package
} from 'lucide-react';
import { createManualOrder } from '../../../lib/adminOrderService';

// Popular Bangladesh Districts for Fast Pick
const POPULAR_DISTRICTS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Cox\'s Bazar',
  'Bogura',
  'Feni',
  'Jashore',
  'Narsingdi',
  'Tangail'
];

export default function CreateOrderModal({
  isOpen,
  onClose,
  products = [],
  onOrderCreated,
  onPrintInvoice
}) {
  // Customer Info State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Order Settings State
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [courierName, setCourierName] = useState('Steadfast');
  const [trackingCode, setTrackingCode] = useState('');

  // Financials
  const [deliveryFee, setDeliveryFee] = useState(60);
  const [discount, setDiscount] = useState(0);

  // Items in this order
  const [selectedItems, setSelectedItems] = useState([]);

  // Product Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Custom Item Mode
  const [customItemTitle, setCustomItemTitle] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Post Actions
  const [autoPrintInvoice, setAutoPrintInvoice] = useState(false);
  const [autoOpenWhatsApp, setAutoOpenWhatsApp] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-set delivery fee when city changes
  useEffect(() => {
    if (city.toLowerCase() === 'dhaka') {
      setDeliveryFee(60);
    } else {
      setDeliveryFee(120);
    }
  }, [city]);

  // Filtered Products for Live Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !Array.isArray(products)) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter((p) => {
        const title = (p.title || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        return title.includes(q) || cat.includes(q) || sku.includes(q);
      })
      .slice(0, 10);
  }, [products, searchQuery]);

  // Add Product from Catalog
  const handleAddProduct = (product) => {
    const existingIndex = selectedItems.findIndex((i) => String(i.id) === String(product.id));
    const price = Number(product.sale_price || product.regular_price || 0);

    if (existingIndex > -1) {
      setSelectedItems((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      });
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          id: product.id,
          product_id: product.id,
          title: product.title,
          image_url: product.image_url || '/splashjet_images/about-splashjet.jpg',
          category: product.category,
          unit_price: price,
          quantity: 1,
          stock: product.stock_quantity ?? 25
        }
      ]);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // Add Custom / Miscellaneous Item
  const handleAddCustomItem = () => {
    if (!customItemTitle.trim()) {
      alert('Please enter the item name');
      return;
    }
    const price = Number(customItemPrice) || 0;
    setSelectedItems((prev) => [
      ...prev,
      {
        id: 'custom_' + Date.now(),
        product_id: 'custom',
        title: customItemTitle.trim(),
        image_url: '/splashjet_images/about-splashjet.jpg',
        category: 'Custom Service/Item',
        unit_price: price,
        quantity: 1,
        stock: 99
      }
    ]);
    setCustomItemTitle('');
    setCustomItemPrice('');
    setIsAddingCustom(false);
  };

  // Item Quantity & Price handlers
  const updateItemQuantity = (index, delta) => {
    setSelectedItems((prev) => {
      const updated = [...prev];
      const newQty = Math.max(1, (updated[index].quantity || 1) + delta);
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const updateItemPrice = (index, newPrice) => {
    setSelectedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], unit_price: Math.max(0, Number(newPrice) || 0) };
      return updated;
    });
  };

  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Subtotal & Grand Total Calculation
  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      return sum + Number(item.unit_price || 0) * Number(item.quantity || 1);
    }, 0);
  }, [selectedItems]);

  const grandTotal = useMemo(() => {
    const total = subtotal + Number(deliveryFee || 0) - Number(discount || 0);
    return Math.max(0, total);
  }, [subtotal, deliveryFee, discount]);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit mobile number (e.g., 017xxxxxxxx)');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please provide a delivery address');
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMessage('Please add at least one item to the order');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createManualOrder({
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        city: city.trim(),
        items: selectedItems,
        subtotal,
        deliveryFee: Number(deliveryFee) || 0,
        discount: Number(discount) || 0,
        grandTotal,
        paymentMethod,
        paymentStatus,
        orderStatus,
        courierName: courierName || null,
        trackingCode: trackingCode.trim() || null,
        adminNotes: adminNotes.trim() || null
      });

      // Notify parent to prepend to orders list
      if (onOrderCreated) {
        onOrderCreated(created);
      }

      // 1. Auto Open Invoice if checked
      if (autoPrintInvoice && onPrintInvoice) {
        onPrintInvoice(created);
      }

      // 2. Auto Open WhatsApp if checked
      if (autoOpenWhatsApp) {
        let p = cleanPhone;
        if (p.startsWith('0')) p = '88' + p;
        const itemsText = selectedItems.map(i => `${i.title} (x${i.quantity})`).join(', ');
        const text = `Hello ${customerName},\nThis is Corporate Technologies BD confirming your Order #${created.order_number}.\n\nItems: ${itemsText}\nTotal Payable (COD): ৳${grandTotal.toLocaleString()}\nDelivery Address: ${address}, ${city}\n\nWe are preparing your package for dispatch via ${courierName}. Thank you!`;
        window.open(`https://wa.me/${p}?text=${encodeURIComponent(text)}`, '_blank');
      }

      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-zinc-900 to-black text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c92127] flex items-center justify-center text-white shadow-md">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Create Manual Order</span>
                <span className="text-[10px] bg-red-500/30 text-red-200 border border-red-400/30 font-bold px-2 py-0.5 rounded-full">
                  Admin Entry
                </span>
              </h2>
              <p className="text-xs text-zinc-300">
                Enter direct orders for phone calls, WhatsApp inquiries, or walk-in customers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#c92127] font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Customer & Shipping Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
                <User className="w-4 h-4 text-[#c92127]" />
                <span>Customer & Delivery Details</span>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name <span className="text-[#c92127]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Anwar Hossain"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-[#c92127]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                  />
                </div>
              </div>

              {/* City / District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery District / City <span className="text-[#c92127]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#c92127]"
                  >
                    {POPULAR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 'Dhaka' ? '(Inside Dhaka - ৳60)' : '(Outside Dhaka - ৳120)'}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or other district..."
                    onChange={(e) => {
                      if (e.target.value) setCity(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Delivery Address <span className="text-[#c92127]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Road No., House No., Thana, Area Name..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:border-[#c92127] resize-none"
                />
              </div>

              {/* Courier & Dispatch info */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Courier Service:
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c92127]"
                  >
                    <option value="Steadfast">Steadfast Courier</option>
                    <option value="Pathao">Pathao Courier</option>
                    <option value="RedX">RedX</option>
                    <option value="Sundarban">Sundarban Courier</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Office Pickup">Office Pickup (Walk-in)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tracking Code (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ST-849204"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Admin Internal Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested delivery before 2 PM"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Product Picker & Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-[#c92127]" />
                  <span>Ordered Items</span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {selectedItems.length} item(s)
                </span>
              </div>

              {/* Product Live Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products (by name, category, or SKU)..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#c92127] focus:ring-1 focus:ring-[#c92127]"
                />

                {/* Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleAddProduct(prod)}
                        className="p-2.5 hover:bg-red-50/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.image_url || '/splashjet_images/about-splashjet.jpg'}
                            alt=""
                            className="w-9 h-9 object-contain rounded-lg border border-slate-100 p-0.5 bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{prod.title}</p>
                            <span className="text-[10px] text-slate-400 block">{prod.category}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="text-xs font-black text-[#c92127] font-mono">
                            ৳{(Number(prod.sale_price) || Number(prod.regular_price) || 0).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            className="bg-[#c92127] text-white p-1 rounded-lg hover:bg-[#b91c1c]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Items List Box */}
              <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 max-h-56 overflow-y-auto space-y-2">
                {selectedItems.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <ShoppingBag className="w-6 h-6 mx-auto mb-1 opacity-40" />
                    <span>No products selected yet. Search and add products above.</span>
                  </div>
                ) : (
                  selectedItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-8 h-8 object-contain rounded bg-slate-50 p-0.5 shrink-0 border border-slate-100"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">Price (৳):</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItemPrice(index, e.target.value)}
                            className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                          />
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs bg-white text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(index, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs bg-white text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right shrink-0 min-w-[65px]">
                        <span className="text-xs font-black text-[#c92127] font-mono block">
                          ৳{(Number(item.unit_price || 0) * Number(item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Miscellaneous Item toggle */}
              {!isAddingCustom ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="text-[11px] font-bold text-[#c92127] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Custom Service or Misc Item</span>
                </button>
              ) : (
                <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Custom Item Entry:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Item name..."
                      value={customItemTitle}
                      onChange={(e) => setCustomItemTitle(e.target.value)}
                      className="col-span-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Price ৳"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCustom(false)}
                      className="text-[10px] font-bold text-slate-500 px-2 py-1 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="text-[10px] font-bold bg-[#c92127] text-white px-3 py-1 rounded-lg cursor-pointer"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              )}

              {/* Financial Breakdown & Status Controls */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Delivery Fee:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-mono">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-right text-xs focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Special Discount:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-mono">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-right text-xs text-emerald-700 focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Grand Total:</span>
                  <span className="font-black text-base text-[#c92127] font-mono">
                    ৳{grandTotal.toLocaleString()}
                  </span>
                </div>

                {/* Status Options */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Order Status:</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Payment Method:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cash">Hand Cash</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Post Action Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700">
              <input
                type="checkbox"
                checked={autoPrintInvoice}
                onChange={(e) => setAutoPrintInvoice(e.target.checked)}
                className="accent-[#c92127] w-4 h-4"
              />
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Auto-print invoice after order creation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700">
              <input
                type="checkbox"
                checked={autoOpenWhatsApp}
                onChange={(e) => setAutoOpenWhatsApp(e.target.checked)}
                className="accent-emerald-600 w-4 h-4"
              />
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send WhatsApp confirmation message to customer</span>
            </label>
          </div>

          {/* Modal Footer / Save Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating order...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Save Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
