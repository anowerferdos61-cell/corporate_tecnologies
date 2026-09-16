import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  getCategoriesTree,
  saveCategory,
  deleteCategory,
  toggleCategoryVisibility
} from '../../../lib/categoryService';
import CategoryFormModal from '../modals/CategoryFormModal';

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'hidden'
  const [expandedIds, setExpandedIds] = useState(new Set());
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalParentId, setModalParentId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const showFeedback = (msg, type = 'success') => {
    setFeedbackMsg({ msg, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const loadCategories = async (forceSync = false) => {
    setLoading(true);
    try {
      const tree = await getCategoriesTree(forceSync);
      setCategories(tree);
      // Auto-expand all categories by default on first load
      setExpandedIds(new Set(tree.map((c) => c.id)));
    } catch (err) {
      console.error('Failed to load categories:', err);
      showFeedback('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(categories.map((c) => c.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Open Create Parent Modal
  const handleOpenAddParent = () => {
    setEditingCategory(null);
    setModalParentId(null);
    setIsModalOpen(true);
  };

  // Open Add Subcategory Modal
  const handleOpenAddSub = (parentId) => {
    setEditingCategory(null);
    setModalParentId(parentId);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (category, parentId = null) => {
    setEditingCategory(category);
    setModalParentId(parentId);
    setIsModalOpen(true);
  };

  // Save Modal Action
  const handleSaveModal = async (formData) => {
    try {
      const isEdit = Boolean(formData.id);
      const isSub = Boolean(formData.parentId);
      
      const updatedTree = await saveCategory(
        formData,
        formData.parentId,
        formData.id
      );
      
      setCategories(updatedTree);
      
      // If we added a subcategory, ensure parent is expanded
      if (formData.parentId) {
        setExpandedIds((prev) => new Set([...prev, formData.parentId]));
      }

      showFeedback(
        `${isSub ? 'Subcategory' : 'Category'} ${isEdit ? 'updated' : 'created'} successfully!`
      );
    } catch (err) {
      console.error('Error saving category:', err);
      showFeedback('Failed to save category: ' + err.message, 'error');
      throw err;
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (categoryId, parentId = null) => {
    try {
      const updatedTree = await toggleCategoryVisibility(categoryId, parentId);
      setCategories(updatedTree);
      showFeedback('Category visibility updated');
    } catch (err) {
      console.error('Error toggling visibility:', err);
      showFeedback('Failed to update visibility', 'error');
    }
  };

  // Delete Category / Subcategory
  const handleDelete = async (categoryId, parentId = null, name = 'this item') => {
    const isSub = Boolean(parentId);
    const confirmText = isSub
      ? `Are you sure you want to delete subcategory "${name}"?`
      : `Are you sure you want to delete category "${name}" and all its subcategories?`;

    if (!window.confirm(confirmText)) return;

    try {
      const updatedTree = await deleteCategory(categoryId, parentId);
      setCategories(updatedTree);
      showFeedback(`${isSub ? 'Subcategory' : 'Category'} deleted successfully`);
    } catch (err) {
      console.error('Error deleting category:', err);
      showFeedback('Failed to delete category: ' + err.message, 'error');
    }
  };

  // Calculate Summary Statistics
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);
  const activeCount = categories.filter((c) => !c.hidden).length;
  const hiddenCount = categories.filter((c) => c.hidden).length;

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    // Status filter
    if (filterStatus === 'active' && cat.hidden) return false;
    if (filterStatus === 'hidden' && !cat.hidden) return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const matchParent =
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q);

    const matchSub = cat.subcategories?.some(
      (sub) =>
        sub.name?.toLowerCase().includes(q) ||
        sub.slug?.toLowerCase().includes(q)
    );

    return matchParent || matchSub;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs font-bold transition-all animate-bounce ${
            feedbackMsg.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          {feedbackMsg.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{feedbackMsg.msg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Categories & Taxonomy
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Organize store hierarchy, subcategories, thumbnails, and public visibility.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadCategories(true)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50 transition-all cursor-pointer"
            title="Sync & Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#c92127]' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenAddParent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c92127] hover:bg-[#a81a1f] text-white text-xs font-black shadow-sm shadow-red-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Categories</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCategories}</span>
            <span className="text-[11px] font-bold text-slate-400">parent items</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Subcategories</span>
            <FolderTree className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{totalSubcategories}</span>
            <span className="text-[11px] font-bold text-slate-400">sub items</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Live</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
            <span className="text-[11px] font-bold text-emerald-600">visible</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Hidden / Draft</span>
            <EyeOff className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{hiddenCount}</span>
            <span className="text-[11px] font-bold text-amber-600">hidden</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories & subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('hidden')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterStatus === 'hidden'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
            >
              Hidden ({hiddenCount})
            </button>
          </div>

          {/* Accordion Controls */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={handleExpandAll}
              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Expand All Accordions"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Collapse All Accordions"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Main Categories Tree View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-slate-200 border-t-[#c92127] rounded-full mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading category taxonomy...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-black text-slate-900">No categories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No categories or subcategories matched "${searchQuery}".`
              : 'You have not added any categories yet.'}
          </p>
          <button
            onClick={handleOpenAddParent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const isExpanded = expandedIds.has(category.id);
            const subcategories = category.subcategories || [];
            const isHidden = category.hidden;

            return (
              <div
                key={category.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isHidden
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Parent Category Row */}
                <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white">
                  {/* Left: Expander & Image & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Image / Thumbnail */}
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Layers className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* Name & Slug */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 truncate">
                          {category.name}
                        </h3>
                        {isHidden && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                          /{category.slug}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-indigo-600">
                          {subcategories.length} subcategories
                        </span>
                        {category.count !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-slate-600 flex items-center gap-1">
                              <Package className="w-3 h-3 text-slate-400" />
                              {category.count} items
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                    {/* Visibility Toggle Button */}
                    <button
                      onClick={() => handleToggleVisibility(category.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isHidden
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={isHidden ? 'Publish on Store' : 'Hide from Public Menu'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isHidden ? 'Hidden' : 'Visible'}</span>
                    </button>

                    {/* Add Subcategory Trigger */}
                    <button
                      onClick={() => handleOpenAddSub(category.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      title="Add Subcategory to this Category"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#c92127]" />
                      <span className="hidden sm:inline">Add Sub</span>
                    </button>

                    {/* Edit Parent */}
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-2 rounded-xl text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Parent */}
                    <button
                      onClick={() => handleDelete(category.id, null, category.name)}
                      className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Accordion Content */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-3 sm:p-4">
                    {subcategories.length === 0 ? (
                      <div className="py-4 text-center">
                        <p className="text-xs text-slate-400">
                          No subcategories under {category.name} yet.
                        </p>
                        <button
                          onClick={() => handleOpenAddSub(category.id)}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#c92127] hover:underline cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add first subcategory</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {subcategories.map((sub) => {
                          const isSubHidden = sub.hidden || isHidden;
                          return (
                            <div
                              key={sub.id || sub.slug}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                                isSubHidden
                                  ? 'bg-amber-50/60 border-amber-200'
                                  : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#c92127]"></span>
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {sub.name}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                  <span className="font-mono text-slate-400">/{sub.slug}</span>
                                  {sub.count !== undefined && (
                                    <span className="text-slate-400 font-bold">
                                      ({sub.count} items)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Subcategory Action Buttons */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleToggleVisibility(sub.id, category.id)}
                                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    sub.hidden
                                      ? 'text-amber-600 hover:bg-amber-100'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title={sub.hidden ? 'Hidden (Click to show)' : 'Visible (Click to hide)'}
                                >
                                  {sub.hidden ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleOpenEdit(sub, category.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit Subcategory"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDelete(sub.id, category.id, sub.name)}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category / Subcategory Create & Edit Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        parentId={modalParentId}
        categoriesTree={categories}
        onSave={handleSaveModal}
      />
    </div>
  );
}
