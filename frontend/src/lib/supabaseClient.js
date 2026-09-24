import { createClient } from '@supabase/supabase-js';

// Supabase Credentials from Environment Variables with project fallback
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vhilsjzpmbcirijhhouc.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoaWxzanpwbWJjaXJpamhob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU3MzkyNSwiZXhwIjoyMTA0MTQ5OTI1fQ.dLD3rSdQmHoyf5NIr4l4793jo1kmzx6yrmC5CShsfG8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallback products data (self-contained within frontend)
import fallbackProductsData from '../data/fallbackProducts.json';

/**
 * Fetch all products from Supabase with fallback to local JSON
 */
const LOCAL_PRODUCTS_KEY = 'corporate_tech_custom_products_v1';

function getLocalCustomProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomProductLocally(product) {
  try {
    const list = getLocalCustomProducts();
    const existingIndex = list.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...product };
    } else {
      list.unshift(product);
    }
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not cache product locally:', e);
  }
}

function updateCustomProductLocally(id, updates) {
  try {
    const list = getLocalCustomProducts();
    const existingIndex = list.findIndex(p => String(p.id) === String(id) || (updates.slug && p.slug === updates.slug));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...updates };
    } else {
      // Find fallback base if editing an initial product
      const baseFallback = fallbackProductsData.find(f => String(f.id) === String(id) || (updates.slug && f.slug === updates.slug)) || {};
      list.unshift({ ...baseFallback, id, ...updates });
    }
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not update custom product locally:', e);
  }
}

function deleteCustomProductLocally(id) {
  try {
    const list = getLocalCustomProducts();
    const remaining = list.filter(p => String(p.id) !== String(id));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(remaining));
  } catch (e) {
    console.warn('Could not delete custom product locally:', e);
  }
}

/**
 * Fetch all products from Supabase with fallback to local JSON + custom products
 */
export async function getProducts() {
  const localCustom = getLocalCustomProducts();
  const localCustomMap = new Map();
  localCustom.forEach(p => {
    if (p.id) localCustomMap.set(String(p.id), p);
    if (p.slug) localCustomMap.set(p.slug, p);
  });

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(0, 499)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallbackList = formatFallbackProducts(fallbackProductsData);
      // Merge custom edits over fallback
      const mergedFallback = fallbackList.map(item => {
        const customOverride = localCustomMap.get(String(item.id)) || localCustomMap.get(item.slug);
        return customOverride ? { ...item, ...customOverride } : item;
      });

      // Add any brand-new locally added items
      const existingIds = new Set(mergedFallback.map(f => String(f.id)));
      const brandNew = localCustom.filter(l => !existingIds.has(String(l.id)));
      return [...brandNew, ...mergedFallback];
    }

    const formattedDbProducts = data.map((item, idx) => {
      const meta = fallbackProductsData.find(f => f.slug === item.slug || f.title === item.title) || {};
      const base = {
        ...item,
        id: item.id || idx + 1,
        image_url: item.image_url ? (item.image_url.startsWith('http') || item.image_url.startsWith('/') || item.image_url.startsWith('data:') ? item.image_url : `/${item.image_url}`) : (meta.image_url || '/splashjet_images/about-splashjet.jpg'),
        regular_price: Number(item.regular_price) || Number(meta.regular_price) || 0,
        sale_price: Number(item.sale_price) || Number(meta.sale_price) || 0,
        discount_label: item.discount_label || meta.discount_label || calculateDiscountLabel(item.regular_price, item.sale_price),
        price_range_label: item.price_range_label || meta.price_range_label || null,
        stock_quantity: item.stock_quantity ?? meta.stock_quantity ?? 25,
        rating: item.rating || meta.rating || 4.9,
        reviews_count: item.reviews_count || meta.reviews_count || 18,
        sku: item.sku || meta.sku || `CT-${item.id || 1000 + idx}`,
        short_description: item.short_description || meta.short_description || '',
        category: item.category || meta.category || 'Printers',
        sub_category: item.sub_category || meta.sub_category || '',
        raw_categories: item.raw_categories || meta.raw_categories || [],
        specifications: item.specifications || meta.specifications || {},
        variations: item.variations || meta.variations || [],
        gallery_images: item.gallery_images || meta.gallery_images || [item.image_url],
        seo: meta.seo || null,
        is_featured: item.is_featured ?? meta.is_featured ?? false,
        call_for_price: Boolean(item.call_for_price || (item.sale_price === 0 && item.regular_price === 0))
      };

      // Apply any local admin updates over DB product
      const customOverride = localCustomMap.get(String(base.id)) || localCustomMap.get(base.slug);
      return customOverride ? { ...base, ...customOverride } : base;
    });

    // Merge any products from fallbackProductsData not in Supabase yet
    const dbSlugs = new Set(formattedDbProducts.map(d => d.slug));
    const missingFallback = formatFallbackProducts(
      fallbackProductsData.filter(f => !dbSlugs.has(f.slug))
    ).map(item => {
      const customOverride = localCustomMap.get(String(item.id)) || localCustomMap.get(item.slug);
      return customOverride ? { ...item, ...customOverride } : item;
    });

    const existingIds = new Set([...formattedDbProducts.map(d => String(d.id)), ...missingFallback.map(f => String(f.id))]);
    const brandNew = localCustom.filter(l => !existingIds.has(String(l.id)));

    return [...brandNew, ...formattedDbProducts, ...missingFallback];
  } catch (err) {
    console.error('Error connecting to Supabase, falling back:', err);
    const fallbackList = formatFallbackProducts(fallbackProductsData).map(item => {
      const customOverride = localCustomMap.get(String(item.id)) || localCustomMap.get(item.slug);
      return customOverride ? { ...item, ...customOverride } : item;
    });
    const existingIds = new Set(fallbackList.map(f => String(f.id)));
    const brandNew = localCustom.filter(l => !existingIds.has(String(l.id)));
    return [...brandNew, ...fallbackList];
  }
}

