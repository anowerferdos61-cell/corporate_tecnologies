import { createClient } from '@supabase/supabase-js';

// Supabase Credentials from Environment Variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createClient("https://placeholder.supabase.co", "placeholder-key");

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
    const updated = list.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not update custom product locally:', e);
  }
}

function deleteCustomProductLocally(id) {
  try {
    const list = getLocalCustomProducts();
    const remaining = list.filter(p => p.id !== id);
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

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(0, 499)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase fetch returned empty/error, using fallback data:', error);
      const fallbackList = formatFallbackProducts(fallbackProductsData);
      // Merge custom products
      const customIds = new Set(localCustom.map(c => c.id));
      const filteredFallback = fallbackList.filter(f => !customIds.has(f.id));
      return [...localCustom, ...filteredFallback];
    }

    const formattedDbProducts = data.map((item, idx) => {
      // Find matching rich product metadata from fallbackProductsData
      const meta = fallbackProductsData.find(f => f.slug === item.slug || f.title === item.title) || {};

      return {
        ...item,
        id: item.id || idx + 1,
        image_url: item.image_url ? (item.image_url.startsWith('http') || item.image_url.startsWith('/') || item.image_url.startsWith('data:') ? item.image_url : `/${item.image_url}`) : (meta.image_url || '/splashjet_images/about-splashjet.jpg'),
        regular_price: Number(item.regular_price) || Number(meta.regular_price) || 1200,
        sale_price: Number(item.sale_price) || Number(meta.sale_price) || 1100,
        discount_label: item.discount_label || meta.discount_label || calculateDiscountLabel(item.regular_price, item.sale_price),
        price_range_label: item.price_range_label || meta.price_range_label || null,
        stock_quantity: item.stock_quantity ?? meta.stock_quantity ?? 25,
        rating: item.rating || meta.rating || 4.9,
        reviews_count: item.reviews_count || meta.reviews_count || 18,
        sku: item.sku || meta.sku || `CT-${item.id || 1000 + idx}`,
        short_description: item.short_description || meta.short_description || '',
        category: meta.category || item.category || 'Printers',
        sub_category: meta.sub_category || item.sub_category || '',
        raw_categories: meta.raw_categories || item.raw_categories || [],
        specifications: meta.specifications || {},
        variations: meta.variations || [],
        gallery_images: meta.gallery_images || [item.image_url],
        seo: meta.seo || null,
        is_featured: item.is_featured ?? meta.is_featured ?? false
      };
    });

    // Merge any products from fallbackProductsData not in Supabase yet
    const dbSlugs = new Set(formattedDbProducts.map(d => d.slug));
    const missingFallback = formatFallbackProducts(
      fallbackProductsData.filter(f => !dbSlugs.has(f.slug))
    );

    // Merge any locally added custom products not yet returned from DB query
    const dbIds = new Set(formattedDbProducts.map(d => d.id));
    const extraLocal = localCustom.filter(l => !dbIds.has(l.id));

    return [...extraLocal, ...formattedDbProducts, ...missingFallback];
  } catch (err) {
    console.error('Error connecting to Supabase, falling back:', err);
    const fallbackList = formatFallbackProducts(fallbackProductsData);
    return [...localCustom, ...fallbackList];
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
    regular_price: Number(p.regular_price) || 1200,
    sale_price: Number(p.sale_price) || 1100,
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
    variations: p.variations || []
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
    category: productData.category || 'Splashjet Ink',
    regular_price: Number(productData.regular_price || productData.sale_price),
    sale_price: Number(productData.sale_price),
    stock_quantity: Number(productData.stock_quantity ?? 20),
    image_url: productData.image_url || '/splashjet_images/about-splashjet.jpg',
    is_featured: productData.is_featured ?? true
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
    id: savedProduct ? savedProduct.id : `prod_${Date.now()}`,
    created_at: savedProduct ? savedProduct.created_at : new Date().toISOString(),
    discount_label: productData.discount_label || calculateDiscountLabel(cleanPayload.regular_price, cleanPayload.sale_price),
    rating: 4.9,
    reviews_count: 1,
    sku: `CT-${Math.floor(1000 + Math.random() * 9000)}`
  };

  saveCustomProductLocally(finalProduct);
  return finalProduct;
}

/**
 * Admin: Update product on Supabase
 */
export async function updateProductOnSupabase(id, updates) {
  const cleanUpdates = {};
  if (updates.title !== undefined) cleanUpdates.title = updates.title;
  if (updates.brand !== undefined) cleanUpdates.brand = updates.brand;
  if (updates.category !== undefined) cleanUpdates.category = updates.category;
  if (updates.regular_price !== undefined) cleanUpdates.regular_price = Number(updates.regular_price);
  if (updates.sale_price !== undefined) cleanUpdates.sale_price = Number(updates.sale_price);
  if (updates.stock_quantity !== undefined) cleanUpdates.stock_quantity = Number(updates.stock_quantity);
  if (updates.image_url !== undefined) cleanUpdates.image_url = updates.image_url;
  if (updates.is_featured !== undefined) cleanUpdates.is_featured = updates.is_featured;

  try {
    await supabase
      .from('products')
      .update(cleanUpdates)
      .eq('id', id);
  } catch (e) {
    console.warn('Could not update on Supabase:', e.message);
  }

  updateCustomProductLocally(id, updates);
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

    // Attempt upload to Supabase Storage bucket 'products'
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!error && data) {
      const { data: publicData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }
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

