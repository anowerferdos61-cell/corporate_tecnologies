export const SPLASHJET_INK_CATEGORIES = [
  {
    id: 'large-format',
    title: 'Large Format Printer Ink',
    slug: 'large-format-printer-ink',
    image: '/splashjet_images/ink-cat-large-format.png',
    description: 'Wide-format inks for banners, posters and photo albums with vivid, long-lasting colors.',
    keywords: ['plotter', 'large format', 'wide format', 'cad', 'gis', 'photo', 'surecolor', 'designjet', 'imageprograf', 'dx5', 'i3200', 'lfp', 'banner']
  },
  {
    id: 'desktop-printer',
    title: 'Desktop Printer Ink',
    slug: 'desktop-printer-ink',
    image: '/splashjet_images/ink-cat-desktop-printer.png',
    description: 'Reliable refill inks for Epson, Canon and HP desktop printers — sharp text and photos.',
    keywords: ['desktop', 'l3110', 'l3250', 'l805', 'l1800', 'g2010', 'g3010', '003', '664', '774', '673', 'dye', 'pigment', 'epson', 'canon', 'hp', 'brother', 'refill']
  },
  {
    id: 'digital-textile',
    title: 'Digital Textile Printing Ink',
    slug: 'digital-textile-printing-ink',
    image: '/splashjet_images/ink-cat-digital-textile.png',
    description: 'Sublimation, DTF and DTG inks for apparel and fabric with a soft hand and wash-fastness.',
    keywords: ['sublimation', 'dtf', 'dtg', 'textile', 'apparel', 'fabric', 't-shirt', 'heat transfer', 'subli']
  },
  {
    id: 'industrial-inkjet',
    title: 'Industrial Inkjet Ink',
    slug: 'industrial-inkjet-ink',
    image: '/splashjet_images/ink-cat-industrial-inkjet.png',
    description: 'Coding, marking and packaging inks built for high-speed industrial print heads.',
    keywords: ['industrial', 'coding', 'marking', 'tij', 'batch', 'cij', 'packaging', 'high-speed']
  }
];

export const CATEGORIES_TREE = [
  {
    name: 'Accessories & Parts',
    slug: 'accessories-parts',
    count: 5,
    subcategories: [
      { name: 'Photocopier Accessories', slug: 'photocopier-accessories', count: 3 },
      { name: 'Printer Accessories', slug: 'printer-accessories', count: 1 },
      { name: 'Printer Parts', slug: 'printer-parts', count: 1 },
    ]
  },
  {
    name: 'Combo package',
    slug: 'combo-package',
    count: 1,
    subcategories: []
  },
  {
    name: 'Gadgets',
    slug: 'gadgets',
    count: 1,
    subcategories: [
      { name: 'Smartwatch', slug: 'smartwatch', count: 1 }
    ]
  },
  {
    name: 'Machinery',
    slug: 'machinery',
    count: 8,
    subcategories: [
      { name: 'Copier Feeders', slug: 'copier-feeders', count: 2 },
      { name: 'DTF Combo', slug: 'dtf-combo', count: 2 },
      { name: 'Others', slug: 'others', count: 2 }
    ]
  },
  {
    name: 'Office Equipment',
    slug: 'office-equipment',
    count: 12,
    subcategories: [
      { name: 'Cash Drawer', slug: 'cash-drawer', count: 3 },
      { name: 'Scanner', slug: 'scanner', count: 8 }
    ]
  },
  {
    name: 'Photocopy Machine',
    slug: 'photocopy-machine',
    count: 8,
    subcategories: [
      { name: 'Color Series', slug: 'color-series', count: 1 },
      { name: 'Heavy Duty Machine', slug: 'heavy-duty-machine', count: 3 },
      { name: 'Light Duty Machine', slug: 'light-duty-machine', count: 4 }
    ]
  },
  {
    name: 'Printers',
    slug: 'printers',
    count: 55,
    subcategories: [
      { name: 'Barcode & Level Printer', slug: 'barcode-level-printer', count: 2 },
      { name: 'Brother Printers', slug: 'brother-printers', count: 9 },
      { name: 'Canon Printers', slug: 'canon-printers', count: 15 },
      { name: 'Epson Printers', slug: 'epson-printers', count: 23 },
      { name: 'HP printers', slug: 'hp-printers', count: 3 },
      { name: 'Inkjet Printers', slug: 'inkjet-printers', count: 29 },
      { name: 'Laser Printers', slug: 'laser-printers', count: 5 },
      { name: 'POS & Receipt Printer', slug: 'pos-receipt-printer', count: 3 }
    ]
  },
  {
    name: 'Printing Equipment',
    slug: 'printing-equipment',
    count: 2,
    subcategories: []
  },
  {
    name: 'Ready Business Setup',
    slug: 'ready-business-setup',
    count: 3,
    subcategories: []
  },
  {
    name: 'Splashjet Ink',
    slug: 'splashjet-ink',
    count: 20,
    subcategories: [
      { name: 'Large Format Printer Ink', slug: 'large-format-printer-ink', count: 4 },
      { name: 'Desktop Printer Ink', slug: 'desktop-printer-ink', count: 12 },
      { name: 'Digital Textile Printing Ink', slug: 'digital-textile-printing-ink', count: 3 },
      { name: 'Industrial Inkjet Ink', slug: 'industrial-inkjet-ink', count: 2 },
      { name: 'Splashjet For Brother', slug: 'splashjet-for-brother', count: 1 },
      { name: 'Splashjet For Canon', slug: 'splashjet-for-canon', count: 6 },
      { name: 'Splashjet For DTF', slug: 'splashjet-for-dtf', count: 1 },
      { name: 'Splashjet For Epson', slug: 'splashjet-for-epson', count: 11 },
      { name: 'Splashjet For HP', slug: 'splashjet-for-hp', count: 1 },
      { name: 'Splashjet For Sublimation', slug: 'splashjet-for-sublimation', count: 1 },
      { name: 'Splashjet Plotter Ink', slug: 'splashjet-plotter-ink', count: 1 }
    ]
  },
  {
    name: 'Toner & Inks',
    slug: 'toner-inks',
    count: 16,
    subcategories: [
      { name: 'Original Inkjets Inks', slug: 'original-inkjets-inks', count: 11 },
      { name: 'Photocopier Toner', slug: 'photocopier-toner', count: 5 }
    ]
  }
];