function calculateDiscountLabel(reg, sale) {
  const r = Number(reg);
  const s = Number(sale);
  if (r > s && r > 0) {
    const pct = Math.round(((r - s) / r) * 100);
    return `-${pct}%`;
  }
  return 'Sale!';
}

function formatFallbackProducts(items) {
  return items.map((p, idx) => ({
    ...p,
    id: p.id || idx + 1,
    title: p.title,
    slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: p.brand || 'Corporate Tech',
    category: p.category || 'Printers',
    sub_category: p.sub_category || '',
    raw_categories: p.raw_categories || [],
    regular_price: Number(p.regular_price) || 0,
    sale_price: Number(p.sale_price) || 0,
    discount_label: p.discount_label || calculateDiscountLabel(p.regular_price, p.sale_price),
    price_range_label: p.price_range_label || null,
    stock_quantity: p.stock_quantity ?? 25,
    image_url: p.image_url || (p.local_image ? `/${p.local_image}` : '/splashjet_images/about-splashjet.jpg'),
    gallery_images: p.gallery_images || [p.image_url],
    is_featured: p.is_featured ?? false,
    rating: p.rating || 4.9,
    reviews_count: p.reviews_count || 20,
    sku: p.sku || `CT-${1000 + idx}`,
    short_description: p.short_description || '',
    description: p.description || '',
    specifications: p.specifications || {},
    variations: p.variations || [],
    call_for_price: Boolean(p.call_for_price || (p.sale_price === 0 && p.regular_price === 0)),
    key_features: p.key_features || []
  }));
}

/**
 * Admin: Add product to Supabase
 */
