import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Percent,
  X,
  Loader2,
  Tag
} from 'lucide-react';
import {
  fetchCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon
} from '../../../lib/couponService';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percentage'
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscountLimit, setMaxDiscountLimit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  }

  function copyCode(text, id) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleToggle(id, currentStatus) {
    try {
      const updated = await toggleCouponStatus(id, !currentStatus);
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    } catch (err) {
      alert('Failed to update coupon status: ' + err.message);
    }
  }

  async function handleDelete(id, code) {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      alert('Coupon deleted successfully!');
    } catch (err) {
      alert('Failed to delete coupon: ' + err.message);
    }
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      alert('Please provide a coupon code and discount value.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCoupon = await createCoupon({
        code: code.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountLimit: maxDiscountLimit ? Number(maxDiscountLimit) : null,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        isActive
      });

      setCoupons(prev => [newCoupon, ...prev.filter(c => c.code !== newCoupon.code)]);
      setIsModalOpen(false);
      resetForm();
      alert(`Coupon "${newCoupon.code}" created successfully!`);
    } catch (err) {
      alert('Failed to create coupon: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setCode('');
    setDiscountType('fixed');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscountLimit('');
    setExpiryDate('');
    setIsActive(true);
  }

  const activeCount = coupons.filter(c => c.is_active).length;
  const totalUsages = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Discount Coupons & Promotions</h2>
          <p className="text-xs text-slate-500">
            Create and manage promo discount codes for customer checkout
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#c92127] hover:bg-[#b01b20] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Coupon</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Coupons</span>
          <span className="text-xl font-black text-slate-900 font-mono">{coupons.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block">Active Coupons</span>
          <span className="text-xl font-black text-emerald-700 font-mono">{activeCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600 block">Inactive / Paused</span>
          <span className="text-xl font-black text-amber-700 font-mono">{coupons.length - activeCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-600 block">Total Redemptions</span>
          <span className="text-xl font-black text-blue-700 font-mono">{totalUsages}</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#c92127] animate-spin mx-auto" />
            <span className="text-xs text-slate-500 font-medium">Loading coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No discount coupons created yet.</p>
            <p className="text-[11px] text-slate-400">Click "+ New Coupon" to create your first promotion.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Min. Cart Value</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Usage Count</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Code & Copy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon.code, coupon.id)}
                          className="text-slate-400 hover:text-black cursor-pointer p-0.5"
                          title="Copy Code"
                        >
                          {copiedId === coupon.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                          {coupon.discount_value}% OFF {coupon.max_discount_limit ? `(Max ৳${coupon.max_discount_limit})` : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                          ৳{Number(coupon.discount_value).toLocaleString()} FLAT
                        </span>
                      )}
                    </td>

                    {/* Min Order Amount */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {coupon.min_order_amount > 0 ? (
                        <span>৳{Number(coupon.min_order_amount).toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400">No Minimum</span>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {coupon.expiry_date ? (
                        new Date(coupon.expiry_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-slate-400 italic">No Expiry</span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {coupon.usage_count || 0} times
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.is_active)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          coupon.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{coupon.is_active ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        title="Delete Coupon"
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden my-6 animate-scale">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#c92127]" />
                <h3 className="font-bold text-sm sm:text-base">Create Discount Coupon</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. EID2026, SPLASH10, FLAT500"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              {/* Discount Type */}
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    discountType === 'fixed'
                      ? 'bg-red-50 border-[#c92127] text-slate-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={discountType === 'fixed'}
                    onChange={() => setDiscountType('fixed')}
                    className="accent-[#c92127]"
                  />
                  <span>Fixed Amount (৳)</span>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                    discountType === 'percentage'
                      ? 'bg-red-50 border-[#c92127] text-slate-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="discountType"
                    value="percentage"
                    checked={discountType === 'percentage'}
                    onChange={() => setDiscountType('percentage')}
                    className="accent-[#c92127]"
                  />
                  <span>Percentage (%)</span>
                </label>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Discount Value {discountType === 'fixed' ? '(৳ Amount)' : '(% Percent)'} *
                </label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'fixed' ? '500' : '10'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              {/* Min Order & Max Limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Min. Cart Total (৳)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountLimit}
                    onChange={(e) => setMaxDiscountLimit(e.target.value)}
                    placeholder="Optional"
                    disabled={discountType === 'fixed'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127] disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#c92127]"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-[#c92127] focus:ring-[#c92127]"
                />
                <label htmlFor="coupon_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate this coupon immediately
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#c92127] hover:bg-[#b01b20] text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Coupon</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
