import { supabase } from './supabaseClient';

const STORAGE_KEY = 'corporate_tech_analytics_v1';

// Seed baseline data so initial dashboard has meaningful analytics on launch
const SEED_DATA = {
  events: [
    { type: 'view', productId: 1, title: 'DTF Printing Ink - CMYK & White 1000ml', category: 'DTF Inks', timestamp: Date.now() - 3600000 * 5 },
    { type: 'view', productId: 1, title: 'DTF Printing Ink - CMYK & White 1000ml', category: 'DTF Inks', timestamp: Date.now() - 3600000 * 4 },
    { type: 'cart', productId: 1, title: 'DTF Printing Ink - CMYK & White 1000ml', category: 'DTF Inks', timestamp: Date.now() - 3600000 * 3 },
    { type: 'view', productId: 2, title: 'Sublimation Ink Pro 1 Liter for Heat Transfer', category: 'Sublimation Inks', timestamp: Date.now() - 3600000 * 2 },
    { type: 'cart', productId: 2, title: 'Sublimation Ink Pro 1 Liter for Heat Transfer', category: 'Sublimation Inks', timestamp: Date.now() - 3600000 * 1 },
    { type: 'view', productId: 3, title: 'Canon imageRUNNER 2206 Photocopier', category: 'Photocopy Machine', timestamp: Date.now() - 3600000 * 6 },
    { type: 'view', productId: 4, title: 'Epson EcoTank L8050 6-Color Photo Printer', category: 'Printers', timestamp: Date.now() - 3600000 * 8 },
    { type: 'cart', productId: 4, title: 'Epson EcoTank L8050 6-Color Photo Printer', category: 'Printers', timestamp: Date.now() - 3600000 * 2 }
  ],
  productStats: {
    1: { views: 42, carts: 14 },
    2: { views: 36, carts: 9 },
    3: { views: 58, carts: 6 }, // High views, low cart (Marketing alert: good for discount promotion)
    4: { views: 47, carts: 18 }, // High conversion
    5: { views: 24, carts: 7 }
  }
};

/**
 * Load stored analytics data
 */
function loadAnalyticsStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read analytics store:', e);
    return SEED_DATA;
  }
}

/**
 * Save analytics data
 */
function saveAnalyticsStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save analytics store:', e);
  }
}

/**
 * Track a product view / click
 */
export async function trackProductView(product) {
  if (!product || !product.id) return;
  const store = loadAnalyticsStore();
  
  // Record event
  const event = {
    type: 'view',
    productId: product.id,
    title: product.title,
    category: product.category || 'General',
    timestamp: Date.now()
  };
  
  store.events.unshift(event);
  if (store.events.length > 500) store.events = store.events.slice(0, 500);

  // Update aggregated product stats
  if (!store.productStats[product.id]) {
    store.productStats[product.id] = { views: 0, carts: 0 };
  }
  store.productStats[product.id].views += 1;
  saveAnalyticsStore(store);

  // Try optional Supabase event sync (non-blocking)
  try {
    supabase.from('analytics_events').insert([{
      event_type: 'product_view',
      product_id: product.id,
      product_title: product.title,
      created_at: new Date().toISOString()
    }]).then(() => {}).catch(() => {});
  } catch (_) {}
}

/**
 * Track an Add to Cart event
 */
export async function trackAddToCart(product, quantity = 1) {
  if (!product || !product.id) return;
  const store = loadAnalyticsStore();

  const event = {
    type: 'cart',
    productId: product.id,
    title: product.title,
    category: product.category || 'General',
    quantity,
    timestamp: Date.now()
  };

  store.events.unshift(event);
  if (store.events.length > 500) store.events = store.events.slice(0, 500);

  if (!store.productStats[product.id]) {
    store.productStats[product.id] = { views: 1, carts: 0 };
  }
  store.productStats[product.id].carts += quantity;
  saveAnalyticsStore(store);

  // Try optional Supabase event sync (non-blocking)
  try {
    supabase.from('analytics_events').insert([{
      event_type: 'add_to_cart',
      product_id: product.id,
      product_title: product.title,
      quantity,
      created_at: new Date().toISOString()
    }]).then(() => {}).catch(() => {});
  } catch (_) {}
}

/**
 * Compute marketing analytics summary
 */
