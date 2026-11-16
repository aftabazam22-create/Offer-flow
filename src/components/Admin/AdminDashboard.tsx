import React from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Layers,
  Image,
  BookOpen,
  Settings,
  ArrowRight,
  ExternalLink,
  Tag,
  Flame,
} from 'lucide-react';
import { Order } from '../../types.js';
import { useStore } from '../../context/StoreContext.js';

interface AdminDashboardProps {
  orders: Order[];
  onSelectTab: (tab: string) => void;
  onNavigateStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  onSelectTab,
  onNavigateStore,
}) => {
  const { products, categories, offers, formatPrice } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const lowStockAlerts = products.filter((p) => p.stock < 5).length;
  const uniqueCustomers = new Set(orders.map((o) => o.phone).filter(Boolean)).size;
  const recentOrders = orders.slice(0, 6);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      subtitle: 'From active & completed orders',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Total Orders',
      value: orders.length,
      subtitle: `${pendingOrders} waiting for confirmation`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Catalog Products',
      value: products.length,
      subtitle: `${lowStockAlerts} items low in stock (<5)`,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Customers',
      value: uniqueCustomers,
      subtitle: 'Unique mobile numbers',
      icon: Users,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
            Firebase Cloud Control Center
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white mt-1">
            Offer Flow Command Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent Firestore database • Live customer order confirmation • Instant storefront sync
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNavigateStore}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
            <span>View Live Website</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Modules Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {[
          { id: 'products', label: 'Products', count: products.length, icon: Package },
          { id: 'orders', label: 'Orders', count: orders.length, icon: ShoppingCart },
          { id: 'categories', label: 'Categories', count: categories.length, icon: Layers },
          { id: 'offers', label: 'Offer Campaigns', count: offers.length, icon: Flame },
          { id: 'banners', label: 'Banners & Flash', icon: Image },
          { id: 'coupons', label: 'Coupons', icon: Tag },
          { id: 'blogs', label: 'Blog Posts', icon: BookOpen },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((mod) => {
          const ModIcon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => onSelectTab(mod.id)}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-rose-500 hover:shadow-md transition-all text-left group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600 flex items-center justify-center transition-colors">
                <ModIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 block">
                  {mod.label}
                </span>
                {mod.count !== undefined && (
                  <span className="text-[10px] text-slate-400">{mod.count} records</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Live incoming Firestore checkout orders</p>
          </div>
          <button
            onClick={() => onSelectTab('orders')}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold text-slate-800">{ord.customerName}</td>
                    <td className="p-3 font-mono text-slate-600">{ord.phone}</td>
                    <td className="p-3 text-slate-500">{ord.district}</td>
                    <td className="p-3 font-extrabold text-rose-600">{formatPrice(ord.total)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          ord.status === 'delivered' || ord.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : ord.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
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
};
