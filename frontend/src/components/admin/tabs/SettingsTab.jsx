import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Truck,
  SlidersHorizontal,
  Users,
  UserPlus,
  Trash2,
  Shield,
  Lock,
  CheckCircle,
  X,
  Flame,
  Clock,
  Zap,
  Eye,
  EyeOff,
  Package,
  Plus,
  Edit2,
  Layers,
  Check,
  Search,
  Sparkles,
  Droplet,
  Printer,
  ShoppingBag,
  Award,
  Tag,
  ShieldCheck,
  Box,
  RotateCcw
} from 'lucide-react';
import { updateAdminPin, fetchStaffUsers, createStaffUser, deleteStaffUser } from '../../../lib/adminAuth';
import { updateStoreSetting } from '../../../lib/adminOrderService';
import { fetchFlashSaleSettings, updateFlashSaleSettings } from '../../../lib/flashSaleService';
import { fetchShippingTiers, saveShippingTier, deleteShippingTier, DEFAULT_SHIPPING_TIERS } from '../../../lib/shippingService';
import { getCachedCategoriesTree } from '../../../lib/categoryService';
import {
  fetchPopularCategoriesSettings,
  savePopularCategoriesSettings,
  DEFAULT_POPULAR_CATEGORIES_SETTINGS
} from '../../../lib/popularCategoriesService';

