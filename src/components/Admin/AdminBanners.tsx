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
} from 'lucide-react';
import { Banner, FlashSaleConfig } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';

export const AdminBanners: React.FC = () => {
  const { banners, flashSale: liveFlashSale, showToast } = useStore();
  const [flashSale, setFlashSale] = useState<FlashSaleConfig | null>(liveFlashSale);
  const [savingFlash, setSavingFlash] = useState(false);

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

      {/* Hero & Promo Banners List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <h2 className="text-xl font-black text-slate-900">Banners & Advertisements</h2>
            <p className="text-xs text-slate-500">Custom dynamic sliders and promotional tiles</p>
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

      {/* Inline Delete Confirmation */}
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

      {/* Modal */}
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
    </div>
  );
};
