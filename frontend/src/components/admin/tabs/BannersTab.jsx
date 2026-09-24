import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Upload, 
  Check, 
  RotateCcw, 
  Eye, 
  ExternalLink, 
  Image as ImageIcon, 
  Layers, 
  ArrowRight, 
  PhoneCall, 
  Loader2, 
  ChevronRight,
  MoveUp,
  MoveDown,
  Info,
  Megaphone,
  Type,
  Sliders,
  Play,
  Settings2,
  Tag,
  Clock,
  Gift,
  Package,
  Percent,
  Printer,
  BadgePercent,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Headphones,
  Award,
  Zap,
  Flame
} from 'lucide-react';
import { 
  useSettings, 
  DEFAULT_HERO_BANNERS, 
  DEFAULT_HERO_TICKER, 
  DEFAULT_TICKER_ITEMS 
} from '../../../context/SettingsContext';
import { uploadProductImage } from '../../../lib/supabaseClient';

const AVAILABLE_TICKER_ICONS = [
  { id: 'ShieldCheck', label: 'Shield / Warranty', Icon: ShieldCheck },
  { id: 'Sparkles', label: 'Sparkles / Official', Icon: Sparkles },
  { id: 'PhoneCall', label: 'Phone / Hotline', Icon: PhoneCall },
  { id: 'Award', label: 'Award / Genuine Quality', Icon: Award },
  { id: 'Truck', label: 'Truck / Delivery', Icon: Truck },
  { id: 'Headphones', label: 'Headphones / Support', Icon: Headphones },
  { id: 'Zap', label: 'Zap / Fast Offer', Icon: Zap },
  { id: 'Flame', label: 'Flame / Hot Deal', Icon: Flame },
  { id: 'Star', label: 'Star / Top Rated', Icon: Star },
  { id: 'CheckCircle2', label: 'Check / Verified', Icon: CheckCircle2 },
  { id: 'Tag', label: 'Tag / Discount', Icon: Tag },
  { id: 'Clock', label: 'Clock / 24-7 Service', Icon: Clock },
  { id: 'Gift', label: 'Gift / Freebie', Icon: Gift },
  { id: 'Package', label: 'Package / In Stock', Icon: Package },
  { id: 'Percent', label: 'Percent / Sale', Icon: Percent },
  { id: 'Printer', label: 'Printer / Machine', Icon: Printer },
  { id: 'Megaphone', label: 'Megaphone / Announcement', Icon: Megaphone },
  { id: 'BadgePercent', label: 'Badge / Special Offer', Icon: BadgePercent }
];

