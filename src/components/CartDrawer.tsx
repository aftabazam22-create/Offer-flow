import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  Tag,
  Phone,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { api } from '../services/api.js';

export const CartDrawer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    openCartCheckout,
    formatPrice,
    settings,
    t,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.discountPrice * item.quantity,
    0
  );

  const totalDiscount = couponDiscount;
  const isFreeDelivery = settings?.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold;
  const deliveryEst = isFreeDelivery ? 0 : (settings?.deliveryChargeInsideDhaka ?? 60);
  const grandTotal = Math.max(0, subtotal - totalDiscount + deliveryEst);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      if (res.valid) {
        setCouponDiscount(res.discount);
        setAppliedCouponCode(couponInput.trim().toUpperCase());
        setCouponMessage({ text: res.message, isError: false });
        showToast(t('Coupon successfully applied!', 'কুপন কার্যকর হয়েছে!'));
      } else {
        setCouponDiscount(0);
        setAppliedCouponCode(null);
        setCouponMessage({ text: res.message, isError: true });
      }
    } catch {
      setCouponMessage({ text: 'Error applying coupon', isError: true });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutEntireCart = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    openCartCheckout(cart, appliedCouponCode || undefined, totalDiscount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('Your Shopping Cart', 'আপনার শপিং কার্ট')}</h2>
              <p className="text-xs text-slate-500">
                {cart.length} {t('unique items', 'ধরনের পণ্য')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 stroke-1" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {t('Your cart is empty', 'আপনার কার্ট খালি')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {t(
                    'Explore our curated offers and add your favorite items to start shopping.',
                    'আমাদের হট ডিল ও সেরা অফারগুলো দেখে পছন্দের পণ্য যুক্ত করুন।'
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('shop');
                }}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold shadow-md transition-colors"
              >
                {t('Browse All Products', 'সকল পণ্য দেখুন')}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.product.id}__${item.selectedColor || ''}`}
                className="flex items-center gap-3 p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-extrabold text-rose-600">
                      {formatPrice(item.product.discountPrice)}
                    </span>
                    {item.selectedColor && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                        {item.selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">SKU: {item.product.sku}</div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1, item.selectedColor)
                        }
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1, item.selectedColor)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-r-lg disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t('Coupon code (e.g. OFFERFLOW10)', 'কুপন কোড (যেমন: OFFERFLOW10)')}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase text-slate-800 focus:outline-hidden focus:border-rose-500"
                />
              </div>
              <button
                type="submit"
                disabled={validatingCoupon}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                {validatingCoupon ? '...' : t('Apply', 'প্রয়োগ')}
              </button>
            </form>

            {couponMessage && (
              <div
                className={`text-[11px] font-medium flex items-center gap-1.5 ${
                  couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {couponMessage.isError ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{couponMessage.text}</span>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
              <div className="flex justify-between">
                <span>{t('Subtotal', 'সাবটোটাল')}:</span>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{t('Coupon Discount', 'কুপন ডিসকাউন্ট')}:</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('Estimated Delivery', 'আনুমানিক ডেলিভারি')}:</span>
                <span>{isFreeDelivery ? t('FREE', 'ফ্রি') : formatPrice(deliveryEst)}</span>
              </div>
              <div className="pt-2 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">{t('Grand Total', 'সর্বমোট প্রদেয়')}:</span>
                <span className="text-lg font-extrabold text-rose-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCheckoutEntireCart}
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('Proceed to Order (Cash on Delivery)', 'অর্ডার সম্পন্ন করতে এগিয়ে যান')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-500 hover:text-slate-800 underline"
                >
                  {t('Continue Shopping', 'আরও কেনাকাটা করুন')}
                </button>
                <button
                  onClick={clearCart}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  {t('Clear Cart', 'কার্ট খালি করুন')}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
