import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Flame,
  Upload,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Banner, Advertisement, FlashSaleConfig } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';

export const AdminBanners: React.FC = () => {
  const { banners, ads, flashSale: liveFlashSale, showToast } = useStore();
  const [flashSale, setFlashSale] = useState<FlashSaleConfig | null>(liveFlashSale);
  const [savingFlash, setSavingFlash] = useState(false);

  // Banner modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    badge: 'HOT DEAL',
    buttonText: 'Shop Now',
    link: '/shop',
    placement: 'homepage_hero' as Banner['placement'],
    showOnHomepage: true,
    isActive: true,
    order: 1,
  });

  // Special Promotion (Advertisement) states
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Advertisement | null>(null);
  const [deletePromoTarget, setDeletePromoTarget] = useState<Advertisement | null>(null);
  const [deletingPromo, setDeletingPromo] = useState(false);
  const [uploadingPromoImage, setUploadingPromoImage] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);
  const [togglingPromoId, setTogglingPromoId] = useState<string | null>(null);
  const promoFileInputRef = useRef<HTMLInputElement>(null);

  const [promoForm, setPromoForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'Shop The Collection',
    targetUrl: '/shop',
    placement: 'promo_section' as Advertisement['placement'],
    showOnHomepage: true,
    isActive: true,
  });

  useEffect(() => {
    setFlashSale(liveFlashSale);
  }, [liveFlashSale]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await compressImageFile(file, 960, 0.78, 300000);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      showToast('Banner image compressed & attached');
    } catch {
      showToast('Failed to process image');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePromoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPromoImage(true);
    try {
      const dataUrl = await compressImageFile(file, 800, 0.78, 280000);
      setPromoForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('Promotion image compressed & attached');
    } catch {
      showToast('Failed to process image');
    } finally {
      setUploadingPromoImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: 'Mega Savings Week',
      subtitle: 'Exclusive discounts on smart watches, audio & accessories.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      badge: 'LIMITED OFFER',
      buttonText: 'Claim Offer',
      link: '/shop',
      placement: 'homepage_hero',
      showOnHomepage: true,
      isActive: true,
      order: banners.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      badge: b.badge || '',
      buttonText: b.buttonText || 'Shop Now',
      link: b.link || '/shop',
      placement: b.placement,
      showOnHomepage: b.showOnHomepage,
      isActive: b.isActive,
      order: b.order || 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      showToast('Please select or upload a banner image');
      return;
    }
    setSavingBanner(true);
    try {
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, formData);
        showToast('Banner updated in Firestore');
      } else {
        await api.createBanner(formData);
        showToast('Banner created & published live');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Error saving banner');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await api.deleteBanner(id);
      setDeleteId(null);
      showToast('Banner deleted');
    } catch {
      showToast('Error deleting banner');
    }
  };

  // Special Promotion handlers
  const handleOpenAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      title: 'Special Combo Offer',
      subtitle: 'Door-to-door express dispatch across 64 districts in Bangladesh.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=85',
      buttonText: 'Shop The Collection',
      targetUrl: '/shop',
      placement: 'promo_section',
      showOnHomepage: true,
      isActive: true,
    });
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (ad: Advertisement) => {
    setEditingPromo(ad);
    setPromoForm({
      title: ad.title,
      subtitle: ad.subtitle || '',
      image: ad.image,
      buttonText: ad.buttonText || 'Shop The Collection',
      targetUrl: ad.targetUrl || '/shop',
      placement: ad.placement || 'promo_section',
      showOnHomepage: ad.showOnHomepage,
      isActive: ad.isActive,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.title.trim()) {
      showToast('Please enter a promotion title');
      return;
    }
    if (!promoForm.image.trim()) {
      showToast('Please upload or paste a promotion image');
      return;
    }
    setSavingPromo(true);
    try {
      if (editingPromo) {
        await api.updateAdvertisement(editingPromo.id, promoForm);
        showToast('Special Promotion updated!');
      } else {
        await api.createAdvertisement(promoForm);
        showToast('New Special Promotion published live!');
      }
      setIsPromoModalOpen(false);
      setEditingPromo(null);
    } catch {
      showToast('Error saving Special Promotion');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (ad: Advertisement) => {
    setTogglingPromoId(ad.id);
    try {
      await api.updateAdvertisement(ad.id, { isActive: !ad.isActive });
      showToast(`Promotion ${!ad.isActive ? 'activated' : 'hidden'}`);
    } catch {
      showToast('Error updating promotion');
    } finally {
      setTogglingPromoId(null);
    }
  };

  const handleConfirmDeletePromo = async () => {
    if (!deletePromoTarget) return;
    setDeletingPromo(true);
    try {
      await api.deleteAdvertisement(deletePromoTarget.id);
      showToast('Special Promotion deleted permanently');
      setDeletePromoTarget(null);
    } catch {
      showToast('Error deleting promotion');
    } finally {
      setDeletingPromo(false);
    }
  };

  const handleSaveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashSale) return;
    setSavingFlash(true);
    try {
      await api.updateFlashSale(flashSale);
      showToast('Flash sale campaign settings saved');
    } catch {
      showToast('Failed to save flash sale');
    } finally {
      setSavingFlash(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Flash Sale Campaign Box */}
      {flashSale && (
        <form
          onSubmit={handleSaveFlashSale}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-50 text-red-600">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Flash Sale Campaign Settings</h2>
                <p className="text-xs text-slate-500">
                  Configures live homepage countdown timer & flash discounts
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={flashSale.isActive}
                onChange={(e) => setFlashSale({ ...flashSale, isActive: e.target.checked })}
                className="accent-rose-600 w-4 h-4 rounded"
              />
              <span>Campaign Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Campaign Headline</label>
              <input
                type="text"
                value={flashSale.title}
                onChange={(e) => setFlashSale({ ...flashSale, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Discount Tag (e.g. UP TO 50% OFF)
              </label>
              <input
                type="text"
                value={flashSale.discountHighlight || ''}
                onChange={(e) => setFlashSale({ ...flashSale, discountHighlight: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                End Time (Countdown target)
              </label>
              <input
                type="datetime-local"
                value={(() => {
                  if (!flashSale.endTime) return '';
                  const d = new Date(flashSale.endTime);
                  if (Number.isNaN(d.getTime())) return '';
                  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                })()}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const parsed = new Date(e.target.value);
                  if (!Number.isNaN(parsed.getTime())) {
                    setFlashSale({
                      ...flashSale,
                      endTime: parsed.toISOString(),
                    });
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-slate-500">
              Want more timed offers with custom products? Open <strong className="text-slate-800">Offer Campaigns</strong> from the menu.
            </p>
            <button
              type="submit"
              disabled={savingFlash}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 self-end sm:self-auto"
            >
              {savingFlash ? 'Saving...' : 'Update Flash Sale'}
            </button>
          </div>
        </form>
      )}

      {/* Special Promotions (Mid-Page Promo Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span>Special Promotions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add, edit, or delete the dark “Special Promotion” spotlight cards on your homepage ({ads.length})
            </p>
          </div>
          <button
            onClick={handleOpenAddPromo}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Special Promotion</span>
          </button>
        </div>

        {ads.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500">
              No Special Promotions right now. Click “Add Special Promotion” to publish one on the homepage.
            </p>
            <button
              onClick={handleOpenAddPromo}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Special Promotion</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-rose-600/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Special Promotion
                      </span>
                      <button
                        type="button"
                        disabled={togglingPromoId === ad.id}
                        onClick={() => handleTogglePromoActive(ad)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          ad.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/10 text-slate-300 border border-white/20'
                        }`}
                      >
                        {togglingPromoId === ad.id ? '...' : ad.isActive ? 'Active' : 'Paused'}
                      </button>
                    </div>
                    <h3 className="text-base font-black text-white leading-snug">{ad.title}</h3>
                    {ad.subtitle && (
                      <p className="text-xs text-slate-300 line-clamp-2">{ad.subtitle}</p>
                    )}
                  </div>

                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/15 shrink-0 bg-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300 truncate">
                    Button: <strong className="text-white">{ad.buttonText || 'Shop The Collection'}</strong> • Link: {ad.targetUrl || '/shop'}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPromo(ad)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletePromoTarget(ad)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hero & Promo Banners List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-slate-900">Hero Sliders & Banners</h2>
            <p className="text-xs text-slate-500">Top homepage sliders and announcement banners</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-md">
                    {b.placement}
                  </span>
                  {b.isActive ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-600 text-white text-[10px] font-bold">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900">{b.title}</h3>
                <p className="text-slate-500 line-clamp-2">{b.subtitle}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Link: {b.link}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(b.id)}
                      className="p-1.5 text-slate-600 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inline Banner Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Banner?</h3>
            <p className="text-xs text-slate-500">It will be removed from the homepage slider.</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBanner(deleteId)}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Promotion Delete Confirmation */}
      {deletePromoTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Special Promotion?</h3>
            <p className="text-xs text-slate-500">
              “{deletePromoTarget.title}” will be permanently deleted from your storefront.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deletingPromo}
                onClick={() => setDeletePromoTarget(null)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingPromo}
                onClick={handleConfirmDeletePromo}
                className="py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deletingPromo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingPromo ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">
                    Banner Image (Upload File or URL) *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadingImage ? 'Compressing...' : 'Upload from Files'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                </div>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-28 object-cover rounded-xl border border-slate-200"
                  />
                )}
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) =>
                      setFormData({ ...formData, showOnHomepage: e.target.checked })
                    }
                    className="accent-rose-600"
                  />
                  <span>Show on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBanner || uploadingImage}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingBanner && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Special Promotion Add / Edit Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPromo ? 'Edit Special Promotion' : 'Add Special Promotion'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPromoModalOpen(false);
                  setEditingPromo(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promotion Headline *</label>
                <input
                  type="text"
                  required
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  placeholder="e.g. Free Delivery on Orders over ৳3000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Offer Details</label>
                <textarea
                  rows={2}
                  value={promoForm.subtitle}
                  onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                  placeholder="e.g. Door-to-door express dispatch across 64 districts in Bangladesh."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">
                    Promotion Image (Upload File or URL) *
                  </label>
                  <button
                    type="button"
                    onClick={() => promoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadingPromoImage ? 'Compressing...' : 'Upload from Files'}</span>
                  </button>
                  <input
                    type="file"
                    ref={promoFileInputRef}
                    accept="image/*"
                    onChange={handlePromoFileSelected}
                    className="hidden"
                  />
                </div>
                {promoForm.image && (
                  <img
                    src={promoForm.image}
                    alt="Promo Preview"
                    className="w-28 h-28 object-cover rounded-2xl border border-slate-200"
                  />
                )}
                <input
                  type="text"
                  required
                  value={promoForm.image}
                  onChange={(e) => setPromoForm({ ...promoForm, image: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={promoForm.buttonText}
                    onChange={(e) => setPromoForm({ ...promoForm, buttonText: e.target.value })}
                    placeholder="Shop The Collection"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Link</label>
                  <input
                    type="text"
                    value={promoForm.targetUrl}
                    onChange={(e) => setPromoForm({ ...promoForm, targetUrl: e.target.value })}
                    placeholder="/shop"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={promoForm.showOnHomepage}
                    onChange={(e) =>
                      setPromoForm({ ...promoForm, showOnHomepage: e.target.checked })
                    }
                    className="accent-rose-600"
                  />
                  <span>Show on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={promoForm.isActive}
                    onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                    className="accent-rose-600"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPromoModalOpen(false);
                    setEditingPromo(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPromo || uploadingPromoImage}
                  className="px-5 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingPromo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPromo ? 'Update Promotion' : 'Publish Promotion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