export function getAnalyticsSummary(allProducts = []) {
  const store = loadAnalyticsStore();
  const stats = store.productStats || {};
  const productsMap = new Map();
  allProducts.forEach(p => productsMap.set(p.id, p));

  let totalViews = 0;
  let totalCarts = 0;
  const categoryClicks = {};

  const productRanking = Object.keys(stats).map(idStr => {
    const id = isNaN(Number(idStr)) ? idStr : Number(idStr);
    const itemStat = stats[idStr] || { views: 0, carts: 0 };
    const prod = productsMap.get(id) || {
      id,
      title: `Product #${id}`,
      category: 'General',
      sale_price: 1200,
      image_url: '/splashjet_images/about-splashjet.jpg'
    };

    totalViews += itemStat.views;
    totalCarts += itemStat.carts;

    const cat = prod.category || 'General';
    categoryClicks[cat] = (categoryClicks[cat] || 0) + itemStat.views;

    const conversionRate = itemStat.views > 0 ? ((itemStat.carts / itemStat.views) * 100).toFixed(1) : 0;

    return {
      id,
      title: prod.title,
      category: prod.category,
      sale_price: prod.sale_price,
      stock_quantity: prod.stock_quantity ?? 10,
      image_url: prod.image_url,
      views: itemStat.views,
      carts: itemStat.carts,
      conversionRate: Number(conversionRate)
    };
  });

  // Top Most Clicked / Viewed
  const topViewed = [...productRanking]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Top Most Added to Cart
  const topCart = [...productRanking]
    .sort((a, b) => b.carts - a.carts)
    .slice(0, 6);

  const overallConversion = totalViews > 0 ? ((totalCarts / totalViews) * 100).toFixed(1) : 0;

  // Generate Actionable Marketing Recommendations
  const recommendations = [];

  // Finding high view, low cart items
  const highInterestLowConversion = productRanking.find(p => p.views >= 20 && p.conversionRate < 15);
  if (highInterestLowConversion) {
    recommendations.push({
      type: 'discount_opportunity',
      badge: 'ডিসকাউন্ট সুপারিশ',
      color: 'amber',
      text: `"${highInterestLowConversion.title.slice(0, 32)}..." পণ্যটিতে প্রচুর ভিজিটর ক্লিক করছেন (${highInterestLowConversion.views} ভিউ), কিন্তু কার্ট হচ্ছে কম (${highInterestLowConversion.carts})। ৫%-১০% ছাড় বা ফ্রি ডেলিভারি অফার দিলে সেলস কয়েকগুণ বাড়তে পারে!`
    });
  }

  // Finding top converter for Facebook ads
  const topPerformer = productRanking.find(p => p.carts >= 8 && p.conversionRate > 25);
  if (topPerformer) {
    recommendations.push({
      type: 'marketing_campaign',
      badge: 'ফেসবুক অ্যাড সাজেস্ট',
      color: 'emerald',
      text: `"${topPerformer.title.slice(0, 32)}..." এর কনভার্সন রেট অসাধারণ (${topPerformer.conversionRate}%)! এই প্রোডাক্টে ফেসবুক বা গুগল অ্যাডের বাজেট বাড়ালে সবচেয়ে বেশি রিটার্ন (ROAS) পাওয়া যাবে।`
    });
  }

  // Stock warning
  const lowStockHero = productRanking.find(p => p.carts >= 5 && p.stock_quantity <= 5);
  if (lowStockHero) {
    recommendations.push({
      type: 'stock_alert',
      badge: 'রিস্টক সতর্কতা',
      color: 'rose',
      text: `"${lowStockHero.title.slice(0, 30)}..." গ্রাহকরা খুব দ্রুত কার্টে নিচ্ছেন, তবে স্টক মাত্র ${lowStockHero.stock_quantity} টি বাকি। দ্রুত ইনভেন্টরি রিফিল করুন।`
    });
  }

  // Fallback tip if recommendations empty
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'general',
      badge: 'মার্কেটিং টিপ',
      color: 'sky',
      text: 'যেসব ক্যাটাগরিতে ভিজিটরদের আগ্রহ বেশি (যেমন Splashjet ও DTF), সেগুলোর ব্যানার হোমপেজের শুরুতে রাখলে কনভার্সন রেট বাড়ে।'
    });
  }

  return {
    totalViews,
    totalCarts,
    overallConversion: Number(overallConversion),
    topViewed,
    topCart,
    categoryClicks,
    recommendations,
    recentEvents: store.events.slice(0, 10)
  };
}

/**
 * Reset analytics data (for demo or testing)
 */
export function resetAnalytics() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
  return getAnalyticsSummary();
}
