import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, Search, X, Check, ArrowUpDown, Flame, Clock } from 'lucide-react';
import { Product, Category } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { useStore } from '../context/StoreContext.js';

interface ShopViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
  initialTag?: string;
  initialOfferId?: string;
  initialFlashSale?: boolean;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  categories,
  initialCategory,
  initialSearch,
  initialTag,
  initialOfferId,
  initialFlashSale,
  onSelectProduct,
  onNavigate,
}) => {
  const { t, formatPrice, offers, language } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [search, setSearch] = useState<string>(initialSearch || '');
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(initialOfferId);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyFlashSale, setOnlyFlashSale] = useState<boolean>(initialFlashSale || false);
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const activeOffer = useMemo(
    () => (selectedOfferId ? offers.find((o) => o.id === selectedOfferId) : undefined),
    [offers, selectedOfferId]
  );

  useEffect(() => {
    if (!activeOffer) return;
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeOffer]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Offer Campaign
        if (activeOffer && !activeOffer.productIds.includes(p.id)) {
          return false;
        }
        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchBrand && !matchCat && !matchSku) return false;
        }
        // Stock
        if (onlyInStock && p.stock <= 0) return false;
        // Flash Sale
        if (onlyFlashSale && !p.isFlashSale) return false;
        // Price
        if (p.discountPrice > priceRange) return false;
        // Tag
        if (initialTag && !p.tags.includes(initialTag)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.discountPrice - b.discountPrice;
        if (sortBy === 'price-desc') return b.discountPrice - a.discountPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return +new Date(b.createdAt) - +new Date(a.createdAt);
        return 0;
      });
  }, [products, activeOffer, selectedCategory, search, onlyInStock, onlyFlashSale, priceRange, sortBy, initialTag]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearch('');
    setSelectedOfferId(undefined);
    setOnlyInStock(false);
    setOnlyFlashSale(false);
    setPriceRange(100000);
    setSortBy('newest');
  };

  const offerRemainingMs = activeOffer ? Math.max(0, +new Date(activeOffer.endTime) - nowTick) : 0;
  const offerDays = Math.floor(offerRemainingMs / (1000 * 60 * 60 * 24));
  const offerHours = Math.floor((offerRemainingMs / (1000 * 60 * 60)) % 24);
  const offerMins = Math.floor((offerRemainingMs / 1000 / 60) % 60);
  const offerSecs = Math.floor((offerRemainingMs / 1000) % 60);

  return (
    <div className="space-y-6">
      {/* Active Offer Campaign Header Banner */}
      {activeOffer && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{activeOffer.discountHighlight || t('SPECIAL OFFER', 'বিশেষ অফার')}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black">
              {language === 'bn' && activeOffer.titleBn ? activeOffer.titleBn : activeOffer.title}
            </h2>
            {activeOffer.subtitle && (
              <p className="text-xs text-slate-300">{activeOffer.subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {offerRemainingMs > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-2 rounded-xl border border-white/10 font-mono tabular-nums text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-bold">
                  {offerDays > 0 ? `${offerDays}d : ` : ''}
                  {String(offerHours).padStart(2, '0')}h : {String(offerMins).padStart(2, '0')}m :{' '}
                  {String(offerSecs).padStart(2, '0')}s
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSelectedOfferId(undefined)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('All Products', 'সব পণ্য দেখুন')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {activeOffer
              ? language === 'bn' && activeOffer.titleBn
                ? activeOffer.titleBn
                : activeOffer.title
              : selectedCategory === 'All'
              ? t('Explore All Products', 'সকল পণ্য অন্বেষণ করুন')
              : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('Showing', 'দেখানো হচ্ছে')} {filteredProducts.length} {t('products matching your criteria', 'টি পণ্য')}
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-600" />
            <span>{t('Filters', 'ফিল্টার')}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">{t('Sort by:', 'সাজান:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="newest">{t('Newest Arrivals', 'নতুন সংযোজন')}</option>
              <option value="price-asc">{t('Price: Low to High', 'দাম: কম থেকে বেশি')}</option>
              <option value="price-desc">{t('Price: High to Low', 'দাম: বেশি থেকে কম')}</option>
              <option value="rating">{t('Customer Rating', 'গ্রাহক রেটিং')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside
          className={`md:col-span-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-6 h-fit ${
            mobileFiltersOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-600" />
              <span>{t('Filter Products', 'ফিল্টার সমূহ')}</span>
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-rose-600 hover:underline"
            >
              {t('Reset All', 'রিসেট')}
            </button>
          </div>

          {/* Search within page */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('Keyword Search', 'কীওয়ার্ড সার্চ')}</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search in results...', 'ফলাফলে খুঁজুন...')}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">{t('Categories', 'ক্যাটাগরি')}</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{t('All Categories', 'সকল ক্যাটাগরি')}</span>
                <span className="text-[10px] text-slate-400">{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-rose-50 text-rose-600 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{t('Max Price', 'সর্বোচ্চ মূল্য')}</span>
              <span className="text-rose-600 font-extrabold">{formatPrice(priceRange)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
              />
              <span>{t('In Stock Items Only', 'শুধু স্টকে থাকা পণ্য')}</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFlashSale}
                onChange={(e) => setOnlyFlashSale(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
              />
              <span>{t('Flash Sale Deals Only', 'শুধু ফ্ল্যাশ সেল অফার')}</span>
            </label>
          </div>
        </aside>

        {/* Product Grid (9 cols) */}
        <main className="md:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {t('No products found matching your filters', 'কোনো পণ্য খুঁজে পাওয়া যায়নি')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('Try adjusting your search criteria or resetting filters to see more available options.', 'ফিল্টার রিসেট করে আবার চেষ্টা করুন।')}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-rose-600 text-white rounded-full text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                {t('Reset All Filters', 'সকল ফিল্টার রিসেট করুন')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
