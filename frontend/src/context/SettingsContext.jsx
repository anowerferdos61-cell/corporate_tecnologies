import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const DEFAULT_BRANDING = {
  site_title: 'Corporate Technologies BD',
  tagline: 'Quality Products at Better Price',
  header_notice: 'বাংলাদেশে অফিসিয়াল Splashjet Ink ও প্রিন্টারের বিশ্বস্ত প্রতিষ্ঠান',
  logo_url: '/corporate-logo-red.png',
  white_logo_url: '/corporate-logo-white.png',
  dark_logo_url: '/corporate-logo-dark.png',
  favicon_url: '/favicon.png',
  primary_color: '#c92127',
  primary_hover_color: '#a8171c',
  accent_color: '#0ea5e9',
  font_family: 'Inter, Hind Siliguri, sans-serif',
  default_theme: 'light',
  badge_text: 'অফিসিয়াল ডিস্ট্রিবিউটর'
};

export const DEFAULT_HEADER_SETTINGS = {
  top_bar: {
    enabled: true,
    mode: 'hybrid', // 'coupons' | 'custom_notice' | 'hybrid'
    custom_notice: '🚚 সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি | হটলাইন: 01777-277740',
    action_text: 'অফার দেখুন',
    action_url: '/shop',
    bg_style: 'gradient' // 'gradient' | 'primary' | 'dark'
  },
  search: {
    placeholder: 'প্রিন্টার, ফটোকপিয়ার বা Splashjet কালি খুঁজুন...'
  },
  action_buttons: {
    show_call_btn: true,
    call_phone: '01777277740',
    call_btn_text: 'Call Now',
    show_whatsapp_btn: true,
    whatsapp_number: '8801777277740',
    whatsapp_btn_text: 'WhatsApp',
    show_blog_btn: true,
    show_account_btn: true,
    show_cart_subtotal: true
  },
  navigation: {
    sticky_nav: true,
    all_products_label: 'All Products',
    hidden_categories: [], // Categories hidden / excluded by admin ("বাদ দেওয়া")
    custom_categories: [] // Categories added by admin with subcategories
  }
};

export const DEFAULT_HERO_BANNERS = {
  // Option 1: Main Slider Carousel
  slides: [
    {
      id: 'slide-1',
      badgeText: 'Trusted Printing & Ink Partner',
      title: 'Corporate Technologies',
      titleColor: 'text-[#c92127]',
      warrantyBadge: '1 Year Official Service Warranty',
      description: 'Authorized distributor of Photocopiers, Printers & Splashjet Certified Digital Inks with guaranteed authentic quality.',
      ctaText: 'Shop Now',
      ctaLink: '/shop/',
      cardImage: '/splashjet_images/grow-your-canon-lfp-ink-business.png',
      cardFallback: '/splashjet_images/about-splashjet.jpg',
      floatingBadge: 'Best Price BD!',
      glowColor: 'bg-red-500/15',
      bgGradient: 'from-amber-50/80 via-stone-50 to-red-50/70',
      isCustomGraphic: false,
      customGraphicUrl: ''
    },
    {
      id: 'slide-2',
      badgeText: 'Smart Office Solutions',
      title: 'Digital Photocopiers',
      titleColor: 'text-slate-900',
      warrantyBadge: 'Free Installation & On-Site Support',
      description: 'Heavy duty Toshiba & Canon digital photocopiers with fast delivery and official 1-year service warranty.',
      ctaText: 'Explore Copiers',
      ctaLink: '/product-category/photocopy-machine/',
      cardImage: 'https://corporatetechbd.com/wp-content/uploads/2025/08/toshiba-2523a-photocopy-machine.toshiba-e-studio-2020ac-multifunction-digital-color-photocopier-machine.202-b9196ab5.png',
      cardFallback: '/splashjet_images/about-splashjet.jpg',
      floatingBadge: 'Office Special!',
      glowColor: 'bg-sky-500/15',
      bgGradient: 'from-sky-50/90 via-slate-50 to-blue-50/70',
      isCustomGraphic: false,
      customGraphicUrl: ''
    },
    {
      id: 'slide-3',
      badgeText: 'Low-Cost High-Volume Printing',
      title: 'Epson & HP Printers',
      titleColor: 'text-slate-900',
      warrantyBadge: 'Crystal Clear & High Yield Prints',
      description: 'Genuine Wi-Fi Ink Tank, EcoTank & LaserJet printers for home, office, and photo studio printing needs.',
      ctaText: 'Explore Printers',
      ctaLink: '/product-category/printers/',
      cardImage: 'https://corporatetechbd.com/wp-content/uploads/2025/08/epson-ecotank-m2050-multifunction-monochrome-ink-tank-printer.2050png.png',
      cardFallback: '/splashjet_images/why-splashjet.webp',
      floatingBadge: 'Ready Stock!',
      glowColor: 'bg-emerald-500/15',
      bgGradient: 'from-emerald-50/80 via-slate-50 to-teal-50/60',
      isCustomGraphic: false,
      customGraphicUrl: ''
    },
    {
      id: 'slide-4',
      badgeText: 'Printing Business Packages',
      title: 'Heat Press & Sublimation',
      titleColor: 'text-[#c92127]',
      warrantyBadge: 'Complete Business Startup Bundles',
      description: 'All-in-one 5-in-1 combo heat press machines, DTF setups, and Splashjet premium sublimation inks.',
      ctaText: 'View Packages',
      ctaLink: '/product-category/heat-press-machine/',
      cardImage: 'https://corporatetechbd.com/wp-content/uploads/2026/06/freesub-15-x-15-professional-t-shirt-heat-press-machine-high-performance-solution-for-custom-apparel-printing.Untitled-design-5-2.png',
      cardFallback: '/splashjet_images/news-product-launches.webp',
      floatingBadge: 'Startup Deal!',
      glowColor: 'bg-amber-500/15',
      bgGradient: 'from-amber-50/80 via-stone-50 to-rose-50/70',
      isCustomGraphic: false,
      customGraphicUrl: ''
    }
  ],

  // Option 2: Side Banner 1 (Top Right)
  sideBanner1: {
    badgeText: 'Official Partner',
    subBadge: 'Splashjet Inks',
    title: 'Genuine Splashjet Inks',
    subtitle: '100% Clog-Free OEM Formula',
    ctaText: 'Explore Inks Collection',
    ctaLink: '/product-category/splashjet-ink/',
    image: '/splashjet_images/grow-your-canon-lfp-ink-business.png',
    bgGradient: 'from-amber-50 via-white to-red-50/60',
    isCustomGraphic: false,
    customGraphicUrl: ''
  },

  // Option 3: Side Banner 2 (Bottom Right)
  sideBanner2: {
    badgeText: 'Direct Helpline',
    subBadge: '10:00 AM - 8:00 PM',
    phone: '01777-277740',
    desc: 'Expert Support for Printers & Copiers',
    ctaText: 'Call Us Now',
    ctaLink: 'tel:+8801777277740',
    bgGradient: 'from-slate-900 via-slate-800 to-slate-900',
    isCustomGraphic: false,
    customGraphicUrl: ''
  }
};

