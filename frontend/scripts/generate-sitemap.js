import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://corporatetechbd.com';

// 1. Static Key Landing Pages
const STATIC_PAGES = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/shop/', changefreq: 'daily', priority: '0.9' },
  { url: '/compare/', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/', changefreq: 'daily', priority: '0.8' },
];

// 2. Main E-commerce Categories
const CORE_CATEGORIES = [
  'splashjet-ink',
  'printers',
  'photocopier',
  'toner-cartridge',
  'large-format-printer-ink',
  'desktop-printer-ink',
  'digital-textile-printing-ink',
  'industrial-inkjet-ink',
  'epson-printers',
  'canon-printers',
  'hp-printers',
  'brother-printers',
  'toshiba-photocopier',
  'accessories-parts',
  'smartwatch',
  'combo-package'
];

async function generateSitemap() {
  console.log('Generating production sitemap.xml...');

  const today = new Date().toISOString().split('T')[0];
  let urls = [];

  // Add static pages
  for (const p of STATIC_PAGES) {
    urls.push(`  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`);
  }

  // Add category pages
  for (const cat of CORE_CATEGORIES) {
    urls.push(`  <url>
    <loc>${BASE_URL}/product-category/${cat}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
  }

  // Add products from fallbackProducts.json
  const fallbackPath = path.join(__dirname, '../src/data/fallbackProducts.json');
  if (fs.existsSync(fallbackPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(p => {
          const slug = p.slug || p.id;
          if (slug) {
            urls.push(`  <url>
    <loc>${BASE_URL}/product/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
          }
        });
        console.log(`Added ${data.length} products to sitemap.`);
      }
    } catch (e) {
      console.warn('Error reading fallback products for sitemap:', e.message);
    }
  }

  // Blog posts
  const blogSlugs = [
    'epson-ecotank-maintenance-guide',
    'splashjet-ink-vs-regular-refill',
    'toshiba-photocopier-troubleshooting-bd',
    'dtf-printing-cost-calculation-bangladesh'
  ];

  for (const b of blogSlugs) {
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${b}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml, 'utf8');
  console.log(`Sitemap generated successfully at ${outputPath} with ${urls.length} URLs!`);
}

generateSitemap();
