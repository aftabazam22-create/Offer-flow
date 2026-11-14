import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types.js';
import { ProductCard } from './ProductCard.js';
import { useStore } from '../context/StoreContext.js';

interface WishlistViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  onSelectProduct,
  onNavigate,
}) => {
  const { wishlist, t } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-rose-600" />
            <span>{t('Saved Items', 'সংরক্ষিত পণ্য')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {t('My Wishlist', 'আমার উইশলিস্ট')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {wishlistProducts.length} {t('items saved for later', 'টি পণ্য সংরক্ষিত আছে')}
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {t('Your wishlist is empty', 'আপনার উইশলিস্ট খালি')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('Tap the heart icon on any product to save it to your personal wishlist.', 'যেকোনো পণ্যের হার্ট আইকনে চাপ দিয়ে উইশলিস্টে রাখুন।')}
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-colors"
          >
            {t('Explore Products', 'পণ্য দেখুন')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      )}
    </div>
  );
};