export async function createProductOnSupabase(productData) {
  const cleanPayload = {
    title: productData.title,
    slug: productData.slug || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    brand: productData.brand || 'Corporate Tech',
    category: productData.category || 'Printers',
    sub_category: productData.sub_category || '',
    regular_price: Number(productData.regular_price || productData.sale_price || 0),
    sale_price: Number(productData.sale_price || 0),
    stock_quantity: Number(productData.stock_quantity ?? 20),
    sku: productData.sku || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
    image_url: productData.image_url || '/splashjet_images/about-splashjet.jpg',
    gallery_images: Array.isArray(productData.gallery_images) ? productData.gallery_images : (productData.image_url ? [productData.image_url] : []),
    short_description: productData.short_description || '',
    description: productData.description || '',
    specifications: typeof productData.specifications === 'object' ? productData.specifications : {},
    variations: Array.isArray(productData.variations) ? productData.variations : [],
    key_features: Array.isArray(productData.key_features) ? productData.key_features : [],
    is_featured: productData.is_featured ?? true,
    rating: productData.rating || 4.9,
    reviews_count: productData.reviews_count || 1,
    call_for_price: Boolean(productData.call_for_price),
    price_range_label: productData.price_range_label || '',
    badge_text: productData.badge_text || '',
    badge_color: productData.badge_color || 'red',
    badge_position: productData.badge_position || 'left',
    badge_mode: productData.badge_mode || 'custom',
    card_border: productData.card_border || 'default',
    card_btn_text: productData.card_btn_text || 'View Details',
    show_brand_badge: Boolean(productData.show_brand_badge ?? true),
    show_rating: Boolean(productData.show_rating ?? false),
    rating_score: productData.rating_score || '4.9',
    show_stock_badge: Boolean(productData.show_stock_badge ?? false),
    warranty_badge: productData.warranty_badge || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
  };

  let savedProduct = null;

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([cleanPayload])
      .select();
    
    if (!error && data && data.length > 0) {
      savedProduct = data[0];
    } else if (error) {
      console.warn('Supabase insert notice:', error.message);
    }
  } catch (e) {
    console.warn('Could not insert to Supabase, fallback:', e.message);
  }

  const finalProduct = {
    ...cleanPayload,
    ...productData,
    id: savedProduct ? savedProduct.id : `prod_${Date.now()}`,
    created_at: savedProduct ? savedProduct.created_at : new Date().toISOString(),
    discount_label: productData.discount_label || calculateDiscountLabel(cleanPayload.regular_price, cleanPayload.sale_price),
    rating: productData.rating || 4.9,
    reviews_count: productData.reviews_count || 1,
    sku: cleanPayload.sku,
    sub_category: cleanPayload.sub_category,
    short_description: cleanPayload.short_description,
    description: cleanPayload.description,
    specifications: cleanPayload.specifications,
    variations: cleanPayload.variations,
    key_features: cleanPayload.key_features,
    gallery_images: cleanPayload.gallery_images,
    call_for_price: Boolean(productData.call_for_price),
    price_range_label: productData.price_range_label || '',
    badge_text: productData.badge_text || '',
    badge_color: productData.badge_color || 'red',
    badge_position: productData.badge_position || 'left',
    badge_mode: productData.badge_mode || 'custom',
    card_border: productData.card_border || 'default',
    card_btn_text: productData.card_btn_text || 'View Details',
    show_brand_badge: Boolean(productData.show_brand_badge ?? true),
    show_rating: Boolean(productData.show_rating ?? false),
    rating_score: productData.rating_score || '4.9',
    show_stock_badge: Boolean(productData.show_stock_badge ?? false),
    stock_status: productData.stock_status || (cleanPayload.stock_quantity > 0 ? 'instock' : 'outofstock'),
    warranty_badge: productData.warranty_badge || '১ বছরের অফিসিয়াল সার্ভিস ওয়ারেন্টি'
  };

  saveCustomProductLocally(finalProduct);
  window.dispatchEvent(new CustomEvent('ct_products_updated', { detail: finalProduct }));
  return finalProduct;
}

/**
 * Admin: Update product on Supabase
 */
