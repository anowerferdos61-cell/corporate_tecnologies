import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Layers,
  ChevronRight,
  Package,
  AlertCircle
} from 'lucide-react';

export default function OverviewTab({
  orders = [],
  products = [],
  onViewAllOrders,
  onViewProductCatalog,
  onSelectOrder
}) {
  // Financial & Order calculations
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.order_status === 'confirmed' || o.order_status === 'processing').length;
  const deliveredOrdersCount = orders.filter((o) => o.order_status === 'delivered').length;
  const totalRevenue = orders
    .filter((o) => o.order_status === 'delivered' || o.payment_status === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.grand_total) || 0), 0);

  // Products stock stats
  const totalProductsCount = products.length;
  const lowStockProducts = products.filter((p) => (p.stock_quantity ?? 25) > 0 && (p.stock_quantity ?? 25) <= 5);
  const outOfStockProducts = products.filter((p) => (p.stock_quantity ?? 25) === 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ৳{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            From {deliveredOrdersCount} delivered/paid orders
          </p>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {orders.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {confirmedOrdersCount} currently in processing
          </p>
        </div>

        {/* 3. Pending Orders (Attention) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Action
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#c92127] font-mono">
            {pendingOrdersCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requires confirmation / courier assignment
          </p>
        </div>

        {/* 4. Products & Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Product Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalProductsCount}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {lowStockProducts.length + outOfStockProducts.length} low/out-of-stock items
          </p>
        </div>
      </div>

      {/* Section Header with Quick Action */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ACTIVE & RECENT ORDERS
            </span>
            <p className="text-sm font-semibold text-slate-700">
              Showing latest customer orders requiring dispatch
            </p>
          </div>
          <button
            onClick={onViewAllOrders}
            className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No orders recorded yet.
            </div>
          ) : (
            orders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 flex-shrink-0 font-bold text-xs">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {order.order_number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        order.order_status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : order.order_status === 'shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.order_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.customer_name} • {order.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Items
                    </span>
                    <span className="font-medium text-slate-700">
                      {order.order_items?.length || 1} Products
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Amount
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ৳{Number(order.grand_total).toLocaleString()}
                    </span>
                  </div>

                  <div className="hidden md:block">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Date
                    </span>
                    <span className="text-slate-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectOrder(order)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-700 hover:text-black transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Low Stock Alert ({lowStockProducts.length} items)
              </h3>
            </div>
            <button
              onClick={onViewProductCatalog}
              className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
            >
              View in Catalog →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                <span className="truncate max-w-[180px] font-medium text-slate-800">
                  {p.title}
                </span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Qty: {p.stock_quantity ?? 3}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
