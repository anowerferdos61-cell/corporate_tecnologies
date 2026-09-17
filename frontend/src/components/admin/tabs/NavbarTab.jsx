import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  MoveUp,
  MoveDown,
  Sparkles,
  PhoneCall,
  MessageCircle,
  BookOpen,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  Zap,
  Info,
  Pin,
  Star
} from 'lucide-react';
import { useSettings, DEFAULT_HEADER_SETTINGS, DEFAULT_NAV_ITEMS } from '../../../context/SettingsContext';
import { getCachedCategoriesTree } from '../../../lib/categoryService';

function mergeStoreCategories(baseNavItems = []) {
  const tree = getCachedCategoriesTree() || [];
  const existingKeys = new Set(baseNavItems.map(i => (i.id || i.slug || i.name || '').toLowerCase().trim()));
  
  const merged = baseNavItems.map(item => {
    const itemKey = (item.id || item.slug || item.name || '').toLowerCase().trim();
    const matchingTreeCat = tree.find(c => (c.id || c.slug || c.name || '').toLowerCase().trim() === itemKey);
    if (matchingTreeCat && Array.isArray(matchingTreeCat.subcategories)) {
      const existingSubKeys = new Set((item.subcategories || []).map(s => (s.id || s.slug || s.name || '').toLowerCase().trim()));
      const extraSubs = matchingTreeCat.subcategories
        .filter(s => !existingSubKeys.has((s.id || s.slug || s.name || '').toLowerCase().trim()))
        .map(sub => ({
          id: sub.id || sub.slug,
          name: sub.name,
          slug: sub.slug || `${item.slug}/${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          badge: '',
          hidden: Boolean(sub.hidden)
        }));
      return {
        ...item,
        hidden: matchingTreeCat.hidden !== undefined ? matchingTreeCat.hidden : item.hidden,
        subcategories: [...(item.subcategories || []), ...extraSubs]
      };
    }
    return item;
  });

  tree.forEach(cat => {
    const key = (cat.id || cat.slug || cat.name || '').toLowerCase().trim();
    if (key && !existingKeys.has(key) && key !== 'human') {
      merged.push({
        id: cat.id || cat.slug,
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        badge: '',
        hidden: Boolean(cat.hidden),
        subcategories: (cat.subcategories || []).map(sub => ({
          id: sub.id || sub.slug,
          name: sub.name,
          slug: sub.slug || `${cat.slug}/${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          badge: '',
          hidden: Boolean(sub.hidden)
        }))
      });
      existingKeys.add(key);
    }
  });

  return merged;
}

