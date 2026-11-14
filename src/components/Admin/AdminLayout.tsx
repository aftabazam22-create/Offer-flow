import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image,
  Layers,
  BookOpen,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Tag,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard.js';
import { AdminProducts } from './AdminProducts.js';
import { AdminOrders } from './AdminOrders.js';
import { AdminBanners } from './AdminBanners.js';
import { AdminCategories } from './AdminCategories.js';
import { AdminBlogs } from './AdminBlogs.js';
import { AdminCoupons } from './AdminCoupons.js';
import { AdminSettings } from './AdminSettings.js';
import { useStore } from '../../context/StoreContext.js';
import { api } from '../../services/api.js';
import { Order } from '../../types.js';

interface AdminLayoutProps {
  onNavigateStore: () => void;
  onBack: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateStore, onBack }) => {
  const { adminUser, logoutAdmin, showToast } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const selectAdminTab = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabHistory((prev) => [...prev, tab]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminBack = () => {
    if (tabHistory.length > 1) {
      const next = tabHistory.slice(0, -1);
      setTabHistory(next);
      setActiveTab(next[next.length - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setTabHistory(['dashboard']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const unsub = api.subscribeOrders((data) => {
      setOrders(data);
    });
    return () => unsub();
  }, []);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {}
    showToast('Logged out of Admin Panel');
    onNavigateStore();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products Catalog', icon: Package },
    {
      id: 'orders',
      label: 'Customer Orders',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'categories', label: 'Departments & Categories', icon: Layers },
    { id: 'banners', label: 'Banners & Flash Sale', icon: Image },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'blogs', label: 'Articles & Blogs', icon: BookOpen },
    { id: 'settings', label: 'Store & DB Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white px-3 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleAdminBack}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-all active:scale-90"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-sm">
              OF
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              Offer Flow <span className="text-rose-500 font-semibold text-xs ml-1">Admin Portal</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold">
            <Database className="w-3 h-3" />
            <span>Firestore Live</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[160px]">
              <strong className="text-white">{adminUser?.name || adminUser?.email || 'Admin'}</strong>
            </span>
          </div>

          <button
            onClick={onNavigateStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs h-fit space-y-1 shrink-0 sticky top-20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectAdminTab(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-rose-600' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div
            className="md:hidden fixed inset-0 top-[52px] z-50 bg-black/50 backdrop-blur-xs flex flex-col p-4"
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              className="bg-white rounded-2xl p-4 shadow-xl space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      selectAdminTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive ? 'bg-rose-600 text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              orders={orders}
              onSelectTab={(t) => selectAdminTab(t)}
              onNavigateStore={onNavigateStore}
            />
          )}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
          {activeTab === 'banners' && <AdminBanners />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'coupons' && <AdminCoupons />}
          {activeTab === 'blogs' && <AdminBlogs />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
