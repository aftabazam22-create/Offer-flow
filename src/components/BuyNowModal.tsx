import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Minus,
  Plus,
  Mail,
  ShoppingBag,
  Clock,
  Check,
  Package,
  Tag,
  MessageSquareText,
  Palette,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.js';
import { api } from '../services/api.js';

const BD_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Gazipur',
  'Narayanganj',
  'Cumilla',
  'Cox’s Bazar',
  'Bogura',
  'Jessore',
  'Dinajpur',
  'Tangail',
  'Kushtia',
  'Feni',
  'Brahmanbaria',
  'Noakhali',
  'Pabna',
  'Jamalpur',
  'Faridpur',
  'Narsingdi',
  'Manikganj',
  'Munshiganj',
  'Sirajganj',
  'Other 64 Districts',
];

interface BuyNowModalProps {
  onNavigate?: (view: string, param?: string) => void;
}

export const BuyNowModal: React.FC<BuyNowModalProps> = ({ onNavigate }) => {
  const {
    isBuyNowModalOpen,
    setIsBuyNowModalOpen,
    checkoutPayload,
    clearCart,
    setCartCoupon,
    addMyOrderNumber,
    firebaseUser,
    userProfile,
    updateUserProfile,
    settings,
    formatPrice,
    t,
    showToast,
  } = useStore();

  const [singleQuantity, setSingleQuantity] = useState(1);
  const [itemColors, setItemColors] = useState<Record<number, string>>({});
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Coupon state directly inside checkout
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [orderCompleteData, setOrderCompleteData] = useState<{
    orderNumber: string;
    customerName: string;
    phone: string;
    email?: string;
    total: number;
    address: string;
    customerNote?: string;
    waUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (isBuyNowModalOpen && checkoutPayload && checkoutPayload.items.length > 0) {
      setSingleQuantity(checkoutPayload.items[0].quantity || 1);
      setOrderCompleteData(null);
      setCustomerNote('');

      // Initialize per-item selected colors
      const initialColors: Record<number, string> = {};
      checkoutPayload.items.forEach((it, idx) => {
        initialColors[idx] =
          it.selectedColor || (it.product.colors && it.product.colors.length > 0 ? it.product.colors[0] : '');
      });
      setItemColors(initialColors);

      // Initialize coupon if forwarded from CartDrawer
      if (checkoutPayload.couponCode) {
        setCouponInput(checkoutPayload.couponCode);
        setAppliedCouponCode(checkoutPayload.couponCode);
        setCouponDiscount(checkoutPayload.discount || 0);
        setCouponMessage({
          text: `${checkoutPayload.couponCode} applied!`,
          isError: false,
        });
      } else {
        setCouponInput('');
        setAppliedCouponCode(null);
        setCouponDiscount(0);
        setCouponMessage(null);
      }

      // Auto-fill from signed-in user's profile/auth when opening checkout
      if (firebaseUser || userProfile) {
        setCustomerName((prev) =>
          prev.trim()
            ? prev
            : userProfile?.displayName || firebaseUser?.displayName || ''
        );
        setEmail((prev) =>
          prev.trim() ? prev : userProfile?.email || firebaseUser?.email || ''
        );
        setPhone((prev) => (prev.trim() ? prev : userProfile?.phone || ''));
        setDistrict((prev) =>
          userProfile?.district && prev === 'Dhaka' ? userProfile.district : prev
        );
        setArea((prev) => (prev.trim() ? prev : userProfile?.area || ''));
        setAddress((prev) => (prev.trim() ? prev : userProfile?.address || ''));
      }
    }
  }, [checkoutPayload, isBuyNowModalOpen]);

  if (!isBuyNowModalOpen || !checkoutPayload || checkoutPayload.items.length === 0) {
    return null;
  }

  const isSingleBuyNow = !checkoutPayload.fromCart && checkoutPayload.items.length === 1;
  const orderItems = isSingleBuyNow
    ? [{ ...checkoutPayload.items[0], quantity: singleQuantity }]
    : checkoutPayload.items;

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.product.discountPrice * item.quantity,
    0
  );
  const discount = Math.min(subtotal, couponDiscount);
  const deliveryCharge =
    district.toLowerCase() === 'dhaka'
      ? settings?.deliveryChargeInsideDhaka ?? 70
      : settings?.deliveryChargeOutsideDhaka ?? 120;
  const isFreeDelivery = Boolean(
    settings?.freeDeliveryEnabled &&
      subtotal >= (settings?.freeDeliveryThreshold ?? 0)
  );
  const finalDeliveryCharge = isFreeDelivery ? 0 : deliveryCharge;
  const grandTotal = Math.max(0, subtotal - discount + finalDeliveryCharge);
  const totalQty = orderItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleQuantityChange = async (delta: number) => {
    if (!isSingleBuyNow) return;
    const maxStock = checkoutPayload.items[0].product.stock;
    const newQ = singleQuantity + delta;
    if (newQ >= 1 && newQ <= maxStock) {
      setSingleQuantity(newQ);
      if (appliedCouponCode) {
        const nextSub = checkoutPayload.items[0].product.discountPrice * newQ;
        try {
          const res = await api.validateCoupon(appliedCouponCode, nextSub);
          if (res.valid) {
            setCouponDiscount(res.discount);
            setCouponMessage({ text: res.message, isError: false });
          } else {
            setCouponDiscount(0);
            setAppliedCouponCode(null);
            setCouponMessage({ text: res.message, isError: true });
          }
        } catch {}
      }
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setValidatingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setCouponDiscount(res.discount);
        setAppliedCouponCode(code);
        setCouponInput(code);
        if (checkoutPayload.fromCart) {
          setCartCoupon({ code, discount: res.discount });
        }
        setCouponMessage({ text: res.message, isError: false });
        showToast(t('Coupon applied successfully!', 'কুপন কোড প্রয়োগ হয়েছে!'));
      } else {
        setCouponDiscount(0);
        setAppliedCouponCode(null);
        if (checkoutPayload.fromCart) {
          setCartCoupon(null);
        }
        setCouponMessage({ text: res.message, isError: true });
      }
    } catch {
      setCouponMessage({
        text: t('Could not verify coupon code', 'কুপন যাচাই করা যায়নি'),
        isError: true,
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponDiscount(0);
    setCouponInput('');
    setCouponMessage(null);
    if (checkoutPayload.fromCart) {
      setCartCoupon(null);
    }
    showToast(t('Coupon cancelled', 'কুপন বাতিল করা হয়েছে'));
  };

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast(t('Please enter your name', 'অনুগ্রহ করে আপনার নাম লিখুন'));
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      showToast(
        t(
          'Please enter a valid 11-digit mobile number',
          'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন'
        )
      );
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      showToast(
        t(
          'Please enter your complete delivery address',
          'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন'
        )
      );
      return;
    }

    setLoading(true);

    const fullAddress = `${address.trim()}, ${area.trim() ? area.trim() + ', ' : ''}${district}`;
    const targetWhatsAppNumber = settings?.whatsappNumber || '01745329020';
    const cleanNumber = targetWhatsAppNumber.startsWith('88')
      ? targetWhatsAppNumber
      : `88${targetWhatsAppNumber}`;

    const cleanNote = customerNote.trim();

    try {
      const order = await api.createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: fullAddress,
        district,
        area: area.trim(),
        items: orderItems.map((it, idx) => ({
          productId: it.product.id,
          productName: it.product.name,
          price: it.product.discountPrice,
          originalPrice: it.product.price,
          quantity: it.quantity,
          image: it.product.images[0] || '',
          sku: it.product.sku,
          selectedColor: (itemColors[idx] ?? it.selectedColor ?? '').trim() || undefined,
        })),
        subtotal,
        discount,
        deliveryFee: finalDeliveryCharge,
        total: grandTotal,
        couponCode: appliedCouponCode || undefined,
        paymentMethod: 'cash_on_delivery',
        customerNote: cleanNote || undefined,
        internalNotes: email.trim()
          ? `Customer email: ${email.trim()}`
          : 'Direct order with Cash on Delivery.',
      });

      addMyOrderNumber(order.orderNumber);
      if (checkoutPayload.fromCart) {
        clearCart();
      }

      if (firebaseUser && (firebaseUser.emailVerified || firebaseUser.phoneNumber)) {
        updateUserProfile({
          displayName: customerName.trim(),
          email: email.trim() || firebaseUser.email || '',
          phone: phone.trim(),
          district,
          area: area.trim(),
          address: address.trim(),
        }).catch(() => {});
      }

      const optionalWaMsg = encodeURIComponent(
        `Hello Offer Flow, I placed order ${order.orderNumber} for ${grandTotal} BDT. Name: ${customerName.trim()}`
      );
      const waUrl = `https://wa.me/${cleanNumber}?text=${optionalWaMsg}`;

      setOrderCompleteData({
        orderNumber: order.orderNumber,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        total: grandTotal,
        address: fullAddress,
        customerNote: cleanNote || undefined,
        waUrl,
      });

      showToast(t('Order placed successfully!', 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!'));
    } catch (err) {
      console.error('Order creation error', err);
      showToast(
        t(
          'Failed to place order. Please try again.',
          'অর্ডার গ্রহণ করা সম্ভব হয়নি, আবার চেষ্টা করুন।'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">
                {t('Order Checkout (Cash on Delivery)', 'অর্ডার সম্পন্ন করুন (ক্যাশ অন ডেলিভারি)')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t(
                  'Pay after receiving product • Helpline: 01745329020',
                  'পণ্য হাতে পেয়ে মূল্য পরিশোধ • হেল্পলাইন: ০১৭৪৫৩২৯০২০'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBuyNowModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleteData ? (
          // Confirmation Screen
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-black text-xs rounded-full border border-amber-200 mb-2">
                {t('Order Placed • Pending Confirmation', 'অর্ডার জমা হয়েছে • কনফার্মেশনের অপেক্ষায়')}
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {t('Thank you for your order!', 'ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('Order ID:', 'অর্ডার আইডি:')}{' '}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  {orderCompleteData.orderNumber}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-200/60 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Customer Name:', 'গ্রাহকের নাম:')}</span>
                <span className="font-bold text-slate-800">{orderCompleteData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Phone Number:', 'মোবাইল:')}</span>
                <span className="font-mono font-bold text-slate-800">{orderCompleteData.phone}</span>
              </div>
              {orderCompleteData.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('Email Address:', 'ইমেইল:')}</span>
                  <span className="font-medium text-slate-800">{orderCompleteData.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">{t('Delivery Address:', 'ডেলিভারি ঠিকানা:')}</span>
                <span className="font-medium text-slate-800 text-right max-w-[220px]">
                  {orderCompleteData.address}
                </span>
              </div>
              {orderCompleteData.customerNote && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">{t('Your Note:', 'আপনার নোট:')}</span>
                  <span className="font-medium text-slate-800 text-right max-w-[220px]">
                    {orderCompleteData.customerNote}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-bold">
                  {t('Total Payable (COD):', 'মোট প্রদেয় (ক্যাশ অন ডেলিভারি):')}
                </span>
                <span className="font-extrabold text-rose-600 text-base">
                  {formatPrice(orderCompleteData.total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2 text-left">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t(
                  'You can check anytime in "My Orders" whether your order has been confirmed, packed, or shipped.',
                  'আপনার অর্ডারটি কনফার্ম হয়েছে কিনা তা "আমার অর্ডার" পেজে যেকোনো সময় লাইভ দেখতে পারবেন।'
                )}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {onNavigate && (
                <button
                  onClick={() => {
                    setIsBuyNowModalOpen(false);
                    onNavigate('orders');
                  }}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  <span>{t('Track My Order Confirmation Status', 'আমার অর্ডার ও কনফার্মেশন স্ট্যাটাস দেখুন')}</span>
                </button>
              )}

              {orderCompleteData.waUrl && (
                <a
                  href={orderCompleteData.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline py-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>
                    {t('Need fast help? Chat on WhatsApp (01745329020)', 'জরুরি প্রয়োজনে হোয়াটসঅ্যাপে যোগাযোগ করুন')}
                  </span>
                </a>
              )}

              <button
                onClick={() => setIsBuyNowModalOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
              >
                {t('Back to Shopping', 'শপিং চালিয়ে যান')}
              </button>
            </div>
          </div>
        ) : (
          // Order Form
          <form onSubmit={handleDirectOrder} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Items Summary + Per-Item Color Selector */}
            <div className="space-y-2.5">
              {orderItems.map((it, idx) => {
                const productColors =
                  it.product.colors && it.product.colors.length > 0 ? it.product.colors : [];
                const activeColor = itemColors[idx] ?? it.selectedColor ?? '';
                const quickOptions =
                  productColors.length > 0 ? productColors : ['Black', 'White', 'Blue', 'Red'];

                return (
                  <div
                    key={`${it.product.id}-${idx}`}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={it.product.images[0]}
                        alt={it.product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {it.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-rose-600">
                            {formatPrice(it.product.discountPrice)}
                          </span>
                          {it.product.price > it.product.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(it.product.price)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          SKU: {it.product.sku} • Qty: {it.quantity}
                          {activeColor ? ` • ${activeColor}` : ''}
                        </span>
                      </div>

                      {isSingleBuyNow && (
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={singleQuantity <= 1}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">
                            {singleQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            disabled={singleQuantity >= it.product.stock}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Color Selection Row */}
                    <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 inline-flex items-center gap-1">
                          <Palette className="w-3 h-3 text-rose-500" />
                          <span>
                            {productColors.length > 0
                              ? t('Select Color:', 'রঙ নির্বাচন করুন:')
                              : t('Select / Type Color (Optional):', 'রঙ নির্বাচন করুন (অপশনাল):')}
                          </span>
                        </span>
                        {activeColor && (
                          <span className="font-bold text-rose-600">{activeColor}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {quickOptions.map((c) => {
                          const isSelected = activeColor.toLowerCase() === c.toLowerCase();
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() =>
                                setItemColors((prev) => ({
                                  ...prev,
                                  [idx]: isSelected && productColors.length === 0 ? '' : c,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
                              }`}
                            >
                              {c}
                            </button>
                          );
                        })}

                        {productColors.length === 0 && (
                          <input
                            type="text"
                            value={activeColor}
                            onChange={(e) =>
                              setItemColors((prev) => ({ ...prev, [idx]: e.target.value }))
                            }
                            placeholder={t('Custom color...', 'নিজে রঙ লিখুন...')}
                            className="flex-1 min-w-[110px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-hidden focus:border-rose-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Your Full Name *', 'আপনার পুরো নাম *')}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('e.g. Tanvir Hossain', 'যেমন: তানভীর হোসেন')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Mobile Number (For Courier Contact) *', 'মোবাইল নম্বর (কুরিয়ার যোগাযোগের জন্য) *')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +880
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="017XXXXXXXX"
                    maxLength={11}
                    className="w-full pl-16 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t('Email Address (Optional)', 'ইমেইল অ্যাড্রেস (অপশনাল)')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {t('For order receipts', 'ইনভয়েস পাওয়ার জন্য')}
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('e.g. name@gmail.com', 'যেমন: name@gmail.com')}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('District *', 'জেলা *')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('Area / Thana', 'এলাকা / থানা')}
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder={t('e.g. Dhanmondi, GEC', 'যেমন: ধানমন্ডি, বাড্ডা')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('Full Delivery Address *', 'সম্পূর্ণ ডেলিভারি ঠিকানা *')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t(
                    'House, Road, Block, Village, Landmark...',
                    'বাড়ি নং, রোড নং, এলাকা, ল্যান্ডমার্ক...'
                  )}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Coupon Code Box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t('Have a Coupon Code?', 'কুপন কোড আছে? (অপশনাল)')}</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder={t('Enter coupon (e.g. OFFERFLOW10)', 'কুপন কোড লিখুন (যেমন: OFFERFLOW10)')}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase text-slate-800 focus:outline-hidden focus:border-rose-500"
                    />
                    {(couponInput || appliedCouponCode) && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        title={t('Cancel Coupon', 'কুপন বাতিল করুন')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {appliedCouponCode && couponInput.trim().toUpperCase() === appliedCouponCode ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors shrink-0"
                    >
                      {t('Cancel', 'বাতিল')}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 shrink-0"
                      >
                        {validatingCoupon ? '...' : t('Apply', 'প্রয়োগ')}
                      </button>
                      {appliedCouponCode && (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors shrink-0"
                        >
                          {t('Cancel', 'বাতিল')}
                        </button>
                      )}
                    </>
                  )}
                </div>
                {couponMessage && (
                  <div
                    className={`text-[11px] font-medium flex items-center gap-1.5 ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponMessage.isError ? (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Customer Order Note (Bottom of Form) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquareText className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('Order Note / Instructions (Optional)', 'অর্ডার নোট / বিশেষ কিছু লিখুন (অপশনাল)')}</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={t(
                    'Any color/size note, delivery instructions, or special message...',
                    'রঙ/সাইজ, ডেলিভারির সময় বা অন্য কোনো বিশেষ নোট বা সমস্যা থাকলে এখানে লিখুন...'
                  )}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  {t('Subtotal', 'সাবটোটাল')} ({totalQty} {t('items', 'টি পণ্য')}):
                </span>
                <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <span>
                      {t('Coupon Discount', 'কুপন ডিসকাউন্ট')}{' '}
                      {appliedCouponCode ? `(${appliedCouponCode})` : ''}:
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold transition-colors"
                      title={t('Cancel coupon', 'কুপন বাতিল করুন')}
                    >
                      <X className="w-2.5 h-2.5" />
                      <span>{t('Cancel', 'বাতিল')}</span>
                    </button>
                  </span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-400" />
                  {t('Delivery Fee', 'ডেলিভারি চার্জ')} ({district}):
                </span>
                {isFreeDelivery ? (
                  <span className="font-bold text-emerald-600">{t('FREE', 'ফ্রি')}</span>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {formatPrice(finalDeliveryCharge)}
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-xs">
                  {t('Total Payable (Cash on Delivery):', 'মোট প্রদেয় (ক্যাশ অন ডেলিভারি):')}
                </span>
                <span className="text-base text-rose-600 font-extrabold">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Primary Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {loading
                  ? t('Placing Order...', 'অর্ডার প্রক্রিয়াধীন...')
                  : t('Order Now (Cash on Delivery)', 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {t(
                  'Cash on Delivery • Inspect parcel before payment',
                  'ক্যাশ অন ডেলিভারি • পণ্য দেখে মূল্য পরিশোধ'
                )}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
