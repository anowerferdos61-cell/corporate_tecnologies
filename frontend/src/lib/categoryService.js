import { CATEGORIES_TREE } from '../data/categoriesData';
import { supabase } from './supabaseClient';

const STORAGE_KEY = 'ct_custom_categories_tree_v2';

/**
 * Helper to generate a URL-friendly slug
 */
export function generateSlug(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get the initial base categories tree
 */
export function getInitialCategoriesTree() {
  return CATEGORIES_TREE.map(cat => ({
    id: cat.slug || generateSlug(cat.name),
    name: cat.name,
    slug: cat.slug || generateSlug(cat.name),
    image: cat.image || (cat.slug === 'splashjet-ink' ? '/splashjet_images/grow-your-canon-lfp-ink-business.png' : ''),
    description: cat.description || '',
    count: cat.count || 0,
    hidden: false,
    isDefault: true,
    subcategories: (cat.subcategories || []).map(sub => ({
      id: sub.slug || generateSlug(sub.name),
      name: sub.name,
      slug: sub.slug || generateSlug(sub.name),
      count: sub.count || 0,
      hidden: false
    }))
  }));
}

/**
 * Synchronous cached categories tree getter
 */
export function getCachedCategoriesTree(products = []) {
  return getCategoriesTree(products);
}

/**
 * Load full categories tree (Merged with Supabase / LocalStorage & Product Counts)
 */
export async function getCategoriesTreeAsync(forceSync = false) {
  if (forceSync) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'categories_tree_v1')
        .single();

      if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value));
        return data.value;
      }
    } catch (e) {
      console.warn('Supabase categories fetch notice:', e);
    }
  }
  return getCategoriesTree();
}

/**
 * Load full categories tree (Merged with Supabase / LocalStorage & Product Counts)
 */
export function getCategoriesTree(products = []) {
  let tree = getInitialCategoriesTree();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        tree = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse categories tree from storage:', e);
  }

  // Calculate live product counts dynamically if products provided
  if (Array.isArray(products) && products.length > 0) {
    tree = tree.map(cat => {
      const catLower = (cat.name || '').toLowerCase();
      const catSlug = (cat.slug || '').toLowerCase();

      const matchingProducts = products.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        return pCat === catLower || pCat === catSlug || (catSlug === 'splashjet-ink' && pCat.includes('splashjet'));
      });

      const updatedSubcategories = (cat.subcategories || []).map(sub => {
        const subLower = (sub.name || '').toLowerCase();
        const subSlug = (sub.slug || '').toLowerCase();
        const subMatches = matchingProducts.filter(p => {
          const pSub = (p.sub_category || '').toLowerCase();
          return pSub === subLower || pSub === subSlug || (p.title || '').toLowerCase().includes(subLower);
        });
        return {
          ...sub,
          count: subMatches.length > 0 ? subMatches.length : sub.count || 0
        };
      });

      return {
        ...cat,
        count: matchingProducts.length > 0 ? matchingProducts.length : cat.count || 0,
        subcategories: updatedSubcategories
      };
    });
  }

  // Filter out any unwanted categories (like 'human')
  return tree.filter(c => c && (c.name || '').toLowerCase().trim() !== 'human');
}

/**
 * Save and persist the entire categories tree
 */
export async function saveCategoriesTree(newTree) {
  if (!Array.isArray(newTree)) return [];

  const cleanTree = newTree.filter(c => c && (c.name || '').toLowerCase().trim() !== 'human');

  // 1. Local-first storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanTree));
    window.dispatchEvent(new CustomEvent('ct_categories_updated', { detail: cleanTree }));
  } catch (e) {
    console.warn('LocalStorage save error for categories tree:', e);
  }

  // 2. Sync to Supabase store_settings
  try {
    await supabase
      .from('store_settings')
      .upsert({
        key: 'categories_tree_v1',
        value: cleanTree,
        updated_at: new Date().toISOString()
      });
  } catch (err) {
    console.warn('Supabase categories sync notice:', err.message);
  }

  return cleanTree;
}

/**
 * Create or Update a Category / Subcategory
 */
