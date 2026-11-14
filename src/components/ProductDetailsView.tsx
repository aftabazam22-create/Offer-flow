import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Product, Review } from '../types.js';
import { useStore } from '../context/StoreContext.js';
import { api } from '../services/api.js';
import { ProductCard } from './ProductCard.js';

interface ProductDetailsProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailsView: React.FC<ProductDetailsProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onNavigate,
}) => {
  const {
    addToCart,
    openBuyNow,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    settings,
    t,
    showToast,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'delivery'>('desc');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review form
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await api.getReviews(product.id);
      setReviews(data);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.addReview({
        productId: product.id,
        customerName: reviewerName.trim(),
        rating,
        comment: comment.trim(),
      });
      setReviewerName('');
      setComment('');
      setRating(5);
      showToast(t('Review submitted successfully! Thank you.', 'রিভিউ সফলভাবে জমা হয়েছে! ধন্যবাদ।'));
      loadReviews();
    } catch {
      showToast(t('Failed to submit review', 'রিভিউ জমা দেওয়া যায়নি'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const isFavorite = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85'];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => onNavigate('home')} className="hover:text-rose-600 transition-colors">
            {t('Home', 'হোম')}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <button onClick={() => onNavigate('shop')} className="hover:text-rose-600 transition-colors">
            {t('Shop', 'দোকান')}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <button
            onClick={() => onNavigate('shop', `category=${encodeURIComponent(product.category)}`)}
            className="hover:text-rose-600 transition-colors"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('Back', 'পেছনে')}</span>
        </button>
      </div>

      {/* Primary Product Card View */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Images Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                -{product.discountPercentage}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/80 text-slate-400 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>
            <img
              src={images[activeImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-rose-600 ring-2 ring-rose-500/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <span>{product.brand}</span>
              <span className="text-slate-300">•</span>
              <span>{product.category}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center text-amber-500 font-bold gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({reviews.length || product.reviewCount} {t('reviews', 'রিভিউ')})</span>
              </div>
              <span className="text-slate-400">SKU: <span className="font-mono text-slate-700 font-bold">{product.sku}</span></span>
              
              {/* Stock Status */}
              <div>
                {inStock ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {t(`In Stock (${product.stock} units)`, `স্টকে আছে (${product.stock} টি)`)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-xs">
                    {t('Out of Stock', 'স্টক শেষ')}
                  </span>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-rose-600">
                {formatPrice(product.discountPrice)}
              </span>
              {product.price > product.discountPrice && (
                <>
                  <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {t('Save', 'সাশ্রয়')} {formatPrice(product.price - product.discountPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Short highlight */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color, Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700">
                    {t('Select Color:', 'রঙ নির্বাচন করুন:')}
                  </span>
                  {selectedColor && (
                    <span className="font-extrabold text-rose-600">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const active = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-rose-500/20'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">{t('Quantity:', 'পরিমাণ:')}</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Buttons: Add to Cart & Buy Now via WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => addToCart(product, quantity, selectedColor || undefined)}
                disabled={!inStock}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-40 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('Add to Shopping Cart', 'কার্টে যোগ করুন')}</span>
              </button>

              <button
                type="button"
                onClick={() => openBuyNow(product, quantity, selectedColor || undefined)}
                disabled={!inStock}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 active:scale-[0.99] disabled:opacity-40 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('Order Now (Cash on Delivery)', 'অর্ডার করুন (ক্যাশ অন ডেলিভারি)')}</span>
              </button>
            </div>

            {/* Delivery Assurance Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">{t('Nationwide Delivery', 'সারাদেশে ডেলিভারি')}</span>
                  <span className="text-[11px] text-slate-500">{t('Dhaka: 24-48h, Outside: 2-4d', 'ঢাকায় ২৪-৪৮ঘণ্টা, বাইরে ২-৪দিন')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">{t('Cash on Delivery', 'ক্যাশ অন ডেলিভারি')}</span>
                  <span className="text-[11px] text-slate-500">{t('Pay after checking product', 'পণ্য দেখে টাকা পরিশোধ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews, Delivery */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 overflow-x-auto scrollbar-none pb-2">
          {[
            { id: 'desc', label: 'Description', labelBn: 'বিবরণ' },
            { id: 'specs', label: 'Specifications', labelBn: 'স্পেসিফিকেশন' },
            { id: 'delivery', label: 'Delivery & Return', labelBn: 'ডেলিভারি ও রিটার্ন' },
            { id: 'reviews', label: `Reviews (${reviews.length})`, labelBn: `রিভিউ (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t(tab.label, tab.labelBn)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'desc' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
            <p className="whitespace-pre-line">{product.description}</p>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-4">
                {product.tags.map((tg, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tg}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                {product.specifications.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 p-3.5 odd:bg-slate-50/50">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="text-slate-600">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {t('No specific technical attributes listed for this item.', 'কোনো অতিরিক্ত স্পেসিফিকেশন পাওয়া যায়নি।')}
              </p>
            )}
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="font-bold text-slate-900">{t('Delivery Information', 'ডেলিভারি সংক্রান্ত তথ্য')}</h4>
              <p>
                • <strong>{t('Inside Dhaka:', 'ঢাকার ভিতরে:')}</strong> {formatPrice(settings?.deliveryChargeInsideDhaka ?? 60)} {t('(Takes 24 to 48 hours)', '(২৪ থেকে ৪৮ ঘণ্টা)')}
              </p>
              <p>
                • <strong>{t('Outside Dhaka (All 64 districts):', 'ঢাকার বাইরে (সকল জেলা):')}</strong> {formatPrice(settings?.deliveryChargeOutsideDhaka ?? 120)} {t('(Takes 2 to 4 working days)', '(২ থেকে ৪ কার্যদিবস)')}
              </p>
              <p>
                • <strong>{t('Free Delivery Threshold:', 'ফ্রি ডেলিভারি:')}</strong> {t('Free delivery on orders over', 'অর্ডার')} {formatPrice(settings?.freeDeliveryThreshold ?? 2500)}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <h4 className="font-bold text-emerald-900">{t('7-Day Warranty & Return Policy', '৭ দিনের রিটার্ন পলিসি')}</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {t(
                  'If you find any manufacturing defect or damage upon receiving the package, please contact our WhatsApp helpline (01745329020) immediately with your unboxing video. We offer replacement or full refund within 7 days.',
                  'পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে বা পছন্দ না হলে আমাদের হোয়াটসঅ্যাপ নম্বরে (০১৭৪৫৩২৯০২০) দ্রুত জানান। আমরা ৭ দিনের মধ্যে পণ্য পরিবর্তন বা সম্পূর্ণ মূল্য ফেরত দিয়ে থাকি।'
                )}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8 max-w-3xl">
            {/* Reviews list */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                {t('Customer Feedback', 'গ্রাহকদের মতামত')} ({reviews.length})
              </h3>
              {loadingReviews ? (
                <p className="text-xs text-slate-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {t('No reviews yet. Be the first to leave a review!', 'এখনও কোনো রিভিউ নেই। প্রথম রিভিউটি দিন!')}
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">
                {t('Write a Verified Review', 'একটি রিভিউ লিখুন')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('Your Name *', 'নাম *')}</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Asif Mahmud"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('Rating', 'রেটিং')}</label>
                  <div className="flex items-center gap-1.5 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('Your Experience *', 'আপনার অভিজ্ঞতা *')}</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('Write your honest review about this product...', 'পণ্যটি সম্পর্কে আপনার বাস্তব অভিজ্ঞতা লিখুন...')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : t('Submit Review', 'রিভিউ জমা দিন')}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {t('Related Products from this Category', 'সম্পর্কিত অন্যান্য পণ্য')}
            </h2>
            <button
              onClick={() => onNavigate('shop', `category=${encodeURIComponent(product.category)}`)}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              {t('View All', 'সব দেখুন')}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} product={rp} onSelectProduct={onSelectProduct} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
