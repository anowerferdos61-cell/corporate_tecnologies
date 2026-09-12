import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ShoppingBag,
  Layers,
  Users,
  Settings,
  ExternalLink,
  ArrowUpRight,
  LogOut,
  X,
  Ticket,
  TrendingUp,
  Shield,
  Lock
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingOrdersCount = 0,
  totalOrdersCount = 0,
  totalProductsCount = 0,
  totalCustomersCount = 0,
  adminRole = 'super_admin',
  adminUsername = 'Admin',
  onLogout,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const isSuperAdmin = adminRole === 'super_admin';
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5 select-none bg-white">
      <div className="space-y-6">
        
        {/* Top Brand Logo */}
        <div className="px-2 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <span className="font-black text-lg text-white">C</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c92127] -ml-0.5 mt-2"></span>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                Corporate <span className="text-[#c92127]">Tech</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Admin Hub
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-2">
          {/* 1. Dashboard / Overview */}
          <button
            onClick={() => handleNavClick('overview')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#c92127]' : 'text-slate-400'}`} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* 2. Orders */}
          <button
            onClick={() => handleNavClick('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#c92127]' : 'text-slate-400'}`} />
              <span>Orders</span>
            </div>
            {pendingOrdersCount > 0 ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-[#c92127] text-white' : 'bg-red-50 text-[#c92127] border border-red-100'
              }`}>
                {pendingOrdersCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">{totalOrdersCount}</span>
            )}
          </button>

          {/* 3. Products */}
          <button
            onClick={() => handleNavClick('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className={`w-4 h-4 ${activeTab === 'products' ? 'text-[#c92127]' : 'text-slate-400'}`} />
              <span>Products</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{totalProductsCount}</span>
          </button>

          {/* 4. Customers */}
          <button
            onClick={() => handleNavClick('customers')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${activeTab === 'customers' ? 'text-[#c92127]' : 'text-slate-400'}`} />
              <span>Customers</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{totalCustomersCount}</span>
          </button>

          {/* 5. Sales Reports & Analytics */}
          <button
            onClick={() => handleNavClick('analytics')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#18181b] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#c92127]' : 'text-slate-400'}`} />
              <span>Analytics & Reports</span>
            </div>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
              New
            </span>
          </button>

          {/* 6. Coupons (Super Admin Only) */}
          {isSuperAdmin ? (
            <button
              onClick={() => handleNavClick('coupons')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'coupons'
                  ? 'bg-[#18181b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className={`w-4 h-4 ${activeTab === 'coupons' ? 'text-[#c92127]' : 'text-slate-400'}`} />
                <span>Coupons</span>
              </div>
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed"
              title="Super Admin permission required"
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-slate-300" />
                <span>Coupons</span>
              </div>
              <Lock className="w-3 h-3 text-slate-400" />
            </div>
          )}

          {/* 7. Settings (Super Admin Only) */}
          {isSuperAdmin ? (
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#18181b] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-[#c92127]' : 'text-slate-400'}`} />
                <span>Settings</span>
              </div>
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed"
              title="Super Admin permission required"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-300" />
                <span>Settings</span>
              </div>
              <Lock className="w-3 h-3 text-slate-400" />
            </div>
          )}
        </nav>
      </div>

      {/* User Profile & Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <div className="px-3 py-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isSuperAdmin ? 'bg-black text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {adminUsername.slice(0, 1).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate capitalize">{adminUsername}</p>
              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full inline-block ${
                isSuperAdmin ? 'bg-red-50 text-[#c92127]' : 'bg-amber-50 text-amber-700'
              }`}>
                {isSuperAdmin ? 'Super Admin' : 'Staff Dispatcher'}
              </span>
            </div>
          </div>
          {isSuperAdmin ? (
            <Shield className="w-3.5 h-3.5 text-[#c92127] shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>Visit Store</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <button
          onClick={() => {
            onCloseMobile();
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 sticky top-0 h-screen flex-col justify-between z-30 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile / Tablet Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col animate-slideInLeft">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
