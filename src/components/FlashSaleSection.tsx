import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight, Zap } from 'lucide-react';
import { Product, FlashSaleConfig } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { useStore } from '../context/StoreContext.js';

interface FlashSaleSectionProps {
  config: FlashSaleConfig | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({
  config,
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const { t } = useStore();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!config || !config.isActive) return;

    const calculateTime = () => {
      const difference = +new Date(config.endTime) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (!config || !config.isActive || timeLeft.expired) return null;

  // Filter flash sale items
  const flashProducts = products.filter((p) => p.isFlashSale);

  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 text-white shadow-lg overflow-hidden relative">
      {/* Decorative Blur and Accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/15">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full backdrop-blur-md">
            <Flame className="w-3 h-3 fill-amber-300 text-amber-300 animate-bounce" />
            <span>{config.discountHighlight || t('LIMITED TIME MEGA DEALS', 'সীমিত সময়ের মেগা অফার')}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
            {config.title}
          </h2>
          {config.titleBn && <p className="text-[11px] sm:text-xs text-rose-100">{config.titleBn}</p>}
        </div>

        {/* Real-time Countdown Timer */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-black/25 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
          <Clock className="w-3.5 h-3.5 text-amber-300 ml-1" />
          <span className="text-[11px] font-bold text-rose-100 mr-0.5">{t('Ends:', 'বাকি:')}</span>
          
          <div className="flex items-center gap-1 text-center">
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
              <span className="text-xs font-black block leading-none text-rose-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Product Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-4">
        {flashProducts.slice(0, 4).map((product) => (
          <div key={product.id} className="text-slate-900">
            <ProductCard product={product} onSelectProduct={onSelectProduct} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="relative z-10 pt-4 text-center">
        <button
          onClick={() => onNavigate('shop', 'isFlashSale=true')}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-rose-600 hover:bg-rose-50 text-[11px] sm:text-xs font-bold rounded-full shadow-sm transition-colors"
        >
          <span>{t('View All Flash Sale Deals', 'সকল ফ্ল্যাশ সেল অফার দেখুন')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
