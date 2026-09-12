import React, { useState } from 'react';
import { Search, Users, Loader2 } from 'lucide-react';

export default function CustomersTab({
  customers = [],
  orders = [],
  customersLoading = false,
  globalSearch = ''
}) {
  const [customerSearch, setCustomerSearch] = useState('');

  // Filter Customers
  const filteredCustomers = customers.filter((cust) => {
    const query = (customerSearch || globalSearch).trim().toLowerCase();
    if (query) {
      const matchName = cust.full_name?.toLowerCase().includes(query);
      const matchPhone = cust.phone?.toLowerCase().includes(query);
      const matchCity = cust.city?.toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Customer Directory</h2>
          <p className="text-xs text-slate-500">
            Directory of registered customers and lifetime purchasing history
          </p>
        </div>
      </div>

      {/* Customers Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Search customer by name, phone number, or city..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c92127]"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {customersLoading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#c92127] animate-spin mx-auto" />
            <span className="text-xs text-slate-500 font-medium">Loading customers...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No customer records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Delivery Address</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const custOrders = orders.filter((o) => o.phone === cust.phone);
                  const totalSpend = custOrders.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {cust.full_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {cust.address ? `${cust.address}, ${cust.city || 'Dhaka'}` : cust.city || 'Dhaka'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {custOrders.length} orders
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-700">
                        ৳{totalSpend.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {cust.created_at ? new Date(cust.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
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