const AVAILABLE_TICKER_COLORS = [
  { id: 'red', label: 'Red', bg: 'bg-red-50 text-[#c92127]' },
  { id: 'sky', label: 'Sky Blue', bg: 'bg-sky-50 text-sky-600' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-50 text-emerald-600' },
  { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-50 text-amber-600' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-50 text-purple-600' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-50 text-indigo-600' },
  { id: 'rose', label: 'Rose Pink', bg: 'bg-rose-50 text-rose-600' },
  { id: 'slate', label: 'Slate Gray', bg: 'bg-slate-100 text-slate-700' }
];

export default function BannersTab() {
  const { heroBanners, updateHeroBanners, resetHeroBanners, loading } = useSettings();

  // Local editing state for all 4 options
  const [formData, setFormData] = useState(() => heroBanners || DEFAULT_HERO_BANNERS);
  const [activeSection, setActiveSection] = useState('main_slider'); // 'main_slider' | 'side_banner_1' | 'side_banner_2' | 'ticker_marquee' | 'live_preview'
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if context updates externally
  React.useEffect(() => {
    if (heroBanners) {
      setFormData(heroBanners);
    }
  }, [heroBanners]);

  const currentSlides = formData.slides || [];
  const currentSlide = currentSlides[selectedSlideIndex] || currentSlides[0] || {};
  const side1 = formData.sideBanner1 || DEFAULT_HERO_BANNERS.sideBanner1;
  const side2 = formData.sideBanner2 || DEFAULT_HERO_BANNERS.sideBanner2;
  const ticker = formData.ticker || DEFAULT_HERO_TICKER;

  // File Upload Helper (Uploads to Supabase storage with base64 fallback)
  const handleFileUpload = async (file, onComplete) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        onComplete(publicUrl);
      } else {
        // Fallback to local base64 reader
        const reader = new FileReader();
        reader.onloadend = () => {
          onComplete(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Upload fallback to local URL:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        onComplete(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Update a field in the currently selected slide
  const updateCurrentSlide = (field, value) => {
    setFormData((prev) => {
      const updatedSlides = [...(prev.slides || [])];
      if (updatedSlides[selectedSlideIndex]) {
        updatedSlides[selectedSlideIndex] = {
          ...updatedSlides[selectedSlideIndex],
          [field]: value
        };
      }
      return { ...prev, slides: updatedSlides };
    });
  };

  // Add new slide to main carousel
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      badgeText: 'New Featured Product',
      title: 'Premium Printing Solutions',
      titleColor: 'text-slate-900',
      warrantyBadge: '1 Year Service Warranty',
      description: 'High-performance printing and digital ink supplies for modern businesses.',
      ctaText: 'Explore Now',
      ctaLink: '/shop/',
      cardImage: '/splashjet_images/grow-your-canon-lfp-ink-business.png',
      cardFallback: '/splashjet_images/about-splashjet.jpg',
      floatingBadge: 'Special Offer!',
      glowColor: 'bg-red-500/15',
      bgGradient: 'from-amber-50/80 via-stone-50 to-red-50/70',
      isCustomGraphic: false,
      customGraphicUrl: ''
    };

    setFormData((prev) => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide]
    }));
    setSelectedSlideIndex(currentSlides.length);
  };

  // Delete slide
  const handleDeleteSlide = (indexToDelete) => {
    if (currentSlides.length <= 1) {
      alert('You must keep at least 1 slide in the carousel.');
      return;
    }
    setFormData((prev) => {
      const updated = prev.slides.filter((_, idx) => idx !== indexToDelete);
      return { ...prev, slides: updated };
    });
    setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
  };

  // Move slide up/down
  const handleMoveSlide = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return;
    setFormData((prev) => {
      const copy = [...prev.slides];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, slides: copy };
    });
    setSelectedSlideIndex(targetIndex);
  };

  // Update Side Banner 1 fields
  const updateSide1 = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      sideBanner1: {
        ...(prev.sideBanner1 || DEFAULT_HERO_BANNERS.sideBanner1),
        [field]: value
      }
    }));
  };

  // Update Side Banner 2 fields
  const updateSide2 = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      sideBanner2: {
        ...(prev.sideBanner2 || DEFAULT_HERO_BANNERS.sideBanner2),
        [field]: value
      }
    }));
  };

  // Update Ticker root settings
  const updateTicker = (field, value) => {
    setFormData((prev) => {
      const currentTicker = prev.ticker || DEFAULT_HERO_TICKER;
      return {
        ...prev,
        ticker: {
          ...currentTicker,
          [field]: value
        }
      };
    });
  };

  // Update a single item inside ticker
  const updateTickerItem = (index, field, value) => {
    setFormData((prev) => {
      const currentTicker = prev.ticker || DEFAULT_HERO_TICKER;
      const items = [...(currentTicker.items || DEFAULT_TICKER_ITEMS)];
      if (items[index]) {
        items[index] = { ...items[index], [field]: value };
      }
      return {
        ...prev,
        ticker: {
          ...currentTicker,
          items
        }
      };
    });
  };

  // Add new ticker item
  const handleAddTickerItem = () => {
    setFormData((prev) => {
      const currentTicker = prev.ticker || DEFAULT_HERO_TICKER;
      const items = [...(currentTicker.items || DEFAULT_TICKER_ITEMS)];
      const newItem = {
        id: `ticker-${Date.now()}`,
        iconName: 'Sparkles',
        title: 'New Benefit or Offer',
        desc: 'Brief description here',
        badgeColor: 'red'
      };
      return {
        ...prev,
        ticker: {
          ...currentTicker,
          items: [...items, newItem]
        }
      };
    });
  };

  // Delete ticker item
  const handleDeleteTickerItem = (indexToDelete) => {
    setFormData((prev) => {
      const currentTicker = prev.ticker || DEFAULT_HERO_TICKER;
      const items = (currentTicker.items || DEFAULT_TICKER_ITEMS).filter((_, idx) => idx !== indexToDelete);
      return {
        ...prev,
        ticker: {
          ...currentTicker,
          items
        }
      };
    });
  };

  // Move ticker item
  const handleMoveTickerItem = (index, direction) => {
    setFormData((prev) => {
      const currentTicker = prev.ticker || DEFAULT_HERO_TICKER;
      const items = [...(currentTicker.items || DEFAULT_TICKER_ITEMS)];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return {
        ...prev,
        ticker: {
          ...currentTicker,
          items
        }
      };
    });
  };

  // Save all banner configurations
  const handleSave = async () => {
    await updateHeroBanners(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Reset to default presets
  const handleReset = async () => {
    if (window.confirm('Reset all hero banner & ticker designs to factory default?')) {
      await resetHeroBanners();
      setFormData(DEFAULT_HERO_BANNERS);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c92127] text-xs font-black tracking-wide uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Hero Banners & Ticker Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hero Section & Banners Design Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Customize sliders, side banners, scrolling ticker notices, and value proposition badges live.
          </p>
        </div>

        {/* Global Save & Reset Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading || isUploading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md ${
              saveSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-[#c92127] hover:bg-[#b91c1c] active:scale-95'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved Live!</span>
              </>
            ) : isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Main Options Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Option 1 Tab: Main Slider */}
        <button
          onClick={() => setActiveSection('main_slider')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'main_slider'
              ? 'bg-white border-[#c92127] ring-2 ring-[#c92127]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#c92127] tracking-wider">Option 1</span>
            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              {currentSlides.length} Slides
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">Main Slider</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Dynamic hero carousel
          </p>
        </button>

        {/* Option 2 Tab: Top-Right Side Banner */}
        <button
          onClick={() => setActiveSection('side_banner_1')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'side_banner_1'
              ? 'bg-white border-[#c92127] ring-2 ring-[#c92127]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#c92127] tracking-wider">Option 2</span>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
              Top-Right
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">Side Banner 1</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Splashjet Inks promo card
          </p>
        </button>

        {/* Option 3 Tab: Bottom-Right Side Banner */}
        <button
          onClick={() => setActiveSection('side_banner_2')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'side_banner_2'
              ? 'bg-white border-[#c92127] ring-2 ring-[#c92127]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#c92127] tracking-wider">Option 3</span>
            <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
              Bottom-Right
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">Side Banner 2</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Helpline & Support card
          </p>
        </button>

        {/* Option 4 Tab: Scrolling Ticker / Marquee */}
        <button
          onClick={() => setActiveSection('ticker_marquee')}
          className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeSection === 'ticker_marquee'
              ? 'bg-white border-[#c92127] ring-2 ring-[#c92127]/20 shadow-md'
              : 'bg-white/80 hover:bg-white border-slate-200/90 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#c92127] tracking-wider">Option 4</span>
            <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
              {(formData.ticker?.items || DEFAULT_TICKER_ITEMS).length} Badges
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">Scrolling Ticker</h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            Scrolling Notice & Badges
          </p>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MAIN SLIDER BANNER (OPTION 1)                                   */}
      {/* ========================================================================= */}
      {activeSection === 'main_slider' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Slides List & Navigation */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Slides List ({currentSlides.length})
                </h4>
                <button
                  onClick={handleAddSlide}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#c92127] hover:bg-[#b91c1c] px-3 py-1.5 rounded-xl shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Slide</span>
                </button>
              </div>

              {/* Slide Selection List */}
              <div className="space-y-2">
                {currentSlides.map((slide, idx) => {
                  const isSelected = selectedSlideIndex === idx;
                  return (
                    <div
                      key={slide.id || idx}
                      onClick={() => setSelectedSlideIndex(idx)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-50/50 border-[#c92127] ring-1 ring-[#c92127]'
                          : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={slide.isCustomGraphic ? slide.customGraphicUrl : slide.cardImage}
                            alt="thumb"
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            Slide {idx + 1}: {slide.title || 'Untitled Slide'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {slide.isCustomGraphic ? '🎨 Full Graphic Banner' : slide.badgeText || 'Poster Layout'}
                          </p>
                        </div>
                      </div>

                      {/* Reorder & Delete actions */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveSlide(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveSlide(idx, 1)}
                          disabled={idx === currentSlides.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Slide Customizer Form */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Editing Slide {selectedSlideIndex + 1}</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  ID: {currentSlide.id || `slide-${selectedSlideIndex + 1}`}
                </span>
              </h4>

              {/* Mode Toggle: Poster Design vs Full Graphic Banner */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => updateCurrentSlide('isCustomGraphic', false)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !currentSlide.isCustomGraphic 
                      ? 'bg-white text-slate-900 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Poster Layout
                </button>
                <button
                  type="button"
                  onClick={() => updateCurrentSlide('isCustomGraphic', true)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    currentSlide.isCustomGraphic 
                      ? 'bg-[#c92127] text-white shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Graphic Banner
                </button>
              </div>
            </div>

            {/* FULL GRAPHIC BANNER MODE */}
            {currentSlide.isCustomGraphic ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" />
                    <span>Full Graphic Banner Mode Active</span>
                  </p>
                  <p className="text-amber-800">
                    Upload a complete designed graphic banner image (Recommended size: 1920x800 or 1200x500 WebP/PNG). The entire slide will display your image.
                  </p>
                </div>

                {/* Graphic Image Uploader */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Banner Graphic Image *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50">
                    <div className="w-full sm:w-48 h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {currentSlide.customGraphicUrl ? (
                        <img 
                          src={currentSlide.customGraphicUrl} 
                          alt="Banner Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">No image set</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <label className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Upload Banner File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], (url) => updateCurrentSlide('customGraphicUrl', url));
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={currentSlide.customGraphicUrl || ''}
                        onChange={(e) => updateCurrentSlide('customGraphicUrl', e.target.value)}
                        placeholder="Or paste image URL (https://... or /images/...)"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                      />
                    </div>
                  </div>
                </div>

                {/* Banner Click Link */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Click Link / Action URL
                  </label>
                  <input
                    type="text"
                    value={currentSlide.ctaLink || ''}
                    onChange={(e) => updateCurrentSlide('ctaLink', e.target.value)}
                    placeholder="/shop/ or /product-category/splashjet-ink/"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>
            ) : (
              /* POSTER DESIGN MODE */
              <div className="space-y-4">
                
                {/* Product Showcase Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    Product Showcase Image *
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <div className="w-28 h-28 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={currentSlide.cardImage || '/splashjet_images/about-splashjet.jpg'} 
                        alt="Product" 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload New Product Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], (url) => updateCurrentSlide('cardImage', url));
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={currentSlide.cardImage || ''}
                        onChange={(e) => updateCurrentSlide('cardImage', e.target.value)}
                        placeholder="Image URL (/splashjet_images/... or https://...)"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Slide Title *
                    </label>
                    <input
                      type="text"
                      value={currentSlide.title || ''}
                      onChange={(e) => updateCurrentSlide('title', e.target.value)}
                      placeholder="e.g. Corporate Technologies"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Top Badge Pill
                    </label>
                    <input
                      type="text"
                      value={currentSlide.badgeText || ''}
                      onChange={(e) => updateCurrentSlide('badgeText', e.target.value)}
                      placeholder="e.g. Trusted Printing & Ink Partner"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Warranty / Highlight Tag
                    </label>
                    <input
                      type="text"
                      value={currentSlide.warrantyBadge || ''}
                      onChange={(e) => updateCurrentSlide('warrantyBadge', e.target.value)}
                      placeholder="e.g. 1 Year Official Service Warranty"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Floating Discount Tag
                    </label>
                    <input
                      type="text"
                      value={currentSlide.floatingBadge || ''}
                      onChange={(e) => updateCurrentSlide('floatingBadge', e.target.value)}
                      placeholder="e.g. Best Price BD!"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide.description || ''}
                    onChange={(e) => updateCurrentSlide('description', e.target.value)}
                    placeholder="Short summary displayed under the slide title..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                {/* CTA Button & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaText || ''}
                      onChange={(e) => updateCurrentSlide('ctaText', e.target.value)}
                      placeholder="e.g. Shop Now"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Button Link (URL)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.ctaLink || ''}
                      onChange={(e) => updateCurrentSlide('ctaLink', e.target.value)}
                      placeholder="e.g. /shop/ or /product-category/splashjet-ink/"
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TOP-RIGHT SIDE BANNER (OPTION 2)                                */}
      {/* ========================================================================= */}
      {activeSection === 'side_banner_1' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                Side Banner 1 (Top-Right Promo)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the top-right highlight card (e.g. Official Partner / Splashjet Inks).
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => updateSide1('isCustomGraphic', false)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !side1.isCustomGraphic 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standard Card
              </button>
              <button
                type="button"
                onClick={() => updateSide1('isCustomGraphic', true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  side1.isCustomGraphic 
                    ? 'bg-[#c92127] text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Graphic Banner
              </button>
            </div>
          </div>

          {side1.isCustomGraphic ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Full Graphic Banner Image *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50">
                  <div className="w-48 h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {side1.customGraphicUrl ? (
                      <img src={side1.customGraphicUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No Image Set</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Upload Graphic</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => updateSide1('customGraphicUrl', url));
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={side1.customGraphicUrl || ''}
                      onChange={(e) => updateSide1('customGraphicUrl', e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Click Link URL</label>
                <input
                  type="text"
                  value={side1.ctaLink || ''}
                  onChange={(e) => updateSide1('ctaLink', e.target.value)}
                  placeholder="/product-category/splashjet-ink/"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Image */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Side Card Product Image
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={side1.image || '/splashjet_images/grow-your-canon-lfp-ink-business.png'} 
                      alt="Side 1" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center gap-2 bg-slate-900 hover:bg-[#c92127] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Upload Side Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => updateSide1('image', url));
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={side1.image || ''}
                      onChange={(e) => updateSide1('image', e.target.value)}
                      placeholder="Image URL..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Badge Text</label>
                  <input
                    type="text"
                    value={side1.badgeText || ''}
                    onChange={(e) => updateSide1('badgeText', e.target.value)}
                    placeholder="e.g. Official Partner"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Sub-Badge</label>
                  <input
                    type="text"
                    value={side1.subBadge || ''}
                    onChange={(e) => updateSide1('subBadge', e.target.value)}
                    placeholder="e.g. Splashjet Inks"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Card Title</label>
                  <input
                    type="text"
                    value={side1.title || ''}
                    onChange={(e) => updateSide1('title', e.target.value)}
                    placeholder="e.g. Genuine Splashjet Inks"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={side1.subtitle || ''}
                    onChange={(e) => updateSide1('subtitle', e.target.value)}
                    placeholder="e.g. 100% Clog-Free OEM Formula"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Action Button Text</label>
                  <input
                    type="text"
                    value={side1.ctaText || ''}
                    onChange={(e) => updateSide1('ctaText', e.target.value)}
                    placeholder="e.g. Explore Inks Collection"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Action Link (URL)</label>
                  <input
                    type="text"
                    value={side1.ctaLink || ''}
                    onChange={(e) => updateSide1('ctaLink', e.target.value)}
                    placeholder="e.g. /product-category/splashjet-ink/"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BOTTOM-RIGHT SIDE BANNER (OPTION 3)                             */}
      {/* ========================================================================= */}
      {activeSection === 'side_banner_2' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                Side Banner 2 (Bottom-Right Support / Helpline)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the bottom-right support card (e.g. Direct Helpline & Call Us Now).
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => updateSide2('isCustomGraphic', false)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !side2.isCustomGraphic 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Helpline Card
              </button>
              <button
                type="button"
                onClick={() => updateSide2('isCustomGraphic', true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  side2.isCustomGraphic 
                    ? 'bg-[#c92127] text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Graphic Banner
              </button>
            </div>
          </div>

          {side2.isCustomGraphic ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Full Graphic Banner Image *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50">
                  <div className="w-48 h-28 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {side2.customGraphicUrl ? (
                      <img src={side2.customGraphicUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No Image Set</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center gap-2 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>Upload Graphic</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (url) => updateSide2('customGraphicUrl', url));
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={side2.customGraphicUrl || ''}
                      onChange={(e) => updateSide2('customGraphicUrl', e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Click Action URL (e.g. tel:01777277740)</label>
                <input
                  type="text"
                  value={side2.ctaLink || ''}
                  onChange={(e) => updateSide2('ctaLink', e.target.value)}
                  placeholder="tel:+8801777277740 or /contact/"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Badge Pill</label>
                  <input
                    type="text"
                    value={side2.badgeText || ''}
                    onChange={(e) => updateSide2('badgeText', e.target.value)}
                    placeholder="e.g. Direct Helpline"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Helpline Timing</label>
                  <input
                    type="text"
                    value={side2.subBadge || ''}
                    onChange={(e) => updateSide2('subBadge', e.target.value)}
                    placeholder="e.g. 10:00 AM - 8:00 PM"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    value={side2.phone || ''}
                    onChange={(e) => updateSide2('phone', e.target.value)}
                    placeholder="e.g. 01777-277740"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Description Tagline</label>
                  <input
                    type="text"
                    value={side2.desc || ''}
                    onChange={(e) => updateSide2('desc', e.target.value)}
                    placeholder="e.g. Expert Support for Printers & Copiers"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Call Action Text</label>
                  <input
                    type="text"
                    value={side2.ctaText || ''}
                    onChange={(e) => updateSide2('ctaText', e.target.value)}
                    placeholder="e.g. Call Us Now"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Phone Dial Link</label>
                  <input
                    type="text"
                    value={side2.ctaLink || ''}
                    onChange={(e) => updateSide2('ctaLink', e.target.value)}
                    placeholder="e.g. tel:+8801777277740"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SCROLLING TICKER & CUSTOM NOTICE (OPTION 4)                    */}
      {/* ========================================================================= */}
      {activeSection === 'ticker_marquee' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          
          {/* Section Header & Master Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-purple-700 tracking-wider">Option 4</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Hero Bottom Scrolling Ticker & Custom Notice
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage and customize the animated scrolling marquee, announcements, and trust badges right below the hero banner.
                </p>
              </div>
            </div>

            {/* Master Enable/Disable Switch */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-700">
                {ticker.enabled !== false ? 'Ticker is Active' : 'Ticker is Disabled'}
              </span>
              <button
                type="button"
                onClick={() => updateTicker('enabled', ticker.enabled === false ? true : false)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  ticker.enabled !== false ? 'bg-[#c92127]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ticker.enabled !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Select Display Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Mode 1: Badges */}
              <button
                type="button"
                onClick={() => updateTicker('mode', 'badges')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  (ticker.mode || 'badges') === 'badges'
                    ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900">Trust Badges with Icons</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Displays animated rotating badges with stylish icons, titles, and subtitle descriptions.
                </p>
              </button>

              {/* Mode 2: Custom Text */}
              <button
                type="button"
                onClick={() => updateTicker('mode', 'custom_text')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  ticker.mode === 'custom_text'
                    ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900">Custom Announcement Text</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Write and scroll any custom promotion message, notice, or marketing announcement.
                </p>
              </button>

              {/* Mode 3: Both Combined */}
              <button
                type="button"
                onClick={() => updateTicker('mode', 'both')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  ticker.mode === 'both'
                    ? 'bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900">Combined (Both Modes)</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Highlights custom promotion text alongside continuously scrolling benefit badges.
                </p>
              </button>

            </div>
          </div>

          {/* Custom Textarea (When mode is custom_text or both) */}
          {(ticker.mode === 'custom_text' || ticker.mode === 'both') && (
            <div className="p-4 sm:p-5 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Type className="w-4 h-4 text-purple-600" />
                  <span>Custom Marquee Text / Notice</span>
                </label>
                <span className="text-[11px] font-bold text-purple-700">
                  {ticker.customText?.length || 0} characters
                </span>
              </div>

              <textarea
                rows={2}
                value={ticker.customText || ''}
                onChange={(e) => updateTicker('customText', e.target.value)}
                placeholder="e.g. 🎉 Special Offer: Exclusive discounts on all Splashjet inks! • Fast Cash on Delivery Nationwide • Hotline: 01777-277740"
                className="w-full text-xs sm:text-sm px-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-900"
              />

              {/* Quick Preset Message Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-purple-900">
                  ⚡ Quick Preset Messages (click to insert):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    '🎉 Special Offer: Exclusive discounts on all Splashjet inks! • Fast Nationwide Delivery • Hotline: 01777-277740',
                    '🚚 Order Today! 24-48 Hours Express Delivery with Live Tracking Nationwide',
                    '⭐ 100% Authentic Splashjet Digital Inks & 1 Year Official Service Warranty',
                    '📞 Direct Call or WhatsApp Order: 01777-277740 (10 AM - 8 PM)'
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => updateTicker('customText', preset)}
                      className="text-[11px] font-semibold bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg transition-all text-left line-clamp-1 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Speed & Pause-on-Hover Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Speed Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Scroll Speed</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'slow', label: 'Slow (48s)' },
                  { id: 'normal', label: 'Normal (30s)' },
                  { id: 'fast', label: 'Fast (18s)' }
                ].map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => updateTicker('speed', sp.id)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center ${
                      (ticker.speed || 'normal') === sp.id
                        ? 'bg-[#c92127] text-white border-[#c92127] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pause On Hover Switch */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-slate-500" />
                <span>Pause on Hover</span>
              </label>
              <button
                type="button"
                onClick={() => updateTicker('pauseOnHover', ticker.pauseOnHover === false ? true : false)}
                className={`w-full py-2 px-4 rounded-lg border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  ticker.pauseOnHover !== false
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>{ticker.pauseOnHover !== false ? '✓ Pause on hover enabled' : '✕ Continuous scroll'}</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded font-black shadow-2xs">
                  {ticker.pauseOnHover !== false ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Badges Manager (When mode is badges or both) */}
          {(ticker.mode !== 'custom_text') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Benefit Badges List ({(ticker.items || DEFAULT_TICKER_ITEMS).length} Items)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Edit text, icon, and colors for each badge or add new ones.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTickerItem}
                  className="inline-flex items-center gap-1.5 bg-[#c92127] hover:bg-[#b91c1c] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Benefit Badge</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {(ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                  const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                  const IconComp = iconObj.Icon;
                  const colorObj = AVAILABLE_TICKER_COLORS.find(c => c.id === item.badgeColor) || AVAILABLE_TICKER_COLORS[0];

                  return (
                    <div 
                      key={item.id || idx} 
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
                    >
                      {/* Item Top Bar with Reorder & Delete */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </span>
                          <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-xs font-bold text-slate-800 line-clamp-1">
                            {item.title || `Badge #${idx + 1}`}
                          </strong>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveTickerItem(idx, -1)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="w-3 h-3 text-slate-600" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (ticker.items || DEFAULT_TICKER_ITEMS).length - 1}
                            onClick={() => handleMoveTickerItem(idx, 1)}
                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="w-3 h-3 text-slate-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTickerItem(idx)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 ml-1 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Item Form Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        
                        {/* Title (Main Text) */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Main Title *
                          </label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => updateTickerItem(idx, 'title', e.target.value)}
                            placeholder="e.g. 1 Year Service Warranty"
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127] font-semibold"
                          />
                        </div>

                        {/* Subtitle / Desc (Parenthesis Text) */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Subtitle / Details
                          </label>
                          <input
                            type="text"
                            value={item.desc || ''}
                            onChange={(e) => updateTickerItem(idx, 'desc', e.target.value)}
                            placeholder="e.g. Official Support & Authentic Parts"
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                          />
                        </div>

                        {/* Icon Picker */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Icon
                          </label>
                          <select
                            value={item.iconName || 'Award'}
                            onChange={(e) => updateTickerItem(idx, 'iconName', e.target.value)}
                            className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                          >
                            {AVAILABLE_TICKER_ICONS.map((ic) => (
                              <option key={ic.id} value={ic.id}>
                                {ic.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Color Theme Picker */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Color Theme
                          </label>
                          <select
                            value={item.badgeColor || 'red'}
                            onChange={(e) => updateTickerItem(idx, 'badgeColor', e.target.value)}
                            className="w-full text-xs px-2.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#c92127]"
                          >
                            {AVAILABLE_TICKER_COLORS.map((cl) => (
                              <option key={cl.id} value={cl.id}>
                                {cl.label}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Section Sandbox Preview */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>Live Scrolling Preview</span>
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                Speed: {ticker.speed === 'fast' ? '18s' : ticker.speed === 'slow' ? '48s' : '30s'}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 shadow-2xs overflow-hidden relative select-none">
              <div className="flex overflow-hidden w-full group">
                <div 
                  className="flex items-center gap-6 sm:gap-8 flex-shrink-0 animate-marquee-infinite"
                  style={{ animationDuration: `${ticker.speed === 'fast' ? 18 : ticker.speed === 'slow' ? 48 : 30}s` }}
                >
                  {ticker.mode === 'custom_text' ? (
                    <>
                      {[1, 2, 3].map((k) => (
                        <div key={k} className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="w-6 h-6 rounded-lg bg-red-50 text-[#c92127] inline-flex items-center justify-center flex-shrink-0">
                            <Megaphone className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                            {ticker.customText || 'Corporate Technologies BD - 100% Genuine Splashjet Inks'}
                          </strong>
                          <span className="text-slate-300 font-black ml-4">•</span>
                        </div>
                      ))}
                    </>
                  ) : ticker.mode === 'both' ? (
                    <>
                      {ticker.customText && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-lg flex-shrink-0">
                          <Megaphone className="w-3.5 h-3.5 text-[#c92127]" />
                          <strong className="text-[#c92127] font-black text-xs whitespace-nowrap">
                            {ticker.customText}
                          </strong>
                          <span className="text-red-300 font-black ml-2">•</span>
                        </div>
                      )}
                      {(ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                        const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                        const IconComp = iconObj.Icon;
                        const colorObj = AVAILABLE_TICKER_COLORS.find(c => c.id === item.badgeColor) || AVAILABLE_TICKER_COLORS[0];
                        return (
                          <div key={item.id || idx} className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                            <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                              {item.title}
                            </strong>
                            {item.desc && (
                              <span className="text-slate-500 font-medium text-xs whitespace-nowrap">
                                ({item.desc})
                              </span>
                            )}
                            <span className="text-slate-300 font-black ml-3">•</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {(ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                        const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                        const IconComp = iconObj.Icon;
                        const colorObj = AVAILABLE_TICKER_COLORS.find(c => c.id === item.badgeColor) || AVAILABLE_TICKER_COLORS[0];
                        return (
                          <div key={item.id || idx} className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                            <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                              {item.title}
                            </strong>
                            {item.desc && (
                              <span className="text-slate-500 font-medium text-xs whitespace-nowrap">
                                ({item.desc})
                              </span>
                            )}
                            <span className="text-slate-300 font-black ml-3">•</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Duplicated track for seamless loop */}
                <div 
                  className="flex items-center gap-6 sm:gap-8 flex-shrink-0 animate-marquee-infinite"
                  aria-hidden="true"
                  style={{ animationDuration: `${ticker.speed === 'fast' ? 18 : ticker.speed === 'slow' ? 48 : 30}s` }}
                >
                  {ticker.mode === 'custom_text' ? (
                    <>
                      {[1, 2, 3].map((k) => (
                        <div key={`d-${k}`} className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="w-6 h-6 rounded-lg bg-red-50 text-[#c92127] inline-flex items-center justify-center flex-shrink-0">
                            <Megaphone className="w-3.5 h-3.5" />
                          </span>
                          <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                            {ticker.customText || 'Corporate Technologies BD - 100% Genuine Splashjet Inks'}
                          </strong>
                          <span className="text-slate-300 font-black ml-4">•</span>
                        </div>
                      ))}
                    </>
                  ) : ticker.mode === 'both' ? (
                    <>
                      {ticker.customText && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-lg flex-shrink-0">
                          <Megaphone className="w-3.5 h-3.5 text-[#c92127]" />
                          <strong className="text-[#c92127] font-black text-xs whitespace-nowrap">
                            {ticker.customText}
                          </strong>
                          <span className="text-red-300 font-black ml-2">•</span>
                        </div>
                      )}
                      {(ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                        const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                        const IconComp = iconObj.Icon;
                        const colorObj = AVAILABLE_TICKER_COLORS.find(c => c.id === item.badgeColor) || AVAILABLE_TICKER_COLORS[0];
                        return (
                          <div key={`d-${item.id || idx}`} className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                            <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                              {item.title}
                            </strong>
                            {item.desc && (
                              <span className="text-slate-500 font-medium text-xs whitespace-nowrap">
                                ({item.desc})
                              </span>
                            )}
                            <span className="text-slate-300 font-black ml-3">•</span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {(ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                        const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                        const IconComp = iconObj.Icon;
                        const colorObj = AVAILABLE_TICKER_COLORS.find(c => c.id === item.badgeColor) || AVAILABLE_TICKER_COLORS[0];
                        return (
                          <div key={`d-${item.id || idx}`} className="flex items-center gap-2 flex-shrink-0">
                            <span className={`w-6 h-6 rounded-lg ${colorObj.bg} inline-flex items-center justify-center flex-shrink-0`}>
                              <IconComp className="w-3.5 h-3.5" />
                            </span>
                            <strong className="text-slate-900 font-extrabold text-xs whitespace-nowrap">
                              {item.title}
                            </strong>
                            {item.desc && (
                              <span className="text-slate-500 font-medium text-xs whitespace-nowrap">
                                ({item.desc})
                              </span>
                            )}
                            <span className="text-slate-300 font-black ml-3">•</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE PREVIEW BOX                                                          */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Live Mockup Preview (All 4 Options Combined)
            </h4>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80">
            Realtime Live View
          </span>
        </div>

        {/* Scaled Preview Grid */}
        <div className="space-y-3 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Main Slider Preview (Left) */}
            <div className="lg:col-span-8 h-[200px] sm:h-[240px] rounded-xl overflow-hidden relative border border-slate-800 bg-gradient-to-r from-amber-50 via-white to-red-50 p-4 flex items-center justify-between text-slate-900 select-none">
              {currentSlide.isCustomGraphic && currentSlide.customGraphicUrl ? (
                <img 
                  src={currentSlide.customGraphicUrl} 
                  alt="Full Graphic" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="space-y-1.5 max-w-[55%] z-10">
                    <span className="inline-block text-[9px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                      {currentSlide.badgeText}
                    </span>
                    <h3 className="text-base sm:text-xl font-black text-slate-900 line-clamp-1">
                      {currentSlide.title}
                    </h3>
                    <span className="inline-block text-[9px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {currentSlide.warrantyBadge}
                    </span>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {currentSlide.description}
                    </p>
                    <button className="bg-[#c92127] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm mt-1">
                      <span>{currentSlide.ctaText || 'Shop Now'}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="w-[45%] h-full flex items-center justify-end relative z-10">
                    {currentSlide.floatingBadge && (
                      <span className="absolute top-1 right-1 bg-[#c92127] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow">
                        {currentSlide.floatingBadge}
                      </span>
                    )}
                    <img
                      src={currentSlide.cardImage || '/splashjet_images/grow-your-canon-lfp-ink-business.png'}
                      alt="product"
                      className="max-h-full max-w-full object-contain filter drop-shadow-md"
                      onError={(e) => { e.target.src = '/splashjet_images/about-splashjet.jpg'; }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* 2 Side Banners Preview (Right) */}
            <div className="lg:col-span-4 flex flex-col gap-2.5 justify-between">
              {/* Side 1 Preview */}
              <div className="h-[95px] sm:h-[115px] rounded-xl overflow-hidden relative border border-slate-800 bg-gradient-to-br from-amber-50 via-white to-red-50/60 p-2.5 flex items-center justify-between text-slate-900">
                {side1.isCustomGraphic && side1.customGraphicUrl ? (
                  <img src={side1.customGraphicUrl} alt="Graphic" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="space-y-0.5 max-w-[65%]">
                      <span className="text-[8px] font-extrabold text-[#c92127] bg-red-100 px-1.5 py-0.2 rounded-full">
                        {side1.badgeText || 'Official Partner'}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1 mt-0.5">{side1.title}</h4>
                      <p className="text-[9px] text-slate-500 line-clamp-1">{side1.subtitle}</p>
                      <span className="text-[9px] font-bold text-[#c92127] flex items-center gap-0.5">
                        {side1.ctaText} <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0">
                      <img src={side1.image || '/splashjet_images/grow-your-canon-lfp-ink-business.png'} alt="side1" className="w-full h-full object-contain" />
                    </div>
                  </>
                )}
              </div>

              {/* Side 2 Preview */}
              <div className="h-[95px] sm:h-[115px] rounded-xl overflow-hidden relative border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2.5 flex flex-col justify-between text-white">
                {side2.isCustomGraphic && side2.customGraphicUrl ? (
                  <img src={side2.customGraphicUrl} alt="Graphic" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">
                        {side2.badgeText || 'Direct Helpline'}
                      </span>
                      <span className="text-[8px] text-slate-400">{side2.subBadge}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-[#c92127]" />
                        <span>{side2.phone}</span>
                      </p>
                      <p className="text-[9px] text-slate-300 line-clamp-1">{side2.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold text-amber-300 flex items-center justify-between">
                      <span>{side2.ctaText}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Option 4: Scrolling Ticker Preview Bar in Mockup */}
          {ticker.enabled !== false && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 overflow-hidden select-none">
              <div className="flex items-center gap-4 animate-marquee-infinite">
                {ticker.mode === 'custom_text' ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 inline-flex items-center justify-center">
                      <Megaphone className="w-3 h-3" />
                    </span>
                    <span className="text-[11px] font-bold text-white whitespace-nowrap">
                      {ticker.customText || 'Corporate Technologies BD - Official Splashjet Inks Distributor'}
                    </span>
                    <span className="text-slate-600 font-bold ml-3">•</span>
                  </div>
                ) : (
                  (ticker.items || DEFAULT_TICKER_ITEMS).map((item, idx) => {
                    const iconObj = AVAILABLE_TICKER_ICONS.find(i => i.id === item.iconName) || AVAILABLE_TICKER_ICONS[0];
                    const IconComp = iconObj.Icon;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="w-4 h-4 rounded bg-white/10 text-amber-400 inline-flex items-center justify-center">
                          <IconComp className="w-2.5 h-2.5" />
                        </span>
                        <strong className="text-[10px] font-extrabold text-white whitespace-nowrap">
                          {item.title}
                        </strong>
                        {item.desc && (
                          <span className="text-[9px] text-slate-400 whitespace-nowrap">
                            ({item.desc})
                          </span>
                        )}
                        <span className="text-slate-600 font-black ml-2">•</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
