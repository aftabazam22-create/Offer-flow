import React, { useState, useEffect } from 'react';
import {
  Save,
  Phone,
  Truck,
  Bell,
  ShieldCheck,
  Database,
  RefreshCw,
} from 'lucide-react';
import { SiteSettings } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';
import firebaseConfig from '../../../firebase-applet-config.json';

export const AdminSettings: React.FC = () => {
  const { settings, adminUser, showToast } = useStore();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(formData);
      showToast('Settings saved to Cloud Firestore');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const res = await api.seedDefaultsToFirestore(true);
      showToast(
        res.seededCollections > 0
          ? `Synced ${res.seededCollections} collection(s) to Firestore!`
          : 'All default catalog items are already persisted in Firestore!'
      );
    } catch {
      showToast('Failed to sync default catalog');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            System & Marketplace Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure logistics, WhatsApp numbers, policies, and Firebase cloud database
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

          <button
            type="button"
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Missing Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Brand & Hotlines */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-600" />
          <span>Identity & WhatsApp Ordering Number</span>
        </h2>

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
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>Bangladesh Delivery Rates & Free Shipping</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Delivery Inside Dhaka (৳)</label>
            <input
              type="number"
              value={formData.deliveryChargeInsideDhaka}
              onChange={(e) =>
                setFormData({ ...formData, deliveryChargeInsideDhaka: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Delivery Outside Dhaka (৳)
            </label>
            <input
              type="number"
              value={formData.deliveryChargeOutsideDhaka}
              onChange={(e) =>
                setFormData({ ...formData, deliveryChargeOutsideDhaka: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Free Delivery Threshold (৳)
            </label>
            <input
              type="number"
              value={formData.freeDeliveryThreshold}
              onChange={(e) =>
                setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600"
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
          <span>Footer Copyright & Creator Credit</span>
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
