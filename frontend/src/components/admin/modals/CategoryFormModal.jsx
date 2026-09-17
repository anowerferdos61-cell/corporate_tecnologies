import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Loader2, 
  Check, 
  FolderTree, 
  Layers, 
  Eye, 
  EyeOff, 
  Image as ImageIcon 
} from 'lucide-react';
import { generateSlug } from '../../../lib/categoryService';
import { uploadProductImage } from '../../../lib/supabaseClient';
import { CATEGORY_DEFAULT_IMAGES } from '../adminConstants';

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingCategory = null,
  category = null, 
  parentCategories = [],
  categoriesTree = [], 
  defaultParentId = null,
  parentId: propParentId = null 
}) {
  const activeCategory = category || editingCategory;
  const initialParentId = propParentId || defaultParentId || (activeCategory?.parentId || null);

  // Normalize parents list from either parentCategories or categoriesTree
  const rawParents = (parentCategories && parentCategories.length > 0) 
    ? parentCategories 
    : (categoriesTree && categoriesTree.length > 0 ? categoriesTree : []);
  const availableParents = rawParents.filter(p => !p.parentId);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState('');
  const [hidden, setHidden] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill form when activeCategory or initialParentId changes
  useEffect(() => {
    if (activeCategory) {
      setName(activeCategory.name || '');
      setSlug(activeCategory.slug || '');
      setDescription(activeCategory.description || '');
      setImage(activeCategory.image || '');
      setHidden(Boolean(activeCategory.hidden));
      const isSub = Boolean(initialParentId || activeCategory.parentId);
      setIsSubcategory(isSub);
      setParentId(initialParentId || activeCategory.parentId || '');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImage('');
      setHidden(false);
      const isSub = Boolean(initialParentId);
      setIsSubcategory(isSub);
      setParentId(initialParentId || (availableParents[0]?.id || availableParents[0]?.slug || ''));
    }
    setErrorMessage('');
  }, [activeCategory, initialParentId, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!activeCategory) {
      setSlug(generateSlug(val));
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setImage(publicUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Upload fallback to base64:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    const cleanSlug = slug.trim() || generateSlug(name);

    onSave({
      id: activeCategory?.id || cleanSlug,
      name: name.trim(),
      slug: cleanSlug,
      description: description.trim(),
      image: image.trim(),
      hidden: Boolean(hidden),
      parentId: isSubcategory && parentId ? parentId : null
    }, isSubcategory && parentId ? parentId : null, activeCategory?.id || null);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#c92127] flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {activeCategory 
                  ? `Edit ${isSubcategory ? 'Subcategory' : 'Category'}` 
                  : `Add New ${isSubcategory ? 'Subcategory' : 'Category'}`}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isSubcategory ? 'Create a subcategory under a parent category' : 'Create a top-level parent category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#c92127]">
              {errorMessage}
            </div>
          )}

          {/* Type Selector (Only when creating new) */}
          {!activeCategory && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-2">
              <button
                type="button"
                onClick={() => { setIsSubcategory(false); setParentId(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  !isSubcategory 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Parent Category
              </button>
              <button
                type="button"
                onClick={() => { setIsSubcategory(true); if (availableParents.length > 0 && !parentId) setParentId(availableParents[0].id || availableParents[0].slug); }}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSubcategory 
                    ? 'bg-[#c92127] text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Subcategory
              </button>
            </div>
          )}

          {/* Parent Category Selection (if subcategory) */}
          {isSubcategory && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Select Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#c92127] outline-none cursor-pointer"
              >
                {availableParents.map((p) => (
                  <option key={p.id || p.slug} value={p.id || p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Printing Machinery, Sublimation Ink, etc."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-[#c92127] outline-none"
              required
            />
          </div>

          {/* Category Slug */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>URL Slug</span>
              <span className="text-[10px] text-slate-400 font-normal">Auto-generated</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-xs font-mono">/product-category/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="printing-machinery"
                className="w-full pl-36 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:bg-white focus:border-[#c92127] outline-none"
              />
            </div>
          </div>

          {/* Category Image (Only for Parent Categories or if desired) */}
          {!isSubcategory && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Category Thumbnail / Icon Image
              </label>
              <div className="flex items-center gap-3 border border-slate-200 rounded-2xl p-3 bg-slate-50">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-[#c92127] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-colors">
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or paste image URL (/splashjet_images/...)"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description displayed on category shop headers..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#c92127] outline-none"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {hidden ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                <span>Visibility on Website Menu & Homepage</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hidden ? 'Currently hidden from public navigation menus' : 'Visible in Navbar mega menu & shop by categories'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                !hidden ? 'bg-[#c92127]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  !hidden ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
