import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Banner } from '../types.js';
import { useStore } from '../context/StoreContext.js';

interface HeroBannerProps {
  banners: Banner[];
  onNavigate: (view: string, param?: string) => void;
}

export const HeroBannerSection: React.FC<HeroBannerProps> = ({ banners, onNavigate }) => {
  const { t } = useStore();
  const activeBanners = banners.filter((b) => b.isActive && b.showOnHomepage);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handleAction = () => {
    if (current.link) {
      if (current.link.startsWith('/shop')) {
        const query = current.link.includes('?') ? current.link.split('?')[1] : undefined;
        onNavigate('shop', query);
      } else if (current.link.startsWith('/categories')) {
        onNavigate('categories');
      } else {
        onNavigate('shop');
      }
    } else {
      onNavigate('shop');
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-900 text-white shadow-lg min-h-[185px] sm:min-h-[250px] md:min-h-[310px] flex items-center">
      {/* Background Image with overlay gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl px-4 sm:px-8 md:px-12 py-5 sm:py-7 space-y-2.5 sm:space-y-3">
        {current.badge && (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>{current.badge}</span>
          </div>
        )}

        <h1 className="text-lg sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
          {current.title}
        </h1>

        <p className="text-[11px] sm:text-xs md:text-sm text-slate-200 line-clamp-2 leading-relaxed max-w-md">
          {current.subtitle}
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-2">
          <button
            onClick={handleAction}
            className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all"
          >
            <span>{current.buttonText || t('Shop Now', 'এখনই কিনুন')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href="https://wa.me/8801745329020"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold rounded-xl backdrop-blur-md transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('WhatsApp Order', 'হোয়াটসঅ্যাপ অর্ডার')}</span>
          </a>
        </div>
      </div>

      {/* Arrows (Desktop) */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors hidden sm:flex"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors hidden sm:flex"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators / Dots */}
          <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex items-center gap-1.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-6 bg-rose-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
