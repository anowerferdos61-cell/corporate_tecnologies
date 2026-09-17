import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  isAdminAuthenticated,
  getAdminSession,
  logoutAdmin
} from '../lib/adminAuth';
import {
  fetchAdminOrders,
  updateOrderStatus,
  updateCourierDispatch,
  deleteOrder,
  fetchAdminCustomers,
  fetchStoreSettings
} from '../lib/adminOrderService';
import {
  createProductOnSupabase,
  updateProductOnSupabase,
  deleteProductFromSupabase
} from '../lib/supabaseClient';

// Modular Admin Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminLoginView from '../components/admin/AdminLoginView';
import OverviewTab from '../components/admin/tabs/OverviewTab';
import OrdersTab from '../components/admin/tabs/OrdersTab';
import ProductsTab from '../components/admin/tabs/ProductsTab';
import CategoriesTab from '../components/admin/tabs/CategoriesTab';
import CustomersTab from '../components/admin/tabs/CustomersTab';
import SettingsTab from '../components/admin/tabs/SettingsTab';
import AnalyticsTab from '../components/admin/tabs/AnalyticsTab';
import BannersTab from '../components/admin/tabs/BannersTab';
import NavbarTab from '../components/admin/tabs/NavbarTab';
import OrderDetailsDrawer from '../components/admin/modals/OrderDetailsDrawer';
import ProductEditorView from '../components/admin/ProductEditorView';
import OrderInvoiceModal from '../components/OrderInvoiceModal';

const VALID_TABS = ['overview', 'orders', 'products', 'categories', 'customers', 'analytics', 'banners', 'navbar', 'settings'];

