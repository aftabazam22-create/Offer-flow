import React from 'react';
import { Category, Product } from '../types.js';
import { useStore } from '../context/StoreContext.js';
import { ArrowRight, Layers } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  const { t } = useStore();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>{t('Marketplace Departments', 'বিভাগসমূহ')}</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-1">
          {t('Explore by Category', 'ক্যাটাগরি অনুযায়ী পণ্যসমূহ')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          {t(
            'Discover quality lifestyle, smart electronics, kitchen appliances, and fashion collections curated for Bangladesh.',
            'আপনার পছন্দের ক্যাটাগরি বেছে নিন এবং সেরা অফার উপভোগ করুন।'
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.name).length;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className="group cursor-pointer bg-white rounded-3xl p-4 border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col items-center text-center space-y-3"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {count} {t('products', 'টি পণ্য')}
                </p>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
