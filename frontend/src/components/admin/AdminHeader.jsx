import React from 'react';
import {
  Search,
  X,
  RefreshCw,
  Menu,
  Plus,
  Bell,
  ExternalLink,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

export default function AdminHeader({
  activeTab,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  adminUsername = 'Admin',
  adminRole = 'super_admin',
  onOpenMobileSidebar = () => {},
  isSidebarCollapsed = false,
  onToggleSidebar = () => {},
  onOpenAddProduct = () => {}
}) {
  const isSuperAdmin = adminRole === 'super_admin';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6 shadow-2xs">
      {/* Left: Toggle & Tab Title */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-black hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 capitalize leading-tight">
            {activeTab === 'overview' ? 'Dashboard' : activeTab}
          </h1>
          <p className="hidden sm:block text-[11px] font-semibold text-slate-400">
            Corporate Technologies Admin
          </p>
        </div>
      </div>

      {/* Middle: Modern Sleek Rounded Search Bar (Like SprintPro) */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search by products, SKU, order ID, phone number..."
            className="w-full pl-10 pr-9 py-2 bg-slate-100/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none transition-all shadow-inner"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* + Quick Action Button */}
        <button
          onClick={onOpenAddProduct}
          className="bg-[#c92127] hover:bg-[#b01b20] text-white text-xs font-extrabold px-3.5 sm:px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          title="Add New Product"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Product</span>
        </button>

        {/* Live Store Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Customer Storefront"
          className="p-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