export default function AdminPanelPage({ products = [], onProductsUpdate = () => {} }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => isAdminAuthenticated());
  const [adminSession, setAdminSession] = useState(() => getAdminSession());

  const adminRole = adminSession?.role || 'super_admin';
  const isSuperAdmin = adminRole === 'super_admin';

  // Hybrid URL Sync: URL Query Params (?tab=orders)
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const initialTab = VALID_TABS.includes(urlTab) ? urlTab : 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('corp_tech_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Keep state in sync with URL changes (e.g. Browser Back / Forward buttons)
  useEffect(() => {
    if (urlTab && VALID_TABS.includes(urlTab) && urlTab !== activeTab) {
      setActiveTab(urlTab);
    } else if (!urlTab && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [urlTab]);

  // Tab change handler that pushes to URL
  const handleTabChange = (newTab) => {
    if (!VALID_TABS.includes(newTab)) return;
    setActiveTab(newTab);
    if (newTab === 'overview') {
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: false });
    } else {
      setSearchParams({ tab: newTab }, { replace: false });
    }
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('corp_tech_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Auto-protect restricted tabs for staff
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'settings') {
      handleTabChange('orders');
    }
  }, [activeTab, isSuperAdmin]);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Products Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Settings State
  const [insideDhakaFee, setInsideDhakaFee] = useState(60);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState(120);
  const [defaultCourier, setDefaultCourier] = useState('Steadfast');

  // Load Data on Authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
    loadCustomers();
    loadSettings();
  }, [isAuthenticated]);

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const data = await fetchAdminOrders();
      let localImported = [];
      try {
        localImported = JSON.parse(localStorage.getItem('corp_tech_local_orders') || '[]');
      } catch (e) {}
      const existingIds = new Set((data || []).map(o => o.id || o.order_number));
      const newLocal = localImported.filter(o => !existingIds.has(o.id || o.order_number));
      setOrders([...newLocal, ...(data || [])]);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    try {
      const data = await fetchAdminCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const allSettings = await fetchStoreSettings();
      if (allSettings?.delivery_charges) {
        setInsideDhakaFee(Number(allSettings.delivery_charges.inside_dhaka) || 60);
        setOutsideDhakaFee(Number(allSettings.delivery_charges.outside_dhaka) || 120);
      }
      if (allSettings?.courier_settings?.default_courier) {
        setDefaultCourier(allSettings.courier_settings.default_courier);
      }
    } catch (err) {
      console.warn('Could not load store settings:', err);
    }
  }

  // Logout Handler
  function handleLogout() {
    if (window.confirm('Are you sure you want to sign out from the Admin Portal?')) {
      logoutAdmin();
      setIsAuthenticated(false);
      setAdminSession(null);
    }
  }

  // Order Handlers
  async function handleStatusChange(orderId, newStatus) {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  }

  async function handleCourierUpdate(orderId, courierPayload) {
    const updated = await updateCourierDispatch(orderId, courierPayload);
    if (courierPayload.adminNotes !== undefined) {
      await updateOrderStatus(orderId, updated.order_status, courierPayload.adminNotes);
    }
    const merged = { ...updated, admin_notes: courierPayload.adminNotes };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? merged : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(merged);
    }
  }

  async function handleDeleteOrder(orderId, orderNumber) {
    if (!window.confirm(`Are you sure you want to permanently delete order ${orderNumber}?`)) return;
    try {
      await deleteOrder(orderId);
    } catch (err) {
      console.warn('Backend delete notice:', err.message);
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      const existing = JSON.parse(localStorage.getItem('corp_tech_local_orders') || '[]');
      localStorage.setItem('corp_tech_local_orders', JSON.stringify(existing.filter((o) => o.id !== orderId)));
    } catch (e) {}
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
  }

  function handleImportOrders(newOrders) {
    setOrders((prev) => [...newOrders, ...prev]);
    try {
      const existing = JSON.parse(localStorage.getItem('corp_tech_local_orders') || '[]');
      localStorage.setItem('corp_tech_local_orders', JSON.stringify([...newOrders, ...existing]));
    } catch (e) {
      console.warn('Could not cache imported orders:', e);
    }
  }

  // Product Handlers
  async function handleSaveProduct(productPayload, existingId = null) {
    if (existingId) {
      const updated = await updateProductOnSupabase(existingId, productPayload);
      onProductsUpdate((prev) =>
        prev.map((p) =>
          String(p.id) === String(existingId) || (productPayload.slug && p.slug === productPayload.slug)
            ? { ...p, ...updated }
            : p
        )
      );
    } else {
      const created = await createProductOnSupabase(productPayload);
      onProductsUpdate((prev) => [created, ...prev]);
    }
  }

  async function handleDeleteProduct(id, title) {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProductFromSupabase(id);
      onProductsUpdate((prev) => prev.filter((p) => p.id !== id));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  }

  async function handleImportProducts(newProds) {
    for (const prod of newProds) {
      try {
        await createProductOnSupabase(prod);
      } catch (e) {
        console.warn('Import product persist warning:', e);
      }
    }
    onProductsUpdate((prev) => [...newProds, ...prev]);
  }

  // If not authenticated, render Login View
  if (!isAuthenticated) {
    return (
      <AdminLoginView
        onLoginSuccess={(session) => {
          setIsAuthenticated(true);
          setAdminSession(session);
        }}
      />
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased">
      {/* 1. Left Sidebar (Desktop persistent, mobile slide-over drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pendingOrdersCount={pendingOrdersCount}
        totalOrdersCount={orders.length}
        totalProductsCount={products.length}
        totalCustomersCount={customers.length}
        adminRole={adminRole}
        adminUsername={adminSession?.name || adminSession?.username || 'Admin'}
        onLogout={handleLogout}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Right Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Top Header */}
        <AdminHeader
          activeTab={activeTab}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onRefresh={() => {
            loadOrders();
            loadCustomers();
          }}
          adminUsername={adminSession?.name || adminSession?.username || 'Admin'}
          adminRole={adminRole}
          onOpenMobileSidebar={() => setIsMobileNavOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebarCollapse}
          onOpenAddProduct={() => setIsAddingProduct(true)}
        />

        {/* Dynamic Tab Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 flex-1">
          {activeTab === 'overview' && (
            <OverviewTab
              orders={orders}
              products={products}
              onViewAllOrders={() => handleTabChange('orders')}
              onViewProductCatalog={() => handleTabChange('products')}
              onSelectOrder={setSelectedOrder}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              ordersLoading={ordersLoading}
              globalSearch={globalSearch}
              onSelectOrder={setSelectedOrder}
              onPrintInvoice={setInvoiceOrder}
              onDeleteOrder={handleDeleteOrder}
              onImportOrders={handleImportOrders}
              isSuperAdmin={isSuperAdmin}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              globalSearch={globalSearch}
              onOpenAddModal={() => setIsAddingProduct(true)}
              onOpenEditModal={(prod) => setEditingProduct(prod)}
              onDeleteProduct={handleDeleteProduct}
              onImportProducts={handleImportProducts}
              isSuperAdmin={isSuperAdmin}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab products={products} />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              customers={customers}
              orders={orders}
              customersLoading={customersLoading}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              orders={orders}
              products={products}
            />
          )}

          {activeTab === 'banners' && (
            <BannersTab />
          )}

          {activeTab === 'navbar' && (
            <NavbarTab />
          )}

          {activeTab === 'settings' && isSuperAdmin && (
            <SettingsTab
              insideDhakaFee={insideDhakaFee}
              outsideDhakaFee={outsideDhakaFee}
              defaultCourier={defaultCourier}
              isSuperAdmin={isSuperAdmin}
              onDeliveryFeesUpdated={(inFee, outFee) => {
                setInsideDhakaFee(inFee);
                setOutsideDhakaFee(outFee);
              }}
              onCourierUpdated={(cr) => setDefaultCourier(cr)}
            />
          )}
        </main>
      </div>

      {/* 3. Order Details Slide-Over Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onCourierUpdate={handleCourierUpdate}
          onPrintInvoice={setInvoiceOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      )}

      {/* 4. Full Page Dedicated Add / Edit Product View */}
      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f8fafc]">
          <ProductEditorView
            product={editingProduct}
            allProducts={products}
            onClose={() => {
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
            onSaveProduct={handleSaveProduct}
          />
        </div>
      )}

      {/* 5. Official Invoice & Packing Slip Modal */}
      {invoiceOrder && (
        <OrderInvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
