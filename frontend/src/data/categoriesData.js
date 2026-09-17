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

  // Check dynamic categories tree from localStorage
  try {
    const savedTree = localStorage.getItem('ct_custom_categories_tree_v2');
    if (savedTree) {
      const dynamicTree = JSON.parse(savedTree);
      if (Array.isArray(dynamicTree)) {
        for (const cat of dynamicTree) {
          if (!cat || (cat.name || '').toLowerCase().trim() === 'human') continue;
          const catSlug = (cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
          if (catSlug === cleanSlug || cat.id === cleanSlug) {
            return { parent: cat, sub: null };
          }
          for (const sub of (cat.subcategories || [])) {
            const subSlug = (sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')).toLowerCase();
            if (subSlug === cleanSlug || sub.id === cleanSlug) {
              return { parent: cat, sub };
            }
          }
        }
      }
    }
  } catch (e) {}

  // Check top-level static defaults
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

  // Check dynamic categories tree first
  try {
    const savedTree = localStorage.getItem('ct_custom_categories_tree_v2');
    if (savedTree) {
      const dynamicTree = JSON.parse(savedTree);
      if (Array.isArray(dynamicTree)) {
        for (const cat of dynamicTree) {
          if (!cat || (cat.name || '').toLowerCase().trim() === 'human') continue;
          if ((cat.name || '').toLowerCase() === n) return { parent: cat, sub: null };
          for (const sub of (cat.subcategories || [])) {
            if ((sub.name || '').toLowerCase() === n) return { parent: cat, sub };
          }
        }
      }
    }
  } catch (e) {}

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
  if (!product) return false;
  if (!parentCatName || parentCatName === 'All' || parentCatName === 'All Products') return true;

  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const pTarget = (parentCatName || '').toLowerCase().trim();
  const sTarget = subCatName ? subCatName.toLowerCase().trim() : null;

  const pCat = (product.category || '').toLowerCase().trim();
  const pSub = (product.sub_category || '').toLowerCase().trim();
  const title = (product.title || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const desc = (product.description || '').toLowerCase() + ' ' + (product.short_description || '').toLowerCase();

  const normTargetParent = normalize(pTarget);
  const normTargetSub = sTarget ? normalize(sTarget) : null;
  const normPCat = normalize(pCat);
  const normPSub = normalize(pSub);

  // 1. Direct Parent Category Check
  const parentMatches = 
    normPCat === normTargetParent || 
    normPCat.includes(normTargetParent) || 
    normTargetParent.includes(normPCat) ||
    (normTargetParent.includes('splashjet') && (normPCat.includes('splashjet') || brand.includes('splashjet') || title.includes('splashjet')));

  // If parent doesn't match and it's not a generic match, return false
  if (!parentMatches && !pTarget.includes('all')) {
    // Check raw_categories
    const raw = Array.isArray(product.raw_categories) ? product.raw_categories : [];
    const rawMatch = raw.some(r => normalize(r).includes(normTargetParent));
    if (!rawMatch) return false;
  }

  // If no subcategory is selected, matching the parent category is sufficient
  if (!sTarget) {
    return true;
  }

  // 2. Direct Subcategory Exact/Normalized Match (HIGHEST PRIORITY)
  if (normPSub && normTargetSub) {
    if (
      normPSub === normTargetSub ||
      normPSub.includes(normTargetSub) ||
      normTargetSub.includes(normPSub) ||
      pSub === sTarget ||
      pSub.toLowerCase() === sTarget.toLowerCase()
    ) {
      return true;
    }
  }

  // 3. Special Splashjet Subcategory Title & Keyword Heuristics (for fallback legacy data)
  if (normTargetParent.includes('splashjet')) {
    if (normTargetSub === 'largeformatprinterink' || normTargetSub === 'splashjetplotterink') {
      return title.includes('plotter') || title.includes('large format') || title.includes('wide format') || title.includes('lfp') || title.includes('surecolor') || title.includes('designjet') || title.includes('imageprograf') || pSub.includes('plotter') || desc.includes('plotter') || desc.includes('large format');
    }

    if (normTargetSub === 'digitaltextileprintingink' || normTargetSub === 'splashjetfordtf' || normTargetSub === 'splashjetforsublimation') {
      return title.includes('sublimation') || title.includes('dtf') || title.includes('dtg') || title.includes('textile') || title.includes('fabric') || pSub.includes('dtf') || pSub.includes('sublimation');
    }

    if (normTargetSub === 'industrialinkjetink') {
      return title.includes('industrial') || title.includes('coding') || title.includes('marking') || title.includes('tij') || title.includes('batch') || title.includes('packaging') || desc.includes('coding') || desc.includes('industrial') || pSub.includes('industrial');
    }

    if (normTargetSub === 'desktopprinterink') {
      const isTextile = (title.includes('sublimation') || title.includes('dtf') || title.includes('dtg')) && !title.includes('desktop');
      const isPlotter = title.includes('plotter') || title.includes('large format');
      const isIndustrial = title.includes('industrial') || title.includes('tij') || title.includes('coding');
      if (isTextile || isPlotter || isIndustrial) return false;
      return true;
    }

    if (title.includes(sTarget.replace('splashjet for ', ''))) {
      return true;
    }
  }

  // 4. Raw categories match
  const raw = Array.isArray(product.raw_categories) ? product.raw_categories : [];
  if (raw.length > 0 && normTargetSub) {
    return raw.some(r => {
      const parts = r.toLowerCase().split('>').map(s => normalize(s));
      return parts.some(p => p === normTargetSub || p.includes(normTargetSub) || normTargetSub.includes(p));
    });
  }

  // 5. Title/Brand fallback for standard brands (e.g. Epson Printers, Brother Printers)
  if (title.includes(sTarget) || (brand && sTarget.includes(brand))) {
    return true;
  }

  return false;
}
