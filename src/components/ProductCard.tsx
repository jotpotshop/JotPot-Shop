import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Zap, Scale, Check } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    language,
    t,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    comparisonList,
    addToComparison,
    removeFromComparison,
    setQuickViewProduct,
    setActiveModal,
  } = useShop();

  const isWished = isInWishlist(product.id);
  const isCompared = comparisonList.includes(product.id);
  const saveAmount = product.oldPrice ? product.oldPrice - product.price : 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setActiveModal('checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  return (
    <div
      onClick={() => {
        setQuickViewProduct(product);
        setActiveModal('quickView');
      }}
      className="group bg-white rounded-2xl border border-gray-100/90 hover:border-rose-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {product.discountPercent && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
            {product.discountPercent}% OFF
          </div>
        )}

        {/* Flash Sale or Trending Badge */}
        {product.isFlashSale && !product.discountPercent && (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center space-x-1">
            <Zap className="w-3 h-3 fill-white" />
            <span>FLASH</span>
          </div>
        )}

        {/* Top Right Actions: Wishlist & Compare */}
        <div className="absolute top-2.5 right-2.5 flex flex-col space-y-1.5 z-10">
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={t('উইশলিস্ট', 'Wishlist')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs cursor-pointer ${
              isWished
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>

          <button
            onClick={handleToggleCompare}
            title={t('তুলনা করুন', 'Compare')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs cursor-pointer ${
              isCompared
                ? 'bg-amber-50 text-amber-600'
                : 'bg-white/80 hover:bg-white text-gray-600 hover:text-amber-600'
            }`}
          >
            {isCompared ? <Check className="w-4 h-4 text-amber-600" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick View Button on Image hover (Desktop) */}
        <div className="absolute inset-x-2 bottom-2 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation();
              setQuickViewProduct(product);
              setActiveModal('quickView');
            }}
            className="w-full bg-white/95 hover:bg-white text-gray-900 text-xs font-bold py-2 rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('কুইক ভিউ', 'Quick View')}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px] truncate max-w-[120px]">
              {language === 'bn' ? product.categoryBn : product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 shrink-0 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-rose-600 transition-colors mb-1.5">
            {language === 'bn' ? product.nameBn : product.name}
          </h3>

          {/* Low Stock Urgency Tag */}
          {isLowStock ? (
            <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mb-2">
              {t(`⚠️ মাত্র ${product.stock}টি বাকি আছে!`, `⚠️ Only ${product.stock} left in stock!`)}
            </div>
          ) : (
            <div className="text-[10px] font-medium text-emerald-600 inline-block mb-2">
              ✓ {t('ইন স্টক • দ্রুত ডেলিভারি', 'In Stock • Fast Delivery')}
            </div>
          )}
        </div>

        {/* Pricing & CTA Buttons */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            {saveAmount > 0 && (
              <span className="hidden sm:inline-block text-[10px] font-semibold text-rose-600 bg-rose-50 px-1 rounded">
                {t(`সাশ্রয় ${formatPrice(saveAmount)}`, `Save ${formatPrice(saveAmount)}`)}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-800 text-[11px] sm:text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('ব্যাগ', 'Cart')}</span>
            </button>

            <button
              onClick={handleQuickBuy}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-1 shadow-xs shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-white stroke-none" />
              <span>{t('অর্ডার করুন', 'Buy Now')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
