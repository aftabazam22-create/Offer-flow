import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Check, X, Loader2, Edit2 } from 'lucide-react';
import { Coupon } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';

export const AdminCoupons: React.FC = () => {
  const { formatPrice, showToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sanitizeNum = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') return '';
    return digits.replace(/^0+(?=\d)/, '');
  };

  const defaultForm = {
    code: '',
    type: 'percentage' as Coupon['type'],
    value: '10',
    minOrderValue: '1000',
    maxDiscount: '500',
    usageLimit: '500',
    isActive: true,
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    const unsub = api.subscribeCoupons(
      (data) => {
        setCoupons(data);
        setLoading(false);
      },
      () => {
        showToast('Failed to load coupons');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (cpn: Coupon) => {
    setEditingCoupon(cpn);
    setFormData({
      code: cpn.code,
      type: cpn.type,
      value: String(cpn.value ?? 0),
      minOrderValue: String(cpn.minOrderValue ?? 0),
      maxDiscount: String(cpn.maxDiscount ?? 0),
      usageLimit: String(cpn.usageLimit ?? 500),
      isActive: cpn.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) return;

    setSaving(true);
    try {
      const payload = {
        code: cleanCode,
        type: formData.type,
        value: Math.max(0, Number(formData.value) || 0),
        minOrderValue: Math.max(0, Number(formData.minOrderValue) || 0),
        maxDiscount: Math.max(0, Number(formData.maxDiscount) || 0),
        usageLimit: Math.max(0, Number(formData.usageLimit) || 0),
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        await api.updateCoupon(editingCoupon.id, payload);
        showToast(`Coupon ${cleanCode} updated`);
      } else {
        await api.createCoupon(payload);
        showToast(`Coupon ${cleanCode} created`);
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      setFormData(defaultForm);
    } catch {
      showToast('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    try {
      await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      showToast(`Coupon ${coupon.code} ${!coupon.isActive ? 'activated' : 'paused'}`);
    } catch {
      showToast('Error updating coupon');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteCoupon(deleteTarget.id);
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast(`Coupon ${deleteTarget.code} deleted permanently`);
      setDeleteTarget(null);
    } catch {
      showToast('Error deleting coupon. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-rose-600" />
            <span>Discount Coupons</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage promotional codes used inside the shopping cart and checkout ({coupons.length})
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">
            Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No coupons found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Create your first discount coupon code for customers to apply in cart or checkout.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Coupon</span>
            </button>
          </div>
        ) : (
          coupons.map((cpn) => (
            <div
              key={cpn.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block font-mono font-black text-base text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    {cpn.code}
                  </span>
                  <p className="text-xs font-bold text-rose-600 mt-2">
                    {cpn.type === 'percentage'
                      ? `${cpn.value}% OFF${cpn.maxDiscount > 0 ? ` (up to ${formatPrice(cpn.maxDiscount)})` : ''}`
                      : `${formatPrice(cpn.value)} Flat Discount`}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleActive(cpn)}
                  disabled={togglingId === cpn.id}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors disabled:opacity-50 ${
                    cpn.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {togglingId === cpn.id ? '...' : cpn.isActive ? 'Active' : 'Paused'}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <div>Min Order: <strong>{formatPrice(cpn.minOrderValue)}</strong></div>
                <div>Used: <strong>{cpn.timesUsed}</strong> / {cpn.usageLimit || '∞'}</div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  onClick={() => openEditModal(cpn)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(cpn)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="text-base font-bold text-slate-900">
              Delete Coupon <span className="font-mono text-rose-600">{deleteTarget.code}</span>?
            </h3>
            <p className="text-xs text-slate-500">
              This coupon will be permanently removed and can no longer be used at checkout.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingCoupon ? `Edit Coupon (${editingCoupon.code})` : 'Create Discount Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCoupon(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WINTER15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Coupon['type'] })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="10"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: sanitizeNum(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order (৳)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1000"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: sanitizeNum(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount (৳)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="500"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: sanitizeNum(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usage Limit (0 = ∞)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="500"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: sanitizeNum(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Active immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCoupon(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingCoupon ? 'Update Coupon' : 'Save Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
