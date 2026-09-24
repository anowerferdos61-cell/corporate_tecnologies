import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  X,
  Shield,
  Lock,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  FolderTree,
  Menu,
  BookOpen
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
  onCloseMobile = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {}
}) {
  const isSuperAdmin = adminRole === 'super_admin';

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#c92127] text-white">
          {pendingOrdersCount}
        </span>
      ) : (
        <span className="text-[10px] text-slate-500 font-bold font-mono">{totalOrdersCount}</span>
      ),
      dot: pendingOrdersCount > 0
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: (
        <span className="text-[10px] text-slate-500 font-bold font-mono">{totalProductsCount}</span>
      )
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: FolderTree,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: (
        <span className="text-[10px] text-slate-500 font-bold font-mono">{totalCustomersCount}</span>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: (
        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md">
          Pro
        </span>
      )
    },
    {
      id: 'banners',
      label: 'Hero Banners',
      icon: Sparkles,
      badge: (
        <span className="text-[9px] font-bold bg-red-100 text-[#c92127] px-1.5 py-0.5 rounded-md">
          Live
        </span>
      )
    },
    {
      id: 'navbar',
      label: 'Navbar & Menus',
      icon: Menu,
      badge: (
        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
          Custom
        </span>
      )
    },
    {
      id: 'blogs',
      label: 'Blogs & Articles',
      icon: BookOpen,
      badge: (
        <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md">
          CMS
        </span>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      superAdminOnly: true
    }
  ];

  const sidebarContent = (
    <div className={`flex flex-col justify-between h-full select-none bg-white transition-all duration-300 ${
      isCollapsed ? 'p-3' : 'p-4 sm:p-5'
    }`}>
      {/* Top Section: Logo & Toggle */}
      <div className="space-y-6">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-1`}>
          {!isCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-black text-lg text-white">C</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c92127] -ml-0.5 mt-2"></span>
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  Corporate <span className="text-[#c92127]">Tech</span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Admin Console
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/" className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform" title="Corporate Tech Admin">
              <span className="font-black text-lg text-white">C</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c92127] -ml-0.5 mt-2"></span>
            </Link>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-black hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isRestricted = item.superAdminOnly && !isSuperAdmin;

            if (isRestricted) {
              return (
                <div
                  key={item.id}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-bold text-slate-400 opacity-50 cursor-not-allowed`}
                  title={`${item.label} (Super Admin Only)`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-300" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center p-3.5' : 'justify-between px-3.5 py-3'
                } rounded-xl text-xs font-black transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'text-slate-900 hover:text-black hover:bg-slate-100/90'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#c92127]' : 'text-slate-700 group-hover:text-black'}`} />
                  {!isCollapsed && (
                    <span className="tracking-tight font-extrabold text-[13px]">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge}

                {/* Notification dot in collapsed mode */}
                {isCollapsed && item.dot && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#c92127] ring-2 ring-white"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions: Visit Store & Logout */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-bold text-slate-800 hover:text-black hover:bg-slate-100 transition-colors`}
          title="Visit Live Store"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-600" />
            {!isCollapsed && <span>Visit Store</span>}
          </div>
        </a>

        <button
          onClick={() => {
            onCloseMobile();
            onLogout();
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-2.5 px-3.5 py-2.5'} rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer`}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar with Toggle Width */}
      <aside className={`hidden lg:flex bg-white border-r border-slate-200/80 sticky top-0 h-screen flex-col justify-between z-30 flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col animate-slideInLeft">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