const LOCAL_BRANDING_KEY = 'corporate_tech_branding_v1';
const LOCAL_HEADER_KEY = 'corporate_tech_header_settings_v1';
const LOCAL_HERO_BANNERS_KEY = 'corporate_tech_hero_banners_v1';

// Hex to RGB helper for opacity styling
function hexToRgb(hex) {
  if (!hex) return '201, 33, 39';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '201, 33, 39';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

const SettingsContext = createContext({
  branding: DEFAULT_BRANDING,
  updateBranding: async () => {},
  resetBranding: async () => {},
  headerSettings: DEFAULT_HEADER_SETTINGS,
  updateHeaderSettings: async () => {},
  resetHeaderSettings: async () => {},
  heroBanners: DEFAULT_HERO_BANNERS,
  updateHeroBanners: async () => {},
  resetHeroBanners: async () => {},
  loading: false
});

export function SettingsProvider({ children }) {
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BRANDING_KEY);
      if (saved) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load branding from localStorage:', e);
    }
    return DEFAULT_BRANDING;
  });

  const [headerSettings, setHeaderSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_HEADER_KEY);
      if (saved) {
        return { ...DEFAULT_HEADER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load header settings from localStorage:', e);
    }
    return DEFAULT_HEADER_SETTINGS;
  });

  const [heroBanners, setHeroBanners] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_HERO_BANNERS_KEY);
      if (saved) {
        return { ...DEFAULT_HERO_BANNERS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load hero banners from localStorage:', e);
    }
    return DEFAULT_HERO_BANNERS;
  });

  const [loading, setLoading] = useState(false);

  // Apply CSS variables and DOM metadata whenever branding changes
  useEffect(() => {
    applyBrandingToDOM(branding);
  }, [branding]);

  // Fetch latest settings from Supabase on mount
  useEffect(() => {
    async function loadRemoteSettings() {
      try {
        // 1. Fetch site_branding
        const { data, error } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'site_branding')
          .single();

        if (!error && data?.value) {
          const merged = { ...DEFAULT_BRANDING, ...data.value };
          setBranding(merged);
          localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(merged));
        }

        // 2. Fetch header_navbar_settings
        const { data: headerData, error: headerErr } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'header_navbar_settings')
          .single();

        if (!headerErr && headerData?.value) {
          const mergedH = { ...DEFAULT_HEADER_SETTINGS, ...headerData.value };
          setHeaderSettings(mergedH);
          localStorage.setItem(LOCAL_HEADER_KEY, JSON.stringify(mergedH));
        }

        // 3. Fetch hero_banners
        const { data: heroData, error: heroErr } = await supabase
          .from('store_settings')
          .select('value')
          .eq('key', 'hero_banners')
          .single();

        if (!heroErr && heroData?.value) {
          const mergedHero = { ...DEFAULT_HERO_BANNERS, ...heroData.value };
          setHeroBanners(mergedHero);
          localStorage.setItem(LOCAL_HERO_BANNERS_KEY, JSON.stringify(mergedHero));
        }
      } catch (err) {
        console.warn('Notice: Remote store_settings fetch fallback to local cache:', err.message);
      }
    }

    loadRemoteSettings();
  }, []);

  function applyBrandingToDOM(data) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 1. Apply Dynamic CSS Variables
    const primary = data.primary_color || DEFAULT_BRANDING.primary_color;
    const hover = data.primary_hover_color || DEFAULT_BRANDING.primary_hover_color;
    const accent = data.accent_color || DEFAULT_BRANDING.accent_color;
    const rgb = hexToRgb(primary);

    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-primary-hover', hover);
    root.style.setProperty('--brand-primary-rgb', rgb);
    root.style.setProperty('--brand-accent', accent);

    if (data.font_family) {
      root.style.setProperty('--font-primary', data.font_family);
      document.body.style.fontFamily = data.font_family;
    }

    // 2. Favicon update
    if (data.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.favicon_url;
    }

    // 3. Document Title update if on public pages
    if (data.site_title && !window.location.pathname.includes('/adminpanel')) {
      const currentTitle = document.title;
      if (!currentTitle.includes(data.site_title)) {
        document.title = `${data.site_title} | ${data.tagline || 'Official Store'}`;
      }
    }

    // 4. Dark Mode / Theme update
    if (data.default_theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Update Branding function (Local + Remote)
  const updateBranding = async (updates) => {
    setLoading(true);
    const newBranding = { ...branding, ...updates };

    setBranding(newBranding);
    applyBrandingToDOM(newBranding);
    try {
      localStorage.setItem(LOCAL_BRANDING_KEY, JSON.stringify(newBranding));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      await supabase
        .from('store_settings')
        .upsert({
          key: 'site_branding',
          value: newBranding,
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.warn('Supabase upsert fallback:', err.message);
    } finally {
      setLoading(false);
    }

    return newBranding;
  };

  // Reset to default branding
  const resetBranding = async () => {
    return await updateBranding(DEFAULT_BRANDING);
  };

  // Update Header & Navbar settings (Local + Remote)
  const updateHeaderSettings = async (updates) => {
    setLoading(true);
    const newHeader = { ...headerSettings, ...updates };

    setHeaderSettings(newHeader);
    try {
      localStorage.setItem(LOCAL_HEADER_KEY, JSON.stringify(newHeader));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      await supabase
        .from('store_settings')
        .upsert({
          key: 'header_navbar_settings',
          value: newHeader,
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.warn('Supabase upsert fallback:', err.message);
    } finally {
      setLoading(false);
    }

    return newHeader;
  };

  // Reset to default header settings
  const resetHeaderSettings = async () => {
    return await updateHeaderSettings(DEFAULT_HEADER_SETTINGS);
  };

  // Update Hero Banners (Main Slider + Side Banner 1 + Side Banner 2)
  const updateHeroBanners = async (updates) => {
    setLoading(true);
    const newBanners = typeof updates === 'function' ? updates(heroBanners) : { ...heroBanners, ...updates };

    setHeroBanners(newBanners);
    try {
      localStorage.setItem(LOCAL_HERO_BANNERS_KEY, JSON.stringify(newBanners));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    try {
      await supabase
        .from('store_settings')
        .upsert({
          key: 'hero_banners',
          value: newBanners,
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.warn('Supabase upsert fallback:', err.message);
    } finally {
      setLoading(false);
    }

    return newBanners;
  };

  // Reset to default hero banners
  const resetHeroBanners = async () => {
    return await updateHeroBanners(DEFAULT_HERO_BANNERS);
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        branding, 
        updateBranding, 
        resetBranding, 
        headerSettings, 
        updateHeaderSettings, 
        resetHeaderSettings,
        heroBanners,
        updateHeroBanners,
        resetHeroBanners,
        loading 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
