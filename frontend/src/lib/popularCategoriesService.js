import { supabase } from './supabaseClient';
import fallbackProductsData from '../data/fallbackProducts.json';

export const LOCAL_POPULAR_SETTINGS_KEY = 'ct_popular_categories_settings_v1';

export const DEFAULT_POPULAR_CATEGORIES_SETTINGS = {
  is_active: true,
  section_title: 'Popular This Week',
  section_subtitle: 'Explore our best-selling Inks, Photocopiers and Printers',
  explore_button_text: 'Explore All Products →',
  explore_button_link: '/shop',
  categories: [
    {
      id: 'slot_1',
      enabled: true,
      category_name: 'Splashjet Inks',
      display_title: 'Splashjet Inks',
      badge_text: 'Premium Inks',
      subtitle: '100% Authentic OEM-grade refill inks for Epson, Canon, HP & Brother',
      icon: 'Droplet',
      limit: 8
    },
    {
      id: 'slot_2',
      enabled: true,
      category_name: 'Photocopy Machine & Printers',
      display_title: 'Photocopy Machine & Printers',
      badge_text: 'Top Models',
      subtitle: 'Official Brother, Epson, HP Printers and Toshiba Digital Multifunction Copiers',
      icon: 'Printer',
      limit: 8
    },
    {
      id: 'slot_3',
      enabled: true,
      category_name: 'Heat Press & Machinery',
      display_title: 'Heat Press & Machinery',
      badge_text: 'Top Equipment',
      subtitle: 'Professional 5-in-1 Combo Heat Press, T-Shirt Flat Press & Sublimation Machinery Solutions',
      icon: 'Flame',
      limit: 8
    }
  ]
};

/**
 * Helper to deep merge saved settings with default structure
 */
function mergeSettings(saved) {
  if (!saved || typeof saved !== 'object') return DEFAULT_POPULAR_CATEGORIES_SETTINGS;

  const defaultCats = DEFAULT_POPULAR_CATEGORIES_SETTINGS.categories;
  const savedCats = Array.isArray(saved.categories) ? saved.categories : [];

  const categories = [0, 1, 2].map((idx) => {
    const def = defaultCats[idx] || {
      id: `slot_${idx + 1}`,
      enabled: true,
      category_name: 'All',
      display_title: `Category ${idx + 1}`,
      badge_text: 'Featured',
      subtitle: 'Top quality products',
      icon: 'Sparkles',
      limit: 8
    };
    const userSlot = savedCats[idx] || {};
    return {
      ...def,
      ...userSlot,
      id: def.id
    };
  });

  return {
    ...DEFAULT_POPULAR_CATEGORIES_SETTINGS,
    ...saved,
    categories
  };
}

/**
 * Fetch Popular Categories settings from Supabase store_settings or local cache
 */
export async function fetchPopularCategoriesSettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'popular_categories_settings')
      .single();

    if (!error && data?.value) {
      const merged = mergeSettings(data.value);
      localStorage.setItem(LOCAL_POPULAR_SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Supabase fetch failed for popular_categories_settings, checking local storage:', err);
  }

  try {
    const local = localStorage.getItem(LOCAL_POPULAR_SETTINGS_KEY);
    if (local) {
      return mergeSettings(JSON.parse(local));
    }
  } catch (e) {
    console.error('Error reading local popular_categories_settings:', e);
  }

  return DEFAULT_POPULAR_CATEGORIES_SETTINGS;
}

/**
 * Save Popular Categories settings to Supabase store_settings & local storage
 */
export async function savePopularCategoriesSettings(settings) {
  const merged = mergeSettings(settings);

  // 1. Save locally
  localStorage.setItem(LOCAL_POPULAR_SETTINGS_KEY, JSON.stringify(merged));

  // 2. Dispatch custom event for real-time reactivity without page reload
  window.dispatchEvent(
    new CustomEvent('ct_popular_categories_updated', {
      detail: merged
    })
  );

  // 3. Save to Supabase
  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'popular_categories_settings',
        value: merged,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) throw error;
    return { success: true, data: merged };
  } catch (err) {
    console.warn('Could not sync to Supabase store_settings:', err);
    return { success: true, data: merged, warning: 'Saved locally, remote sync failed.' };
  }
}

