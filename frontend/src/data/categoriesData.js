/**
 * Complete Category Tree matching corporatetechbd.com WooCommerce setup
 */
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

  // Check top-level
  for (const cat of CATEGORIES_TREE) {
    if (cat.slug === cleanSlug) return { parent: cat, sub: null };
    for (const sub of cat.subcategories) {
      if (sub.slug === cleanSlug) return { parent: cat, sub };
    }
  }

  // Soft fallback matching
  for (const cat of CATEGORIES_TREE) {
    if (cat.slug.includes(cleanSlug) || cleanSlug.includes(cat.slug)) {
      return { parent: cat, sub: null };
    }
  }

  return null;
}

export function findCategoryByName(name) {
  if (!name || name === 'All') return null;
  const n = name.toLowerCase().trim();

  for (const cat of CATEGORIES_TREE) {
    if (cat.name.toLowerCase() === n) return { parent: cat, sub: null };
    for (const sub of cat.subcategories) {
      if (sub.name.toLowerCase() === n) return { parent: cat, sub };
    }
  }

  // Substring fallback
  for (const cat of CATEGORIES_TREE) {
    if (cat.name.toLowerCase().includes(n) || n.includes(cat.name.toLowerCase())) {
      return { parent: cat, sub: null };
    }
  }

  return null;
}

/**
 * Checks if a product matches a parent category or subcategory
 */
export function productMatchesCategory(product, parentCatName, subCatName = null) {
  if (!parentCatName || parentCatName === 'All' || parentCatName === 'All Products') return true;

  const raw = Array.isArray(product.raw_categories) ? product.raw_categories : [];
  const pTarget = parentCatName.toLowerCase().trim();
  const sTarget = subCatName ? subCatName.toLowerCase().trim() : null;

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

  // Fallback if raw_categories is not present
  const pCat = (product.category || '').toLowerCase();
  const pSub = (product.sub_category || '').toLowerCase();

  if (sTarget) {
    return pSub === sTarget || pSub.includes(sTarget);
  }

  return pCat === pTarget || pCat.includes(pTarget);
}
