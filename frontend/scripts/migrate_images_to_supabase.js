import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Credentials
const SUPABASE_URL = 'https://vhilsjzpmbcirijhhouc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoaWxzanpwbWJjaXJpamhob3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU3MzkyNSwiZXhwIjoyMTA0MTQ5OTI1fQ.dLD3rSdQmHoyf5NIr4l4793jo1kmzx6yrmC5CShsfG8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});
const BUCKET_NAME = 'product-images';

const DOWNLOAD_DIR = path.join(__dirname, '../../backend/images/downloaded_images');
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

const FALLBACK_PRODUCTS_PATH = path.join(__dirname, '../src/data/fallbackProducts.json');

function getCleanFilename(url, fallbackPrefix = 'product') {
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    // Sanitize filename: replace invalid chars with underscore
    const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    if (clean.length > 5) return clean;
  } catch {}
  return `${fallbackPrefix}_${Date.now()}.webp`;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}

async function ensureBucket() {
  console.log(`Checking bucket "${BUCKET_NAME}"...`);
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
  }

  const exists = buckets?.some(b => b.id === BUCKET_NAME || b.name === BUCKET_NAME);
  if (!exists) {
    console.log(`Creating bucket "${BUCKET_NAME}"...`);
    const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });
    if (createErr) {
      console.warn('Bucket creation note:', createErr.message);
    }
  } else {
    console.log(`Bucket "${BUCKET_NAME}" exists and is ready.`);
  }
}

async function downloadAndUploadImage(url, slug) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return url;
  }

  // If already uploaded to our Supabase storage, skip
  if (url.includes('supabase.co/storage/v1/object/public/product-images/')) {
    return url;
  }

  const filename = getCleanFilename(url, slug);
  const localFilePath = path.join(DOWNLOAD_DIR, filename);

  let fileBuffer;

  // 1. Download if not already downloaded locally
  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 100) {
    fileBuffer = fs.readFileSync(localFilePath);
  } else {
    try {
      console.log(`Downloading: ${url}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        console.warn(`Failed to download ${url}: HTTP ${resp.status}`);
        return url; // fallback to original
      }
      const arrayBuf = await resp.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
      fs.writeFileSync(localFilePath, fileBuffer);
    } catch (err) {
      console.warn(`Error downloading ${url}:`, err.message);
      return url;
    }
  }

  // 2. Upload to Supabase Storage
  const contentType = getContentType(filename);
  try {
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadErr) {
      console.warn(`Upload note for ${filename}:`, uploadErr.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    if (publicUrlData?.publicUrl) {
      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.warn(`Storage error for ${filename}:`, err.message);
  }

  return url;
}

async function runMigration() {
  console.log('=== STARTING IMAGE MIGRATION TO SUPABASE STORAGE ===');
  await ensureBucket();

  if (!fs.existsSync(FALLBACK_PRODUCTS_PATH)) {
    console.error('fallbackProducts.json not found!');
    return;
  }

  const raw = fs.readFileSync(FALLBACK_PRODUCTS_PATH, 'utf8');
  const products = JSON.parse(raw);
  console.log(`Loaded ${products.length} products from fallback JSON.`);

  const urlMap = new Map();
  let processedCount = 0;
  let downloadedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = p.slug || `prod_${p.id}`;

    // 1. Process Main Image
    if (p.image_url && p.image_url.startsWith('http') && !p.image_url.includes('supabase.co')) {
      if (urlMap.has(p.image_url)) {
        p.image_url = urlMap.get(p.image_url);
      } else {
        const newUrl = await downloadAndUploadImage(p.image_url, slug);
        if (newUrl !== p.image_url) {
          urlMap.set(p.image_url, newUrl);
          p.image_url = newUrl;
          downloadedCount++;
        }
      }
    }

    // 2. Process Gallery Images
    if (Array.isArray(p.gallery_images) && p.gallery_images.length > 0) {
      const newGallery = [];
      for (let g = 0; g < p.gallery_images.length; g++) {
        const gUrl = p.gallery_images[g];
        if (gUrl && typeof gUrl === 'string' && gUrl.startsWith('http') && !gUrl.includes('supabase.co')) {
          if (urlMap.has(gUrl)) {
            newGallery.push(urlMap.get(gUrl));
          } else {
            const newGUrl = await downloadAndUploadImage(gUrl, `${slug}_g${g}`);
            if (newGUrl !== gUrl) {
              urlMap.set(gUrl, newGUrl);
              newGallery.push(newGUrl);
              downloadedCount++;
            } else {
              newGallery.push(gUrl);
            }
          }
        } else {
          newGallery.push(gUrl);
        }
      }
      p.gallery_images = newGallery;
    }

    processedCount++;
    if (processedCount % 10 === 0 || processedCount === products.length) {
      console.log(`Progress: ${processedCount}/${products.length} products processed. ${downloadedCount} images migrated.`);
    }
  }

  // Save updated fallbackProducts.json
  fs.writeFileSync(FALLBACK_PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Saved updated fallbackProducts.json with new Supabase Storage URLs!`);

  // 3. Update Supabase Database 'products' Table
  console.log('Syncing updated image URLs to Supabase Database "products" table in batches...');
  let dbUpdatedCount = 0;

  for (const p of products) {
    try {
      const updatePayload = {
        image_url: p.image_url,
        gallery_images: p.gallery_images || []
      };

      let query = supabase.from('products').update(updatePayload);
      if (p.slug) {
        query = query.eq('slug', p.slug);
      } else if (p.id) {
        query = query.eq('id', p.id);
      }

      const { error: dbErr } = await query;
      if (!dbErr) {
        dbUpdatedCount++;
      } else {
        const { error: titleErr } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('title', p.title);
        if (!titleErr) dbUpdatedCount++;
      }
    } catch (e) {
      console.warn(`DB update error for ${p.title}:`, e.message);
    }
  }

  console.log(`Database sync completed: ${dbUpdatedCount} products updated in Supabase!`);
  console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
}

runMigration().catch(err => {
  console.error('Fatal migration error:', err);
});
