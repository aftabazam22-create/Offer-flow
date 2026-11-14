import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  LogIn,
  ShieldCheck,
  MapPin,
  Box,
  RefreshCw,
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase.js';
import { Order, OrderTracking } from '../types.js';
import { api } from '../services/api.js';
import { useStore } from '../context/StoreContext.js';

interface MyOrdersViewProps {
  onNavigate: (view: string, param?: string) => void;
}

const STEPS: { key: OrderTracking['status']; labelEn: string; labelBn: string }[] = [
  { key: 'pending', labelEn: 'Order Placed', labelBn: 'অর্ডার জমা' },
  { key: 'confirmed', labelEn: 'Confirmed', labelBn: 'কনফার্মড' },
  { key: 'processing', labelEn: 'Packing', labelBn: 'প্যাকিং' },
  { key: 'shipped', labelEn: 'Shipped', labelBn: 'কুরিয়ারে' },
  { key: 'delivered', labelEn: 'Delivered', labelBn: 'ডেলিভারড' },
];

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onNavigate }) => {
  const {
    myOrderNumbers,
    addMyOrderNumber,
    firebaseUser,
    formatPrice,
    t,
    showToast,
  } = useStore();

  const [lookupInput, setLookupInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [trackedOrders, setTrackedOrders] = useState<Record<string, OrderTracking>>({});
  const [authOrders, setAuthOrders] = useState<Order[]>([]);
  const [loadingAuthOrders, setLoadingAuthOrders] = useState(false);

  // Live subscribe to every saved order number on this device
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    myOrderNumbers.forEach((orderNum) => {
      const unsub = api.subscribeOrderTracking(orderNum, (data) => {
        if (data) {
          setTrackedOrders((prev) => ({ ...prev, [orderNum]: data }));
        }
      });
      unsubs.push(unsub);
    });
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [myOrderNumbers]);

  // Also load orders linked to authenticated Google user if signed in
  useEffect(() => {
    if (!firebaseUser) {
      setAuthOrders([]);
      return;
    }
    setLoadingAuthOrders(true);
    api
      .getMyAuthOrders(firebaseUser.uid)
      .then((list) => {
        setAuthOrders(list);
        list.forEach((o) => {
          if (!myOrderNumbers.includes(o.orderNumber)) {
            addMyOrderNumber(o.orderNumber);
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoadingAuthOrders(false));
  }, [firebaseUser?.uid]);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lookupInput.trim().toUpperCase();
    if (!clean) return;
    setSearching(true);
    try {
      const res = await api.getOrderTracking(clean);
      if (res) {
        addMyOrderNumber(res.orderNumber);
        setTrackedOrders((prev) => ({ ...prev, [res.orderNumber]: res }));
        setLookupInput('');
        showToast(t(`Order ${res.orderNumber} found!`, `অর্ডার ${res.orderNumber} পাওয়া গেছে!`));
      } else {
        showToast(
          t(
            'Order not found. Please check your Order ID (e.g. OF-2026-123456).',
            'অর্ডারটি খুঁজে পাওয়া যায়নি। সঠিক অর্ডার নম্বর দিন।'
          )
        );
      }
    } catch {
      showToast(t('Could not look up order right now', 'এই মুহূর্তে অর্ডার খোঁজা যায়নি'));
    } finally {
      setSearching(false);
    }
  };

  const handleGoogleSync = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast(t('Signed in! Your orders are synced.', 'সাইন ইন সম্পন্ন!'));
    } catch {
      showToast(t('Google sign-in cancelled', 'সাইন ইন বাতিল করা হয়েছে'));
    }
  };

  const combinedOrderNumbers = Array.from(
    new Set([...myOrderNumbers, ...authOrders.map((o) => o.orderNumber)])
  );

  const displayList: OrderTracking[] = combinedOrderNumbers
    .map((num) => {
      if (trackedOrders[num]) return trackedOrders[num];
      const fromAuth = authOrders.find((o) => o.orderNumber === num);
      if (!fromAuth) return null;
      return {
        orderNumber: fromAuth.orderNumber,
        orderId: fromAuth.id,
        status: fromAuth.status,
        statusNote: fromAuth.statusNote,
        items: fromAuth.items,
        subtotal: fromAuth.subtotal,
        discount: fromAuth.discount,
        deliveryFee: fromAuth.deliveryFee,
        total: fromAuth.total,
        district: fromAuth.district,
        paymentMethod: fromAuth.paymentMethod,
        createdAt: fromAuth.createdAt,
        updatedAt: fromAuth.updatedAt,
      } as OrderTracking;
    })
    .filter((x): x is OrderTracking => x !== null)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const getStatusMeta = (status: OrderTracking['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          banner: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: CheckCircle2,
          labelEn: 'Confirmed by Store',
          labelBn: 'অর্ডার কনফার্ম হয়েছে',
        };
      case 'processing':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          banner: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          icon: Box,
          labelEn: 'Packing & Processing',
          labelBn: 'প্যাকিং চলছে (কনফার্মড)',
        };
      case 'shipped':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          banner: 'bg-purple-50 border-purple-200 text-purple-900',
          icon: Truck,
          labelEn: 'On the Way (Shipped)',
          labelBn: 'কুরিয়ারে পাঠানো হয়েছে',
        };
      case 'delivered':
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          banner: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: Sparkles,
          labelEn: 'Delivered',
          labelBn: 'ডেলিভারি সম্পন্ন হয়েছে',
        };
      case 'cancelled':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          banner: 'bg-red-50 border-red-200 text-red-900',
          icon: XCircle,
          labelEn: 'Cancelled',
          labelBn: 'অর্ডার বাতিল হয়েছে',
        };
      default:
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          banner: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: Clock,
          labelEn: 'Pending Confirmation',
          labelBn: 'কনফার্মেশনের জন্য অপেক্ষমান',
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header + Order Lookup */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Package className="w-4 h-4" />
              <span>{t('Live Order Tracking', 'লাইভ অর্ডার ট্র্যাকিং')}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('My Orders & Confirmation Status', 'আমার অর্ডার ও কনফার্মেশন স্ট্যাটাস')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'Check what you ordered and whether your order has been confirmed, packed, or shipped.',
                'আপনি কী কী অর্ডার করেছেন এবং আপনার অর্ডারটি কনফার্ম হয়েছে কিনা তা লাইভ দেখুন।'
              )}
            </p>
          </div>

          {!firebaseUser && (
            <button
              onClick={handleGoogleSync}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs self-start md:self-auto transition-colors"
            >
              <LogIn className="w-4 h-4 text-rose-400" />
              <span>{t('Sync Orders with Google', 'গুগল দিয়ে অর্ডার সিঙ্ক করুন')}</span>
            </button>
          )}
        </div>

        {/* Lookup by Order ID */}
        <form onSubmit={handleLookupOrder} className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder={t(
                'Enter Order ID to track (e.g. OF-2026-123456)...',
                'অর্ডার আইডি লিখুন (যেমন: OF-2026-123456)...'
              )}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
          >
            {searching ? t('Checking...', 'খোঁজা হচ্ছে...') : t('Track Order', 'অর্ডার খুঁজুন')}
          </button>
        </form>
      </div>

      {/* Orders List */}
      {loadingAuthOrders && displayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">{t('Loading your orders...', 'অর্ডার লোড হচ্ছে...')}</p>
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-100 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {t('No orders placed yet on this device', 'এই ডিভাইসে এখনো কোনো অর্ডার পাওয়া যায়নি')}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t(
              'Once you place an order, it will automatically appear here with live confirmation updates. You can also enter an Order ID above to track it.',
              'যেকোনো পণ্য অর্ডার করলে তা এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে এবং অর্ডার কনফার্ম হয়েছে কিনা তা জানতে পারবেন।'
            )}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-md transition-colors"
          >
            <span>{t('Browse Products', 'পণ্য দেখুন')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {displayList.map((order) => {
            const meta = getStatusMeta(order.status);
            const StatusIcon = meta.icon;
            const currentStepIdx = STEPS.findIndex((s) => s.key === order.status);
            const isConfirmedOrBeyond =
              order.status === 'confirmed' ||
              order.status === 'processing' ||
              order.status === 'shipped' ||
              order.status === 'delivered';

            return (
              <div
                key={order.orderNumber}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-5"
              >
                {/* Top Row: Order Number, Date, Confirmation Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-semibold">
                        {t('Order ID:', 'অর্ডার আইডি:')}
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        {t('Destination:', 'গন্তব্য:')} <strong className="text-slate-700">{order.district}</strong>
                      </span>
                      {order.phoneLast4 && (
                        <span className="text-slate-400">• ***{order.phoneLast4}</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border self-start sm:self-auto ${meta.badge}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    <span>{t(meta.labelEn, meta.labelBn)}</span>
                  </div>
                </div>

                {/* Clear Confirmation Banner */}
                <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${meta.banner}`}>
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {order.status === 'pending' &&
                        t(
                          'Waiting for Admin Confirmation — Not yet confirmed',
                          'অর্ডারটি এখনো কনফার্ম হয়নি — আমাদের প্রতিনিধি শীঘ্রই যাচাই করে কনফার্ম করবেন।'
                        )}
                      {isConfirmedOrBeyond &&
                        t(
                          'Your order has been CONFIRMED!',
                          'আপনার অর্ডারটি কনফার্ম হয়েছে!'
                        )}
                      {order.status === 'cancelled' &&
                        t(
                          'This order was cancelled.',
                          'এই অর্ডারটি বাতিল করা হয়েছে।'
                        )}
                    </p>
                    {order.statusNote && (
                      <p className="opacity-90 text-[11px]">{order.statusNote}</p>
                    )}
                  </div>
                </div>

                {/* 5-Step Progress Bar (unless cancelled) */}
                {order.status !== 'cancelled' && (
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-3 pt-1">
                    {STEPS.map((step, idx) => {
                      const done = currentStepIdx >= idx;
                      const active = currentStepIdx === idx;
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center gap-1.5">
                          <div
                            className={`w-full h-1.5 rounded-full transition-all ${
                              done ? 'bg-emerald-500' : 'bg-slate-200'
                            } ${active ? 'ring-2 ring-emerald-200' : ''}`}
                          />
                          <span
                            className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                              done ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {t(step.labelEn, step.labelBn)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ordered Items List */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t('Ordered Products', 'অর্ডার করা পণ্যসমূহ')} ({order.items.length})
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/60">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-500">
                    <span>
                      {t('Subtotal:', 'সাবটোটাল:')} <strong>{formatPrice(order.subtotal)}</strong>
                    </span>
                    {order.discount > 0 && (
                      <span className="text-emerald-600">
                        {t('Discount:', 'ডিসকাউন্ট:')} -{formatPrice(order.discount)}
                      </span>
                    )}
                    <span>
                      {t('Delivery:', 'ডেলিভারি:')}{' '}
                      <strong>{order.deliveryFee === 0 ? t('FREE', 'ফ্রি') : formatPrice(order.deliveryFee)}</strong>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-600 font-semibold">
                      {t('Total Payable (COD):', 'সর্বমোট (ক্যাশ অন ডেলিভারি):')}
                    </span>
                    <span className="text-base font-black text-rose-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
