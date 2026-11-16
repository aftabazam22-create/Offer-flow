import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Flame,
  Clock,
  Search,
  Check,
  X,
  Loader2,
  AlertCircle,
  Package,
  Sparkles,
  Power,
} from 'lucide-react';
import { OfferCampaign, OfferCampaignTheme, Product } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';

const THEME_OPTIONS: {
  id: OfferCampaignTheme;
  label: string;
  swatch: string;
  badge: string;
}[] = [
  {
    id: 'crimson',
    label: 'Crimson Flame',
    swatch: 'from-rose-600 via-red-600 to-rose-700',
    badge: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'obsidian',
    label: 'Obsidian Luxe',
    swatch: 'from-slate-900 via-zinc-900 to-slate-800',
    badge: 'bg-slate-900 text-white',
  },
  {
    id: 'emerald',
    label: 'Emerald Deal',
    swatch: 'from-emerald-700 via-teal-700 to-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'amber',
    label: 'Golden Flash',
    swatch: 'from-amber-600 via-orange-600 to-amber-700',
    badge: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'indigo',
    label: 'Royal Indigo',
    swatch: 'from-indigo-700 via-violet-700 to-indigo-800',
    badge: 'bg-indigo-100 text-indigo-800',
  },
];

function toLocalDatetimeValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getDefaultEndTimeIso(hours = 72): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

