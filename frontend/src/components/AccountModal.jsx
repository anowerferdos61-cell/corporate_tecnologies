import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Package, 
  Truck, 
  Heart, 
  Tag, 
  FileText, 
  PhoneCall, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { 
  loginCustomer, 
  registerCustomer, 
  logoutCustomer, 
  getCurrentCustomer,
  updateCustomerProfile
} from '../lib/customerAuth';
import { getCustomerOrders, trackOrder } from '../lib/orderService';

export default function AccountModal({ isOpen, onClose, onNavigate, initialTab = 'account' }) {
  const { wishlist, addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(initialTab); // 'account' | 'my-orders' | 'track' | 'wishlist' | 'offers' | 'profile'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Current logged in customer state
  const [customer, setCustomer] = useState(() => getCurrentCustomer());

  // Form states
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // My Orders state
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Order Tracking state
  const [orderQuery, setOrderQuery] = useState('');
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackResults, setTrackResults] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Profile Edit state
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('Dhaka');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Sync initial tab when modal opens
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Sync customer session
  useEffect(() => {
    const handleAuthSync = () => {
      const cur = getCurrentCustomer();
      setCustomer(cur);
      if (cur) {
        setEditName(cur.full_name || '');
        setEditAddress(cur.address || '');
        setEditCity(cur.city || 'Dhaka');
      }
    };
    handleAuthSync();
    window.addEventListener('ct_user_updated', handleAuthSync);
    return () => window.removeEventListener('ct_user_updated', handleAuthSync);
  }, []);

  // Fetch orders when modal opens or 'my-orders' or account tab changes
  useEffect(() => {
    if (isOpen && customer?.phone) {
      setOrdersLoading(true);
      getCustomerOrders(customer.phone)
        .then(orders => setMyOrders(orders))
        .catch(err => console.error('Orders load error:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [isOpen, activeTab, customer]);

  if (!isOpen) return null;

  // Handle Login (Phone Number matching - No password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginCustomer({ phone, full_name: fullName, rememberMe });
      setCustomer(res);
      setAuthError('');
    } catch (err) {
      setAuthError(err.message || 'লগইন ব্যর্থ হয়েছে');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register (Name + Number + Courier Address - No password)
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await registerCustomer({ 
        phone, 
        full_name: fullName, 
        address: regAddress, 
        rememberMe 
      });
      setCustomer(res);
      setAuthError('');
    } catch (err) {
      setAuthError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logoutCustomer();
    setCustomer(null);
    setMyOrders([]);
    setActiveTab('account');
    setAuthMode('login');
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      await updateCustomerProfile({
        full_name: editName,
        address: editAddress,
        city: editCity
      });
      setProfileSuccessMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Track Order
  const handleTrackSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!orderQuery.trim()) return;

    setIsSearchingTrack(true);
    setTrackError('');
    setTrackResults(null);

    try {
      const results = await trackOrder(orderQuery);
      if (!results || results.length === 0) {
        setTrackError('এই নম্বর বা অর্ডার আইডিতে কোনো অর্ডার পাওয়া যায়নি। সঠিক তথ্য দিন।');
      } else {
        setTrackResults(results);
      }
    } catch (err) {
      setTrackError('অর্ডার ট্র্যাক করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  // Helper for Order Status Badge
  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">ডেলিভারড</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">কুরিয়ারে আছে</span>;
      case 'confirmed':
      case 'processing':
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">প্রসেসিং হচ্ছে</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">বাতিল</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">পেন্ডিং</span>;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-2xl md:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl animate-slideUp text-slate-800 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#c92127] flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              {activeTab === 'track' ? (
                <Truck className="w-5 h-5" />
              ) : activeTab === 'my-orders' ? (
                <Package className="w-5 h-5" />
              ) : activeTab === 'wishlist' ? (
                <Heart className="w-5 h-5" />
              ) : activeTab === 'profile' ? (
                <MapPin className="w-5 h-5" />
              ) : activeTab === 'offers' ? (
                <Tag className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                {activeTab === 'track' ? 'অর্ডার লাইভ ট্র্যাকিং' :
                 activeTab === 'my-orders' ? 'আমার অর্ডারসমূহ' :
                 activeTab === 'profile' ? 'ডেলিভারি ঠিকানা ও প্রোফাইল' :
                 activeTab === 'wishlist' ? 'পছন্দের তালিকা (উইশলিস্ট)' :
                 activeTab === 'offers' ? 'স্পেশাল অফার ও ভাউচার' :
                 customer ? 'আমার অ্যাকাউন্ট' : 'লগইন বা রেজিস্টার'}
              </h3>
              <p className="text-xs text-slate-500">
                Corporate Technologies – আপনার বিশ্বস্ত আইটি ও প্রিন্টিং পার্টনার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onNavigate) onNavigate('/my-account');
                else window.location.href = '/my-account';
              }}
              className="text-xs font-bold text-slate-700 hover:text-[#c92127] bg-slate-100 hover:bg-red-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="ফুল পেইজ ড্যাশবোর্ড খুলুন"
            >
              <span className="hidden sm:inline">ফুল স্ক্রিন ড্যাশবোর্ড</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {activeTab !== 'account' && (
              <button 
                onClick={() => setActiveTab('account')}
                className="text-xs font-bold text-[#c92127] hover:underline px-2 py-1 cursor-pointer"
              >
                ← ড্যাশবোর্ড
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: MAIN ACCOUNT / LOGIN / REGISTER                                    */}
        {/* ========================================================================= */}
        {activeTab === 'account' && (
          <div>
            {customer ? (
              /* LOGGED IN CUSTOMER DASHBOARD */
              <div className="space-y-4">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4.5 shadow-md flex items-center justify-between border border-slate-700">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-full bg-[#c92127] flex items-center justify-center text-xl font-black text-white shadow-inner border-2 border-white/20">
                      {customer.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-black text-base leading-tight">{customer.full_name}</h4>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{customer.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          ● ভেরিফাইড মেম্বার
                        </span>
                        {customer.city && (
                          <span className="text-[10px] text-slate-300">
                            📍 {customer.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="লগআউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => setActiveTab('my-orders')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#c92127] flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">আমার অর্ডারসমূহ</span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {ordersLoading ? 'লোড হচ্ছে...' : `${myOrders.length}টি অর্ডার পাওয়া গেছে`}
                      </span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('track')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">অর্ডার ট্র্যাকিং</span>
                      <span className="text-[10px] text-slate-500 truncate block">কুরিয়ার স্ট্যাটাস দেখুন</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">ডেলিভারি ঠিকানা</span>
                      <span className="text-[10px] text-slate-500 truncate block">
                        {customer.address ? 'ঠিকানা সেভ করা আছে' : 'ঠিকানা যোগ করুন'}
                      </span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('wishlist')}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center gap-3 text-left hover:bg-red-50/50 hover:border-red-200 transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">উইশলিস্ট</span>
                      <span className="text-[10px] text-slate-500 truncate block">{wishlist.length}টি পণ্য সংরক্ষিত</span>
                    </div>
                  </button>
                </div>

                {/* Recent Orders Preview */}
                {myOrders.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">সাম্প্রতিক অর্ডার</span>
                      <button 
                        onClick={() => setActiveTab('my-orders')}
                        className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer"
                      >
                        সবগুলো দেখুন ({myOrders.length}) →
                      </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 divide-y divide-slate-100">
                      {myOrders.slice(0, 2).map((ord) => (
                        <div key={ord.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-slate-900">{ord.order_number}</span>
                              {getStatusBadge(ord.order_status)}
                            </div>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              {new Date(ord.created_at).toLocaleDateString('bn-BD')} • {ord.order_items?.length || 1}টি আইটেম
                            </span>
                          </div>
                          <span className="text-xs font-black text-[#c92127]">৳{Number(ord.grand_total).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Helpline Strip */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#c92127] text-white flex items-center justify-center">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block">কাস্টমার সাপোর্ট ও অর্ডার সহায়তা</span>
                      <span className="text-xs font-black text-[#c92127] font-mono">01777-277740</span>
                    </div>
                  </div>
                  <a 
                    href="tel:+8801777277740" 
                    className="text-xs font-black text-white bg-[#c92127] hover:bg-[#b91c1c] px-3.5 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    কল দিন
                  </a>
                </div>
              </div>
            ) : (
              /* AUTHENTICATION: LOGIN OR REGISTER FORM */
              <div>
                {/* Toggle Login vs Register */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-4 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white text-[#c92127] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    লগইন করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className={`py-2 rounded-xl transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-[#c92127] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-3.5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                  {authMode === 'register' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        আপনার নাম / দোকানের নাম <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="যেমন: মোঃ করিম / ডিজিটাল সাইন প্রেস"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                    />
                  </div>

                  {authMode === 'login' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        আপনার নাম (ঐচ্ছিক)
                      </label>
                      <input 
                        type="text"
                        placeholder="নাম আপডেট করতে চাইলে লিখুন"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        কুরিয়ার ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        rows="2"
                        placeholder="রোড নম্বর, বাড়ি/দোকানের নাম, এলাকা, থানা ও জেলা..."
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
                      />
                    </div>
                  )}

                  {/* Remember Me Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#c92127] accent-[#c92127] cursor-pointer"
                      />
                      <span>লগইন মনে রাখুন (আর কখনো লগআউট হবে না)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <span>অপেক্ষা করুন...</span>
                    ) : authMode === 'login' ? (
                      <span>লগইন করুন →</span>
                    ) : (
                      <span>অ্যাকাউন্ট খুলুন →</span>
                    )}
                  </button>
                </form>

                {/* Quick Track Order Link for Guests */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">লগইন ছাড়াই কোনো অর্ডার ট্র্যাক করবেন?</span>
                  <button
                    onClick={() => setActiveTab('track')}
                    className="text-xs font-black text-[#c92127] hover:underline cursor-pointer"
                  >
                    অর্ডার ট্র্যাক →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY ORDERS LIST (রিয়েল অর্ডার তালিকা)                                */}
        {/* ========================================================================= */}
        {activeTab === 'my-orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-3 border-[#c92127] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">আপনার অর্ডারসমূহ লোড হচ্ছে...</p>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">এখনো কোনো অর্ডার করেননি</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  আপনার কার্টে পছন্দসই প্রিন্টার, ফটোকপিয়ার বা Splashjet কালি যুক্ত করে এখনই অর্ডার করুন।
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('/shop');
                  }}
                  className="bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-[#b91c1c] cursor-pointer"
                >
                  শপ ব্রাউজ করুন →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    {/* Top Row: Number & Status */}
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-slate-900">{ord.order_number}</span>
                          {getStatusBadge(ord.order_status)}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {new Date(ord.created_at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#c92127] block">৳{Number(ord.grand_total).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{ord.payment_method}</span>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-1.5">
                      {ord.order_items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                          <span className="truncate max-w-[240px]">• {item.product_title}</span>
                          <span className="font-semibold text-slate-500">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address & Courier Tracking Info */}
                    <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{ord.delivery_address}, {ord.city}</span>
                      </div>
                      {ord.tracking_code && (
                        <div className="flex items-center gap-1.5 pt-1 text-blue-700 font-semibold">
                          <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>কুরিয়ার ট্র্যাকিং কোড: <strong className="font-mono">{ord.tracking_code}</strong> ({ord.courier_name || 'Steadfast'})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ORDER TRACKING (সার্চ ও লাইভ স্ট্যাটাস)                             */}
        {/* ========================================================================= */}
        {activeTab === 'track' && (
          <div className="space-y-4">
            <form onSubmit={handleTrackSubmit} className="relative">
              <input 
                type="text"
                placeholder="অর্ডার নম্বর বা মোবাইল নম্বর দিন (যেমন: CT-2609-1001)"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-4 pr-24 py-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
              />
              <button
                type="submit"
                disabled={isSearchingTrack || !orderQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSearchingTrack ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
              </button>
            </form>

            {/* Error Message */}
            {trackError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {/* Tracking Results */}
            {trackResults && trackResults.length > 0 && (
              <div className="space-y-3 animate-fadeIn">
                {trackResults.map((order) => (
                  <div key={order.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-slate-900">{order.order_number}</span>
                          {getStatusBadge(order.order_status)}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          কাস্টমার: {order.customer_name} ({order.phone})
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#c92127]">৳{Number(order.grand_total).toLocaleString()}</span>
                    </div>

                    {/* Timeline Visualizer */}
                    <div className="py-2 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">অর্ডার গ্রহণ করা হয়েছে</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {new Date(order.created_at).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${order.order_status !== 'pending' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-800">প্যাকেজিং ও কনফার্মেশন</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {order.order_status !== 'pending' ? 'সম্পন্ন' : 'চলমান'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${['shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-800">কুরিয়ারে হস্তান্তর ({order.courier_name || 'Steadfast / Pathao'})</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {order.tracking_code ? `ট্র্যাকিং: ${order.tracking_code}` : 'প্রক্রিয়াধীন'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full ${order.order_status === 'delivered' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="font-semibold text-slate-800">ডেলিভারি সম্পন্ন</span>
                        <span className="text-[10px] text-slate-400 ml-auto">
                          {order.order_status === 'delivered' ? 'সফল' : 'অপেক্ষমান'}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>ডেলিভারি ঠিকানা: {order.delivery_address}, {order.city}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PROFILE & DELIVERY ADDRESS EDIT                                    */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && customer && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (পরিবর্তনযোগ্য নয়)</label>
              <input 
                type="text"
                disabled
                value={customer.phone}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">আপনার নাম / দোকানের নাম</label>
              <input 
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ডিফল্ট ডেলিভারি ঠিকানা</label>
              <textarea 
                rows="2"
                placeholder="রোড নম্বর, বাড়ি/দোকানের নাম, এলাকা..."
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">শহর / জেলা</label>
              <input 
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#c92127]/20 focus:border-[#c92127] outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full bg-[#c92127] hover:bg-[#b91c1c] disabled:bg-slate-300 text-white font-black text-xs sm:text-sm py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isSavingProfile ? 'সংরক্ষণ হচ্ছে...' : 'ঠিকানা সেভ করুন'}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: WISHLIST                                                           */}
        {/* ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div className="space-y-3">
            {wishlist.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Heart className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">আপনার পছন্দের তালিকা বর্তমানে খালি।</p>
              </div>
            ) : (
              wishlist.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-12 h-12 object-contain bg-white rounded-xl border border-slate-200 p-1"
                      onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-black text-[#c92127]">৳{Number(item.sale_price || item.regular_price).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-[#c92127] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#b91c1c] shadow-xs cursor-pointer"
                  >
                    কার্টে নিন
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: OFFERS                                                             */}
        {/* ========================================================================= */}
        {activeTab === 'offers' && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-md">Splashjet Special</span>
                <span className="text-xs font-bold">১০% ক্যাশব্যাক</span>
              </div>
              <h4 className="text-sm font-black">যেকোনো ৪ রঙের Splashjet সেটে ফ্রি ডেলিভারি</h4>
              <p className="text-[11px] text-white/80 mt-1">কুপন কোড: <strong className="font-mono bg-white text-[#c92127] px-1.5 py-0.5 rounded">SPLASHJET2026</strong></p>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-md">Photocopier Deal</span>
                <span className="text-xs font-bold">ফ্রি সেটআপ ও টোনার</span>
              </div>
              <h4 className="text-sm font-black">Toshiba e-Studio ফটোকপিয়ারে ১ বছরের ফ্রি সার্ভিসিং</h4>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
