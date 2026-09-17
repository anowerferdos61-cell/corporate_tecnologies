import React, { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { updateAdminPin, fetchStaffUsers, createStaffUser, deleteStaffUser } from '../../../lib/adminAuth';
import { updateStoreSetting } from '../../../lib/adminOrderService';
import { fetchFlashSaleSettings, updateFlashSaleSettings } from '../../../lib/flashSaleService';
import { fetchShippingTiers, saveShippingTier, deleteShippingTier, DEFAULT_SHIPPING_TIERS } from '../../../lib/shippingService';
import { getCachedCategoriesTree } from '../../../lib/categoryService';

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
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Delivery Fee State
  const [inDhaka, setInDhaka] = useState(insideDhakaFee);
  const [outDhaka, setOutDhaka] = useState(outsideDhakaFee);
  const [deliveryFeeSaved, setDeliveryFeeSaved] = useState(false);
  const [deliveryFeeError, setDeliveryFeeError] = useState('');

  // Shipping Tiers State
  const [shippingTiers, setShippingTiers] = useState(DEFAULT_SHIPPING_TIERS);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
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
  const [categoriesList, setCategoriesList] = useState([]);

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
    end_time: new Date(Date.now() + 48 * 3600000).toISOString()
  });
  const [flashSaved, setFlashSaved] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      loadStaffList();
      fetchFlashSaleSettings()
        .then((s) => {
          if (s) setFlashSettings(s);
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
                          className="bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-300 cursor-pointer shadow-2xs"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="datetime-local"
                    value={flashSettings.end_time ? new Date(new Date(flashSettings.end_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFlashSettings({ ...flashSettings, end_time: new Date(e.target.value).toISOString() })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-[#c92127]"
                  />
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

        {/* 5. Staff Accounts & Permissions (Multi-Admin Roles) */}
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
