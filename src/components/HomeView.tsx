import React from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  Layers,
  Phone
} from 'lucide-react';
import { Product, Category, Banner, FlashSaleConfig, BlogPost, Advertisement } from '../types.js';
import { HeroBannerSection } from './HeroBannerSection.js';
import { FlashSaleSection } from './FlashSaleSection.js';
import { OfferCampaignsSection } from './OfferCampaignsSection.js';
import { ProductCard } from './ProductCard.js';
import { useStore } from '../context/StoreContext.js';

interface HomeViewProps {
  banners: Banner[];
  flashSale: FlashSaleConfig | null;
  products: Product[];
  categories: Category[];
  blogs: BlogPost[];
  ads: Advertisement[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners,
  flashSale,
  products,
  categories,
  blogs,
  ads,
  onSelectProduct,
  onNavigate,
}) => {
  const { t, offers } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);
  const promoAd = ads.find((a) => a.isActive && a.showOnHomepage) || ads[0];

  return (
    <div className="space-y-6 sm:space-y-10">
      
      {/* Dynamic Hero Banner Slider */}
      <section>
        <HeroBannerSection banners={banners} onNavigate={onNavigate} />
      </section>

      {/* Category Pills / Circular Department Icons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              {t('Explore Departments', 'ক্যাটাগরি সমূহ')}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {t('Browse handpicked categories', 'পছন্দের পণ্য সহজে খুঁজে নিন')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group shrink-0"
          >
            <span>{t('All', 'সব দেখুন')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', `category=${encodeURIComponent(cat.name)}`)}
              className="cursor-pointer group flex flex-col items-center text-center p-2 sm:p-3 rounded-2xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 mb-1.5 group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400">
                {products.filter((p) => p.category === cat.name).length} {t('items', 'পণ্য')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section with Real-Time Countdown Timer */}
      <section>
        <FlashSaleSection
          config={flashSale}
          products={products}
          onSelectProduct={onSelectProduct}
          onNavigate={onNavigate}
        />
      </section>

      {/* Custom Admin-Created Timed Offer Campaigns */}
      <OfferCampaignsSection
        offers={offers}
        products={products}
        onSelectProduct={onSelectProduct}
        onNavigate={onNavigate}
      />

      {/* Featured Products Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{t('Handpicked for You', 'নির্বাচিত কালেকশন')}</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              {t('Featured Best Sellers', 'জনপ্রিয় বেস্ট সেলার')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', 'isFeatured=true')}
            className="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group shrink-0"
          >
            <span>{t('View All', 'সব দেখুন')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* Mid Promotional Banner Card */}
      {promoAd && (
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-block px-2.5 py-0.5 bg-rose-600/80 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Special Promotion
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {promoAd.title}
            </h3>
            <p className="text-xs text-slate-300">
              {promoAd.subtitle || t('Upgrade your daily lifestyle with premium electronics & authentic Bangladesh craftsmanship.', 'সেরা কোয়ালিটি এবং সাশ্রয়ী মূল্যে আপনার পছন্দের পণ্য কিনুন।')}
            </p>
            <div className="pt-1 flex flex-wrap gap-2 justify-center md:justify-start">
              <button
                onClick={() => onNavigate('shop')}
                className="px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 text-[11px] sm:text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                {t('Shop The Collection', 'কালেকশন দেখুন')}
              </button>
              <a
                href="https://wa.me/8801745329020"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('Order via WhatsApp', 'হোয়াটসঅ্যাপ অর্ডার')}</span>
              </a>
            </div>
          </div>

          <div className="w-36 sm:w-48 md:w-56 aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/10 shrink-0">
            <img
              src={promoAd.image}
              alt={promoAd.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" />
              <span>{t('Just Landed', 'নতুন সংযোজন')}</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
              {t('New Arrivals in Bangladesh', 'সদ্য আসা নতুন পণ্য')}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group shrink-0"
          >
            <span>{t('View All', 'সব দেখুন')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* Blog & Shopping Guides Preview */}
      {blogs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('Tech & Shopping Guides', 'ব্লগ ও শপিং গাইড')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('Tips and reviews to help you make the best purchase decisions', 'সঠিক পণ্য বেছে নেওয়ার প্রয়োজনীয় গাইড')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
            >
              <span>{t('Read All Articles', 'সব পড়ুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogs.slice(0, 2).map((blog) => (
              <div
                key={blog.id}
                onClick={() => onNavigate('blog')}
                className="cursor-pointer group bg-white rounded-3xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all flex gap-4 items-center"
              >
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold text-rose-600 uppercase">
                    {blog.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {blog.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