export function findCategoryBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.replace(/^\/|\/$/g, '').toLowerCase();

  if (cleanSlug === 'shop' || cleanSlug === 'all') {
    return { parent: { name: 'All Products', slug: 'shop', count: 125, subcategories: [] }, sub: null };
  }

  // Alias support for Splashjet Inks
  if (cleanSlug === 'splashjet-inks' || cleanSlug === 'splashjet-ink') {
    const splashCat = CATEGORIES_TREE.find(c => c.slug === 'splashjet-ink');
    return { parent: splashCat, sub: null };
  }

  // Check top-level
  for (const cat of CATEGORIES_TREE) {
    if (cat.slug === cleanSlug) return { parent: cat, sub: null };
    for (const sub of cat.subcategories) {
      if (sub.slug === cleanSlug) return { parent: cat, sub };
    }
  }

  // Check 4 Splashjet Categories
  for (const sCat of SPLASHJET_INK_CATEGORIES) {
    if (sCat.slug === cleanSlug) {
      const parentCat = CATEGORIES_TREE.find(c => c.slug === 'splashjet-ink');
      return { parent: parentCat, sub: { name: sCat.title, slug: sCat.slug } };
    }
  }

  // Check custom categories from localStorage
  try {
    const saved = localStorage.getItem('ct_custom_categories');
    if (saved) {
      const customCats = JSON.parse(saved);
      if (Array.isArray(customCats)) {
        for (const catName of customCats) {
          if (!catName || catName.toLowerCase().trim() === 'human') continue;
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (catSlug === cleanSlug) {
            return {
              parent: {
                name: catName,
                slug: catSlug,
                count: 1,
                subcategories: []
              },
              sub: null
            };
          }
        }
      }
    }
  } catch (e) {}

  // Soft fallback matching
  for (const cat of CATEGORIES_TREE) {
    if (cat.slug.includes(cleanSlug) || cleanSlug.includes(cat.slug)) {
      return { parent: cat, sub: null };
    }
  }

  // Dynamic / Custom Category fallback (e.g. newly created admin categories)
  const decoded = decodeURIComponent(cleanSlug).replace(/-/g, ' ');
  return {
    parent: {
      name: decoded.charAt(0).toUpperCase() + decoded.slice(1),
      slug: cleanSlug,
      count: 1,
      subcategories: []
    },
    sub: null
  };
}

export function findCategoryByName(name) {
  if (!name || name === 'All') return null;
  const n = name.toLowerCase().trim();

  // Alias support for Splashjet Inks
  if (n === 'splashjet inks' || n === 'splashjet ink') {
    const splashCat = CATEGORIES_TREE.find(c => c.slug === 'splashjet-ink');
    return { parent: splashCat, sub: null };
  }

  for (const cat of CATEGORIES_TREE) {
    if (cat.name.toLowerCase() === n) return { parent: cat, sub: null };
    for (const sub of cat.subcategories) {
      if (sub.name.toLowerCase() === n) return { parent: cat, sub };
    }
  }

  for (const sCat of SPLASHJET_INK_CATEGORIES) {
    if (sCat.title.toLowerCase() === n) {
      const parentCat = CATEGORIES_TREE.find(c => c.slug === 'splashjet-ink');
      return { parent: parentCat, sub: { name: sCat.title, slug: sCat.slug } };
    }
  }

  return {
    parent: {
      name: name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subcategories: []
    },
    sub: null
  };
}