export async function updateProductOnSupabase(id, updates) {
  const cleanUpdates = {};
  if (updates.title !== undefined) cleanUpdates.title = updates.title;
  if (updates.slug !== undefined) cleanUpdates.slug = updates.slug;
  if (updates.brand !== undefined) cleanUpdates.brand = updates.brand;
  if (updates.category !== undefined) cleanUpdates.category = updates.category;
  if (updates.sub_category !== undefined) cleanUpdates.sub_category = updates.sub_category;
  if (updates.regular_price !== undefined) cleanUpdates.regular_price = Number(updates.regular_price);
  if (updates.sale_price !== undefined) cleanUpdates.sale_price = Number(updates.sale_price);
  if (updates.stock_quantity !== undefined) cleanUpdates.stock_quantity = Number(updates.stock_quantity);
  if (updates.sku !== undefined) cleanUpdates.sku = updates.sku;
  if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;
  if (updates.gallery_images !== undefined) cleanUpdates.gallery_images = updates.gallery_images;
  if (updates.short_description !== undefined) cleanUpdates.short_description = updates.short_description;
  if (updates.description !== undefined) cleanUpdates.description = updates.description;
  if (updates.specifications !== undefined) cleanUpdates.specifications = updates.specifications;
  if (updates.variations !== undefined) cleanUpdates.variations = Array.isArray(updates.variations) ? updates.variations : [];
  if (updates.key_features !== undefined) cleanUpdates.key_features = updates.key_features;
  if (updates.is_featured !== undefined) cleanUpdates.is_featured = updates.is_featured;
  if (updates.call_for_price !== undefined) cleanUpdates.call_for_price = Boolean(updates.call_for_price);
  if (updates.discount_label !== undefined) cleanUpdates.discount_label = updates.discount_label;
  if (updates.price_range_label !== undefined) cleanUpdates.price_range_label = updates.price_range_label;
  if (updates.badge_text !== undefined) cleanUpdates.badge_text = updates.badge_text;
  if (updates.badge_color !== undefined) cleanUpdates.badge_color = updates.badge_color;
  if (updates.badge_position !== undefined) cleanUpdates.badge_position = updates.badge_position;
  if (updates.badge_mode !== undefined) cleanUpdates.badge_mode = updates.badge_mode;
  if (updates.card_border !== undefined) cleanUpdates.card_border = updates.card_border;
  if (updates.card_btn_text !== undefined) cleanUpdates.card_btn_text = updates.card_btn_text;
  if (updates.show_brand_badge !== undefined) cleanUpdates.show_brand_badge = updates.show_brand_badge;
  if (updates.show_rating !== undefined) cleanUpdates.show_rating = updates.show_rating;
  if (updates.rating_score !== undefined) cleanUpdates.rating_score = updates.rating_score;
  if (updates.show_stock_badge !== undefined) cleanUpdates.show_stock_badge = updates.show_stock_badge;
  if (updates.warranty_badge !== undefined) cleanUpdates.warranty_badge = updates.warranty_badge;

  try {
    await supabase
      .from('products')
      .update(cleanUpdates)
      .eq('id', id);
  } catch (e) {
    console.warn('Could not update on Supabase:', e.message);
  }

  updateCustomProductLocally(id, updates);
  window.dispatchEvent(new CustomEvent('ct_products_updated', { detail: { id, updates } }));
  return { ...updates, id };
}

/**
 * Admin: Delete product from Supabase
 */
export async function deleteProductFromSupabase(id) {
  try {
    await supabase
      .from('products')
      .delete()
      .eq('id', id);
  } catch (e) {
    console.warn('Could not delete on Supabase:', e.message);
  }
  
  deleteCustomProductLocally(id);
  return true;
}

/**
 * Admin: Upload product image to Supabase Storage or convert to DataURL
 */
export async function uploadProductImage(file) {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `product-uploads/${cleanFileName}`;

    // Attempt upload to Supabase Storage bucket ('product-images' or 'products')
    const bucketsToTry = ['product-images', 'products'];
    for (const b of bucketsToTry) {
      try {
        const { data, error } = await supabase.storage
          .from(b)
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from(b)
            .getPublicUrl(filePath);

          if (publicData?.publicUrl) {
            return publicData.publicUrl;
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('Supabase storage upload error, falling back to DataURL:', err);
  }

  // Fallback: Read as base64 DataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

