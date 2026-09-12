import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  Heart,
  User,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Copy,
  Check,
  Search,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  PhoneCall,
  ShoppingBag,
  RefreshCw,
  Edit3,
  SlidersHorizontal,
  ChevronLeft,
  LayoutGrid,
  Filter
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  getCurrentCustomer,
  loginCustomer,
  registerCustomer,
  logoutCustomer,
  updateCustomerProfile
} from '../lib/customerAuth';
import { getCustomerOrders, trackOrder } from '../lib/orderService';

export default function CustomerDashboardPage({ products = [] }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, addToCart, showToast } = useCart();

  // Active Tab: 'orders' | 'track' | 'address' | 'wishlist'
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Customer State
  const [customer, setCustomer] = useState(() => getCurrentCustomer());

  // Auth Form State (for guests)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'shipped' | 'delivered'
  const [copiedOrderNum, setCopiedOrderNum] = useState(null);

  // Track Order State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResults, setTrackResults] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('Dhaka');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Sync Customer Auth Listener
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

  // Fetch Orders when customer is available
  const loadOrders = async () => {
    if (!customer?.phone) return;
    setOrdersLoading(true);
    try {
      const ords = await getCustomerOrders(customer.phone);
      setOrders(ords);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (customer?.phone) {
      loadOrders();
    }
  }, [customer]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginCustomer({ phone, full_name: fullName, rememberMe });
      setCustomer(res);
      showToast?.('লগইন সফল হয়েছে!', 'success');
    } catch (err) {
      setAuthError(err.message || 'লগইন ব্যর্থ হয়েছে। ফোন নম্বর চেক করুন।');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register
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
      showToast?.('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'success');
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
    setOrders([]);
    showToast?.('সফলভাবে লগআউট হয়েছে', 'info');
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');
    try {
      await updateCustomerProfile({
        full_name: editName,
        address: editAddress,
        city: editCity
      });
      setProfileSuccessMsg('ঠিকানা ও প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      setIsEditingProfile(false);
      showToast?.('প্রোফাইল আপডেট হয়েছে!', 'success');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Track Order Search
  const handleTrackSearch = async (e) => {
    if (e) e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackLoading(true);
    setTrackError('');
    setTrackResults(null);
    try {
      const res = await trackOrder(trackQuery);
      if (!res || res.length === 0) {
        setTrackError('কোনো অর্ডার পাওয়া যায়নি। সঠিক অর্ডার নম্বর বা মোবাইল নম্বর দিন।');
      } else {
        setTrackResults(res);
      }
    } catch (err) {
      setTrackError('অর্ডার ট্র্যাক করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setTrackLoading(false);
    }
  };

  // Copy Order Number Helper
  const handleCopyOrder = (orderNum) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderNum(orderNum);
    setTimeout(() => setCopiedOrderNum(null), 2000);
    showToast?.('অর্ডার নম্বর কপি করা হয়েছে!', 'info');
  };

  // Helper for Order Status Badge
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ডেলিভারি সম্পন্ন
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            কুরিয়ারে রয়েছে
          </span>
        );
      case 'confirmed':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            প্রসেসিং হচ্ছে
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            বাতিলকৃত
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            অপেক্ষমান (পেন্ডিং)
          </span>
        );
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    if (orderFilter === 'pending') return ord.order_status === 'pending';
    if (orderFilter === 'shipped') return ord.order_status === 'shipped';
    if (orderFilter === 'delivered') return ord.order_status === 'delivered';
    return true;
  });

  // Filtered Wishlist Products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Navigation Items
  const navItems = [
    {
      id: 'orders',
      label: 'আমার অর্ডারসমূহ',
      sublabel: `${orders.length}টি অর্ডার রের্কড`,
      icon: Package,
      count: orders.length,
      badgeColor: 'bg-red-50 text-[#c92127]'
    },
    {
      id: 'track',
      label: 'অর্ডার লাইভ ট্র্যাকিং',
      sublabel: 'কুরিয়ার পার্সেল ট্র্যাকিং',
      icon: Truck,
      count: null,
      badgeColor: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'address',
      label: 'কুরিয়ার ডেলিভারি ঠিকানা',
      sublabel: customer?.address ? 'ঠিকানা সেভ করা আছে' : 'ঠিকানা যোগ করুন',
      icon: MapPin,
      count: null,
      badgeColor: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'wishlist',
      label: 'পছন্দের তালিকা (উইশলিস্ট)',
      sublabel: `${wishlist.length}টি সংরক্ষিত পণ্য`,
      icon: Heart,
      count: wishlist.length,
      badgeColor: 'bg-pink-50 text-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-36 md:pb-24 pt-4 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        
        {/* Breadcrumb Navigation */}
        <div className="py-2 border-b border-slate-200/80">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-[#c92127] transition-colors">হোম</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">কাস্টমার ড্যাশবোর্ড</span>
          </nav>
        </div>

        {!customer ? (
          /* ========================================================================= */
          /* GUEST VIEW: PASSWORDLESS LOGIN / REGISTRATION CARD                        */
          /* ========================================================================= */
          <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 text-slate-800">
            <div className="text-center space-y-2 mb-8">
              <div className="w-16 h-16 bg-red-50 text-[#c92127] rounded-3xl flex items-center justify-center mx-auto shadow-inner ring-8 ring-red-50/50">
                <User className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">আমার অ্যাকাউন্টে স্বাগতম</h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                পাসওয়ার্ড মনে রাখার ঝামেলা ছাড়া শুধুমাত্র আপনার মোবাইল নম্বর দিয়ে সরাসরি লগইন করুন
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6 text-xs sm:text-sm font-black">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`py-3 rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#c92127] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                লগইন করুন
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`py-3 rounded-xl transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#c92127] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                নতুন অ্যাকাউন্ট খুলুন
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs sm:text-sm text-red-700 font-semibold animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    আপনার নাম / প্রতিষ্ঠানের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: মোঃ করিম / ক্রিয়েটিভ প্রিন্টার্স"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127] focus:bg-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ১১ ডিজিটের মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    +88
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-[#c92127] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    কুরিয়ার ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="বাসা/দোকান নং, রোড, থানা, জেলা (কুরিয়ার পার্সেল পাওয়ার জন্য)"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127] focus:bg-white transition-colors resize-none"
                  />
                </div>
              )}

              {authMode === 'login' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    আপনার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="নাম দিলে স্বয়ংক্রিয়ভাবে সেভ থাকবে"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127] focus:bg-white transition-colors"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pageRememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#c92127] focus:ring-[#c92127] accent-[#c92127] cursor-pointer"
                />
                <label htmlFor="pageRememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                  আমাকে লগইন অবস্থায় রাখুন (মনে রাখুন)
                </label>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {authLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* PROFESSIONAL 2-COLUMN DASHBOARD (SIDEBAR MENU ON RIGHT / DETAILS ON LEFT) */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* --------------------------------------------------------------------- */}
            {/* 1. SIDEBAR MENU PANEL (ডান পাশে মেনু বাটনসমূহ)                         */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-4 lg:col-span-4 order-1 lg:order-2">
              
              {/* User Profile Mini Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-700/70 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#c92127] to-red-700 text-white font-black text-xl flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
                      {customer.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-base text-white truncate">{customer.full_name}</h3>
                      <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {customer.phone}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          ● ভেরিফাইড
                        </span>
                        {customer.city && (
                          <span className="text-[10px] text-slate-300 truncate">
                            📍 {customer.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-slate-300 hover:text-white transition-all cursor-pointer flex-shrink-0"
                    title="লগআউট"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation Menu Card (ডান পাশের মূল মেনু বাটন) */}
              <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-200/90 space-y-1.5">
                <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  ড্যাশবোর্ড মেনু
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'bg-[#c92127] text-white shadow-md shadow-red-600/20 translate-x-1'
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-black block truncate">{item.label}</span>
                          <span className={`text-[10px] truncate block ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                            {item.sublabel}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.count !== null && (
                          <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white text-[#c92127]' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-1'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Summary Box */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90 space-y-3">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  অর্ডার স্ট্যাটিস্টিকস
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block">মোট অর্ডার</span>
                    <span className="text-lg font-black text-slate-900">{orders.length}টি</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 block">চলমান অর্ডার</span>
                    <span className="text-lg font-black text-amber-700">
                      {orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled').length}টি
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block">ডেলিভারি সম্পন্ন</span>
                      <span className="text-base font-black text-emerald-700">
                        {orders.filter(o => o.order_status === 'delivered').length}টি
                      </span>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Customer Support Helpline Card */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/80 rounded-3xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c92127] text-white flex items-center justify-center flex-shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">জরুরি অর্ডার সহায়তা</span>
                    <span className="text-[11px] text-slate-500">প্রতিনিধির সাথে সরাসরি কথা বলুন</span>
                  </div>
                </div>
                <a
                  href="tel:+8801777277740"
                  className="w-full bg-[#c92127] hover:bg-[#b91c1c] text-white py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>01777-277740 এ কল করুন</span>
                </a>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* 2. MAIN DETAILS PANEL (ক্লিক করলে বিস্তারিত দেখবে বাম/মূল এরিয়াতে)      */}
            {/* --------------------------------------------------------------------- */}
            <div className="space-y-4 lg:col-span-8 order-2 lg:order-1">
              
              {/* =================================================================== */}
              {/* TAB 1: MY ORDERS (আমার অর্ডারসমূহ ও বিস্তারিত প্রোডাক্ট)            */}
              {/* =================================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Section Top Header */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#c92127]" />
                        <span>আমার অর্ডারসমূহ ও বিস্তারিত বিবরণ</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        আপনার সমস্ত অর্ডারের স্ট্যাটাস, ইনভয়েস বিবরণ এবং ডেলিভারি ট্র্যাকিং
                      </p>
                    </div>

                    <button
                      onClick={loadOrders}
                      disabled={ordersLoading}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#c92127] font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                      <span>রিফ্রেশ</span>
                    </button>
                  </div>

                  {/* Orders Filter Tabs */}
                  {orders.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                      <button
                        onClick={() => setOrderFilter('all')}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          orderFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সবগুলো ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderFilter('pending')}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          orderFilter === 'pending'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        অপেক্ষমান ({orders.filter(o => o.order_status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setOrderFilter('shipped')}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          orderFilter === 'shipped'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        কুরিয়ারে রয়েছে ({orders.filter(o => o.order_status === 'shipped').length})
                      </button>
                      <button
                        onClick={() => setOrderFilter('delivered')}
                        className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                          orderFilter === 'delivered'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সম্পন্ন ({orders.filter(o => o.order_status === 'delivered').length})
                      </button>
                    </div>
                  )}

                  {/* Orders Content Area */}
                  {ordersLoading ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200">
                      <div className="w-10 h-10 border-3 border-[#c92127] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700">অর্ডার লোড হচ্ছে...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
                      <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">এখনো কোনো অর্ডার সম্পন্ন করেননি</h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        আমাদের শপ থেকে Splashjet অরিজিনাল কালি, Epson ইঙ্কট্যাঙ্ক প্রিন্টার কিংবা তোশিবা ফটোকপিয়ার দেখে এখনই অর্ডার করুন।
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-all shadow-md"
                      >
                        <span>শপে পণ্য ব্রাউজ করুন</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-200 space-y-2 text-slate-500 text-xs">
                      <p>এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।</p>
                      <button
                        onClick={() => setOrderFilter('all')}
                        className="text-[#c92127] font-bold hover:underline cursor-pointer"
                      >
                        সবগুলো অর্ডার দেখুন
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/90 hover:border-slate-300 transition-all space-y-4"
                        >
                          {/* Order Card Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono font-black text-base text-slate-900">
                                  {ord.order_number}
                                </span>
                                <button
                                  onClick={() => handleCopyOrder(ord.order_number)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                  title="অর্ডার নম্বর কপি করুন"
                                >
                                  {copiedOrderNum === ord.order_number ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {getStatusBadge(ord.order_status)}
                              </div>
                              <p className="text-xs text-slate-500">
                                অর্ডারের তারিখ: {new Date(ord.created_at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-[11px] text-slate-500 block">মোট প্রদেয় বিল</span>
                              <span className="text-lg font-black text-[#c92127]">
                                ৳{Number(ord.grand_total).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                                পেমেন্ট: {ord.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : ord.payment_method} ({ord.payment_status})
                              </span>
                            </div>
                          </div>

                          {/* Order Items Breakdown */}
                          <div className="space-y-2.5">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                              <span>অর্ডারের পণ্যসমূহ ({ord.order_items?.length || 0}টি):</span>
                              <span className="text-slate-400 font-normal">সাবটোটাল: ৳{Number(ord.subtotal).toLocaleString()}</span>
                            </h4>
                            <div className="divide-y divide-slate-100 bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                              {ord.order_items?.map((item, idx) => (
                                <div key={idx} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_title}
                                        className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 flex-shrink-0"
                                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                                        <Package className="w-6 h-6" />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                        {item.product_title}
                                      </h5>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        পরিমাণ: <span className="font-bold text-slate-800 font-mono">x{item.quantity}</span> | প্রতি ইউনিট: <span className="font-mono">৳{Number(item.unit_price).toLocaleString()}</span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className="text-xs sm:text-sm font-black text-slate-900">
                                      ৳{Number(item.total_price || item.unit_price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Address & Courier Footer */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex items-start gap-2.5">
                              <MapPin className="w-4 h-4 text-[#c92127] mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-bold text-slate-800 block">ডেলিভারি কুরিয়ার ঠিকানা</span>
                                <span className="text-slate-600">{ord.delivery_address}, {ord.city}</span>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex items-start justify-between gap-2.5">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <Truck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-800 block">কুরিয়ার ট্র্যাকিং</span>
                                  <span className="text-slate-600 truncate block">
                                    {ord.courier_name ? `${ord.courier_name} কুরিয়ার` : 'কুরিয়ারে বুকিং প্রক্রিয়াধীন'}
                                    {ord.tracking_code && ` (কোড: ${ord.tracking_code})`}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setTrackQuery(ord.order_number);
                                  handleTabChange('track');
                                  trackOrder(ord.order_number).then(res => setTrackResults(res));
                                }}
                                className="text-xs font-bold text-[#c92127] hover:underline cursor-pointer flex-shrink-0"
                              >
                                ট্র্যাক করুন →
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 2: LIVE ORDER TRACKING (অর্ডার লাইভ ট্র্যাকিং)                   */}
              {/* =================================================================== */}
              {activeTab === 'track' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#c92127]" />
                      <span>অর্ডার লাইভ ট্র্যাকিং ও কুরিয়ার তথ্য</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      আপনার যেকোনো অর্ডারের বর্তমান অবস্থা এবং কুরিয়ার স্ট্যাটাস দেখতে অর্ডার নম্বর বা মোবাইল নম্বর দিন
                    </p>
                  </div>

                  <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-2xl">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="অর্ডার নম্বর (যেমন: CT-2609-XXXX) বা ১১ ডিজিটের মোবাইল..."
                        value={trackQuery}
                        onChange={(e) => setTrackQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#c92127] focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={trackLoading}
                      className="bg-[#c92127] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {trackLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>ট্র্যাক করুন</span>}
                    </button>
                  </form>

                  {trackError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  {trackResults && trackResults.length > 0 && (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-900">
                        ট্র্যাকিং ফলাফল ({trackResults.length}টি অর্ডার পাওয়া গেছে):
                      </h3>

                      {trackResults.map((ord) => (
                        <div key={ord.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-base text-slate-900">{ord.order_number}</span>
                                {getStatusBadge(ord.order_status)}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">গ্রাহক: {ord.customer_name} ({ord.phone})</p>
                            </div>
                            <div className="sm:text-right">
                              <span className="text-base font-black text-[#c92127]">৳{Number(ord.grand_total).toLocaleString()}</span>
                              <span className="text-[10px] text-slate-500 block uppercase font-bold">{ord.payment_method}</span>
                            </div>
                          </div>

                          {/* Visual Step Tracker */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-center space-y-1">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                              <span className="text-xs font-bold text-slate-800 block">১. অর্ডার গৃহীত</span>
                              <span className="text-[10px] text-slate-500">অনলাইন রিসিভড</span>
                            </div>

                            <div className={`p-3 bg-white rounded-2xl border text-center space-y-1 ${
                              ord.order_status !== 'pending' ? 'border-emerald-200' : 'border-slate-200 opacity-60'
                            }`}>
                              <CheckCircle2 className={`w-5 h-5 mx-auto ${ord.order_status !== 'pending' ? 'text-emerald-600' : 'text-slate-300'}`} />
                              <span className="text-xs font-bold text-slate-800 block">২. কনফার্মড</span>
                              <span className="text-[10px] text-slate-500">প্যাকিং প্রস্তুত</span>
                            </div>

                            <div className={`p-3 bg-white rounded-2xl border text-center space-y-1 ${
                              ord.order_status === 'shipped' || ord.order_status === 'delivered' ? 'border-emerald-200' : 'border-slate-200 opacity-60'
                            }`}>
                              <Truck className={`w-5 h-5 mx-auto ${ord.order_status === 'shipped' || ord.order_status === 'delivered' ? 'text-blue-600' : 'text-slate-300'}`} />
                              <span className="text-xs font-bold text-slate-800 block">৩. কুরিয়ারে আছে</span>
                              <span className="text-[10px] text-slate-500">{ord.courier_name || 'Steadfast'}</span>
                            </div>

                            <div className={`p-3 bg-white rounded-2xl border text-center space-y-1 ${
                              ord.order_status === 'delivered' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 opacity-60'
                            }`}>
                              <CheckCircle2 className={`w-5 h-5 mx-auto ${ord.order_status === 'delivered' ? 'text-emerald-600' : 'text-slate-300'}`} />
                              <span className="text-xs font-bold text-slate-800 block">৪. ডেলিভারড</span>
                              <span className="text-[10px] text-slate-500">সফলভাবে হস্তান্তরিত</span>
                            </div>
                          </div>

                          {/* Items in this tracked order */}
                          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold text-slate-700">অর্ডারের পণ্যসমূহ:</h4>
                            <div className="divide-y divide-slate-100">
                              {ord.order_items?.map((item, i) => (
                                <div key={i} className="py-2 flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-800">• {item.product_title}</span>
                                  <span className="font-bold text-slate-600 font-mono">x{item.quantity} (৳{Number(item.total_price).toLocaleString()})</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 3: COURIER DELIVERY ADDRESS (কুরিয়ার ডেলিভারি ঠিকানা)           */}
              {/* =================================================================== */}
              {activeTab === 'address' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#c92127]" />
                        <span>কুরিয়ার ডেলিভারি ঠিকানা ও প্রোফাইল</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        চেকআউটে দ্রুত অর্ডার সম্পন্ন করার জন্য আপনার ডিফল্ট ঠিকানা সেভ করে রাখুন
                      </p>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c92127] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>পরিবর্তন করুন</span>
                      </button>
                    )}
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  {isEditingProfile ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">আপনার নাম / প্রতিষ্ঠানের নাম</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">কুরিয়ার ডেলিভারি ঠিকানা (বিস্তারিত)</label>
                        <textarea
                          required
                          rows={3}
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="বাসা/দোকান নং, রোড নং, থানা, জেলা"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">জেলা / শহর</label>
                        <select
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c92127]"
                        >
                          <option value="Dhaka">Dhaka (ঢাকা)</option>
                          <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                          <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                          <option value="Khulna">Khulna (খুলনা)</option>
                          <option value="Sylhet">Sylhet (সিলেট)</option>
                          <option value="Barisal">Barisal (বরিশাল)</option>
                          <option value="Rangpur">Rangpur (রংপুর)</option>
                          <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                          <option value="Other">অন্যান্য জেলা (Others)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="bg-[#c92127] hover:bg-[#b91c1c] text-white px-6 py-3 rounded-xl font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          {profileSaving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-xs text-slate-500 font-bold block">গ্রাহকের নাম:</span>
                        <span className="text-sm font-black text-slate-900">{customer.full_name}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-xs text-slate-500 font-bold block">মোবাইল নম্বর:</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{customer.phone}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 md:col-span-2">
                        <span className="text-xs text-slate-500 font-bold block">ডিফল্ট ডেলিভারি ও কুরিয়ার ঠিকানা:</span>
                        <span className="text-sm text-slate-800 font-medium">
                          {customer.address ? `${customer.address}, ${customer.city}` : 'কোনো ঠিকানা সেভ করা নেই। অনুগ্রহ করে ঠিকানা যোগ করুন।'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 4: WISHLIST (উইশলিস্ট সংরক্ষিত পণ্যসমূহ)                       */}
              {/* =================================================================== */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <span>পছন্দের তালিকা (উইশলিস্ট)</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        আপনার সংরক্ষিত পণ্যসমূহ সরাসরি কার্টে যুক্ত করে অর্ডার করতে পারেন
                      </p>
                    </div>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 space-y-3">
                      <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">উইশলিস্টে কোনো পণ্য নেই</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        যেকোনো পণ্যের হার্ট (Heart) আইকনে ক্লিক করে পছন্দের তালিকায় সংরক্ষণ করতে পারেন।
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-[#c92127] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm"
                      >
                        শপে ঘুরে দেখুন
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlistProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                        >
                          <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden p-2">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{p.title}</h4>
                            <span className="text-sm font-black text-[#c92127]">৳{Number(p.sale_price).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="w-full bg-slate-900 hover:bg-[#c92127] text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>কার্টে যোগ করুন</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