/**
 * Filter products for a given category slot configuration
 */
export function filterProductsForSlot(allProducts = [], slotConfig = {}) {
  const sourceList = (allProducts && allProducts.length > 0) ? allProducts : fallbackProductsData;
  const count = Number(slotConfig.limit) || 8;
  const targetCategory = (slotConfig.category_name || '').toLowerCase().trim();

  if (!targetCategory || targetCategory === 'all') {
    return sourceList.slice(0, count);
  }

  // Handle specialized hardcoded keyword cases for backward compatibility or smart matching
  if (targetCategory === 'splashjet inks' || targetCategory === 'splashjet-ink' || targetCategory === 'ink') {
    const inks = sourceList.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      if (
        title.includes('dcp-') ||
        title.includes('mfc-') ||
        (title.includes('printer') && !title.includes('ink for') && !title.includes('inkjet printer'))
      ) {
        return false;
      }
      return cat.includes('splashjet') || (cat.includes('ink') && !cat.includes('printer')) ||
             title.includes('splashjet') || title.includes('refill ink') || title.includes('bottle') || title.includes('cmybk');
    });
    return sortAndLimitProducts(inks, count);
  }

  if (targetCategory === 'photocopy machine & printers' || targetCategory === 'printers' || targetCategory === 'photocopy machines') {
    const printers = sourceList.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      if (
        title.includes('refill ink') || 
        title.includes('compatible refill') || 
        title.includes('cmybk') ||
        (cat.includes('ink') && !cat.includes('printer'))
      ) {
        return false;
      }
      return (
        cat.includes('printer') || 
        cat.includes('photocopy') || 
        title.includes('printer') || 
        title.includes('photocopier') || 
        title.includes('e-studio') ||
        title.includes('brother') ||
        title.includes('epson')
      );
    });
    return sortAndLimitProducts(printers, count);
  }

  if (targetCategory === 'heat press & machinery' || targetCategory === 'machinery' || targetCategory === 'heat press') {
    const machinery = sourceList.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const sub = (p.sub_category || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      return (
        cat.includes('machinery') ||
        cat.includes('heat press') ||
        cat.includes('equipment') ||
        sub.includes('machinery') ||
        sub.includes('heat press') ||
        title.includes('heat press') ||
        title.includes('freesub') ||
        title.includes('combo heat press') ||
        title.includes('combo package') ||
        title.includes('screen protector cutter') ||
        title.includes('cutting machine')
      );
    });
    return sortAndLimitProducts(machinery, count);
  }

  // Generic dynamic matching for any store category (e.g. "Toner & Inks", "POS & Barcode", "Sublimation Paper", etc.)
  const matched = sourceList.filter(p => {
    const cat = (p.category || '').toLowerCase().trim();
    const subCat = (p.sub_category || '').toLowerCase().trim();
    const title = (p.title || '').toLowerCase().trim();
    const rawCats = Array.isArray(p.raw_categories)
      ? p.raw_categories.map(rc => String(rc).toLowerCase().trim())
      : [];

    return (
      cat === targetCategory ||
      cat.includes(targetCategory) ||
      targetCategory.includes(cat) ||
      subCat === targetCategory ||
      subCat.includes(targetCategory) ||
      targetCategory.includes(subCat) ||
      rawCats.some(rc => rc.includes(targetCategory) || targetCategory.includes(rc)) ||
      title.includes(targetCategory)
    );
  });

  return sortAndLimitProducts(matched, count);
}

function sortAndLimitProducts(list = [], limit = 8) {
  // Prioritize newly created/customized products to top
  const sorted = [...list].sort((a, b) => {
    const aIsCustom = Boolean(a.badge_text || a.card_border !== 'default' || (a.id && String(a.id).startsWith('prod_')));
    const bIsCustom = Boolean(b.badge_text || b.card_border !== 'default' || (b.id && String(b.id).startsWith('prod_')));
    if (aIsCustom && !bIsCustom) return -1;
    if (!aIsCustom && bIsCustom) return 1;
    return 0;
  });

  return sorted.slice(0, limit);
}
