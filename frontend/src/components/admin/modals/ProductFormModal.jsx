import React, { useState } from 'react';
import { Layers, X, Loader2 } from 'lucide-react';
import ImagePickerField from '../ImagePickerField';
import { PRODUCT_CATEGORIES, CATEGORY_DEFAULT_IMAGES } from '../adminConstants';
import { uploadProductImage } from '../../../lib/supabaseClient';

export default function ProductFormModal({
  product = null, // if null -> add mode, if exists -> edit mode
  onClose,
  onSaveProduct
}) {
  const isEditing = Boolean(product && product.id);

  const [form, setForm] = useState({
    title: product?.title || '',
    category: product?.category || 'Printers',
    sub_category: product?.sub_category || '',
    regular_price: product?.regular_price || '',
    sale_price: product?.sale_price || '',
    discount_label: product?.discount_label || '',
    stock_quantity: product?.stock_quantity ?? 25,
    image_url: product?.image_url || CATEGORY_DEFAULT_IMAGES['Printers'],
    short_description: product?.short_description || '',
    sku: product?.sku || `CT-${Date.now().toString().slice(-4)}`,
    brand: product?.brand || 'Epson',
    is_featured: product?.is_featured || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Image upload handling
  async function handleImageUpload(fileOrUrl) {
    if (typeof fileOrUrl === 'string') {
      setForm((prev) => ({ ...prev, image_url: fileOrUrl }));
      return;
    }

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadProductImage(fileOrUrl);
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      alert('Upload notice: ' + err.message);
      const localPreview = URL.createObjectURL(fileOrUrl);
      setForm((prev) => ({ ...prev, image_url: localPreview }));
    } finally {
      setIsUploadingImage(false);
    }
  }

  // Handle Form Submit
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a product title');
      return;
    }

    setIsSubmitting(true);
    try {
      const reg = Number(form.regular_price) || 0;
      const sale = Number(form.sale_price) || reg;
      let calculatedDiscount = form.discount_label;
      if (!calculatedDiscount && reg > sale) {
        const pct = Math.round(((reg - sale) / reg) * 100);
        calculatedDiscount = `-${pct}%`;
      }

      const payload = {
        title: form.title.trim(),
        category: form.category,
        sub_category: form.sub_category || '',
        regular_price: reg,
        sale_price: sale,
        discount_label: calculatedDiscount || null,
        stock_quantity: Number(form.stock_quantity) ?? 20,
        image_url: form.image_url || CATEGORY_DEFAULT_IMAGES[form.category] || CATEGORY_DEFAULT_IMAGES['Printers'],
        short_description: form.short_description || '',
        sku: form.sku || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: form.brand || 'Corporate Tech',
        is_featured: form.is_featured
      };

      await onSaveProduct(payload, product?.id);
      onClose();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-4 sm:my-8 animate-scale">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c92127] text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                {isEditing ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditing ? `Editing SKU: ${product.sku}` : 'Create a new catalog item with live pricing & inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Epson EcoTank L3250 Wi-Fi All-in-One Ink Tank Printer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setForm({
                    ...form,
                    category: newCat,
                    image_url: CATEGORY_DEFAULT_IMAGES[newCat] || form.image_url
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              >
                {PRODUCT_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Epson, Splashjet, Canon, HP"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              />
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Regular Price (MRP ৳) *
              </label>
              <input
                type="number"
                required
                value={form.regular_price}
                onChange={(e) => setForm({ ...form, regular_price: e.target.value })}
                placeholder="22000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#c92127]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Sale Price (৳) *
              </label>
              <input
                type="number"
                required
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                placeholder="20500"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#c92127]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Discount Badge
              </label>
              <input
                type="text"
                value={form.discount_label}
                onChange={(e) => setForm({ ...form, discount_label: e.target.value })}
                placeholder="Auto or -10%"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#c92127]"
              />
            </div>
          </div>

          {/* Stock Quantity & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                required
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                placeholder="25"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product SKU
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. CT-EPSON-3250"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              />
            </div>
          </div>

          {/* Image Picker Field */}
          <ImagePickerField
            imageUrl={form.image_url}
            isUploading={isUploadingImage}
            onImageChange={handleImageUpload}
            onPresetSelect={(preset) => {
              setForm({
                ...form,
                image_url: preset.path,
                category: preset.category || form.category
              });
            }}
          />

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              placeholder="Key features, print technology, speed, warranty..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modal_prod_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="rounded border-slate-300 text-[#c92127] focus:ring-[#c92127]"
            />
            <label htmlFor="modal_prod_featured" className="text-xs font-medium text-slate-700 cursor-pointer">
              Feature this product on homepage Hot Deals / Best Sellers
            </label>
          </div>

          {/* Form Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#c92127] hover:bg-[#b01b20] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Publish Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