export default function SettingsTab({
  insideDhakaFee = 60,
  outsideDhakaFee = 120,
  defaultCourier = 'Steadfast',
  isSuperAdmin = true,
  products = [],
  onDeliveryFeesUpdated,
  onCourierUpdated
}) {
  // PIN State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Delivery Fee State
  const [inDhaka, setInDhaka] = useState(insideDhakaFee);
  const [outDhaka, setOutDhaka] = useState(outsideDhakaFee);
  const [deliveryFeeSaved, setDeliveryFeeSaved] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState('');
  const [insideFee, setInsideFee] = useState(insideDhakaFee);
  const [outsideFee, setOutsideFee] = useState(outsideDhakaFee);
  const [courier, setCourier] = useState(defaultCourier);
  const [feeMessage, setFeeMessage] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  // Free Delivery Threshold State
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(2000);
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  // Shipping Tiers State
  const [shippingTiers, setShippingTiers] = useState(DEFAULT_SHIPPING_TIERS);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierSaveMsg, setTierSaveMsg] = useState('');
  const [tierForm, setTierForm] = useState({
    id: '',
    name: '',
    inside_dhaka: 60,
    outside_dhaka: 120,
    badge: '',
    is_default: false,
    categories: [],
    product_ids: []
  });
  const [tierProductSearch, setTierProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [categoriesList, setCategoriesList] = useState([]);

  // Section collapse state (all open by default)
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const toggleSection = (key) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Courier State
  const [selectedCourier, setSelectedCourier] = useState(defaultCourier);
  const [courierSettingsSaved, setCourierSettingsSaved] = useState(false);

  // Staff Users State (Super Admin Only)
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    username: '',
    pin: '',
    role: 'staff'
  });
  const [staffActionMsg, setStaffActionMsg] = useState('');
  const [visiblePins, setVisiblePins] = useState(new Set());

  const togglePinVisibility = (key) => {
    setVisiblePins((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Flash Sale State (Super Admin Only)
  const [flashSettings, setFlashSettings] = useState({
    is_active: true,
    title: 'সীমিত সময়ের ফ্ল্যাশ ডিল',
    subtitle: 'প্রিন্টার ও Splashjet কালিতে আকর্ষণীয় ছাড়!',
    discount_banner: 'UP TO 35% OFF',
    end_time: new Date(Date.now() + 48 * 3600000).toISOString(),
    featured_categories: ['Printers', 'Splashjet Inks'],
    display_limit: 4
  });
  const [flashSaved, setFlashSaved] = useState(false);
  const [flashCatSearch, setFlashCatSearch] = useState('');

  // Popular Categories State (Popular This Week - 3 Configurable Categories)
  const [popularSettings, setPopularSettings] = useState(DEFAULT_POPULAR_CATEGORIES_SETTINGS);
  const [popularSaved, setPopularSaved] = useState(false);
  const [popularLoading, setPopularLoading] = useState(false);

  // Compute category counts from products
  const categoryCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.category) {
          counts[p.category] = (counts[p.category] || 0) + 1;
        }
        if (p.sub_category && p.sub_category !== p.category) {
          counts[p.sub_category] = (counts[p.sub_category] || 0) + 1;
        }
      });
    }
    return counts;
  }, [products]);

  // Distinct available categories
  const availableFlashCategories = useMemo(() => {
    const list = [...new Set([...categoriesList, ...Object.keys(categoryCounts)])].filter(Boolean);
    list.sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
    return list;
  }, [categoriesList, categoryCounts]);

  // Count matching products for selected categories
  const matchedFlashProductCount = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return 0;
    const selected = (flashSettings.featured_categories || []).map(c => String(c).toLowerCase().trim()).filter(Boolean);
    if (selected.length === 0) return products.length;

    return products.filter(p => {
      const cat = (p.category || '').toLowerCase().trim();
      const subCat = (p.sub_category || '').toLowerCase().trim();
      const rawCats = Array.isArray(p.raw_categories) 
        ? p.raw_categories.map(rc => String(rc).toLowerCase().trim()) 
        : [];

      return selected.some(fc => 
        cat === fc || cat.includes(fc) || fc.includes(cat) ||
        subCat === fc || subCat.includes(fc) || fc.includes(subCat) ||
        rawCats.some(rc => rc.includes(fc))
      );
    }).length;
  }, [products, flashSettings.featured_categories]);

  // Toggle single category for flash sale
  function toggleFlashCategory(catName) {
    setFlashSettings((prev) => {
      const current = Array.isArray(prev.featured_categories) ? prev.featured_categories : [];
      const exists = current.some(c => c.toLowerCase().trim() === catName.toLowerCase().trim());
      const updated = exists 
        ? current.filter(c => c.toLowerCase().trim() !== catName.toLowerCase().trim())
        : [...current, catName];
      return {
        ...prev,
        featured_categories: updated
      };
    });
  }

  // Select all categories for flash sale
  function selectAllFlashCategories(allCats) {
    setFlashSettings((prev) => ({
      ...prev,
      featured_categories: allCats
    }));
  }

  // Clear all categories for flash sale
  function clearAllFlashCategories() {
    setFlashSettings((prev) => ({
      ...prev,
      featured_categories: []
    }));
  }

  useEffect(() => {
    if (isSuperAdmin) {
      loadStaffList();
      fetchFlashSaleSettings()
        .then((s) => {
          if (s) setFlashSettings(s);
        })
        .catch(() => {});
      fetchPopularCategoriesSettings()
        .then((s) => {
          if (s) setPopularSettings(s);
        })
        .catch(() => {});
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadShippingTiers();
    try {
      const tree = getCachedCategoriesTree() || [];
      const catNames = [];
      tree.forEach(c => {
        if (!c.hidden && c.name) catNames.push(c.name);
        if (c.subcategories) {
          c.subcategories.forEach(sc => {
            if (!sc.hidden && sc.name) catNames.push(sc.name);
          });
        }
      });
      if (Array.isArray(products)) {
        products.forEach(p => {
          if (p.category) catNames.push(p.category);
          if (p.sub_category) catNames.push(p.sub_category);
        });
      }
      setCategoriesList([...new Set(catNames.filter(Boolean))]);
    } catch (err) {
      console.warn('Error loading categories:', err);
    }
  }, [products]);

  async function loadShippingTiers() {
    setTiersLoading(true);
    try {
      const tiers = await fetchShippingTiers();
      if (tiers && tiers.length > 0) {
        setShippingTiers(tiers);
      }
    } catch (err) {
      console.warn('Could not load shipping tiers:', err);
    } finally {
      setTiersLoading(false);
    }
  }

  function handleOpenAddTier() {
    setEditingTier(null);
    setTierForm({
      id: '',
      name: '',
      inside_dhaka: inDhaka || 60,
      outside_dhaka: outDhaka || 120,
      badge: '',
      is_default: false,
      categories: [],
      product_ids: []
    });
    setTierProductSearch('');
    setIsTierModalOpen(true);
  }

  function handleOpenEditTier(tier) {
    setEditingTier(tier);
    setTierForm({
      id: tier.id || '',
      name: tier.name || '',
      inside_dhaka: tier.inside_dhaka ?? 60,
      outside_dhaka: tier.outside_dhaka ?? 120,
      badge: tier.badge || '',
      is_default: Boolean(tier.is_default),
      categories: Array.isArray(tier.categories) ? [...tier.categories] : [],
      product_ids: Array.isArray(tier.product_ids) ? [...tier.product_ids] : []
    });
    setTierProductSearch('');
    setIsTierModalOpen(true);
  }

  async function handleSaveTierSubmit(e) {
    e.preventDefault();
    if (!tierForm.name.trim()) {
      alert('অনুগ্রহ করে শিপিং টিয়ারের একটি নাম দিন।');
      return;
    }
    setTierSaveMsg('');
    try {
      const savedList = await saveShippingTier({
        ...tierForm,
        inside_dhaka: Number(tierForm.inside_dhaka) || 0,
        outside_dhaka: Number(tierForm.outside_dhaka) || 0
      });
      setShippingTiers(savedList);
      setTierSaveMsg(`শিপিং টিয়ার "${tierForm.name}" সফলভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setTierSaveMsg(''), 4000);
      setIsTierModalOpen(false);
    } catch (err) {
      alert('Failed to save shipping tier: ' + err.message);
    }
  }

  async function handleDeleteTier(tier) {
    if (tier.is_default) {
      alert('ডিফল্ট শিপিং টিয়ার ডিলিট করা যাবে না।');
      return;
    }
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${tier.name}" শিপিং টিয়ারটি মুছে ফেলতে চান?`)) return;
    try {
      const updatedList = await deleteShippingTier(tier.id);
      setShippingTiers(updatedList);
      setTierSaveMsg(`শিপিং টিয়ার "${tier.name}" মুছে ফেলা হয়েছে।`);
      setTimeout(() => setTierSaveMsg(''), 4000);
    } catch (err) {
      alert('Failed to delete tier: ' + err.message);
    }
  }

  function toggleTierCategory(catName) {
    setTierForm(prev => {
      const exists = prev.categories.includes(catName);
      return {
        ...prev,
        categories: exists ? prev.categories.filter(c => c !== catName) : [...prev.categories, catName]
      };
    });
  }

  function toggleTierProduct(prodId) {
    setTierForm(prev => {
      const exists = prev.product_ids.includes(String(prodId));
      return {
        ...prev,
        product_ids: exists 
          ? prev.product_ids.filter(id => id !== String(prodId)) 
          : [...prev.product_ids, String(prodId)]
      };
    });
  }

  function handleSetFlashHours(hours) {
    const future = new Date(Date.now() + hours * 3600000);
    setFlashSettings((prev) => ({
      ...prev,
      end_time: future.toISOString()
    }));
  }

  async function handleSaveFlashSettings(e) {
    e.preventDefault();
    setFlashSaved(false);
    try {
      await updateFlashSaleSettings(flashSettings);
      setFlashSaved(true);
      setTimeout(() => setFlashSaved(false), 3000);
    } catch (err) {
      alert('Failed to save flash sale settings: ' + err.message);
    }
  }

  // Helper to get all categories with product counts for Popular slots
  const allCategoryOptionsWithCount = useMemo(() => {
    const set = new Set(categoriesList);
    set.add('Splashjet Inks');
    set.add('Photocopy Machine & Printers');
    set.add('Heat Press & Machinery');
    set.add('Printers');
    set.add('Photocopy Machines');
    set.add('Toner & Inks');
    set.add('POS & Barcode');
    set.add('Sublimation Paper');

    const list = Array.from(set).filter(Boolean);
    return list.map((catName) => {
      const lower = catName.toLowerCase().trim();
      const count = (products || []).filter((p) => {
        const c = (p.category || '').toLowerCase().trim();
        const sc = (p.sub_category || '').toLowerCase().trim();
        const rc = Array.isArray(p.raw_categories) ? p.raw_categories.map(r => String(r).toLowerCase().trim()) : [];
        return c === lower || c.includes(lower) || sc === lower || sc.includes(lower) || rc.some(r => r.includes(lower));
      }).length;

      return {
        name: catName,
        count
      };
    });
  }, [categoriesList, products]);

  // Update a single slot field in Popular Categories
  const updatePopularSlot = (slotIndex, field, value) => {
    setPopularSettings((prev) => {
      const currentCats = prev?.categories && prev.categories.length === 3 
        ? [...prev.categories] 
        : [...DEFAULT_POPULAR_CATEGORIES_SETTINGS.categories];
      
      currentCats[slotIndex] = {
        ...currentCats[slotIndex],
        [field]: value
      };
      return {
        ...prev,
        categories: currentCats
      };
    });
  };

  // Preset switchers for Popular Categories
  const applyPopularPreset = (presetKey) => {
    if (presetKey === 'default') {
      setPopularSettings((prev) => ({
        ...prev,
        section_title: 'Popular This Week',
        section_subtitle: 'Explore our best-selling Inks, Photocopiers and Printers',
        categories: [
          {
            id: 'slot_1',
            enabled: true,
            category_name: 'Splashjet Inks',
            display_title: 'Splashjet Inks',
            badge_text: 'Premium Inks',
            subtitle: '100% Authentic OEM-grade refill inks for Epson, Canon, HP & Brother',
            icon: 'Droplet',
            limit: 8
          },
          {
            id: 'slot_2',
            enabled: true,
            category_name: 'Photocopy Machine & Printers',
            display_title: 'Photocopy Machine & Printers',
            badge_text: 'Top Models',
            subtitle: 'Official Brother, Epson, HP Printers and Toshiba Digital Multifunction Copiers',
            icon: 'Printer',
            limit: 8
          },
          {
            id: 'slot_3',
            enabled: true,
            category_name: 'Heat Press & Machinery',
            display_title: 'Heat Press & Machinery',
            badge_text: 'Top Equipment',
            subtitle: 'Professional 5-in-1 Combo Heat Press, T-Shirt Flat Press & Sublimation Machinery Solutions',
            icon: 'Flame',
            limit: 8
          }
        ]
      }));
    } else if (presetKey === 'machinery') {
      setPopularSettings((prev) => ({
        ...prev,
        section_title: 'Featured Machines & Equipment',
        section_subtitle: 'Top rated industrial printers, heavy copiers, and POS hardware',
        categories: [
          {
            id: 'slot_1',
            enabled: true,
            category_name: 'Printers',
            display_title: 'Official Printers',
            badge_text: 'Top Printers',
            subtitle: 'Best ink tank and photo printers from Brother & Epson',
            icon: 'Printer',
            limit: 8
          },
          {
            id: 'slot_2',
            enabled: true,
            category_name: 'Photocopy Machines',
            display_title: 'Photocopy Machines',
            badge_text: 'Heavy Duty',
            subtitle: 'Toshiba digital multifunction copiers & high volume machines',
            icon: 'Layers',
            limit: 8
          },
          {
            id: 'slot_3',
            enabled: true,
            category_name: 'POS & Barcode',
            display_title: 'POS & Barcode Solutions',
            badge_text: 'Retail Ready',
            subtitle: 'Thermal barcode printers, scanners & cash drawers',
            icon: 'Zap',
            limit: 8
          }
        ]
      }));
    } else if (presetKey === 'consumables') {
      setPopularSettings((prev) => ({
        ...prev,
        section_title: 'Inks, Toners & Sublimation Supplies',
        section_subtitle: 'Premium imported refill consumables for non-stop printing',
        categories: [
          {
            id: 'slot_1',
            enabled: true,
            category_name: 'Splashjet Inks',
            display_title: 'Splashjet Inks',
            badge_text: 'Direct Imported',
            subtitle: 'Official premium refill ink bottles for all inkjet models',
            icon: 'Droplet',
            limit: 8
          },
          {
            id: 'slot_2',
            enabled: true,
            category_name: 'Toner & Inks',
            display_title: 'Toner & Cartridges',
            badge_text: 'Best Price',
            subtitle: 'High yield laser toner cartridges and replacement parts',
            icon: 'Package',
            limit: 8
          },
          {
            id: 'slot_3',
            enabled: true,
            category_name: 'Sublimation Paper',
            display_title: 'Sublimation & DTF Supplies',
            badge_text: 'Printing Media',
            subtitle: 'High transfer rate sublimation papers, films and powders',
            icon: 'Sparkles',
            limit: 8
          }
        ]
      }));
    }
  };

  async function handleSavePopularSettings(e) {
    if (e) e.preventDefault();
    setPopularLoading(true);
    setPopularSaved(false);
    try {
      await savePopularCategoriesSettings(popularSettings);
      setPopularSaved(true);
      setTimeout(() => setPopularSaved(false), 3500);
    } catch (err) {
      alert('Failed to save popular categories settings: ' + err.message);
    } finally {
      setPopularLoading(false);
    }
  }

  async function loadStaffList() {
    setStaffLoading(true);
    try {
      const list = await fetchStaffUsers();
      setStaffUsers(list);
    } catch (err) {
      console.warn('Could not load staff list:', err);
    } finally {
      setStaffLoading(false);
    }
  }

  async function handleAddStaff(e) {
    e.preventDefault();
    setStaffActionMsg('');
    try {
      await createStaffUser(newStaffData);
      setStaffActionMsg(`স্টাফ ইউজার "${newStaffData.username}" সফলভাবে তৈরি হয়েছে!`);
      setIsAddStaffOpen(false);
      setNewStaffData({ name: '', username: '', pin: '', role: 'staff' });
      loadStaffList();
    } catch (err) {
      alert(err.message || 'Failed to create staff');
    }
  }

  async function handleDeleteStaff(userId, username) {
    if (!window.confirm(`Are you sure you want to remove staff account "${username}"?`)) return;
    try {
      await deleteStaffUser(userId, username);
      setStaffUsers((prev) => prev.filter((u) => u.username !== username));
      setStaffActionMsg(`স্টাফ "${username}" মুছে ফেলা হয়েছে।`);
    } catch (err) {
      alert(err.message || 'Failed to delete staff');
    }
  }

  // Handle Admin PIN update
  async function handlePinSubmit(e) {
    e.preventDefault();
    setPinSuccess('');
    setPinError('');
    try {
      await updateAdminPin({ currentPin, newPin });
      setPinSuccess('Security PIN successfully updated!');
      setCurrentPin('');
      setNewPin('');
    } catch (err) {
      setPinError(err.message || 'Failed to update PIN');
    }
  }

  // Handle Delivery Fee update
  async function handleDeliveryFeeSubmit(e) {
    e.preventDefault();
    setDeliveryFeeSaved(false);
    setDeliveryFeeError('');
    try {
      const inVal = Number(inDhaka) || 60;
      const outVal = Number(outDhaka) || 120;
      await updateStoreSetting('delivery_charges', {
        inside_dhaka: inVal,
        outside_dhaka: outVal
      });
      if (onDeliveryFeesUpdated) {
        onDeliveryFeesUpdated(inVal, outVal);
      }
      setDeliveryFeeSaved(true);
      setTimeout(() => setDeliveryFeeSaved(false), 3000);
    } catch (err) {
      setDeliveryFeeError(err.message || 'Failed to save delivery fees');
    }
  }

  // Handle Courier Settings update
  async function handleCourierSettingsSubmit(e) {
    e.preventDefault();
    setCourierSettingsSaved(false);
    try {
      await updateStoreSetting('courier_settings', {
        default_courier: selectedCourier
      });
      if (onCourierUpdated) {
        onCourierUpdated(selectedCourier);
      }
      setCourierSettingsSaved(true);
      setTimeout(() => setCourierSettingsSaved(false), 3000);
    } catch (err) {
      alert('Failed to save courier setting: ' + err.message);
    }
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Store Settings & Configuration</h2>
        <p className="text-xs text-slate-500">
          Update admin access credentials, delivery charges, and courier API settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Security PIN Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <KeyRound className="w-5 h-5 text-[#c92127]" />
            <h3 className="text-sm font-bold">Admin Security PIN</h3>
          </div>
          <p className="text-xs text-slate-500">
            Change the PIN code used to unlock the /adminpanel portal
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            {pinSuccess && (
              <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✓ {pinSuccess}
              </p>
            )}
            {pinError && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                ⚠ {pinError}
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Current PIN
              </label>
              <input
                type="password"
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="Current PIN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                New PIN (Min 4 Digits)
              </label>
              <input
                type="password"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Update Security PIN
            </button>
          </form>
        </div>

        {/* 2. Courier Partner Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900">
            <SlidersHorizontal className="w-5 h-5 text-[#c92127]" />
            <h3 className="text-sm font-bold">Default Courier Partner</h3>
          </div>

          <form onSubmit={handleCourierSettingsSubmit} className="space-y-4">
            {courierSettingsSaved && (
              <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✓ Courier partner settings saved!
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Steadfast', 'Pathao', 'RedX'].map((partner) => (
                <label
                  key={partner}
                  className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    selectedCourier === partner
                      ? 'bg-red-50/50 border-[#c92127] text-slate-900 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="default_courier"
                    value={partner}
                    checked={selectedCourier === partner}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="text-[#c92127] focus:ring-[#c92127]"
                  />
                  <span className="text-xs">{partner} Courier</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="bg-black hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Save Courier Setting
            </button>
          </form>
        </div>

        {/* 3.1 Custom Shipping Tiers & Category-wise Delivery Charges Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">ক্যাটাগরি ও প্রোডাক্টভিত্তিক ডেলিভারি চার্জ (Custom Shipping Tiers)</h3>
                <p className="text-xs text-slate-500">
                  বিভিন্ন পণ্য ও ক্যাটাগরির জন্য আলাদা ডেলিভারি চার্জ নির্ধারণ করুন (যেমন: কালি ৳৬০/১২০, ফটোকপিয়ার ৳৩০০/৫০০, ডিটিএফ ৳৫০০/১০০০)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTier}
              className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ নতুন শিপিং টিয়ার যুক্ত করুন</span>
            </button>
          </div>

          {tierSaveMsg && (
            <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              ✓ {tierSaveMsg}
            </p>
          )}

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {shippingTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={tier.name}>
                          {tier.name}
                        </h4>
                        {tier.is_default && (
                          <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-md font-semibold">
                            Default Fallback
                          </span>
                        )}
                        {tier.badge && (
                          <span className="text-[10px] bg-red-50 text-[#c92127] border border-red-200 px-2 py-0.5 rounded-md font-semibold">
                            {tier.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTier(tier)}
                        className="p-1.5 text-slate-500 hover:text-black hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        title="Edit Tier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!tier.is_default && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTier(tier)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">ঢাকা সিটির ভেতরে:</span>
                      <span className="font-bold font-mono text-[#c92127] text-sm">৳{tier.inside_dhaka}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ঢাকার বাইরে:</span>
                      <span className="font-bold font-mono text-slate-800 text-sm">৳{tier.outside_dhaka}</span>
                    </div>
                  </div>

                  {/* Assigned Categories */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      অন্তর্ভুক্ত ক্যাটাগরি:
                    </span>
                    {Array.isArray(tier.categories) && tier.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tier.categories.map((c) => (
                          <span
                            key={c}
                            className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        {tier.is_default ? 'সকল আন-অ্যাসাইনড ক্যাটাগরি' : 'কোনো ক্যাটাগরি নির্বাচন করা হয়নি'}
                      </span>
                    )}
                  </div>

                  {/* Specific Products Assigned */}
                  {Array.isArray(tier.product_ids) && tier.product_ids.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        ✓ {tier.product_ids.length}টি নির্দিষ্ট প্রোডাক্টে এসাইন করা
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Flash Sale & Countdown Deals Configuration */}
        {isSuperAdmin && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Flash Sale & Countdown Deals (ফ্ল্যাশ সেল ও কাউন্টডাউন)</h3>
                  <p className="text-xs text-slate-500">
                    Control homepage flash banner, countdown deadline, and urgency box
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-slate-700">ফ্ল্যাশ সেল স্ট্যাটাস:</span>
                <input
                  type="checkbox"
                  checked={flashSettings.is_active}
                  onChange={(e) => setFlashSettings({ ...flashSettings, is_active: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4"
                />
                <span className={`text-xs font-bold ${flashSettings.is_active ? 'text-[#c92127]' : 'text-slate-400'}`}>
                  {flashSettings.is_active ? 'Active (চালু)' : 'Paused (বন্ধ)'}
                </span>
              </label>
            </div>

            <form onSubmit={handleSaveFlashSettings} className="space-y-4 pt-1 text-xs">
              {flashSaved && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  ✓ Flash Sale settings saved successfully to database!
                </p>
              )}

              {/* Real-time Expiry / Live Banner Notice */}
              {flashSettings.is_active && (
                (() => {
                  const now = Date.now();
                  const target = flashSettings.end_time ? new Date(flashSettings.end_time).getTime() : 0;
                  const diff = target - now;
                  const isExpired = diff <= 0;

                  if (isExpired) {
                    return (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 animate-bounce" />
                        <div>
                          <strong className="block text-xs font-black text-amber-900">
                            ⚠️ অফারের নির্ধারিত সময় পার হয়ে গেছে (Expired)!
                          </strong>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            যেহেতু অফারের সময় শেষ, তাই হোমপেজে এটি বর্তমানে অদৃশ্য (Hidden) আছে। ওয়েবসাইটে চালু রাখতে নিচের <strong>কুইক সেট</strong> বাটন থেকে <span className="font-bold underline">+24 Hours</span> বা <span className="font-bold underline">+3 Days</span> ক্লিক করে সেভ করুন।
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 text-emerald-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <strong className="text-xs font-bold text-emerald-900">
                          🟢 ফ্ল্যাশ সেল লাইভ চলছে (হোমপেজে দৃশ্যমান)
                        </strong>
                      </div>
                      <span className="text-[11px] font-mono font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        বাকি: {days > 0 ? `${days} দিন ` : ''}{hours} ঘণ্টা {minutes} মিনিট
                      </span>
                    </div>
                  );
                })()
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ক্যাম্পেইনের নাম (Campaign Title) *</label>
                  <input
                    type="text"
                    required
                    value={flashSettings.title}
                    onChange={(e) => setFlashSettings({ ...flashSettings, title: e.target.value })}
                    placeholder="যেমন: সীমিত সময়ের ফ্ল্যাশ ডিল"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ডিসকাউন্ট ব্যানার ট্যাগ (Discount Tag)</label>
                  <input
                    type="text"
                    value={flashSettings.discount_banner}
                    onChange={(e) => setFlashSettings({ ...flashSettings, discount_banner: e.target.value })}
                    placeholder="যেমন: UP TO 35% OFF"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">সাবটাইটেল / বিবরণ (Subtitle)</label>
                  <input
                    type="text"
                    value={flashSettings.subtitle}
                    onChange={(e) => setFlashSettings({ ...flashSettings, subtitle: e.target.value })}
                    placeholder="যেমন: প্রিন্টার ও Splashjet কালিতে আকর্ষণীয় ছাড়!"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-slate-800 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c92127]" />
                      <span>অফার শেষ হওয়ার সময় (End Date & Time):</span>
                    </label>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold">কুইক সেট:</span>
                      {[
                        { label: '+12 Hours', hours: 12 },
                        { label: '+24 Hours', hours: 24 },
                        { label: '+3 Days', hours: 72 },
                        { label: '+7 Days', hours: 168 }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSetFlashHours(preset.hours)}
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-300 cursor-pointer shadow-2xs transition-all active:scale-95"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="datetime-local"
                    value={(() => {
                      if (!flashSettings.end_time) return '';
                      try {
                        const d = new Date(flashSettings.end_time);
                        if (isNaN(d.getTime())) return '';
                        const offset = d.getTimezoneOffset() * 60000;
                        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
                      } catch {
                        return '';
                      }
                    })()}
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const localDate = new Date(e.target.value);
                      setFlashSettings({ ...flashSettings, end_time: localDate.toISOString() });
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                {/* 4. Multi-Category Selector for Flash Deals */}
                <div className="sm:col-span-2 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-slate-800 font-bold flex items-center gap-1.5 text-xs">
                        <Layers className="w-3.5 h-3.5 text-[#c92127]" />
                        <span>ফ্ল্যাশ ডিলের ক্যাটাগরি নির্বাচন (Featured Categories) *</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        একাধিক ক্যাটাগরি সিলেক্ট করতে পারেন। হোমপেজে শুধুমাত্র নির্বাচিত ক্যাটাগরির প্রোডাক্টগুলোই ফ্ল্যাশ ডিলে আসবে।
                      </p>
                    </div>

                    {/* Actions: Select All / Clear */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => selectAllFlashCategories(availableFlashCategories)}
                        className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
                      >
                        সকল ক্যাটাগরি (Select All)
                      </button>
                      <button
                        type="button"
                        onClick={clearAllFlashCategories}
                        className="text-[10px] font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg shadow-2xs cursor-pointer transition-all active:scale-95"
                      >
                        ক্লিয়ার (Clear)
                      </button>
                    </div>
                  </div>

                  {/* Search input & Stats badges */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={flashCatSearch}
                        onChange={(e) => setFlashCatSearch(e.target.value)}
                        placeholder="ক্যাটাগরি ফিল্টার বা সার্চ করুন..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#c92127]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs whitespace-nowrap">
                        সিলেক্টেড: <strong className="text-[#c92127]">{(flashSettings.featured_categories || []).length} টি</strong>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs whitespace-nowrap">
                        ম্যাচিং প্রোডাক্ট: <strong className="text-emerald-900">{matchedFlashProductCount} টি</strong>
                      </span>
                    </div>
                  </div>

                  {/* Selectable Categories Grid */}
                  <div className="max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableFlashCategories
                      .filter(cat => !flashCatSearch || cat.toLowerCase().includes(flashCatSearch.toLowerCase()))
                      .map((catName) => {
                        const isSelected = (flashSettings.featured_categories || []).some(
                          c => c.toLowerCase().trim() === catName.toLowerCase().trim()
                        );
                        const count = categoryCounts[catName] || 0;

                        return (
                          <button
                            key={catName}
                            type="button"
                            onClick={() => toggleFlashCategory(catName)}
                            className={`p-2 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-red-50 border-[#c92127] text-slate-900 shadow-2xs'
                                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 border ${
                                isSelected ? 'bg-[#c92127] text-white border-[#c92127]' : 'bg-white border-slate-300'
                              }`}>
                                {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                              </span>
                              <span className="text-xs font-bold truncate">{catName}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {count} টি
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Display Limit Selector */}
                <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      হোমপেজে কতটি প্রোডাক্ট দেখাবে? (Display Limit)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      নির্বাচিত ক্যাটাগরি থেকে সবচেয়ে বেশি ছাড় থাকা প্রোডাক্টগুলো আগে ডিসপ্লে হবে।
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[4, 8, 12, 16].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFlashSettings({ ...flashSettings, display_limit: num })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          (Number(flashSettings.display_limit) || 4) === num
                            ? 'bg-[#c92127] text-white border-[#c92127] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num} টি
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm hover:shadow-md"
                >
                  Save Flash Sale Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. Popular This Week (3 Configurable Categories) */}
        {isSuperAdmin && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 md:col-span-2">
            {/* Header & Status Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-slate-900">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Popular This Week Settings (পপুলার দিস উইক ৩টি ক্যাটাগরি)</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                      3 Slots
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    হোমপেজের Popular This Week সেকশনে যেকোনো ৩টি ক্যাটাগরি, প্রোডাক্ট লিমিট, টাইটেল ও আইকন সিলেক্ট করুন
                  </p>
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-slate-700">সেকশন স্ট্যাটাস:</span>
                <input
                  type="checkbox"
                  checked={popularSettings?.is_active !== false}
                  onChange={(e) => setPopularSettings({ ...popularSettings, is_active: e.target.checked })}
                  className="accent-[#c92127] w-4 h-4"
                />
                <span className={`text-xs font-bold ${popularSettings?.is_active !== false ? 'text-[#c92127]' : 'text-slate-400'}`}>
                  {popularSettings?.is_active !== false ? 'Active (চালু)' : 'Hidden (বন্ধ)'}
                </span>
              </label>
            </div>

            <form onSubmit={handleSavePopularSettings} className="space-y-6 text-xs">
              {popularSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-bold animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ Popular This Week সেকশনের ৩টি ক্যাটাগরি সফলভাবে সেভ করা হয়েছে এবং ওয়েবসাইটে লাইভ হয়েছে!</span>
                </div>
              )}

              {/* Quick Presets Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">কুইক রেডিমেড প্রেসেট সিলেক্ট করুন:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyPopularPreset('default')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#c92127] text-slate-700 hover:text-[#c92127] font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                  >
                    💎 ডিফল্ট (Inks + Printers + Heat Press)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPopularPreset('machinery')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#c92127] text-slate-700 hover:text-[#c92127] font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                  >
                    🖨️ মেশিনারি (Printers + Copiers + POS)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPopularPreset('consumables')}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#c92127] text-slate-700 hover:text-[#c92127] font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                  >
                    🧪 কনজিউমেবলস (Inks + Toner + Sublimation)
                  </button>
                </div>
              </div>

              {/* Section Header Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    সেকশন মেইন টাইটেল:
                  </label>
                  <input
                    type="text"
                    value={popularSettings.section_title || ''}
                    onChange={(e) => setPopularSettings({ ...popularSettings, section_title: e.target.value })}
                    placeholder="e.g. Popular This Week"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    সেকশন সাবটাইটেল:
                  </label>
                  <input
                    type="text"
                    value={popularSettings.section_subtitle || ''}
                    onChange={(e) => setPopularSettings({ ...popularSettings, section_subtitle: e.target.value })}
                    placeholder="e.g. Explore our best-selling Inks..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ভিউ অল বাটন টেক্সট:
                  </label>
                  <input
                    type="text"
                    value={popularSettings.explore_button_text || ''}
                    onChange={(e) => setPopularSettings({ ...popularSettings, explore_button_text: e.target.value })}
                    placeholder="e.g. Explore All Products →"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ভিউ অল বাটন লিংক:
                  </label>
                  <input
                    type="text"
                    value={popularSettings.explore_button_link || ''}
                    onChange={(e) => setPopularSettings({ ...popularSettings, explore_button_link: e.target.value })}
                    placeholder="e.g. /shop"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>

              {/* 3 Configurable Category Slot Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    ৩টি ক্যাটাগরি স্লট কনফিগারেশন:
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (যে কোনো স্লটের ক্যাটাগরি বা নাম পরিবর্তন করুন)
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {(popularSettings.categories || DEFAULT_POPULAR_CATEGORIES_SETTINGS.categories).map((slot, index) => {
                    const slotNum = index + 1;
                    const isSlotEnabled = slot?.enabled !== false;

                    return (
                      <div
                        key={slot.id || index}
                        className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                          isSlotEnabled
                            ? 'bg-white border-slate-300 shadow-xs ring-1 ring-slate-200'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Slot Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-[#c92127] text-white flex items-center justify-center font-black text-xs">
                                {slotNum}
                              </span>
                              <span className="font-extrabold text-slate-900 text-xs">
                                ক্যাটাগরি স্লট {slotNum}
                              </span>
                            </div>

                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isSlotEnabled}
                                onChange={(e) => updatePopularSlot(index, 'enabled', e.target.checked)}
                                className="accent-[#c92127] w-3.5 h-3.5"
                              />
                              <span className="text-[11px] font-bold text-slate-600">
                                {isSlotEnabled ? 'চালু' : 'বন্ধ'}
                              </span>
                            </label>
                          </div>

                          {/* 1. Category Selector */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              প্রোডাক্ট ক্যাটাগরি সিলেক্ট করুন:
                            </label>
                            <select
                              value={slot.category_name || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                updatePopularSlot(index, 'category_name', val);
                                if (!slot.display_title || slot.display_title === slot.category_name) {
                                  updatePopularSlot(index, 'display_title', val);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#c92127]"
                            >
                              <option value="All">All (সকল প্রোডাক্ট)</option>
                              {allCategoryOptionsWithCount.map((cat) => (
                                <option key={cat.name} value={cat.name}>
                                  {cat.name} ({cat.count} টি প্রোডাক্ট)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Custom Display Title */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              হেডারে প্রদর্শিত টাইটেল (Display Title):
                            </label>
                            <input
                              type="text"
                              value={slot.display_title || ''}
                              onChange={(e) => updatePopularSlot(index, 'display_title', e.target.value)}
                              placeholder="e.g. Splashjet Inks"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c92127]"
                            />
                          </div>

                          {/* 3. Badge Text */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              ব্যাজ টেক্সট (Badge Text):
                            </label>
                            <input
                              type="text"
                              value={slot.badge_text || ''}
                              onChange={(e) => updatePopularSlot(index, 'badge_text', e.target.value)}
                              placeholder="e.g. Premium Inks / Top Models"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#c92127]"
                            />
                          </div>

                          {/* 4. Subtitle / Description */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              সাবটাইটেল / বর্ণনা (Subtitle):
                            </label>
                            <textarea
                              rows={2}
                              value={slot.subtitle || ''}
                              onChange={(e) => updatePopularSlot(index, 'subtitle', e.target.value)}
                              placeholder="ক্যাটাগরির বিবরণ লিখুন..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:border-[#c92127] resize-none"
                            />
                          </div>

                          {/* 5. Icon Picker & Limit */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                আইকন:
                              </label>
                              <select
                                value={slot.icon || 'Sparkles'}
                                onChange={(e) => updatePopularSlot(index, 'icon', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#c92127]"
                              >
                                <option value="Droplet">💧 Droplet (কালি)</option>
                                <option value="Printer">🖨️ Printer (প্রিন্টার)</option>
                                <option value="Flame">🔥 Flame (হিট প্রেস / হট)</option>
                                <option value="Sparkles">✨ Sparkles (ফিচার্ড)</option>
                                <option value="Zap">⚡ Zap (ফাস্ট / স্পিড)</option>
                                <option value="Package">📦 Package (টোনা / বক্স)</option>
                                <option value="Layers">📑 Layers (পেপার / পেজ)</option>
                                <option value="Award">🏆 Award (টপ রেটেড)</option>
                                <option value="Tag">🏷️ Tag (অফার)</option>
                                <option value="Box">📦 Box (মেশিন)</option>
                                <option value="ShieldCheck">🛡️ ShieldCheck (জেনুইন)</option>
                                <option value="ShoppingBag">🛍️ ShoppingBag (শপ)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                প্রোডাক্ট সংখ্যা:
                              </label>
                              <select
                                value={Number(slot.limit) || 8}
                                onChange={(e) => updatePopularSlot(index, 'limit', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#c92127]"
                              >
                                <option value={4}>4 টি প্রোডাক্ট</option>
                                <option value={8}>8 টি প্রোডাক্ট (Standard)</option>
                                <option value={12}>12 টি প্রোডাক্ট</option>
                                <option value={16}>16 টি প্রোডাক্ট</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Slot Visual Header Preview Tag */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">প্রিভিউ:</span>
                          <span className="font-extrabold text-[#c92127] truncate max-w-[170px]">
                            {slot.display_title || slot.category_name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={popularLoading}
                  className="bg-[#c92127] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-bold px-7 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  {popularLoading ? (
                    <span>সেভ হচ্ছে...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save Popular This Week Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 6. Staff Accounts & Permissions (Multi-Admin Roles) */}
        {isSuperAdmin && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900">
                  <Users className="w-5 h-5 text-[#c92127]" />
                  <h3 className="text-sm font-bold">Staff Accounts & Permissions (মাল্টি-অ্যাডমিন রোল)</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin full control vs Order Dispatcher restricted operational access
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddStaffOpen(true)}
                className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#c92127]" />
                <span>+ Add Staff User</span>
              </button>
            </div>

            {staffActionMsg && (
              <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✓ {staffActionMsg}
              </p>
            )}

            {/* Staff Users Table */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Password / PIN</th>
                    <th className="py-2.5 px-4">Access Permissions</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffUsers.map((user) => {
                    const isSuper = user.role === 'super_admin' || user.username === 'admin';
                    const userKey = user.id || user.username;
                    const isPinVisible = visiblePins.has(userKey);
                    const displayPin = user.pin_or_password || (user.username === 'admin' ? '******' : '123456');

                    return (
                      <tr key={userKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSuper ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.username.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.name || user.username}</p>
                              <p className="text-[10px] text-slate-400 font-mono">@{user.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isSuper
                              ? 'bg-red-50 text-[#c92127] border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {isSuper ? <Shield className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{isSuper ? 'Super Admin' : 'Order Dispatcher'}</span>
                          </span>
                        </td>

                        {/* Password / PIN Column with Reveal Toggle */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                            <span className="font-mono font-bold text-xs text-slate-800 select-all">
                              {isPinVisible ? displayPin : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePinVisibility(userKey)}
                              className="p-0.5 text-slate-400 hover:text-black transition-colors cursor-pointer"
                              title={isPinVisible ? "Hide Password" : "Show Password"}
                            >
                              {isPinVisible ? (
                                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {isSuper ? (
                            <span className="font-medium text-slate-900">
                              Full Access: PIN, Settings, Delete Products & Orders, Coupons
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Operational Access: Orders, Status, Courier Dispatch, Invoices only
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {user.username !== 'admin' ? (
                            <button
                              onClick={() => handleDeleteStaff(user.id, user.username)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete staff account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Primary Admin</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <UserPlus className="w-4 h-4 text-[#c92127]" />
                <h3 className="text-sm font-bold">নতুন স্টাফ একাউন্ট তৈরি করুন</h3>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">স্টাফের নাম (Full Name)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Arif Rahman"
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ইউজারনেম (Username - Login ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: arif_staff"
                  value={newStaffData.username}
                  onChange={(e) => setNewStaffData({ ...newStaffData, username: e.target.value.toLowerCase().trim() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">সিকিউরিটি পিন (PIN Code - Min 4 Digits) *</label>
                <input
                  type="password"
                  required
                  placeholder="যেমন: 123456"
                  value={newStaffData.pin}
                  onChange={(e) => setNewStaffData({ ...newStaffData, pin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">রোল ও পারমিশন (Role & Permissions) *</label>
                <select
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                >
                  <option value="staff">Order Dispatcher / Staff (শুধুমাত্র অর্ডার ও কুরিয়ার)</option>
                  <option value="super_admin">Super Admin (সম্পূর্ণ সিস্টেম এক্সেস)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Order Dispatcher রোল থাকলে ইউজার সেটিংস, কুপন বা প্রোডাক্ট ডিলিট করতে পারবে না।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold transition-all cursor-pointer shadow-xs"
                >
                  স্টাফ তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Shipping Tier Modal */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-slate-900">
                <Truck className="w-5 h-5 text-[#c92127]" />
                <h3 className="text-sm font-bold">
                  {editingTier ? 'শিপিং টিয়ার এডিট করুন' : 'নতুন শিপিং টিয়ার যোগ করুন'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTierSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">টিয়ারের নাম (Tier Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Heavy Machinery & Photocopier"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ঢাকা সিটির ভেতরে চার্জ (৳) *</label>
                  <input
                    type="number"
                    required
                    value={tierForm.inside_dhaka}
                    onChange={(e) => setTierForm({ ...tierForm, inside_dhaka: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ঢাকার বাইরে চার্জ (৳) *</label>
                  <input
                    type="number"
                    required
                    value={tierForm.outside_dhaka}
                    onChange={(e) => setTierForm({ ...tierForm, outside_dhaka: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ব্যাজ বা লেবেল (Badge / Tag)</label>
                  <input
                    type="text"
                    placeholder="যেমন: হেভি ওয়েট পার্সেল / ট্রান্সপোর্ট"
                    value={tierForm.badge}
                    onChange={(e) => setTierForm({ ...tierForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tierForm.is_default}
                      onChange={(e) => setTierForm({ ...tierForm, is_default: e.target.checked })}
                      className="accent-[#c92127] w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">ডিফল্ট শিপিং টিয়ার (Default Fallback Tier)</span>
                  </label>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-800 font-bold">
                  এই টিয়ারে অন্তর্ভুক্ত ক্যাটাগরিসমূহ নির্বাচন করুন (Select Categories):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 max-h-40 overflow-y-auto">
                  {categoriesList.map((cat) => {
                    const isChecked = tierForm.categories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-red-50 border-red-300 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTierCategory(cat)}
                          className="accent-[#c92127] w-3.5 h-3.5"
                        />
                        <span className="truncate">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Specific Products selector */}
              {Array.isArray(products) && products.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold">
                      নির্দিষ্ট প্রোডাক্ট এসাইন করুন (Optional - Specific Products):
                    </label>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {tierForm.product_ids.length}টি প্রোডাক্ট নির্বাচিত
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="প্রোডাক্ট খুঁজুন..."
                      value={tierProductSearch}
                      onChange={(e) => setTierProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 max-h-44 overflow-y-auto">
                    {products
                      .filter(p => !tierProductSearch || p.title?.toLowerCase().includes(tierProductSearch.toLowerCase()) || p.category?.toLowerCase().includes(tierProductSearch.toLowerCase()))
                      .map((p) => {
                        const isChecked = tierForm.product_ids.includes(String(p.id));
                        return (
                          <label
                            key={p.id}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-red-50 border-red-300 text-slate-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleTierProduct(p.id)}
                              className="accent-[#c92127] w-3.5 h-3.5 shrink-0"
                            />
                            {p.image_url && (
                              <img src={p.image_url} alt="" className="w-6 h-6 object-contain rounded shrink-0 bg-white" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{p.title}</p>
                              <span className="text-[10px] text-slate-400">{p.category}</span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c92127] hover:bg-[#b91c1c] text-white font-bold transition-all cursor-pointer shadow-xs"
                >
                  {editingTier ? 'টিয়ার আপডেট করুন' : 'টিয়ার সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
