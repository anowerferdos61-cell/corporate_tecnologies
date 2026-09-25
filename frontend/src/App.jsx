import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import Root from './layouts/Root';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import { getProducts } from './lib/supabaseClient';

// Lazy-loaded routes for code-splitting (dramatically reduces initial JS payload)
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));

// Lightweight page transition fallback
function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-3 border-[#c92127] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-400 animate-pulse tracking-wide uppercase">
        Loading...
      </p>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products from Supabase (with automatic fallback & real-time update sync)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen for live product additions/edits across tabs and admin panels
    const handleProductsChange = async () => {
      try {
        const updated = await getProducts();
        setProducts(updated);
      } catch (e) {
        console.error('Failed to refresh products:', e);
      }
    };

    window.addEventListener('ct_products_updated', handleProductsChange);
    window.addEventListener('storage', handleProductsChange);

    return () => {
      window.removeEventListener('ct_products_updated', handleProductsChange);
      window.removeEventListener('storage', handleProductsChange);
    };
  }, []);

  return (
    <SettingsProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Secret Standalone Admin Panel - Completely hidden from all public menus and pages */}
              <Route 
                path="adminpanel" 
                element={
                  <AdminPanelPage 
                    products={products} 
                    onProductsUpdate={setProducts} 
                  />
                } 
              />
              <Route 
                path="admin" 
                element={<Navigate to="/adminpanel" replace />} 
              />

              {/* Persistent Root Layout with Header, Footer, Drawers & Modals */}
              <Route 
                path="/" 
                element={
                  <Root 
                    products={products} 
                    setProducts={setProducts} 
                    loading={loading} 
                  />
                }
              >
                {/* 1. Home Page (Eagerly loaded for instant first paint) */}
                <Route 
                  index 
                  element={
                    <HomePage 
                      products={products} 
                      loading={loading} 
                    />
                  } 
                />

                {/* 2. Shop Page (All Products) */}
                <Route 
                  path="shop" 
                  element={
                    <CategoryPage 
                      products={products} 
                      categorySlug="shop" 
                    />
                  } 
                />

                {/* 3. Category & Sub-Category Pages */}
                <Route 
                  path="product-category/:categorySlug" 
                  element={<CategoryPage products={products} />} 
                />
                <Route 
                  path="product-category/:categorySlug/:subCategorySlug" 
                  element={<CategoryPage products={products} />} 
                />

                {/* 4. Product Detail Page */}
                <Route 
                  path="product/:productSlug" 
                  element={<ProductDetailPage allProducts={products} />} 
                />

                {/* 5. Product Comparison Page */}
                <Route 
                  path="compare" 
                  element={<ComparePage allProducts={products} />} 
                />

                {/* 6. Blog & Tech Guides */}
                <Route 
                  path="blog" 
                  element={<BlogPage />} 
                />
                <Route 
                  path="blog/:slug" 
                  element={<BlogDetailPage allProducts={products} />} 
                />

                {/* 7. Dedicated Checkout Page & Cart Redirect */}
                <Route 
                  path="checkout" 
                  element={<CheckoutPage />} 
                />
                <Route 
                  path="cart" 
                  element={<Navigate to="/checkout" replace />} 
                />

                {/* 8. Dedicated Customer Account & Order Dashboard */}
                <Route 
                  path="my-account" 
                  element={<CustomerDashboardPage products={products} />} 
                />
                <Route 
                  path="account" 
                  element={<CustomerDashboardPage products={products} />} 
                />
                <Route 
                  path="dashboard" 
                  element={<CustomerDashboardPage products={products} />} 
                />

                {/* 9. Catch-All Fallback -> Home */}
                <Route 
                  path="*" 
                  element={<Navigate to="/" replace />} 
                />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </SettingsProvider>
  );
}