export default function NavbarTab() {
  const { headerSettings, updateHeaderSettings, resetHeaderSettings, loading } = useSettings();

  const maxNavbarLimit = 14; // Strictly 14 categories (7+7 layout)

  // Local working copy
  const [formData, setFormData] = useState(() => {
    const rawNavItems = headerSettings?.navigation?.nav_items?.length > 0
      ? headerSettings.navigation.nav_items
      : DEFAULT_NAV_ITEMS;

    const navItems = mergeStoreCategories(rawNavItems);

    const initialPinned = headerSettings?.navigation?.pinned_navbar_categories?.length > 0
      ? headerSettings.navigation.pinned_navbar_categories
      : navItems.filter(i => !i.hidden).slice(0, maxNavbarLimit).map(i => i.id);

    return {
      ...DEFAULT_HEADER_SETTINGS,
      ...(headerSettings || {}),
      navigation: {
        ...DEFAULT_HEADER_SETTINGS.navigation,
        ...(headerSettings?.navigation || {}),
        max_navbar_items: maxNavbarLimit,
        pinned_navbar_categories: initialPinned,
        nav_items: navItems
      }
    };
  });

  const [activeTabSection, setActiveTabSection] = useState('menu_items'); // 'menu_items' | 'header_actions' | 'promo_bar' | 'preview'
  const [expandedMenuId, setExpandedMenuId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePreviewDropdown, setActivePreviewDropdown] = useState(null);

  // Modal State for adding/editing top menu item
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null); // null if adding new
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    slug: '',
    badge: ''
  });

  // Modal State for adding/editing subcategory dropdown item
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [parentMenuIdForSub, setParentMenuIdForSub] = useState(null);
  const [editingSubItem, setEditingSubItem] = useState(null); // null if adding new
  const [subItemForm, setSubItemForm] = useState({
    name: '',
    slug: '',
    badge: ''
  });

  // Sync state if context updates
  useEffect(() => {
    if (headerSettings) {
      const rawNavItems = headerSettings?.navigation?.nav_items?.length > 0
        ? headerSettings.navigation.nav_items
        : DEFAULT_NAV_ITEMS;

      const navItems = mergeStoreCategories(rawNavItems);

      const initialPinned = headerSettings?.navigation?.pinned_navbar_categories?.length > 0
        ? headerSettings.navigation.pinned_navbar_categories
        : navItems.filter(i => !i.hidden).slice(0, maxNavbarLimit).map(i => i.id);

      setFormData({
        ...DEFAULT_HEADER_SETTINGS,
        ...headerSettings,
        navigation: {
          ...DEFAULT_HEADER_SETTINGS.navigation,
          ...(headerSettings.navigation || {}),
          max_navbar_items: maxNavbarLimit,
          pinned_navbar_categories: initialPinned,
          nav_items: navItems
        }
      });
    }
  }, [headerSettings]);

  // Live listen for categories added or updated from Categories Tab or Product Editor
  useEffect(() => {
    const handleCategoryUpdate = () => {
      setFormData(prev => {
        const currentNavItems = prev.navigation?.nav_items || DEFAULT_NAV_ITEMS;
        const updatedNavItems = mergeStoreCategories(currentNavItems);
        return {
          ...prev,
          navigation: {
            ...prev.navigation,
            nav_items: updatedNavItems
          }
        };
      });
    };
    window.addEventListener('ct_categories_updated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);
    return () => {
      window.removeEventListener('ct_categories_updated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, []);

  const navItems = formData.navigation?.nav_items || DEFAULT_NAV_ITEMS;
  const pinnedIds = formData.navigation?.pinned_navbar_categories?.length > 0
    ? formData.navigation.pinned_navbar_categories
    : navItems.filter(i => !i.hidden).slice(0, maxNavbarLimit).map(i => i.id);

  // Helper to update navigation nav_items
  const updateNavItems = (newItems) => {
    setFormData(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        nav_items: newItems
      }
    }));
  };

  // Pin / Unpin Category to Navbar (Strictly 14, 7+7)
  const togglePinToNavbar = (itemId) => {
    let currentPinned = [...pinnedIds];
    if (currentPinned.includes(itemId)) {
      currentPinned = currentPinned.filter(id => id !== itemId);
    } else {
      if (currentPinned.length >= maxNavbarLimit) {
        alert(`⚠️ আপনি সর্বোচ্চ ১৪টি ক্যাটাগরি (৭+৭) নাভবারে পিন করতে পারবেন। অন্য একটি আনপিন করে এটি যুক্ত করুন।`);
        return;
      }
      currentPinned.push(itemId);
    }
    setFormData(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        pinned_navbar_categories: currentPinned
      }
    }));
  };

  // Select first 14 categories automatically (7+7)
  const handleAutoSelectTop14 = () => {
    const top14 = navItems.filter(i => !i.hidden).slice(0, maxNavbarLimit).map(i => i.id);
    setFormData(prev => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        pinned_navbar_categories: top14
      }
    }));
  };

  // Reordering Menu Items
  const moveMenuItem = (index, direction) => {
    const newItems = [...navItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    updateNavItems(newItems);
  };

  // Toggle Hide/Show Menu Item
  const toggleMenuItemVisibility = (id) => {
    const newItems = navItems.map(item => {
      if (item.id === id) {
        return { ...item, hidden: !item.hidden };
      }
      return item;
    });
    updateNavItems(newItems);
  };

  // Delete Menu Item
  const deleteMenuItem = (id, name) => {
    if (!window.confirm(`"${name}" মেন্যু আইটেমটি এবং এর সকল ড্রপডাউন সাব-ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    const newItems = navItems.filter(item => item.id !== id);
    updateNavItems(newItems);
    if (expandedMenuId === id) setExpandedMenuId(null);
  };

  // Open Menu Item Modal (Add or Edit)
  const openMenuModal = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuItemForm({
        name: item.name || '',
        slug: item.slug || '',
        badge: item.badge || ''
      });
    } else {
      setEditingMenuItem(null);
      setMenuItemForm({
        name: '',
        slug: '',
        badge: ''
      });
    }
    setMenuModalOpen(true);
  };

  // Save Menu Item Modal
  const saveMenuItem = (e) => {
    e.preventDefault();
    if (!menuItemForm.name.trim()) return;

    const slug = menuItemForm.slug.trim()
      ? menuItemForm.slug.trim()
      : menuItemForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingMenuItem) {
      // Edit existing
      const newItems = navItems.map(item => {
        if (item.id === editingMenuItem.id) {
          return {
            ...item,
            name: menuItemForm.name.trim(),
            slug,
            badge: menuItemForm.badge.trim()
          };
        }
        return item;
      });
      updateNavItems(newItems);
    } else {
      // Add new
      const newItem = {
        id: `menu-${Date.now()}`,
        name: menuItemForm.name.trim(),
        slug,
        badge: menuItemForm.badge.trim(),
        hidden: false,
        subcategories: []
      };
      const updated = [...navItems, newItem];
      updateNavItems(updated);
      setExpandedMenuId(newItem.id);

      // Auto pin if less than 8
      if (pinnedIds.length < maxNavbarLimit) {
        setFormData(prev => ({
          ...prev,
          navigation: {
            ...prev.navigation,
            pinned_navbar_categories: [...pinnedIds, newItem.id]
          }
        }));
      }
    }

    setMenuModalOpen(false);
  };

  // --- Subcategory Dropdown Actions ---

  // Reorder Subcategory
  const moveSubItem = (menuId, subIndex, direction) => {
    const newItems = navItems.map(item => {
      if (item.id === menuId) {
        const subs = [...(item.subcategories || [])];
        const targetIndex = direction === 'up' ? subIndex - 1 : subIndex + 1;
        if (targetIndex < 0 || targetIndex >= subs.length) return item;

        const temp = subs[subIndex];
        subs[subIndex] = subs[targetIndex];
        subs[targetIndex] = temp;
        return { ...item, subcategories: subs };
      }
      return item;
    });
    updateNavItems(newItems);
  };

  // Toggle Subcategory Visibility
  const toggleSubItemVisibility = (menuId, subId) => {
    const newItems = navItems.map(item => {
      if (item.id === menuId) {
        const subs = (item.subcategories || []).map(sub => {
          if (sub.id === subId || sub.name === subId || sub.slug === subId) {
            return { ...sub, hidden: !sub.hidden };
          }
          return sub;
        });
        return { ...item, subcategories: subs };
      }
      return item;
    });
    updateNavItems(newItems);
  };

  // Delete Subcategory
  const deleteSubItem = (menuId, subId, subName) => {
    if (!window.confirm(`"${subName}" ড্রপডাউন অপশনটি মুছে ফেলতে চান?`)) return;
    const newItems = navItems.map(item => {
      if (item.id === menuId) {
        const subs = (item.subcategories || []).filter(sub => sub.id !== subId && sub.name !== subId && sub.slug !== subId);
        return { ...item, subcategories: subs };
      }
      return item;
    });
    updateNavItems(newItems);
  };

  // Open Sub Item Modal
  const openSubModal = (menuId, subItem = null) => {
    setParentMenuIdForSub(menuId);
    if (subItem) {
      setEditingSubItem(subItem);
      setSubItemForm({
        name: subItem.name || '',
        slug: subItem.slug || '',
        badge: subItem.badge || ''
      });
    } else {
      setEditingSubItem(null);
      setSubItemForm({
        name: '',
        slug: '',
        badge: ''
      });
    }
    setSubModalOpen(true);
  };

  // Save Sub Item Modal
  const saveSubItem = (e) => {
    e.preventDefault();
    if (!subItemForm.name.trim() || !parentMenuIdForSub) return;

    const parentMenu = navItems.find(i => i.id === parentMenuIdForSub);
    let defaultSlug = subItemForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (parentMenu?.slug && !defaultSlug.startsWith(parentMenu.slug)) {
      defaultSlug = `${parentMenu.slug}/${defaultSlug}`;
    }

    const slug = subItemForm.slug.trim() ? subItemForm.slug.trim() : defaultSlug;

    const newItems = navItems.map(item => {
      if (item.id === parentMenuIdForSub) {
        const subs = [...(item.subcategories || [])];
        if (editingSubItem) {
          // Edit existing
          const updatedSubs = subs.map(sub => {
            const isMatch = sub.id === editingSubItem.id || (editingSubItem.id === undefined && sub.name === editingSubItem.name);
            if (isMatch) {
              return {
                ...sub,
                id: sub.id || `sub-${Date.now()}`,
                name: subItemForm.name.trim(),
                slug,
                badge: subItemForm.badge.trim()
              };
            }
            return sub;
          });
          return { ...item, subcategories: updatedSubs };
        } else {
          // Add new sub item
          const newSub = {
            id: `sub-${Date.now()}`,
            name: subItemForm.name.trim(),
            slug,
            badge: subItemForm.badge.trim(),
            hidden: false
          };
          return { ...item, subcategories: [...subs, newSub] };
        }
      }
      return item;
    });

    updateNavItems(newItems);
    setSubModalOpen(false);
  };

  // Save All Settings to Cloud & Local
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateHeaderSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save navbar settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Default Settings
  const handleResetToDefault = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে নাভবার সেটিংস রিসেট করে ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) return;
    setIsSaving(true);
    try {
      await resetHeaderSettings();
      setFormData(DEFAULT_HEADER_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to reset: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter pinned items for preview
  const previewNavbarItems = (pinnedIds && pinnedIds.length > 0
    ? navItems.filter(i => !i.hidden && (pinnedIds.includes(i.id) || pinnedIds.includes(i.slug) || pinnedIds.includes(i.name)))
    : navItems.filter(i => !i.hidden)
  ).slice(0, maxNavbarLimit);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Navbar & Dropdowns Customizer</span>
                <span className="text-[11px] font-bold bg-red-100 text-[#c92127] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Editor
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ডেস্কটপ নাভবারে প্রতি লাইনে ৭টি করে সর্বোচ্চ ১৪টি ক্যাটাগরি (৭+৭) ও ড্রপডাউন সিলেক্ট করুন, বাকি ক্যাটাগরি সাইড মেন্যুতে সংরক্ষিত থাকবে
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="ডিফল্ট নাভবারে ফিরে যান"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#c92127] hover:bg-[#b91c1c] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-red-500/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>আপনার নাভবার ও ড্রপডাউন সেটিংস সফলভাবে সেভ হয়েছে এবং পুরো ওয়েবসাইটে তাৎক্ষণিকভাবে লাইভ কার্যকর হয়েছে!</span>
        </div>
      )}

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTabSection('menu_items')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTabSection === 'menu_items'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>ক্যাটাগরি ও ড্রপডাউন নির্বাচন ({pinnedIds.length}/{maxNavbarLimit} নাভবারে পিন করা)</span>
        </button>

        <button
          onClick={() => setActiveTabSection('header_actions')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTabSection === 'header_actions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>হেডার অ্যাকশন বাটনসমূহ</span>
        </button>

        <button
          onClick={() => setActiveTabSection('promo_bar')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTabSection === 'promo_bar'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>টপ প্রমো / অ্যানাউন্সমেন্ট বার</span>
        </button>

        <button
          onClick={() => setActiveTabSection('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeTabSection === 'preview'
              ? 'bg-red-50 text-[#c92127] border border-red-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Eye className="w-4 h-4 text-[#c92127]" />
          <span>লাইভ ইন্টারেক্টিভ প্রিভিউ</span>
        </button>
      </div>

      {/* 1. TAB: MENU ITEMS & DROPDOWNS */}
      {activeTabSection === 'menu_items' && (
        <div className="space-y-4">
          {/* Important Notice & Pin Control Card */}
          <div className="p-4 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 rounded-2xl border border-red-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c92127] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Pin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>ডেস্কটপ নাভবার পিন সিলেকশন (Navbar Items Selection)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${pinnedIds.length === maxNavbarLimit
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#c92127] text-white'
                    }`}>
                    {pinnedIds.length} / {maxNavbarLimit} টি সিলেক্টেড
                  </span>
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  ল্যাপটপ ও কম্পিউটারে প্রতি লাইনে ৭টি করে সর্বোচ্চ <strong>{maxNavbarLimit}টি ক্যাটাগরি (৭+৭ দুটি লাইনে)</strong> ডানে সামান্য সরিয়ে সুন্দরভাবে দেখাবে। বাকি সব ক্যাটাগরি সাইড "Menu" ড্রয়ারে থাকবে।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={handleAutoSelectTop14}
                className="px-3 py-1.5 rounded-xl bg-white border border-red-300 text-xs font-black text-[#c92127] hover:bg-red-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              >
                টপ {maxNavbarLimit}টি অটো-সিলেক্ট করুন
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">সকল ক্যাটাগরি তালিকা ({navItems.length} টি)</h2>
              <p className="text-[11px] text-slate-500">যে ক্যাটাগরিগুলো নাভবারে দেখাতে চান সেগুলোতে "পিন করুন" চাপুন, বাকিগুলো মেন্যুতে থাকবে</p>
            </div>
            <button
              type="button"
              onClick={() => openMenuModal()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {navItems.map((item, index) => {
              const isExpanded = expandedMenuId === item.id;
              const subCount = item.subcategories?.length || 0;
              const isFirst = index === 0;
              const isLast = index === navItems.length - 1;
              const isPinned = pinnedIds.includes(item.id);

              return (
                <div
                  key={item.id || index}
                  className={`bg-white rounded-2xl border transition-all ${item.hidden
                      ? 'border-dashed border-slate-300 bg-slate-50/50 opacity-70'
                      : isPinned
                        ? 'border-red-300 ring-1 ring-red-400/30 shadow-2xs hover:shadow-xs bg-white'
                        : 'border-slate-200/90 shadow-2xs hover:shadow-xs bg-slate-50/40'
                    }`}
                >
                  {/* Top Level Item Bar */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveMenuItem(index, 'up')}
                          disabled={isFirst}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-slate-900 cursor-pointer"
                          title="উপরে নিন"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMenuItem(index, 'down')}
                          disabled={isLast}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-slate-900 cursor-pointer"
                          title="নিচে নিন"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pin to Navbar Button */}
                      <button
                        type="button"
                        onClick={() => togglePinToNavbar(item.id)}
                        disabled={item.hidden}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${isPinned
                            ? 'bg-[#c92127] text-white shadow-xs hover:bg-[#b91c1c]'
                            : 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                          } ${item.hidden ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title={isPinned ? 'নাভবার থেকে আনপিন করুন' : 'নাভবারে পিন করুন (সর্বোচ্চ ১৪টি)'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-current text-amber-300' : 'text-slate-500'}`} />
                        <span>{isPinned ? 'নাভবারে পিনড' : 'নাভবারে দেখান'}</span>
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-black ${item.hidden ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-black bg-red-100 text-[#c92127] px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {isPinned ? (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                              ● Top Navbar
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                              Menu Drawer Only
                            </span>
                          )}
                          {item.hidden && (
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                              Hidden (অদৃশ্য)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          /product-category/{item.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {/* Subcategory Count & Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedMenuId(isExpanded ? null : item.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isExpanded
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                      >
                        <span>ড্রপডাউন ({subCount})</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Hide/Show Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleMenuItemVisibility(item.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${item.hidden
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        title={item.hidden ? 'নাভবারে দেখান (Show)' : 'নাভবার থেকে লুকান (Hide)'}
                      >
                        {item.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openMenuModal(item)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="এডিট করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id, item.name)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Dropdown Subcategories Area */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c92127]"></span>
                          <span>"{item.name}" এর ড্রপডাউন সাব-ক্যাটাগরি তালিকা</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => openSubModal(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#c92127] hover:bg-[#b91c1c] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>ড্রপডাউন লিংক যোগ করুন</span>
                        </button>
                      </div>

                      {item.subcategories && item.subcategories.length > 0 ? (
                        <div className="space-y-2">
                          {item.subcategories.map((sub, sIdx) => {
                            const subId = sub.id || sub.slug || sub.name;
                            const isSubFirst = sIdx === 0;
                            const isSubLast = sIdx === item.subcategories.length - 1;

                            return (
                              <div
                                key={subId || sIdx}
                                className={`p-2.5 bg-white rounded-xl border flex items-center justify-between gap-3 ${sub.hidden ? 'border-dashed border-slate-300 opacity-60' : 'border-slate-200 shadow-2xs'
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Sub Reorder */}
                                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => moveSubItem(item.id, sIdx, 'up')}
                                      disabled={isSubFirst}
                                      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-400 hover:text-slate-800 cursor-pointer"
                                    >
                                      <MoveUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveSubItem(item.id, sIdx, 'down')}
                                      disabled={isSubLast}
                                      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-400 hover:text-slate-800 cursor-pointer"
                                    >
                                      <MoveDown className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`text-xs font-bold ${sub.hidden ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                        {sub.name}
                                      </span>
                                      {sub.badge && (
                                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                                          {sub.badge}
                                        </span>
                                      )}
                                      {sub.hidden && (
                                        <span className="text-[9px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.2 rounded">
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400 truncate">
                                      /product-category/{sub.slug}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleSubItemVisibility(item.id, subId)}
                                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${sub.hidden ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      }`}
                                    title={sub.hidden ? 'আনহাইড করুন' : 'হাইড করুন'}
                                  >
                                    {sub.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openSubModal(item.id, sub)}
                                    className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                    title="এডিট"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteSubItem(item.id, subId, sub.name)}
                                    className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                    title="মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                          কোন ড্রপডাউন সাব-আইটেম নেই। নতুন যুক্ত করতে উপরের বাটনে চাপুন।
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TAB: HEADER ACTION BUTTONS */}
      {activeTabSection === 'header_actions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900">হেডার অ্যাকশন বাটন ও সার্চ সেটিংস</h2>
            <p className="text-xs text-slate-500 mt-0.5">টপ হেডারে দৃশ্যমান কল, হোয়াটসঅ্যাপ, ব্লগ বাটন ও সার্চ বার কনফিগারেশন</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Placeholder */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c92127]" />
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  সার্চ বার প্লেসহোল্ডার টেক্সট
                </label>
              </div>
              <input
                type="text"
                value={formData.search?.placeholder || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  search: { ...prev.search, placeholder: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none"
                placeholder="Search products, models, or ink codes..."
              />
            </div>

            {/* Direct Call Button */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">সরাসরি ফোন কল বাটন</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.action_buttons?.show_call_btn ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, show_call_btn: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">ফোন নাম্বার (Phone Number)</label>
                  <input
                    type="text"
                    value={formData.action_buttons?.call_phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, call_phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                    placeholder="01777277740"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">বাটন লেবেল (Button Label)</label>
                  <input
                    type="text"
                    value={formData.action_buttons?.call_btn_text || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, call_btn_text: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                    placeholder="Call Now"
                  />
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Button */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">WhatsApp চ্যাট বাটন</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.action_buttons?.show_whatsapp_btn ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, show_whatsapp_btn: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp নাম্বার (Country code সহ)</label>
                  <input
                    type="text"
                    value={formData.action_buttons?.whatsapp_number || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, whatsapp_number: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                    placeholder="8801777277740"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">বাটন লেবেল (Button Label)</label>
                  <input
                    type="text"
                    value={formData.action_buttons?.whatsapp_btn_text || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, whatsapp_btn_text: e.target.value }
                    }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white outline-none"
                    placeholder="WhatsApp"
                  />
                </div>
              </div>
            </div>

            {/* Other Button Toggles */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 md:col-span-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">অন্যান্য বাটন ও স্টিকি সেটিংস</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300">
                  <span className="text-xs font-bold text-slate-800">Blog বাটন দেখান</span>
                  <input
                    type="checkbox"
                    checked={formData.action_buttons?.show_blog_btn ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, show_blog_btn: e.target.checked }
                    }))}
                    className="rounded text-[#c92127] focus:ring-0 w-4 h-4"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300">
                  <span className="text-xs font-bold text-slate-800">Splashjet Ink বাটন</span>
                  <input
                    type="checkbox"
                    checked={formData.action_buttons?.show_splashjet_btn ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action_buttons: { ...prev.action_buttons, show_splashjet_btn: e.target.checked }
                    }))}
                    className="rounded text-[#c92127] focus:ring-0 w-4 h-4"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300">
                  <span className="text-xs font-bold text-slate-800">Sticky Navbar (স্ক্রলে আটকে থাকবে)</span>
                  <input
                    type="checkbox"
                    checked={formData.navigation?.sticky_nav ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      navigation: { ...prev.navigation, sticky_nav: e.target.checked }
                    }))}
                    className="rounded text-[#c92127] focus:ring-0 w-4 h-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: TOP PROMO / ANNOUNCEMENT BAR */}
      {activeTabSection === 'promo_bar' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">টপ প্রমো ও নোটিশ বার কাস্টমাইজেশন</h2>
              <p className="text-xs text-slate-500 mt-0.5">হেডারের একদম উপরে যে ঘোষণা/নোটিশ স্ট্রিপ থাকে তার সেটিংস</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">
                {(formData.top_bar?.enabled ?? true) ? 'সক্রিয় (Enabled)' : 'বন্ধ (Disabled)'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.top_bar?.enabled ?? true}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    top_bar: { ...prev.top_bar, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c92127]"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">নোটিশ / ঘোষণা টেক্সট (Notice Text)</label>
                {(formData.top_bar?.custom_notice || '') && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      top_bar: { ...prev.top_bar, custom_notice: '' }
                    }))}
                    className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    টেক্সট ক্লিয়ার করুন
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.top_bar?.custom_notice ?? ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  top_bar: { ...prev.top_bar, custom_notice: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-[#c92127] focus:ring-2 focus:ring-red-500/20"
                placeholder="ঘোষণা বা নোটিশ লিখুন (যেমন: 🚚 সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি...)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">অ্যাকশন বাটন টেক্সট (Action Button Text)</label>
                <input
                  type="text"
                  value={formData.top_bar?.action_text ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    top_bar: { ...prev.top_bar, action_text: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-[#c92127] focus:ring-2 focus:ring-red-500/20"
                  placeholder="অফার দেখুন (খালি রাখতে পারেন)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">অ্যাকশন লিংক / URL</label>
                <input
                  type="text"
                  value={formData.top_bar?.action_url ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    top_bar: { ...prev.top_bar, action_url: e.target.value }
                  }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white outline-none focus:border-[#c92127] focus:ring-2 focus:ring-red-500/20"
                  placeholder="/shop"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: LIVE INTERACTIVE PREVIEW */}
      {activeTabSection === 'preview' && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-2xl border border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              <h3 className="text-base font-black">রিয়েল-টাইম নাভবার প্রিভিউ (Interactive Live Preview)</h3>
            </div>
            <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
              নাভবারে মোট {previewNavbarItems.length}টি ক্যাটাগরি প্রদর্শিত হবে
            </span>
          </div>

          {/* Render Navbar Simulation */}
          <div className="rounded-2xl border border-red-700/50 shadow-inner overflow-hidden">
            {/* Top Announcement Bar simulation if enabled */}
            {(formData.top_bar?.enabled ?? true) && formData.top_bar?.custom_notice?.trim() && (
              <div className="bg-slate-950 text-white text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2 truncate">
                  <span className="bg-[#c92127] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">ঘোষণা</span>
                  <span className="truncate">{formData.top_bar.custom_notice}</span>
                  {formData.top_bar.action_text?.trim() && (
                    <span className="text-amber-300 font-bold ml-1">{formData.top_bar.action_text} →</span>
                  )}
                </div>
                <span className="text-zinc-500 text-[10px]">✕</span>
              </div>
            )}

            <div className="bg-[#c92127] p-3 overflow-visible">
              {/* Main Nav Header */}
              <div className="flex items-center justify-between px-2 py-2 border-b border-white/20 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white text-[#c92127] flex items-center justify-center font-black text-xs">
                    C
                  </div>
                  <span className="font-extrabold text-white">Corporate Technologies</span>
                </div>
                <div className="flex-1 max-w-xs mx-4">
                  <div className="bg-white text-slate-400 text-[11px] px-3 py-1.5 rounded-full flex items-center justify-between">
                    <span>{formData.search?.placeholder?.slice(0, 30)}...</span>
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {formData.action_buttons?.show_call_btn && (
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-300" />
                      {formData.action_buttons?.call_btn_text || 'Call'}
                    </span>
                  )}
                  {formData.action_buttons?.show_whatsapp_btn && (
                    <span className="text-[10px] bg-emerald-600 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {formData.action_buttons?.whatsapp_btn_text || 'Chat'}
                    </span>
                  )}
                  <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    Cart
                  </span>
                </div>
              </div>

              {/* Category Nav Strip */}
              <div className="flex items-center justify-between pt-2 px-1 relative gap-3">
                <div className="flex-1 min-w-0 pl-2 sm:pl-4 pr-2 flex flex-col justify-center gap-y-1">
                  {/* Line 1 (Strictly First 7) */}
                  <div className="grid grid-cols-7 gap-1 xl:gap-1.5 items-center w-full">
                    {previewNavbarItems.slice(0, 7).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="relative"
                        onMouseEnter={() => setActivePreviewDropdown(item.id)}
                        onMouseLeave={() => setActivePreviewDropdown(null)}
                      >
                        <button
                          type="button"
                          className={`w-full px-1.5 xl:px-2 py-0.8 rounded-md text-[11px] xl:text-[11.5px] font-bold text-white flex items-center justify-center gap-1 hover:bg-white/20 transition-all ${activePreviewDropdown === item.id ? 'bg-white/25' : ''
                            }`}
                          title={item.name}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[8.5px] bg-white text-[#c92127] font-black px-1 py-0.2 rounded-full flex-shrink-0">
                              {item.badge}
                            </span>
                          )}
                          {item.subcategories && item.subcategories.length > 0 && (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-950/80 flex-shrink-0" />
                          )}
                        </button>

                        {/* Preview Dropdown */}
                        {activePreviewDropdown === item.id && item.subcategories && item.subcategories.filter(s => !s.hidden).length > 0 && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                            <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                              {item.name} Collection
                            </div>
                            {item.subcategories.filter(s => !s.hidden).map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>{sub.name}</span>
                                {sub.badge && (
                                  <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Line 2 (Strictly Second 7) */}
                  {previewNavbarItems.length > 7 && (
                    <div className="grid grid-cols-7 gap-1 xl:gap-1.5 items-center w-full">
                      {previewNavbarItems.slice(7, 14).map((item, idx) => (
                        <div
                          key={item.id || idx + 7}
                          className="relative"
                          onMouseEnter={() => setActivePreviewDropdown(item.id)}
                          onMouseLeave={() => setActivePreviewDropdown(null)}
                        >
                          <button
                            type="button"
                            className={`w-full px-1.5 xl:px-2 py-0.8 rounded-md text-[11px] xl:text-[11.5px] font-bold text-white flex items-center justify-center gap-1 hover:bg-white/20 transition-all ${activePreviewDropdown === item.id ? 'bg-white/25' : ''
                              }`}
                            title={item.name}
                          >
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="text-[8.5px] bg-white text-[#c92127] font-black px-1 py-0.2 rounded-full flex-shrink-0">
                                {item.badge}
                              </span>
                            )}
                            {item.subcategories && item.subcategories.length > 0 && (
                              <ChevronDown className="w-3 h-3 text-white/80 flex-shrink-0" />
                            )}
                          </button>

                          {/* Preview Dropdown */}
                          {activePreviewDropdown === item.id && item.subcategories && item.subcategories.filter(s => !s.hidden).length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                              <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                                {item.name} Collection
                              </div>
                              {item.subcategories.filter(s => !s.hidden).map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-[#c92127] flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span>{sub.name}</span>
                                  {sub.badge && (
                                    <span className="text-[9px] font-black bg-red-100 text-[#c92127] px-1.5 py-0.2 rounded-full">
                                      {sub.badge}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
                  <div className="text-[11px] font-black bg-white text-[#c92127] px-3 py-1 rounded-full flex items-center gap-1">
                    <span>All Products</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                  <div className="text-[11px] font-black bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Menu className="w-3 h-3" />
                    <span>Menu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT MENU ITEM */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c92127]" />
                <span>{editingMenuItem ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setMenuModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveMenuItem} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ক্যাটাগরি নাম (Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={menuItemForm.name}
                  onChange={(e) => setMenuItemForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none"
                  placeholder="যেমন: Photocopiers, Printers, Laser Inks"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  স্লাগ / ক্যাটাগরি URL (Category Slug)
                </label>
                <input
                  type="text"
                  value={menuItemForm.slug}
                  onChange={(e) => setMenuItemForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none font-mono"
                  placeholder="যেমন: photocopy-machine বা printers"
                />
                <p className="text-[10px] text-slate-400 mt-1">ফাঁকা রাখলে নাম অনুযায়ী স্বয়ংক্রিয়ভাবে স্লাগ তৈরি হবে।</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ব্যাজ টেক্সট (Badge - ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={menuItemForm.badge}
                  onChange={(e) => setMenuItemForm(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none"
                  placeholder="যেমন: Hot, New, Popular, Official"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#c92127] hover:bg-[#b91c1c] cursor-pointer shadow-xs"
                >
                  {editingMenuItem ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT SUBCATEGORY DROPDOWN ITEM */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#c92127]" />
                <span>{editingSubItem ? 'ড্রপডাউন অপশন এডিট করুন' : 'নতুন ড্রপডাউন অপশন যোগ করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveSubItem} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ড্রপডাউন আইটেম নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subItemForm.name}
                  onChange={(e) => setSubItemForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none"
                  placeholder="যেমন: Color Series Photocopiers"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  স্লাগ / লিংক URL (Slug / Route)
                </label>
                <input
                  type="text"
                  value={subItemForm.slug}
                  onChange={(e) => setSubItemForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none font-mono"
                  placeholder="যেমন: photocopy-machine/color-series"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ব্যাজ (Badge - ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={subItemForm.badge}
                  onChange={(e) => setSubItemForm(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-[#c92127] outline-none"
                  placeholder="যেমন: Hot, New, Best Seller"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#c92127] hover:bg-[#b91c1c] cursor-pointer shadow-xs"
                >
                  {editingSubItem ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
