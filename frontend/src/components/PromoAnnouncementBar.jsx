import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function PromoAnnouncementBar({ onOpenCheckout }) {
  const { headerSettings, branding } = useSettings();
  const [isDismissed, setIsDismissed] = useState(false);

  const topBarConfig = headerSettings?.top_bar;
  const isEnabled = topBarConfig?.enabled ?? true;
  const customNotice = topBarConfig?.custom_notice !== undefined ? topBarConfig.custom_notice : '🚚 সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি | হটলাইন: 01777-277740';
  const actionText = topBarConfig?.action_text ?? 'অফার দেখুন';
  const actionUrl = topBarConfig?.action_url || '/shop';
  const primaryColor = branding?.primary_color || '#c92127';

  // Live event listener for header settings updates
  const [, setRevision] = useState(0);
  useEffect(() => {
    const handleUpdate = () => {
      setRevision(r => r + 1);
      setIsDismissed(false); // Reset dismissal if admin updates notice
    };
    window.addEventListener('ct_header_settings_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('ct_header_settings_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // If top bar is disabled, dismissed, or notice is empty, do not render
  if (!isEnabled || isDismissed || !customNotice || !customNotice.trim()) {
    return null;
  }

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-zinc-900 to-slate-950 text-white text-xs border-b border-zinc-800/80 relative z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        
        {/* Left / Center Content */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 justify-center sm:justify-start">
          <span 
            style={{ backgroundColor: primaryColor }}
            className="text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden xs:inline">ঘোষণা</span>
            <span className="xs:hidden">নোটিশ</span>
          </span>

          <div className="flex items-center gap-2 truncate text-slate-200">
            <span className="font-semibold truncate">{customNotice}</span>
            {actionText && actionText.trim() && (
              <a
                href={actionUrl}
                className="text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center gap-0.5 shrink-0 hover:underline ml-1"
              >
                <span>{actionText}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Right: Dismiss Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            title="ব্যানার বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
