import { supabase } from './supabaseClient.js';

const LOCAL_SHIPPING_TIERS_KEY = 'ct_custom_shipping_tiers_v1';

export const DEFAULT_SHIPPING_TIERS = [
  {
    id: 'tier-standard',
    name: 'Standard (কালি, টোনার ও ছোট পার্সেল)',
    inside_dhaka: 60,
    outside_dhaka: 120,
    is_default: true,
    badge: 'Lightweight',
    categories: [
      'Inks', 'Splashjet Inks', 'Splashjet Ink', 'splashjet-ink', 
      'Toner', 'Toner & Inks', 'toner-inks', 'Toner Cartridges', 'Photocopier Toner',
      'Accessories', 'accessories-parts', 'Paper & Media', 'ID Card Solutions',
      'Ribbon', 'Cleaning Kit', 'Sublimation Paper', 'Cartridge', 'Photo Paper', 'Parts'
    ],
    product_ids: []
  },
  {
    id: 'tier-printers',
    name: 'Desktop Printers (ডেস্কটপ ও অফিস প্রিন্টার্স)',
    inside_dhaka: 150,
    outside_dhaka: 250,
    is_default: false,
    badge: 'Desktop Printer',
    categories: [
      'Printers', 'printers', 'Ink Tank Printers', 'Laser Printers', 
      'Office Equipment', 'office-equipment', 'Barcode Printers', 'Receipt Printers',
      'Scanner', 'Label Printers', 'POS Printers', 'All-in-One Printers'
    ],
    product_ids: []
  },
  {
    id: 'tier-machinery',
    name: 'Heavy Machinery & Photocopier (ভারী মেশিনারি ও ফটোকপিয়ার)',
    inside_dhaka: 300,
    outside_dhaka: 500,
    is_default: false,
    badge: 'Heavy Machinery',
    categories: [
      'Photocopiers', 'Photocopy Machine', 'Photocopy Machines', 'photocopy-machine', 
      'photocopy', 'photocopier', 'Machinery', 'machinery', 'Heavy Duty Machines', 
      'Heat Press Machine', 'heat-press-machine', 'DTF Combo', 'dtf-combo', 
      'Laminating & Binding Machines', 'Large Format Printers'
    ],
    product_ids: []
  },
  {
    id: 'tier-dtf-transport',
    name: 'DTF & Industrial Transport (ইন্ডাস্ট্রিয়াল প্রিন্টার ও বিশেষ ট্রান্সপোর্ট)',
    inside_dhaka: 500,
    outside_dhaka: 1000,
    is_default: false,
    badge: 'Special Transport',
    categories: [
      'DTF Printers', 'dtf-printers', 'Industrial Printers', 'UV Printers', 'Large Format DTF'
    ],
    product_ids: []
  }
];

/**
 * Normalization helper for strings (removes hyphens, plurals, whitespace)
 */
export function normalizeCategoryText(str = '') {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Get all cached shipping tiers from localStorage or defaults
 */
export function getCachedShippingTiers() {
  try {
    const saved = localStorage.getItem(LOCAL_SHIPPING_TIERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse shipping tiers from storage:', e);
  }
  return DEFAULT_SHIPPING_TIERS;
}

/**
 * Fetch shipping tiers from Supabase store_settings
 */
export async function fetchShippingTiers() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping_tiers_v1')
      .single();

    if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
      localStorage.setItem(LOCAL_SHIPPING_TIERS_KEY, JSON.stringify(data.value));
      return data.value;
    }
  } catch (err) {
    console.warn('Notice: Remote shipping tiers fetch fallback:', err.message);
  }
  return getCachedShippingTiers();
}

/**
 * Save shipping tiers to LocalStorage & Supabase
 */
export async function saveShippingTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return DEFAULT_SHIPPING_TIERS;

  // 1. Save locally
  try {
    localStorage.setItem(LOCAL_SHIPPING_TIERS_KEY, JSON.stringify(tiers));
    window.dispatchEvent(new CustomEvent('ct_shipping_tiers_updated', { detail: tiers }));
  } catch (e) {
    console.warn('LocalStorage save error for shipping tiers:', e);
  }

  // 2. Sync to Supabase
  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'shipping_tiers_v1',
        value: tiers,
        updated_at: new Date().toISOString()
      });
    if (error) {
      console.error('Supabase shipping tiers save error:', error);
    }
  } catch (err) {
    console.warn('Supabase shipping tiers sync error:', err.message);
  }

  return tiers;
}

/**
 * Create or Update a Single Shipping Tier
 */
export async function saveShippingTier(tierData, existingId = null) {
  const currentTiers = getCachedShippingTiers();
  const id = existingId || tierData.id || `tier-${Date.now()}`;
  const name = tierData.name?.trim();
  if (!name) throw new Error('Tier name is required');

  const newTier = {
    id,
    name,
    inside_dhaka: Number(tierData.inside_dhaka ?? 60),
    outside_dhaka: Number(tierData.outside_dhaka ?? 120),
    is_default: Boolean(tierData.is_default),
    badge: tierData.badge?.trim() || '',
    categories: Array.isArray(tierData.categories) ? tierData.categories : [],
    product_ids: Array.isArray(tierData.product_ids) ? tierData.product_ids : []
  };

  let updatedTiers = [...currentTiers];
  const existingIdx = updatedTiers.findIndex(t => t.id === id);

  if (existingIdx >= 0) {
    updatedTiers[existingIdx] = { ...updatedTiers[existingIdx], ...newTier };
  } else {
    updatedTiers.push(newTier);
  }

  // If this tier is marked as default, unset other defaults
  if (newTier.is_default) {
    updatedTiers = updatedTiers.map(t => ({
      ...t,
      is_default: t.id === id
    }));
  }

  return await saveShippingTiers(updatedTiers);
}

