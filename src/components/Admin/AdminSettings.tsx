import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  Phone,
  Truck,
  Bell,
  ShieldCheck,
  Database,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { SiteSettings } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import { compressImageFile } from '../../utils/imageUtils.js';
import firebaseConfig from '../../../firebase-applet-config.json';

function sanitizeNumericInput(val: string): string {
  const digits = val.replace(/[^0-9]/g, '');
  if (digits === '') return '';
  return digits.replace(/^0+(?=\d)/, '');
}

export const AdminSettings: React.FC = () => {
  const { settings, adminUser, showToast } = useStore();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [dhakaChargeText, setDhakaChargeText] = useState(
    String(settings.deliveryChargeInsideDhaka ?? 70)
  );
  const [outsideChargeText, setOutsideChargeText] = useState(
    String(settings.deliveryChargeOutsideDhaka ?? 120)
  );
  const [freeThresholdText, setFreeThresholdText] = useState(
    String(settings.freeDeliveryThreshold ?? 3000)
  );
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData(settings);
    setDhakaChargeText(String(settings.deliveryChargeInsideDhaka ?? 70));
    setOutsideChargeText(String(settings.deliveryChargeOutsideDhaka ?? 120));
    setFreeThresholdText(String(settings.freeDeliveryThreshold ?? 3000));
  }, [settings]);

  const handleLogoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const dataUrl = await compressImageFile(file, 400, 0.85, 160000);
      const next: SiteSettings = { ...formData, logoUrl: dataUrl };
      setFormData(next);
      await api.updateSettings(next);
      showToast('Store picture updated & published!');
    } catch {
      showToast('Failed to upload store picture');
    } finally {
      setUploadingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    const next: SiteSettings = { ...formData, logoUrl: '' };
    setFormData(next);
    try {
      await api.updateSettings(next);
      showToast('Store picture removed');
    } catch {
      showToast('Failed to remove store picture');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: SiteSettings = {
      ...formData,
      deliveryChargeInsideDhaka: Math.max(0, Number(dhakaChargeText) || 0),
      deliveryChargeOutsideDhaka: Math.max(0, Number(outsideChargeText) || 0),
      freeDeliveryThreshold: Math.max(0, Number(freeThresholdText) || 0),
    };
    try {
      await api.updateSettings(payload);
      showToast('Settings saved to Cloud Firestore');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            System &amp; Marketplace Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure store picture, logistics, WhatsApp numbers, and cloud database
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Firebase Cloud Database Status */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cloud Firestore Database Connected</h2>
              <p className="text-[11px] text-slate-400">
                Project: <span className="font-mono text-slate-200">{firebaseConfig.projectId}</span> • Admin UID:{' '}
                <span className="font-mono text-slate-200">{adminUser?.uid}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Store Picture / Logo & Brand Identity */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-600" />
          <span>Store Picture, Identity &amp; WhatsApp Ordering</span>
        </h2>

        {/* Store Picture Uploader */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt={formData.websiteName || 'Store Logo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[9px] font-bold uppercase">No Pic</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Store Profile Picture / Logo</h3>
              <p className="text-[11px] text-slate-500">
                Shown in the storefront header, mobile menu, footer, and admin portal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoFileSelected}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingLogo ? 'Uploading...' : 'Upload Store Picture'}</span>
              </button>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <input
              type="text"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="Or paste store image URL..."
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Site Title</label>
            <input
              type="text"
              value={formData.websiteName}
              onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              WhatsApp Order Number (e.g. 01745329020) *
            </label>
            <input
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-600 font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              International prefix 88 will be automatically handled for wa.me links.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>
        </div>
      </div>

      {/* Logistics & Delivery Rates */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Bangladesh Delivery Rates &amp; Free Shipping</span>
          </h2>

          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={Boolean(formData.freeDeliveryEnabled)}
              onChange={async (e) => {
                const enabled = e.target.checked;
                const next: SiteSettings = {
                  ...formData,
                  freeDeliveryEnabled: enabled,
                  deliveryChargeInsideDhaka: Math.max(0, Number(dhakaChargeText) || 0),
                  deliveryChargeOutsideDhaka: Math.max(0, Number(outsideChargeText) || 0),
                  freeDeliveryThreshold: Math.max(0, Number(freeThresholdText) || 0),
                };
                setFormData(next);
                try {
                  await api.updateSettings(next);
                  showToast(
                    enabled
                      ? 'Free Delivery option turned ON'
                      : 'Free Delivery option turned OFF (Standard charges apply)'
                  );
                } catch {
                  showToast('Failed to update Free Delivery setting');
                }
              }}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span className="text-xs font-bold text-slate-800">Free Delivery Option</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                formData.freeDeliveryEnabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {formData.freeDeliveryEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        <p className="text-[11px] text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
          {formData.freeDeliveryEnabled
            ? `Free delivery is currently ON for orders of ${freeThresholdText || 0}৳ or more.`
            : 'Free delivery is currently OFF. Customers will always pay standard Inside/Outside Dhaka delivery charges even on orders above ৳3,000.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Delivery Inside Dhaka (৳)</label>
            <input
              type="text"
              inputMode="numeric"
              value={dhakaChargeText}
              placeholder="70"
              onChange={(e) => {
                const clean = sanitizeNumericInput(e.target.value);
                setDhakaChargeText(clean);
                setFormData({ ...formData, deliveryChargeInsideDhaka: Number(clean) || 0 });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Delivery Outside Dhaka (৳)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={outsideChargeText}
              placeholder="120"
              onChange={(e) => {
                const clean = sanitizeNumericInput(e.target.value);
                setOutsideChargeText(clean);
                setFormData({ ...formData, deliveryChargeOutsideDhaka: Number(clean) || 0 });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div className={formData.freeDeliveryEnabled ? '' : 'opacity-60'}>
            <label className="block font-bold text-slate-700 mb-1">
              Free Delivery Threshold (৳){' '}
              {!formData.freeDeliveryEnabled && (
                <span className="text-[10px] font-semibold text-slate-400">(OFF)</span>
              )}
            </label>
            <input
              type="text"
              inputMode="numeric"
              disabled={!formData.freeDeliveryEnabled}
              value={freeThresholdText}
              placeholder="3000"
              onChange={(e) => {
                const clean = sanitizeNumericInput(e.target.value);
                setFreeThresholdText(clean);
                setFormData({ ...formData, freeDeliveryThreshold: Number(clean) || 0 });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Top Announcement Banner</span>
          </h2>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={formData.announcementBarActive}
              onChange={(e) =>
                setFormData({ ...formData, announcementBarActive: e.target.checked })
              }
              className="accent-rose-600"
            />
            <span>Show Announcement Bar</span>
          </label>
        </div>

        <div className="text-xs">
          <label className="block font-bold text-slate-700 mb-1">Banner Announcement Text</label>
          <input
            type="text"
            value={formData.announcementBarText}
            onChange={(e) => setFormData({ ...formData, announcementBarText: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Footer Branding Credit */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span>Footer Copyright &amp; Creator Credit</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Copyright Line</label>
            <input
              type="text"
              value={formData.footerCopyright}
              onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Creator Attribution</label>
            <input
              type="text"
              value={formData.footerCredit}
              onChange={(e) => setFormData({ ...formData, footerCredit: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/25 transition-all"
        >
          {saving ? 'Saving...' : 'Save Site Settings'}
        </button>
      </div>
    </form>
  );
};
