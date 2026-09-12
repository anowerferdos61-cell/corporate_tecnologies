import { supabase } from './supabaseClient';

const LOCAL_FLASH_KEY = 'corp_tech_flash_sale_settings';

// Default Flash Sale Settings (e.g. 48 hours in the future)
export function getDefaultFlashSaleSettings() {
  const future = new Date(Date.now() + 48 * 60 * 60 * 1000);
  return {
    is_active: true,
    title: 'সীমিত সময়ের ফ্ল্যাশ ডিল',
    subtitle: 'প্রিন্টার ও Splashjet কালিতে আকর্ষণীয় ছাড়!',
    discount_banner: 'UP TO 35% OFF',
    end_time: future.toISOString(),
    featured_categories: ['Printers', 'Splashjet Inks']
  };
}

/**
 * Fetch Flash Sale Settings from Supabase store_settings or local storage
 */
export async function fetchFlashSaleSettings() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'flash_sale_settings')
      .maybeSingle();

    if (!error && data && data.value) {
      saveLocalFlashSettings(data.value);
      return data.value;
    }
  } catch (err) {
    console.warn('Supabase flash sale query notice (using local fallback):', err.message);
  }

  // Local fallback
  return getLocalFlashSettings();
}

/**
 * Update Flash Sale Settings in Supabase and local storage
 */
export async function updateFlashSaleSettings(updates) {
  const current = await fetchFlashSaleSettings();
  const merged = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('store_settings')
      .upsert({
        key: 'flash_sale_settings',
        value: merged,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) console.warn('Supabase flash update notice:', error.message);
  } catch (e) {
    console.warn('Could not update Supabase store_settings:', e);
  }

  saveLocalFlashSettings(merged);
  window.dispatchEvent(new CustomEvent('ct_flash_sale_updated', { detail: merged }));
  return merged;
}

function getLocalFlashSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_FLASH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults = getDefaultFlashSaleSettings();
  saveLocalFlashSettings(defaults);
  return defaults;
}

function saveLocalFlashSettings(settings) {
  try {
    localStorage.setItem(LOCAL_FLASH_KEY, JSON.stringify(settings));
  } catch {}
}
