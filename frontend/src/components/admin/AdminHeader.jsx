import React from 'react';
import { Search, X, RefreshCw, Menu } from 'lucide-react';

export default function AdminHeader({
  activeTab,
  globalSearch,
  setGlobalSearch,
  onRefresh,
  adminUsername = 'Admin',
  onOpenMobileSidebar = () => {}
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Hamburger button on mobile + Title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 capitalize whitespace-nowrap">
          {activeTab === 'overview' ? 'Dashboard' : activeTab}
        </h1>
      </div>

      {/* Middle: Global Search (Responsive width) */}
      <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search here..."
            className="w-full pl-8 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-slate-100 border border-transparent rounded-full text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none transition-all"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <button
          onClick={onRefresh}
          title="Refresh Data"
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="h-4 sm:h-5 w-px bg-slate-200"></div>

        {/* Admin Avatar Pill */}
        <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white font-bold text-[11px] sm:text-xs flex items-center justify-center border-2 border-[#c92127]">
            CT
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {adminUsername}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
