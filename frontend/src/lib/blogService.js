import { supabase } from './supabaseClient';

const LOCAL_BLOGS_STORAGE_KEY = 'corporate_tech_custom_blogs_v1';

export const DEFAULT_BLOG_CATEGORIES = [
  'Printer Maintenance',
  'Ink Guide',
  'Photocopiers',
  'Textile & Machinery',
  'POS & Barcode',
  'Tech Tips',
  'Product Reviews'
];

export const INITIAL_FALLBACK_BLOGS = [
  {
    id: 'blog-1-printer-head-care',
    title: '5 Essential Tips to Keep Your Printer Head Clean & Long-Lasting',
    slug: '5-essential-tips-printer-head-clean',
    category: 'Printer Maintenance',
    author: 'Technical Support Team',
    read_time: '4 min read',
    created_at: '2026-09-08T10:00:00Z',
    image_url: '/splashjet_images/about-splashjet.jpg',
    summary: 'Prevent printhead clogging, nozzle blockages, and streaky prints with simple daily care tips that double your printhead lifespan.',
    content: `## Why Printer Head Maintenance Matters

Printheads are the most critical and delicate component in any inkjet or EcoTank printer. A clogged printhead results in missing lines, washed-out colors, and frequent head cleaning cycles that waste expensive ink.

### 1. Run Regular Test Prints
If you don't use your printer daily, ink inside microscopic nozzle chambers can dry up. Print at least **1 full-color test page every 3-4 days** to keep liquid ink flowing smoothly.

### 2. Never Force Sharp Tools into Nozzles
Cleaning nozzles with pins, needles, or unapproved alcohol wipes can permanently scratch piezoelectric or thermal crystal elements. Always use official automated head cleaning utilities or specialized non-corrosive flushing fluids.

> **Pro Tip:** If automated head cleaning fails twice consecutively, let the printer rest for 4-6 hours. This allows trapped microscopic air bubbles to escape naturally before running a third cleaning.

### 3. Use 100% Authentic Low-Sediment Inks
Cheap duplicate inks contain coarse pigment particles and unbalanced viscosity that deposit stubborn sludge inside printhead micro-filters. Always use certified OEM or high-grade **Splashjet Digital Inks**.

### 4. Turn Off the Printer Properly
Always turn off the printer using the physical **Power Button** rather than turning off the wall switch directly. When powered down properly, the carriage returns to its capped capping station, preventing air exposure.

### 5. Maintain Room Humidity and Dust-Free Environment
Dust particles floating onto the paper feed rollers transfer directly to printheads during high-speed passes. Keep your office printing area clean and avoid direct exposure to extreme heat or AC drafts.`,
    tags: ['Epson', 'Canon', 'Printhead Care', 'EcoTank'],
    is_published: true,
    featured: true,
    views_count: 342,
    related_product_ids: []
  },
  {
    id: 'blog-2-genuine-splashjet-inks',
    title: 'How to Identify Genuine Splashjet Digital Inks & Avoid Counterfeits',
    slug: 'how-to-identify-genuine-splashjet-inks',
    category: 'Ink Guide',
    author: 'Splashjet Distributor Team',
    read_time: '5 min read',
    created_at: '2026-09-05T12:30:00Z',
    image_url: '/splashjet_images/about-splashjet.jpg',
    summary: 'Why 100% authentic Splashjet inks protect your printer and guarantee vibrant colors. Includes security seals and bottle verification guide.',
    content: `## The Threat of Counterfeit Inks in Bangladesh

The digital printing market has seen an influx of low-grade imitation inks repackaged in duplicate branded bottles. Using substandard ink causes head degradation, inaccurate Delta-E color deviation, and quick UV fading.

### Key Authenticity Checklist for Splashjet Inks:

1. **Tamper-Evident Induction Heat Seal:**
   Every genuine Splashjet bottle features a hermetically sealed aluminum foil under the nozzle cap with micro-embossed security patterns.

2. **Laser-Etched Batch Number & Expiry Date:**
   Authentic bottles have clean, non-smudged dot-matrix laser etching indicating exact production batch codes and 24-month shelf-life timestamps.

3. **High Purity & Zero Sediment:**
   Hold the sealed bottle against strong light: Splashjet ink is 100% homogenous with sub-micron filtration (<0.2 micron), ensuring zero sediment or oily layer separation.

> **Authorized Partner Guarantee:** Corporate Technologies is an authorized and trusted importer of Splashjet Inks in Bangladesh, offering 100% money-back authenticity guarantee.`,
    tags: ['Splashjet', 'Original Ink', 'Security', 'Anti-Counterfeit'],
    is_published: true,
    featured: true,
    views_count: 518,
    related_product_ids: []
  },
  {
    id: 'blog-3-office-photocopier-guide',
    title: 'Key Factors to Consider Before Buying an Office Photocopier',
    slug: 'key-factors-buying-office-photocopier',
    category: 'Photocopiers',
    author: 'Sales & Solutions Team',
    read_time: '6 min read',
    created_at: '2026-09-01T09:15:00Z',
    image_url: '/splashjet_images/about-splashjet.jpg',
    summary: 'Heavy-duty vs. light-duty copiers: how Toshiba multifunction series can slash office printing and copying costs by up to 70%.',
    content: `## Selecting the Perfect Photocopier for Your Business

Buying an office copier is a long-term capital investment. Choosing the wrong speed rating or high page-cost machine can inflate operating expenses by thousands of takas each month.

### 1. Monthly Duty Cycle & PPM Speed
- **Small Offices (1-5 Persons):** 20-25 Pages Per Minute (PPM)
- **Medium Workgroups (5-25 Persons):** 28-35 PPM with dual-scan document feeders
- **Large Enterprises & Commercial Print Shops:** 45-85 PPM heavy-duty engines

### 2. Monochrome (B&W) vs. Color Multifunction
If 90% of your daily workload comprises invoices, agreements, and text documents, a monochrome machine (e.g. Toshiba e-Studio series) offers the lowest cost per copy and supreme reliability.

### 3. Toner Yield and Cost-Per-Page (CPP)
Always compare the price of replacement toner cartridges and their ISO 5% coverage page yield. A machine with slightly higher initial purchase price often delivers 50% cheaper operational cost over 3 years.

### 4. Warranty, Maintenance Contracts & Genuine Spares
Ensure your vendor provides on-site technician service and readily available original drum units, developer, and fuser rollers.`,
    tags: ['Toshiba', 'Photocopier', 'Office Equipment', 'Cost Saving'],
    is_published: true,
    featured: false,
    views_count: 289,
    related_product_ids: []
  },
  {
    id: 'blog-4-sublimation-vs-dtf',
    title: 'Apparel & Fabric Printing: Sublimation vs. DTF Technology',
    slug: 'apparel-printing-sublimation-vs-dtf-technology',
    category: 'Textile & Machinery',
    author: 'Industrial Printing Specialist',
    read_time: '5 min read',
    created_at: '2026-08-28T14:00:00Z',
    image_url: '/splashjet_images/about-splashjet.jpg',
    summary: 'The garment printing revolution: compare DTF ink wash-fastness against traditional sublimation and master proper heat press temperatures.',
    content: `## The Modern Fabric Printing Landscape

Textile entrepreneurs frequently ask: *Should I invest in Dye-Sublimation or Direct-to-Film (DTF) printing?* Both technologies excel in distinct domains.

### Direct Comparison:

| Feature | Dye-Sublimation | DTF (Direct to Film) |
| :--- | :--- | :--- |
| **Fabric Compatibility** | 100% Polyester or High-Poly blends | Cotton, Poly, Nylon, Leather, Canvas |
| **Fabric Colors** | White or Light colored fabrics only | Any color (including Pitch Black) |
| **Hand Feel / Texture** | Zero hand feel (ink vaporizes into yarn) | Soft stretchable film coating |
| **Required Equipment** | Sublimation Printer + Heat Press | DTF Printer + Powder Shaker/Curing Oven + Press |

### Which One Should You Choose?
- Choose **Sublimation** if your focus is sportswear, jersey sublimation, mugs, or polyester promotional banners.
- Choose **DTF** if you print custom cotton t-shirts, hoodies, canvas bags, and multi-color garments on demand with white underbase.`,
    tags: ['DTF Ink', 'Heat Press', 'Sublimation', 'Textile'],
    is_published: true,
    featured: false,
    views_count: 412,
    related_product_ids: []
  }
];

