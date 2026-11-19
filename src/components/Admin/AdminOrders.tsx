import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  CheckCircle2,
  Truck,
  Mail,
  Loader2,
  Package,
  MessageSquareText,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderItem } from '../../types.js';
import { api } from '../../services/api.js';
import { useStore } from '../../context/StoreContext.js';

const STATUS_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const AdminOrders: React.FC = () => {
  const { products, formatPrice, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const resolveItemImage = (it: OrderItem) => {
    if (it.image) return it.image;
    const match = products.find((p) => p.id === it.productId);
    return match?.images?.[0] || '';
  };
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [quickActionId, setQuickActionId] = useState<string | null>(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  useEffect(() => {
    const unsub = api.subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusNote(ord.statusNote || '');
    setInternalNotes(ord.internalNotes || '');
  };

  const handleQuickStatus = async (ord: Order, nextStatus: Order['status']) => {
    setQuickActionId(ord.id);
    try {
      await api.updateOrderStatus(ord.id, nextStatus, ord.internalNotes);
      showToast(`Order ${ord.orderNumber} marked as ${nextStatus}!`);
    } catch {
      showToast('Failed to update order status');
    } finally {
      setQuickActionId(null);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await api.updateOrderStatus(selectedOrder.id, newStatus, internalNotes, statusNote);
      showToast(`Order ${selectedOrder.orderNumber} updated & synced to customer tracking!`);
      setSelectedOrder(null);
    } catch {
      showToast('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deleteConfirmOrder) return;
    setDeletingOrder(true);
    try {
      await api.deleteOrder(deleteConfirmOrder.id);
      showToast(`Order ${deleteConfirmOrder.orderNumber} permanently deleted`);
      if (selectedOrder?.id === deleteConfirmOrder.id) {
        setSelectedOrder(null);
      }
      setDeleteConfirmOrder(null);
    } catch {
      showToast('Failed to delete order');
    } finally {
      setDeletingOrder(false);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Orders & Shipments</h1>
          <p className="text-xs text-slate-500">
            Total {orders.length} live orders • Confirm orders in 1 click to update customer tracking instantly
          </p>
        </div>
      </div>

      {/* Status Filter Pills with Counts */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.id === 'all' ? orders.length : orders.filter((o) => o.status === tab.id).length;
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Customer Name, Phone, Address..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading live orders...</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No matching orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {ord.paymentMethod}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a
                          href={`https://wa.me/88${ord.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-600 hover:underline inline-flex items-center gap-1 text-[11px]"
                          title="Chat on WhatsApp"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{ord.phone}</span>
                        </a>
                      </div>
                      {ord.email && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{ord.email}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                        {ord.address}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1.5">
                        {ord.items.map((it, idx) => {
                          const thumb = resolveItemImage(it);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={it.productName}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                  <Package className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="truncate max-w-[180px]">
                                  <span className="font-semibold">{it.quantity}x</span> {it.productName}
                                </div>
                                {it.selectedColor && (
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    Color: {it.selectedColor}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {ord.customerNote && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium max-w-[210px] truncate">
                            <MessageSquareText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ord.customerNote}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-rose-600 block">
                        {formatPrice(ord.total)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Delivery: {formatPrice(ord.deliveryFee)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleQuickStatus(ord, 'confirmed')}
                            disabled={quickActionId === ord.id}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirm</span>
                          </button>
                        )}
                        {(ord.status === 'confirmed' || ord.status === 'processing') && (
                          <button
                            onClick={() => handleQuickStatus(ord, 'shipped')}
                            disabled={quickActionId === ord.id}
                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Ship</span>
                          </button>
                        )}
                        {ord.status === 'shipped' && (
                          <button
                            onClick={() => handleQuickStatus(ord, 'delivered')}
                            disabled={quickActionId === ord.id}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1 shadow-xs disabled:opacity-50"
                          >
                            <Package className="w-3 h-3" />
                            <span>Deliver</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenStatusModal(ord)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Manage
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmOrder(ord)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Order"
                          aria-label={`Delete order ${ord.orderNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Status & Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Manage Order: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">Customer: {selectedOrder.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Ordered Products with Pictures */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ordered Products ({selectedOrder.items.length})
              </div>
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/70">
                {selectedOrder.items.map((it, idx) => {
                  const thumb = resolveItemImage(it);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={it.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 line-clamp-2">
                          {it.productName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                          <span>
                            {formatPrice(it.price)} × {it.quantity}
                          </span>
                          {it.sku && <span className="font-mono text-[10px]">• {it.sku}</span>}
                          {it.selectedColor && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              Color: {it.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 shrink-0">
                        {formatPrice(it.price * it.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Note Highlight */}
            {selectedOrder.customerNote && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquareText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Customer Note</span>
                </div>
                <p className="text-amber-800 whitespace-pre-line leading-relaxed">
                  {selectedOrder.customerNote}
                </p>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold capitalize"
                >
                  <option value="pending">Pending (New)</option>
                  <option value="confirmed">Confirmed with Customer</option>
                  <option value="processing">Packaging / Processing</option>
                  <option value="shipped">Handed to Courier (Shipped)</option>
                  <option value="delivered">Successfully Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer-Visible Update Message
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Leave blank for automatic status message, or write custom update..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Shown live to the customer in "My Orders".
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Admin Notes (Private)
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="e.g. Steadfast consignment #10293, verified on call..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 space-y-1">
                <div>
                  <strong>Address:</strong> {selectedOrder.address}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedOrder.phone}
                </div>
                {selectedOrder.email && (
                  <div>
                    <strong>Email:</strong> {selectedOrder.email}
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="text-emerald-700 font-semibold">
                    <strong>Coupon Discount{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}:</strong> -{formatPrice(selectedOrder.discount)}
                  </div>
                )}
                <div>
                  <strong>Total:</strong> {formatPrice(selectedOrder.total)} (Delivery: {formatPrice(selectedOrder.deliveryFee)})
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOrder(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{updatingStatus ? 'Updating...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteConfirmOrder && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete this Order?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete order{' '}
                <strong className="font-mono text-slate-800">{deleteConfirmOrder.orderNumber}</strong>{' '}
                ({deleteConfirmOrder.customerName} • {formatPrice(deleteConfirmOrder.total)})? This cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={deletingOrder}
                onClick={() => setDeleteConfirmOrder(null)}
                className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingOrder}
                onClick={handleConfirmDeleteOrder}
                className="py-2.5 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deletingOrder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingOrder ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
