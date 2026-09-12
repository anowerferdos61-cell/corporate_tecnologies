import React, { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { exportToCsv } from '../../../lib/csvHelper';

export default function AnalyticsTab({ orders = [], products = [] }) {
  const [datePreset, setDatePreset] = useState('month'); // 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  
  // Custom date range state (default to current month)
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [customStart, setCustomStart] = useState(thirtyDaysAgoStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  // 1. Calculate Date Range Bounds
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let label = 'Last 30 Days';

    if (datePreset === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Today (আজকের সেলস)';
    } else if (datePreset === 'yesterday') {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      label = 'Yesterday (গতকালের সেলস)';
    } else if (datePreset === 'week') {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Last 7 Days (এই সপ্তাহের সেলস)';
    } else if (datePreset === 'month') {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      label = 'Last 30 Days (এই মাসের সেলস)';
    } else if (datePreset === 'custom') {
      start = new Date(customStart || thirtyDaysAgoStr);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEnd || todayStr);
      end.setHours(23, 59, 59, 999);
      label = `Custom (${customStart} to ${customEnd})`;
    }

    return { startDate: start, endDate: end, periodLabel: label };
  }, [datePreset, customStart, customEnd, thirtyDaysAgoStr, todayStr]);

  // 2. Filter Orders in Selected Date Range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o.created_at) return true;
      const orderDate = new Date(o.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, startDate, endDate]);

  // 3. Financial Metrics
  const totalPeriodRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.order_status !== 'cancelled')
      .reduce((acc, curr) => acc + (Number(curr.grand_total) || 0), 0);
  }, [filteredOrders]);

  const deliveredRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.order_status === 'delivered')
      .reduce((acc, curr) => acc + (Number(curr.grand_total) || 0), 0);
  }, [filteredOrders]);

  const deliveredOrdersCount = filteredOrders.filter((o) => o.order_status === 'delivered').length;
  const pendingOrdersCount = filteredOrders.filter((o) => o.order_status === 'pending').length;
  const inTransitOrdersCount = filteredOrders.filter((o) => o.order_status === 'shipped' || o.order_status === 'processing').length;
  const cancelledOrdersCount = filteredOrders.filter((o) => o.order_status === 'cancelled').length;

  const totalOrdersCount = filteredOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalPeriodRevenue / totalOrdersCount) : 0;
  const deliverySuccessRate = totalOrdersCount > 0 ? Math.round((deliveredOrdersCount / totalOrdersCount) * 100) : 0;

  // 4. Daily Sales Timeline Data (For Bar Graph)
  const dailyTimelineData = useMemo(() => {
    const daysMap = {};
    // Pre-populate days in range (up to 31 days)
    const cur = new Date(startDate);
    const maxDays = 31;
    let count = 0;
    while (cur <= endDate && count < maxDays) {
      const key = cur.toISOString().slice(0, 10);
      daysMap[key] = {
        dateStr: key,
        displayLabel: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      };
      cur.setDate(cur.getDate() + 1);
      count++;
    }

    filteredOrders.forEach((o) => {
      if (!o.created_at || o.order_status === 'cancelled') return;
      const d = o.created_at.slice(0, 10);
      if (daysMap[d]) {
        daysMap[d].revenue += Number(o.grand_total) || 0;
        daysMap[d].orders += 1;
      }
    });

    return Object.values(daysMap);
  }, [filteredOrders, startDate, endDate]);

  const maxDailyRevenue = Math.max(...dailyTimelineData.map((d) => d.revenue), 1);

  // 5. Category & Brand Breakdown
  const { categoryStats, brandStats } = useMemo(() => {
    const catMap = {
      'Printers': 0,
      'Splashjet Inks': 0,
      'Photocopiers': 0,
      'Toners & Spares': 0,
      'Thermal & POS': 0,
      'Other Supplies': 0
    };

    const brandMap = {
      'Epson': 0,
      'Splashjet': 0,
      'Canon': 0,
      'HP': 0,
      'Brother': 0,
      'Others': 0
    };

    let totalSoldAmount = 0;

    filteredOrders.forEach((order) => {
      if (order.order_status === 'cancelled') return;
      const orderRevenue = Number(order.grand_total) || 0;
      totalSoldAmount += orderRevenue;

      const items = order.order_items || [];
      if (items.length === 0) {
        catMap['Printers'] += orderRevenue;
        brandMap['Epson'] += orderRevenue;
        return;
      }

      items.forEach((item) => {
        const title = (item.product_title || '').toLowerCase();
        const price = (Number(item.unit_price) || 1000) * (Number(item.quantity) || 1);

        // Category matching
        if (title.includes('ink') || title.includes('splashjet') || title.includes('bottle') || title.includes('refill')) {
          catMap['Splashjet Inks'] += price;
        } else if (title.includes('toner') || title.includes('cartridge')) {
          catMap['Toners & Spares'] += price;
        } else if (title.includes('photocopy') || title.includes('copier') || title.includes('duplicator')) {
          catMap['Photocopiers'] += price;
        } else if (title.includes('thermal') || title.includes('pos') || title.includes('barcode')) {
          catMap['Thermal & POS'] += price;
        } else if (title.includes('printer') || title.includes('ecotank') || title.includes('l3250') || title.includes('l3110')) {
          catMap['Printers'] += price;
        } else {
          catMap['Other Supplies'] += price;
        }

        // Brand matching
        if (title.includes('epson')) {
          brandMap['Epson'] += price;
        } else if (title.includes('splashjet')) {
          brandMap['Splashjet'] += price;
        } else if (title.includes('canon')) {
          brandMap['Canon'] += price;
        } else if (title.includes('hp') || title.includes('laserjet')) {
          brandMap['HP'] += price;
        } else if (title.includes('brother')) {
          brandMap['Brother'] += price;
        } else {
          brandMap['Others'] += price;
        }
      });
    });

    const formatBreakdown = (map) => {
      const sum = Object.values(map).reduce((a, b) => a + b, 0) || 1;
      return Object.entries(map)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: Math.round((amount / sum) * 100)
        }))
        .sort((a, b) => b.amount - a.amount);
    };

    return {
      categoryStats: formatBreakdown(catMap),
      brandStats: formatBreakdown(brandMap)
    };
  }, [filteredOrders]);

  // 6. Top Selling Products in Range
  const topProductsList = useMemo(() => {
    const prodMap = {};

    filteredOrders.forEach((order) => {
      if (order.order_status === 'cancelled') return;
      (order.order_items || []).forEach((item) => {
        const title = item.product_title || 'General Product';
        if (!prodMap[title]) {
          prodMap[title] = {
            title,
            quantity: 0,
            revenue: 0
          };
        }
        prodMap[title].quantity += Number(item.quantity) || 1;
        prodMap[title].revenue += (Number(item.unit_price) || 0) * (Number(item.quantity) || 1);
      });
    });

    return Object.values(prodMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);
  }, [filteredOrders]);

  // 7. Export Analytics CSV
  const handleExportAnalyticsCsv = () => {
    const columns = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' }
    ];

    const rows = [
      { metric: 'Report Period', value: periodLabel },
      { metric: 'Total Period Revenue (COD)', value: `৳${totalPeriodRevenue.toLocaleString()}` },
      { metric: 'Delivered Revenue', value: `৳${deliveredRevenue.toLocaleString()}` },
      { metric: 'Total Orders', value: totalOrdersCount },
      { metric: 'Delivered Orders', value: deliveredOrdersCount },
      { metric: 'Pending Orders', value: pendingOrdersCount },
      { metric: 'In-Transit Orders', value: inTransitOrdersCount },
      { metric: 'Cancelled Orders', value: cancelledOrdersCount },
      { metric: 'Average Order Value (AOV)', value: `৳${aov.toLocaleString()}` },
      { metric: 'Delivery Success Rate', value: `${deliverySuccessRate}%` }
    ];

    exportToCsv(`corporate_tech_analytics_${datePreset}_${todayStr}.csv`, columns, rows);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 1. Header Toolbar with Date Presets & Custom Range */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Sales Reports & Analytics</h2>
            <span className="text-[11px] font-bold bg-red-50 text-[#c92127] border border-red-200 px-2 py-0.5 rounded-full">
              Live Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time revenue performance, date-range filtering, and category distribution
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'today', label: 'Today (আজ)' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'month', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Range' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === p.id
                    ? 'bg-black text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportAnalyticsCsv}
            className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download CSV report for current date range"
          >
            <Download className="w-3.5 h-3.5 text-[#c92127]" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Accordion */}
      {datePreset === 'custom' && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-4 animate-fadeIn text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#c92127]" />
            <span className="font-bold text-slate-700">তারিখ নির্বাচন করুন (Select Range):</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">From:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#c92127]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">To:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#c92127]"
            />
          </div>

          <span className="text-slate-400 text-[11px]">
            Showing results for {filteredOrders.length} orders
          </span>
        </div>
      )}

      {/* 2. Executive KPI Cards for Selected Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Period Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Period Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            ৳{totalPeriodRevenue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Delivered:</span>
            <span className="font-bold text-emerald-600">৳{deliveredRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Orders in Period */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            {totalOrdersCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Delivered: {deliveredOrdersCount}</span>
            <span className="text-amber-600 font-bold">Pending: {pendingOrdersCount}</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Order Value (AOV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
            ৳{aov.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Average basket value per checkout
          </div>
        </div>

        {/* Delivery Completion Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivery Success
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#c92127] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#c92127] font-mono tracking-tight">
            {deliverySuccessRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            {deliveredOrdersCount} of {totalOrdersCount} orders successfully delivered
          </div>
        </div>
      </div>

      {/* 3. Daily Sales Timeline Graph */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#c92127]" />
              <span>Daily Revenue Trend ({periodLabel})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Daily revenue fluctuation and order volume during the selected timeframe
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Peak: ৳{maxDailyRevenue.toLocaleString()}
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end gap-1 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            {dailyTimelineData.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100));
              const hasSales = day.revenue > 0;
              return (
                <div
                  key={idx}
                  className="flex-1 min-w-[28px] max-w-[50px] flex flex-col items-center gap-1 group relative cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap font-mono">
                      <p className="font-bold text-amber-300">৳{day.revenue.toLocaleString()}</p>
                      <p className="text-slate-300">{day.orders} order(s) • {day.dateStr}</p>
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      hasSales
                        ? 'bg-gradient-to-t from-slate-900 to-[#c92127] group-hover:from-black group-hover:to-[#b91c1c] shadow-2xs'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  ></div>

                  {/* Date Label */}
                  <span className="text-[9px] text-slate-400 font-mono truncate w-full text-center group-hover:text-slate-900 group-hover:font-bold">
                    {day.displayLabel.split(' ')[1] || day.displayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Two Column Section: Category & Brand Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c92127]" />
                <span>Sales by Category (ক্যাটাগরি ভিত্তিক বিক্রয়)</span>
              </h3>
              <p className="text-xs text-slate-400">Printers vs Splashjet Inks vs Toners</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">
                      ৳{cat.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`h-full rounded-full transition-all ${
                      idx === 0
                        ? 'bg-[#c92127]'
                        : idx === 1
                        ? 'bg-black'
                        : idx === 2
                        ? 'bg-slate-600'
                        : 'bg-slate-400'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Sales by Brand (ব্র্যান্ড ভিত্তিক বিক্রয়)</span>
              </h3>
              <p className="text-xs text-slate-400">Epson vs Splashjet vs Canon vs HP</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {brandStats.map((brand, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{brand.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">
                      ৳{brand.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                      {brand.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${brand.percentage}%` }}
                    className={`h-full rounded-full transition-all ${
                      idx === 0
                        ? 'bg-[#c92127]'
                        : idx === 1
                        ? 'bg-black'
                        : idx === 2
                        ? 'bg-blue-600'
                        : 'bg-slate-400'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Top Selling Products Leaderboard */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#c92127]" />
              <span>Top Selling Products ({periodLabel})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Highest-selling models and supplies during this reporting window
            </p>
          </div>
        </div>

        {topProductsList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No product sales recorded in this date range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3 text-center">Units Sold</th>
                  <th className="pb-3 text-right pr-2">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topProductsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[11px] ${
                        idx === 0
                          ? 'bg-[#c92127] text-white'
                          : idx === 1
                          ? 'bg-black text-white'
                          : idx === 2
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 text-slate-900 font-semibold max-w-md truncate">
                      {item.title}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-slate-700">
                      {item.quantity} units
                    </td>
                    <td className="py-3 text-right pr-2 font-mono font-black text-slate-900">
                      ৳{item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