function formatRemainingShort(endTime: string): { label: string; expired: boolean } {
  const diff = +new Date(endTime) - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { label: 'Expired', expired: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  if (days > 0) return { label: `${days}d ${hours}h left`, expired: false };
  if (hours > 0) return { label: `${hours}h ${mins}m left`, expired: false };
  return { label: `${Math.max(1, mins)}m left`, expired: false };
}

export const AdminOffers: React.FC = () => {
  const { offers, products, categories, formatPrice, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal form state
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [discountHighlight, setDiscountHighlight] = useState('SPECIAL OFFER');
  const [theme, setTheme] = useState<OfferCampaignTheme>('crimson');
  const [endTimeLocal, setEndTimeLocal] = useState(toLocalDatetimeValue(getDefaultEndTimeIso(72)));
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Product picker filters inside modal
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      map.set(p.id, p);
    }
    return map;
  }, [products]);

  const filteredPickerProducts = useMemo(() => {
    return products.filter((p) => {
      if (showSelectedOnly && !selectedProductIds.includes(p.id)) return false;
      if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const hit =
          p.name.toLowerCase().includes(q) ||
          (p.nameBn || '').toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [products, productSearch, productCategoryFilter, showSelectedOnly, selectedProductIds]);

  const openCreateModal = () => {
    setEditingOffer(null);
    setTitle('');
    setTitleBn('');
    setSubtitle('');
    setDiscountHighlight('UP TO 40% OFF');
    setTheme('obsidian');
    setEndTimeLocal(toLocalDatetimeValue(getDefaultEndTimeIso(72)));
    setIsActive(true);
    setOrder(offers.length + 1);
    setSelectedProductIds([]);
    setProductSearch('');
    setProductCategoryFilter('All');
    setShowSelectedOnly(false);
    setIsModalOpen(true);
  };

  const openEditModal = (offer: OfferCampaign) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setTitleBn(offer.titleBn || '');
    setSubtitle(offer.subtitle || '');
    setDiscountHighlight(offer.discountHighlight || 'SPECIAL OFFER');
    setTheme(offer.theme || 'crimson');
    setEndTimeLocal(
      toLocalDatetimeValue(offer.endTime) || toLocalDatetimeValue(getDefaultEndTimeIso(72))
    );
    setIsActive(offer.isActive);
    setOrder(offer.order || 1);
    setSelectedProductIds(offer.productIds || []);
    setProductSearch('');
    setProductCategoryFilter('All');
    setShowSelectedOnly(false);
    setIsModalOpen(true);
  };

  const toggleProductInOffer = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 100) {
        showToast('Maximum 100 products per offer campaign');
        return prev;
      }
      return [...prev, productId];
    });
  };

  const selectAllFiltered = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      for (const p of filteredPickerProducts) {
        if (next.size >= 100) break;
        next.add(p.id);
      }
      return Array.from(next);
    });
  };

  const applyDurationPreset = (hours: number) => {
    setEndTimeLocal(toLocalDatetimeValue(getDefaultEndTimeIso(hours)));
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an offer campaign title');
      return;
    }
    if (!endTimeLocal) {
      showToast('Please select an end date & time');
      return;
    }

    const parsedDate = new Date(endTimeLocal);
    if (Number.isNaN(parsedDate.getTime())) {
      showToast('Invalid end date & time');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<OfferCampaign> = {
        title: title.trim(),
        titleBn: titleBn.trim(),
        subtitle: subtitle.trim(),
        discountHighlight: discountHighlight.trim() || 'SPECIAL OFFER',
        theme,
        endTime: parsedDate.toISOString(),
        isActive,
        order: Number(order) || 1,
        productIds: selectedProductIds,
      };

      if (editingOffer) {
        await api.updateOffer(editingOffer.id, payload);
        showToast('Offer campaign updated & synced live');
      } else {
        await api.createOffer(payload);
        showToast('New offer campaign created & live');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Failed to save offer campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (offer: OfferCampaign) => {
    setTogglingId(offer.id);
    try {
      await api.updateOffer(offer.id, { isActive: !offer.isActive });
      showToast(offer.isActive ? 'Offer paused' : 'Offer activated live');
    } catch {
      showToast('Failed to toggle offer status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await api.deleteOffer(id);
      setDeleteId(null);
      showToast('Offer campaign deleted');
    } catch {
      showToast('Failed to delete offer campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>Custom Timed Campaigns</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 mt-0.5">Offer Campaigns</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create unlimited timed offers like Flash Sale, set countdowns, and pick products for each offer.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Offer Campaign</span>
        </button>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Custom Offer Campaigns Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create your first custom offer (e.g. Weekend Mega Deal, Eid Special, Gadget Bundle) with its own countdown timer and selected products.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Offer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {offers.map((offer) => {
            const themeMeta = THEME_OPTIONS.find((t) => t.id === offer.theme) || THEME_OPTIONS[0];
            const remaining = formatRemainingShort(offer.endTime);
            const assignedProducts = offer.productIds
              .map((pid) => productMap.get(pid))
              .filter((p): p is Product => Boolean(p));

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Top Theme Banner Strip */}
                <div className={`bg-gradient-to-r ${themeMeta.swatch} p-4 text-white space-y-2`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                      {offer.discountHighlight || 'SPECIAL OFFER'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          remaining.expired
                            ? 'bg-red-950/70 text-red-200'
                            : offer.isActive
                            ? 'bg-emerald-500/30 text-emerald-100'
                            : 'bg-black/40 text-slate-200'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {remaining.expired
                            ? 'Expired'
                            : offer.isActive
                            ? remaining.label
                            : 'Paused'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {offer.title}
                    </h3>
                    {offer.subtitle && (
                      <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                        {offer.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Body: Linked Products Preview */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-rose-600" />
                        <span>{assignedProducts.length} Products Added</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Order #{offer.order}</span>
                    </div>

                    {assignedProducts.length === 0 ? (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800 font-medium">
                        No products added yet. Click &quot;Manage Products&quot; to add items to this offer.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {assignedProducts.slice(0, 5).map((prod) => (
                          <div
                            key={prod.id}
                            className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5 pr-2.5 shrink-0 max-w-[175px]"
                          >
                            <img
                              src={prod.images[0] || ''}
                              alt={prod.name}
                              className="w-9 h-9 rounded-lg object-cover bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 truncate">
                                {prod.name}
                              </p>
                              <p className="text-[10px] font-extrabold text-rose-600">
                                {formatPrice(prod.discountPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {assignedProducts.length > 5 && (
                          <span className="text-[11px] font-bold text-slate-500 px-2 shrink-0">
                            +{assignedProducts.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      disabled={togglingId === offer.id}
                      onClick={() => handleToggleActive(offer)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
                        offer.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{offer.isActive ? 'Live' : 'Paused'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(offer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit &amp; Manage Products</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteId(offer.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Offer Campaign?</h3>
            <p className="text-xs text-slate-500">
              Products will remain in your catalog, only this offer campaign will be removed.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteOffer(deleteId)}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Offer Modal with Built-in Product Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  {editingOffer ? 'Edit Offer Campaign' : 'Create New Offer Campaign'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Configure campaign timer, style, and select products to showcase.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveOffer} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Offer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Offer Headline (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekend Mega Deal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Headline Bangla (Optional)
                  </label>
                  <input
                    type="text"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="যেমন: উইকেন্ড মেগা ডিল"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discount Highlight Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={discountHighlight}
                    onChange={(e) => setDiscountHighlight(e.target.value)}
                    placeholder="e.g. UP TO 45% OFF"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subtitle / Short Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Limited stock audio & smart gadgets"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Countdown End Time & Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label className="font-bold text-slate-700">
                      Offer End Time (Countdown Timer) *
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => applyDurationPreset(24)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                      >
                        +24h
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDurationPreset(72)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                      >
                        +3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => applyDurationPreset(168)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={endTimeLocal}
                    onChange={(e) => setEndTimeLocal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Order</label>
                    <input
                      type="number"
                      min={1}
                      value={order}
                      onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 pb-2 justify-end">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              {/* Theme Color Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Campaign Card Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                        theme === opt.id
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-lg bg-gradient-to-br ${opt.swatch} shrink-0`}
                      />
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Selector */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-rose-600" />
                      <span>Select Products for This Offer ({selectedProductIds.length} selected)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Click products below to add or remove them from this offer section.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowSelectedOnly((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        showSelectedOnly
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Selected ({selectedProductIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Select Shown
                    </button>
                    {selectedProductIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProductIds([])}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-red-600 hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Search + Category filter */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product by name, SKU, or brand..."
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Checklist */}
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {filteredPickerProducts.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">
                      No matching products found.
                    </p>
                  ) : (
                    filteredPickerProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => toggleProductInOffer(prod.id)}
                          className={`cursor-pointer flex items-center justify-between gap-3 p-2 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                              : 'bg-white border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={prod.images[0] || ''}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="truncate">{prod.category}</span>
                                <span>•</span>
                                <span className="font-extrabold text-rose-600">
                                  {formatPrice(prod.discountPrice)}
                                </span>
                                {prod.price > prod.discountPrice && (
                                  <span className="line-through text-slate-400">
                                    {formatPrice(prod.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                              isSelected
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'bg-slate-50 border-slate-300 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingOffer ? 'Save Offer Changes' : 'Publish Offer Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