function getLocalBlogs() {
  try {
    const raw = localStorage.getItem(LOCAL_BLOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_BLOGS_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_BLOGS));
      return INITIAL_FALLBACK_BLOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local blogs:', e);
    return INITIAL_FALLBACK_BLOGS;
  }
}

function saveLocalBlogs(blogs) {
  try {
    localStorage.setItem(LOCAL_BLOGS_STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.warn('Error saving local blogs:', e);
  }
}

/**
 * Fetch all blog posts (Supabase with LocalStorage fallback)
 */
export async function fetchBlogPosts({ onlyPublished = false } = {}) {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (onlyPublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data) && data.length > 0) {
      // Sync to local storage for offline caching
      saveLocalBlogs(data);
      return data;
    }
  } catch (e) {
    console.warn('Supabase fetch blogs failed, falling back to local:', e);
  }

  // Fallback to local storage
  const localList = getLocalBlogs();
  if (onlyPublished) {
    return localList.filter(b => b.is_published);
  }
  return localList;
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug) {
  if (!slug) return null;
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Supabase fetch blog by slug failed:', e);
  }

  const localList = getLocalBlogs();
  return localList.find(b => b.slug === slug || String(b.id) === String(slug)) || null;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(postData) {
  const newPost = {
    id: postData.id || `blog-${Date.now()}`,
    title: postData.title || 'Untitled Article',
    slug: postData.slug || `post-${Date.now()}`,
    summary: postData.summary || '',
    content: postData.content || '',
    category: postData.category || 'Tech Guides',
    author: postData.author || 'Corporate Tech Team',
    read_time: postData.read_time || '5 min read',
    image_url: postData.image_url || '/splashjet_images/about-splashjet.jpg',
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    is_published: postData.is_published ?? true,
    featured: Boolean(postData.featured),
    views_count: postData.views_count || 0,
    related_product_ids: Array.isArray(postData.related_product_ids) ? postData.related_product_ids : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Try saving to Supabase
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([newPost])
      .select()
      .maybeSingle();

    if (!error && data) {
      const local = getLocalBlogs();
      saveLocalBlogs([data, ...local.filter(b => b.id !== data.id)]);
      return data;
    }
  } catch (e) {
    console.warn('Supabase insert blog failed, storing locally:', e);
  }

  // 2. Save locally
  const local = getLocalBlogs();
  const updated = [newPost, ...local.filter(b => b.id !== newPost.id)];
  saveLocalBlogs(updated);
  return newPost;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id, updates) {
  const cleanUpdates = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!error && data) {
      const local = getLocalBlogs();
      const updatedLocal = local.map(b => b.id === id ? { ...b, ...data } : b);
      saveLocalBlogs(updatedLocal);
      return data;
    }
  } catch (e) {
    console.warn('Supabase update blog failed, storing locally:', e);
  }

  // 2. Update locally
  const local = getLocalBlogs();
  const updatedLocal = local.map(b => (b.id === id || b.slug === id) ? { ...b, ...cleanUpdates } : b);
  saveLocalBlogs(updatedLocal);
  return updatedLocal.find(b => b.id === id || b.slug === id);
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id) {
  try {
    await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
  } catch (e) {
    console.warn('Supabase delete blog failed:', e);
  }

  const local = getLocalBlogs();
  const filtered = local.filter(b => b.id !== id && b.slug !== id);
  saveLocalBlogs(filtered);
  return true;
}

/**
 * Increment blog view count
 */
export async function incrementBlogViews(id) {
  const local = getLocalBlogs();
  const target = local.find(b => b.id === id || b.slug === id);
  if (target) {
    target.views_count = (Number(target.views_count) || 0) + 1;
    saveLocalBlogs(local);
  }

  try {
    await supabase.rpc('increment_blog_views', { blog_id: id });
  } catch {
    // Silent fallback
  }
}
