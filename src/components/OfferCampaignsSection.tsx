import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { OfferCampaign, OfferCampaignTheme, Product } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { useStore } from '../context/StoreContext.js';

interface OfferCampaignsSectionProps {
  offers: OfferCampaign[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

const THEME_CLASSES: Record<
  OfferCampaignTheme,
  {
    container: string;
    subtitle: string;
    secondsText: string;
    ctaButton: string;
  }
> = {
  crimson: {
    container: 'bg-gradient-to-br from-rose-600 via-red-600 to-rose-700',
    subtitle: 'text-rose-100',
    secondsText: 'text-rose-600',
    ctaButton: 'bg-white text-rose-600 hover:bg-rose-50',
  },
  obsidian: {
    container: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800',
    subtitle: 'text-slate-300',
    secondsText: 'text-rose-600',
    ctaButton: 'bg-white text-slate-900 hover:bg-slate-100',
  },
  emerald: {
    container: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800',
    subtitle: 'text-emerald-100',
    secondsText: 'text-emerald-700',
    ctaButton: 'bg-white text-emerald-700 hover:bg-emerald-50',
  },
  amber: {
    container: 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700',
    subtitle: 'text-amber-100',
    secondsText: 'text-orange-600',
    ctaButton: 'bg-white text-orange-700 hover:bg-amber-50',
  },
  indigo: {
    container: 'bg-gradient-to-br from-indigo-700 via-violet-700 to-indigo-800',
    subtitle: 'text-indigo-100',
    secondsText: 'text-indigo-700',
    ctaButton: 'bg-white text-indigo-700 hover:bg-indigo-50',
  },
};

function computeTimeLeft(endTime: string) {
  const difference = +new Date(endTime) - Date.now();
  if (Number.isNaN(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

const SingleOfferCard: React.FC<{
  offer: OfferCampaign;
  offerProducts: Product[];
  nowTick: number;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}> = ({ offer, offerProducts, onSelectProduct, onNavigate }) => {
  const { t, language } = useStore();
  const timeLeft = computeTimeLeft(offer.endTime);

  if (!offer.isActive || timeLeft.expired || offerProducts.length === 0) {
    return null;
  }

  const styles = THEME_CLASSES[offer.theme] || THEME_CLASSES.crimson;
  const displayTitle = language === 'bn' && offer.titleBn ? offer.titleBn : offer.title;

  return (
    <section
      className={`${styles.container} rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white shadow-lg overflow-hidden relative`}
    >
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/15">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
            <span>{offer.discountHighlight || t('SPECIAL OFFER', 'বিশেষ অফার')}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
            {displayTitle}
          </h2>
          {offer.subtitle && (
            <p className={`text-[11px] sm:text-xs ${styles.subtitle}`}>{offer.subtitle}</p>
          )}
        </div>

        {/* Real-time Countdown Timer */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-black/25 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-300 ml-1" />
          <span className={`text-[11px] font-bold mr-0.5 ${styles.subtitle}`}>
            {t('Ends:', 'বাকি:')}
          </span>

          <div className="flex items-center gap-1 text-center font-mono tabular-nums">
            {timeLeft.days > 0 && (
              <>
                <div className="bg-white text-slate-900 rounded-lg px-2 py-0.5 min-w-[28px]">
                  <span className="text-xs font-black block leading-none">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase">D</span>
                </div>
                <span className="font-bold text-white text-xs">:</span>
              </>
            )}
            <div className="bg-white text-slate-900 rounded-lg px-2 py-0.5 min-w-[28px]">
              <span className="text-xs font-black block leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">H</span>
            </div>
            <span className="font-bold text-white text-xs">:</span>
            <div className="bg-white text-slate-900 rounded-lg px-2 py-0.5 min-w-[28px]">
              <span className="text-xs font-black block leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">M</span>
            </div>
            <span className="font-bold text-white text-xs">:</span>
            <div className="bg-white text-slate-900 rounded-lg px-2 py-0.5 min-w-[28px]">
              <span className={`text-xs font-black block leading-none ${styles.secondsText}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Products Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-4">
        {offerProducts.slice(0, 4).map((product) => (
          <div key={product.id} className="text-slate-900">
            <ProductCard product={product} onSelectProduct={onSelectProduct} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="relative z-10 pt-4 text-center">
        <button
          onClick={() => onNavigate('shop', `offer=${encodeURIComponent(offer.id)}`)}
          className={`inline-flex items-center gap-1.5 px-5 py-2 ${styles.ctaButton} text-[11px] sm:text-xs font-bold rounded-full shadow-sm transition-colors`}
        >
          <span>
            {t(`View All (${offerProducts.length} Deals)`, `সবগুলো অফার দেখুন (${offerProducts.length}টি)`)}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};

export const OfferCampaignsSection: React.FC<OfferCampaignsSectionProps> = ({
  offers,
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const [nowTick, setNowTick] = useState(() => Date.now());

  const activeOffers = offers.filter(
    (o) => o.isActive && +new Date(o.endTime) > nowTick && o.productIds.length > 0
  );

  useEffect(() => {
    if (offers.length === 0) return;
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [offers.length]);

  if (activeOffers.length === 0) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeOffers.map((offer) => {
        const offerIdSet = new Set(offer.productIds);
        const offerProducts = products.filter((p) => offerIdSet.has(p.id));
        if (offerProducts.length === 0) return null;
        return (
          <SingleOfferCard
            key={offer.id}
            offer={offer}
            offerProducts={offerProducts}
            nowTick={nowTick}
            onSelectProduct={onSelectProduct}
            onNavigate={onNavigate}
          />
        );
      })}
    </div>
  );
};