/**
 * Checks if a product matches a parent category or subcategory
 */
export function productMatchesCategory(product, parentCatName, subCatName = null) {
  if (!parentCatName || parentCatName === 'All' || parentCatName === 'All Products') return true;

  const pTarget = parentCatName.toLowerCase().trim();
  const sTarget = subCatName ? subCatName.toLowerCase().trim() : null;

  const pCat = (product.category || '').toLowerCase().trim();
  const pSub = (product.sub_category || '').toLowerCase().trim();
  const title = (product.title || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const desc = (product.description || '').toLowerCase() + ' ' + (product.short_description || '').toLowerCase();

  // Special Splashjet Ink classification
  if (pTarget === 'splashjet ink' || pTarget === 'splashjet inks') {
    const isSplashjetProduct = brand.includes('splashjet') || pCat.includes('splashjet') || title.includes('splashjet');
    if (!isSplashjetProduct) return false;

    // If no subcategory is selected, show all Splashjet products
    if (!sTarget) return true;

    // Match 4 Main Splashjet Application Subcategories
    if (sTarget === 'large format printer ink' || sTarget === 'large-format-printer-ink' || sTarget === 'splashjet plotter ink' || sTarget === 'splashjet-plotter-ink') {
      return title.includes('plotter') || title.includes('large format') || title.includes('wide format') || title.includes('lfp') || title.includes('surecolor') || title.includes('designjet') || title.includes('imageprograf') || pSub.includes('plotter') || desc.includes('plotter') || desc.includes('large format');
    }

    if (sTarget === 'digital textile printing ink' || sTarget === 'digital-textile-printing-ink' || sTarget === 'splashjet for dtf' || sTarget === 'splashjet-for-dtf' || sTarget === 'splashjet for sublimation' || sTarget === 'splashjet-for-sublimation') {
      return title.includes('sublimation') || title.includes('dtf') || title.includes('dtg') || title.includes('textile') || title.includes('fabric') || pSub.includes('dtf') || pSub.includes('sublimation');
    }

    if (sTarget === 'industrial inkjet ink' || sTarget === 'industrial-inkjet-ink') {
      return title.includes('industrial') || title.includes('coding') || title.includes('marking') || title.includes('tij') || title.includes('batch') || title.includes('packaging') || desc.includes('coding') || desc.includes('industrial');
    }

    if (sTarget === 'desktop printer ink' || sTarget === 'desktop-printer-ink') {
      // Exclude pure textile/sublimation/dtf unless desktop refill
      const isTextile = (title.includes('sublimation') || title.includes('dtf') || title.includes('dtg')) && !title.includes('desktop');
      const isPlotter = title.includes('plotter') || title.includes('large format');
      const isIndustrial = title.includes('industrial') || title.includes('tij') || title.includes('coding');
      if (isTextile || isPlotter || isIndustrial) return false;
      return true; // All standard Splashjet refill inks (Epson, Canon, HP, Brother desktop inks)
    }

    // Direct brand subcategory matches (e.g. Splashjet For Epson, Splashjet For Canon)
    if (pSub === sTarget || pSub.includes(sTarget) || sTarget.includes(pSub)) {
      return true;
    }
    if (title.includes(sTarget.replace('splashjet for ', ''))) {
      return true;
    }
  }

  // 1. Direct Category field match (always takes priority)
  if (!sTarget && (pCat === pTarget || pCat.includes(pTarget) || pTarget.includes(pCat))) {
    return true;
  }
  if (sTarget && (pSub === sTarget || pSub.includes(sTarget) || sTarget.includes(pSub))) {
    return true;
  }

  // 2. Raw categories match
  const raw = Array.isArray(product.raw_categories) ? product.raw_categories : [];
  if (raw.length > 0) {
    if (sTarget) {
      return raw.some(r => {
        const parts = r.toLowerCase().split('>').map(s => s.trim());
        return parts.some(p => p === sTarget || p.includes(sTarget));
      });
    }
    return raw.some(r => {
      const parts = r.toLowerCase().split('>').map(s => s.trim());
      return parts[0] === pTarget || parts.includes(pTarget) || r.toLowerCase().includes(pTarget);
    });
  }

  return false;
}
