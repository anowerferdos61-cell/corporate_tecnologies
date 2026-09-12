import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Layers,
  Edit3,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { PRODUCT_CATEGORIES, CATEGORY_DEFAULT_IMAGES } from '../adminConstants';
import { exportToCsv, parseCsv, downloadSampleProductCsv } from '../../../lib/csvHelper';

export default function ProductsTab({
  products = [],
  globalSearch = '',
  initialStockFilter = 'all',
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onImportProducts = () => {},
  isSuperAdmin = true
}) {
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState(initialStockFilter || 'all');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const totalProductsCount = products.length;
  const inStockProducts = products.filter((p) => (p.stock_quantity ?? 25) > 5);
  const lowStockProducts = products.filter((p) => (p.stock_quantity ?? 25) > 0 && (p.stock_quantity ?? 25) <= 5);
  const outOfStockProducts = products.filter((p) => (p.stock_quantity ?? 25) === 0);

  // Filter Products
  const filteredProducts = products.filter((prod) => {
    if (productCategoryFilter !== 'All' && prod.category !== productCategoryFilter) {
      return false;
    }
    const stock = prod.stock_quantity ?? 25;
    if (productStockFilter === 'instock' && stock <= 5) return false;
    if (productStockFilter === 'lowstock' && (stock === 0 || stock > 5)) return false;
    if (productStockFilter === 'outofstock' && stock !== 0) return false;

    const query = (productSearch || globalSearch).trim().toLowerCase();
    if (query) {
      const matchTitle = prod.title?.toLowerCase().includes(query);
      const matchSku = prod.sku?.toLowerCase().includes(query);
      const matchCat = prod.category?.toLowerCase().includes(query);
      if (!matchTitle && !matchSku && !matchCat) return false;
    }
    return true;
  });

  // Export Products to CSV
  function handleExportCsv() {
    if (filteredProducts.length === 0) {
      alert('No products available to export.');
      return;
    }

    const columns = [
      { key: 'title', label: 'title' },
      { key: 'category', label: 'category' },
      { key: 'brand', label: 'brand' },
      { key: 'regular_price', label: 'regular_price' },
      { key: 'sale_price', label: 'sale_price' },
      { key: 'discount_label', label: 'discount_label' },
      { key: 'stock_quantity', label: 'stock_quantity' },
      { key: 'sku', label: 'sku' },
      { key: 'short_description', label: 'short_description' },
      { key: 'image_url', label: 'image_url' }
    ];

    const rows = filteredProducts.map(p => ({
      title: p.title,
      category: p.category,
      brand: p.brand || 'Corporate Tech',
      regular_price: p.regular_price || 0,
      sale_price: p.sale_price || p.regular_price || 0,
      discount_label: p.discount_label || '',
      stock_quantity: p.stock_quantity ?? 20,
      sku: p.sku || `CT-${p.id}`,
      short_description: p.short_description || '',
      image_url: p.image_url || ''
    }));

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`corporate_tech_products_${dateStr}.csv`, columns, rows);
  }

  // Import Products from CSV
  async function handleCsvFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const parsedRows = await parseCsv(file);
      if (parsedRows.length === 0) {
        alert('No data rows found in uploaded CSV file.');
        return;
      }

      // Convert parsed CSV rows into product format
      const importedProducts = parsedRows.map((r, idx) => {
        const reg = Number(r['regular_price'] || r['Regular Price'] || 0);
        const sale = Number(r['sale_price'] || r['Sale Price'] || reg);
        const cat = r['category'] || r['Category'] || 'Printers';
        return {
          id: `imp-prod-${Date.now()}-${idx}`,
          title: r['title'] || r['Title'] || `Imported Product #${idx + 1}`,
          category: cat,
          brand: r['brand'] || r['Brand'] || 'Corporate Tech',
          regular_price: reg,
          sale_price: sale,
          discount_label: r['discount_label'] || r['Discount'] || (reg > sale ? `-${Math.round(((reg - sale) / reg) * 100)}%` : null),
          stock_quantity: Number(r['stock_quantity'] || r['Stock'] || 20),
          sku: r['sku'] || r['SKU'] || `CT-${Math.floor(1000 + Math.random() * 9000)}`,
          short_description: r['short_description'] || r['Description'] || '',
          image_url: r['image_url'] || r['Image URL'] || CATEGORY_DEFAULT_IMAGES[cat] || CATEGORY_DEFAULT_IMAGES['Printers'],
          created_at: new Date().toISOString()
        };
      });

      onImportProducts(importedProducts);
      alert(`Successfully imported ${importedProducts.length} products into the catalog!`);
    } catch (err) {
      alert('Failed to parse product CSV file: ' + err.message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Product Catalog</h2>
          <p className="text-xs text-slate-500">
            Manage store inventory, upload images, update prices and stock levels
          </p>
        </div>

        {/* Action Buttons: Import, Export, Sample, and + New Product */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvFileChange}
          />

          <button
            onClick={downloadSampleProductCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted sample CSV file for Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Template</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Import products in bulk from CSV spreadsheet"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export products list to CSV Excel file"
          >
            <Download className="w-3.5 h-3.5 text-[#c92127]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="bg-[#c92127] hover:bg-[#b01b20] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Product</span>
          </button>
        </div>
      </div>

      {/* Stock Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => setProductStockFilter('all')}
          className={`p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
            productStockFilter === 'all'
              ? 'bg-white border-black ring-1 ring-black shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 block">All Products</span>
          <span className="text-xl font-black text-slate-900 font-mono">{totalProductsCount}</span>
        </button>

        <button
          onClick={() => setProductStockFilter('instock')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            productStockFilter === 'instock'
              ? 'bg-white border-emerald-600 ring-1 ring-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">In Stock (&gt;5)</span>
          <span className="text-xl font-black text-emerald-700 font-mono">{inStockProducts.length}</span>
        </button>

        <button
          onClick={() => setProductStockFilter('lowstock')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            productStockFilter === 'lowstock'
              ? 'bg-white border-amber-500 ring-1 ring-amber-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Low Stock (1-5)</span>
          <span className="text-xl font-black text-amber-700 font-mono">{lowStockProducts.length}</span>
        </button>

        <button
          onClick={() => setProductStockFilter('outofstock')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            productStockFilter === 'outofstock'
              ? 'bg-white border-rose-500 ring-1 ring-rose-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-rose-600 block">Out of Stock (0)</span>
          <span className="text-xl font-black text-rose-700 font-mono">{outOfStockProducts.length}</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search product title, SKU, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c92127]"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#c92127]"
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No products found matching filters.</p>
            <p className="text-[11px] text-slate-400">Try adjusting category or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Regular Price</th>
                  <th className="py-3.5 px-4">Sale Price</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => {
                  const stock = prod.stock_quantity ?? 20;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Title & Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={prod.image_url || CATEGORY_DEFAULT_IMAGES['Printers']}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="max-w-xs">
                            <span className="font-bold text-slate-900 line-clamp-1 block">
                              {prod.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              SKU: {prod.sku || `CT-${prod.id}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Regular Price */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 line-through">
                        ৳{Number(prod.regular_price || 0).toLocaleString()}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        ৳{Number(prod.sale_price || prod.regular_price || 0).toLocaleString()}
                      </td>

                      {/* Discount Badge */}
                      <td className="py-3.5 px-4">
                        {prod.discount_label ? (
                          <span className="bg-red-50 text-[#c92127] border border-red-100 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {prod.discount_label}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                          stock > 5
                            ? 'bg-emerald-50 text-emerald-700'
                            : stock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {stock} pcs
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEditModal(prod)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-black hover:border-slate-400 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => onDeleteProduct(prod.id, prod.title)}
                              title="Delete Product (Super Admin Only)"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