export async function saveCategory(categoryData, parentId = null, existingId = null) {
  const currentTree = getCategoriesTree();
  const name = categoryData.name?.trim();
  if (!name) throw new Error('Category name is required');

  const slug = categoryData.slug?.trim() || generateSlug(name);
  const id = existingId || categoryData.id || slug;

  let updatedTree = [...currentTree];

  if (parentId) {
    // Adding or editing a subcategory under a parent
    updatedTree = updatedTree.map(cat => {
      if (cat.id === parentId || cat.slug === parentId) {
        const subs = [...(cat.subcategories || [])];
        const existingSubIdx = subs.findIndex(s => s.id === id || s.slug === slug || (existingId && s.id === existingId));

        const newSub = {
          id,
          name,
          slug,
          count: categoryData.count || 0,
          hidden: Boolean(categoryData.hidden)
        };

        if (existingSubIdx >= 0) {
          subs[existingSubIdx] = { ...subs[existingSubIdx], ...newSub };
        } else {
          subs.push(newSub);
        }

        return { ...cat, subcategories: subs };
      }
      return cat;
    });
  } else {
    // Adding or editing a root parent category
    const existingIndex = updatedTree.findIndex(c => c.id === id || c.slug === slug || (existingId && c.id === existingId));
    const newCategory = {
      id,
      name,
      slug,
      image: categoryData.image || '',
      description: categoryData.description || '',
      count: categoryData.count || 0,
      hidden: Boolean(categoryData.hidden),
      isDefault: false,
      subcategories: categoryData.subcategories || (existingIndex >= 0 ? updatedTree[existingIndex].subcategories : [])
    };

    if (existingIndex >= 0) {
      updatedTree[existingIndex] = { ...updatedTree[existingIndex], ...newCategory };
    } else {
      updatedTree.push(newCategory);
    }
  }

  return await saveCategoriesTree(updatedTree);
}

/**
 * Delete a Category or Subcategory
 */
export async function deleteCategory(categoryId, parentId = null) {
  const currentTree = getCategoriesTree();
  let updatedTree = [...currentTree];

  if (parentId) {
    // Delete subcategory under parent
    updatedTree = updatedTree.map(cat => {
      if (cat.id === parentId || cat.slug === parentId) {
        return {
          ...cat,
          subcategories: (cat.subcategories || []).filter(s => s.id !== categoryId && s.slug !== categoryId)
        };
      }
      return cat;
    });
  } else {
    // Delete root parent category
    updatedTree = updatedTree.filter(c => c.id !== categoryId && c.slug !== categoryId);
  }

  return await saveCategoriesTree(updatedTree);
}

/**
 * Toggle Visibility (Show / Hide from Menu & Homepage)
 */
export async function toggleCategoryVisibility(categoryId, parentId = null) {
  const currentTree = getCategoriesTree();
  let updatedTree = [...currentTree];

  if (parentId) {
    // Subcategory toggle
    updatedTree = updatedTree.map(cat => {
      if (cat.id === parentId || cat.slug === parentId) {
        const subs = (cat.subcategories || []).map(s => {
          if (s.id === categoryId || s.slug === categoryId) {
            return { ...s, hidden: !s.hidden };
          }
          return s;
        });
        return { ...cat, subcategories: subs };
      }
      return cat;
    });
  } else {
    // Parent category toggle
    updatedTree = updatedTree.map(cat => {
      if (cat.id === categoryId || cat.slug === categoryId) {
        return { ...cat, hidden: !cat.hidden };
      }
      return cat;
    });
  }

  return await saveCategoriesTree(updatedTree);
}

/**
 * Get simple list of category names for Product Editor dropdowns
 */
export function getAvailableCategories(products = []) {
  const tree = getCategoriesTree(products);
  const activeNames = tree.filter(c => !c.hidden).map(c => c.name);
  return Array.from(new Set(activeNames)).filter(c => c && c.toLowerCase().trim() !== 'human');
}

/**
 * Legacy compatibility helper for simple category creation in ProductEditorView
 */
export function createCategory(newCategoryName) {
  const cleanName = newCategoryName?.trim();
  if (!cleanName) throw new Error('Category name cannot be empty');

  saveCategory({ name: cleanName });
  return cleanName;
}
