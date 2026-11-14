import React from 'react';
import { Heart, Star, ShoppingCart, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../types.js';
import { useStore } from '../context/StoreContext.js';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const {
    addToCart,
    openBuyNow,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    t,
  } = useStore();

  const isFavorite = isInWishlist(product.id);
  const inStock = product.stock > 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top Badges & Wishlist */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
            -{product.discountPercentage}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'bg-white/80 text-slate-400 hover:text-rose-600 hover:bg-white shadow-xs'
          }`}
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Product Image with smooth hover scale */}
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock Badge */}
        <div className="absolute bottom-2.5 left-2.5">
          {inStock ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t('In Stock', 'স্টক আছে')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {t('Stock Out', 'স্টক শেষ')}
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="text-[11px] font-medium text-slate-400 truncate mb-1">
          <span>{product.brand}</span>
          <span className="mx-1.5">•</span>
          <span>{product.category}</span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer min-h-[36px] leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-2 mb-2.5 text-xs">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold ml-1 text-slate-800 text-[11px]">{product.rating}</span>
          </div>
          <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-base sm:text-lg font-extrabold text-rose-600">
            {formatPrice(product.discountPrice)}
          </span>
          {product.price > product.discountPrice && (
            <span className="text-xs font-medium text-slate-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Action Buttons: Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            disabled={!inStock}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="truncate">{t('Cart', 'কার্ট')}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openBuyNow(product, 1);
            }}
            disabled={!inStock}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-xs hover:shadow-md hover:shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span className="truncate">{t('Order Now', 'অর্ডার করুন')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