/**
 * Delete a Shipping Tier
 */
export async function deleteShippingTier(tierId) {
  const currentTiers = getCachedShippingTiers();
  if (currentTiers.length <= 1) {
    throw new Error('At least one default shipping tier must remain.');
  }

  const updatedTiers = currentTiers.filter(t => t.id !== tierId);
  // Ensure at least one tier is default
  if (!updatedTiers.some(t => t.is_default)) {
    updatedTiers[0].is_default = true;
  }

  return await saveShippingTiers(updatedTiers);
}

/**
 * Calculate the exact shipping charge for a cart of items
 * Rule: Highest applicable tier for Inside / Outside Dhaka
 */
export function calculateCartShipping(cartItems = [], deliveryArea = 'inside_dhaka', customTiers = null) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      fee: 0,
      tierName: 'Free',
      appliedTier: null,
      isFreeDelivery: true
    };
  }

  const rawTiers = customTiers || getCachedShippingTiers();
  // Ensure we have valid tiers array
  const tiers = Array.isArray(rawTiers) && rawTiers.length > 0 ? rawTiers : DEFAULT_SHIPPING_TIERS;
  const defaultTier = tiers.find(t => t.is_default) || tiers[0] || DEFAULT_SHIPPING_TIERS[0];

  const isInsideDhaka = deliveryArea === 'inside_dhaka';

  let highestFee = 0;
  let highestTier = defaultTier;
  let allFree = true;

  cartItems.forEach(item => {
    const product = item.product || item;
    
    // Check if product has explicit free delivery flag
    if (product.is_free_delivery) {
      return;
    }
    allFree = false;

    // 1. Direct assigned shipping_tier_id on product
    let matchedTier = null;
    if (product.shipping_tier_id) {
      matchedTier = tiers.find(t => t.id === product.shipping_tier_id);
    }

    // 2. Specific product ID matching inside tier product_ids
    if (!matchedTier) {
      const pIdStr = String(product.id || '');
      const pSlug = String(product.slug || '');
      matchedTier = tiers.find(t => 
        (t.product_ids || []).some(id => String(id) === pIdStr || String(id) === pSlug)
      );
    }

    // 3. Category & Subcategory matching inside tier categories
    const pCat = String(product.category || '').toLowerCase().trim();
    const pSub = String(product.sub_category || '').toLowerCase().trim();
    const pTitle = String(product.title || '').toLowerCase().trim();
    const normCat = normalizeCategoryText(pCat);
    const normSub = normalizeCategoryText(pSub);
    const normTitle = normalizeCategoryText(pTitle);

    if (!matchedTier) {
      matchedTier = tiers.find(t => 
        (t.categories || []).some(c => {
          const normC = normalizeCategoryText(c);
          if (!normC) return false;
          return (
            normCat === normC ||
            normSub === normC ||
            normCat.includes(normC) ||
            normC.includes(normCat) ||
            (normSub && (normSub.includes(normC) || normC.includes(normSub))) ||
            (normTitle && normTitle.includes(normC) && normC.length >= 4)
          );
        })
      );
    }

    // 4. Intelligent keyword-based matcher for known hardware types
    if (!matchedTier) {
      // Photocopiers & Heavy Machinery
      if (
        normCat.includes('photocop') || 
        normTitle.includes('photocop') || 
        normTitle.includes('estudio') || 
        normTitle.includes('heatpress') || 
        normTitle.includes('laminat') ||
        normCat.includes('machin')
      ) {
        matchedTier = tiers.find(t => 
          t.id.includes('machinery') || 
          t.id.includes('heavy') || 
          (t.name && (t.name.toLowerCase().includes('machinery') || t.name.toLowerCase().includes('photocopier') || t.name.includes('ফটোকপিয়ার')))
        );
      }
      // DTF & Industrial Printers
      else if (
        normCat.includes('dtf') || 
        normTitle.includes('dtf') || 
        normCat.includes('industrial') || 
        normTitle.includes('largeformat')
      ) {
        matchedTier = tiers.find(t => 
          t.id.includes('dtf') || 
          t.id.includes('transport') || 
          (t.name && (t.name.toLowerCase().includes('dtf') || t.name.includes('ট্রান্সপোর্ট')))
        );
      }
      // Desktop Printers
      else if (
        normCat.includes('printer') || 
        normTitle.includes('printer') || 
        normTitle.includes('ecotank')
      ) {
        matchedTier = tiers.find(t => 
          t.id.includes('printer') || 
          (t.name && (t.name.toLowerCase().includes('printer') || t.name.includes('প্রিন্টার')))
        );
      }
    }

    // 5. Fallback to default tier
    const effectiveTier = matchedTier || defaultTier;
    const currentItemFee = isInsideDhaka ? Number(effectiveTier.inside_dhaka || 60) : Number(effectiveTier.outside_dhaka || 120);

    if (currentItemFee > highestFee) {
      highestFee = currentItemFee;
      highestTier = effectiveTier;
    }
  });

  if (allFree) {
    return {
      fee: 0,
      tierName: 'Free Delivery',
      appliedTier: null,
      isFreeDelivery: true
    };
  }

  if (highestFee === 0) {
    highestFee = isInsideDhaka ? Number(defaultTier.inside_dhaka || 60) : Number(defaultTier.outside_dhaka || 120);
    highestTier = defaultTier;
  }

  return {
    fee: highestFee,
    tierName: highestTier.name,
    badge: highestTier.badge || '',
    appliedTier: highestTier,
    isFreeDelivery: false
  };
}
