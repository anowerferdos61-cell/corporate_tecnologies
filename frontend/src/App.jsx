import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Root from './layouts/Root';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import CategoryPage from './components/CategoryPage';
import ProductDetailPage from './components/ProductDetailPage';
import ComparePage from './components/ComparePage';
import BlogPage from './components/BlogPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { getProducts } from './lib/supabaseClient';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products from Supabase (with automatic fallback)
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
  }, []);

  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
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
            {/* 1. Home Page */}
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

            {/* 7. Dedicated Customer Account & Order Dashboard */}
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

            {/* 8. Catch-All Fallback -> Home */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
