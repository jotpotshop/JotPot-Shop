import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Eye, Scale, Check, Package } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { getAvailableStock, getStockStatusInfo } from '../utils/inventory';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    products,
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

  const [imageError, setImageError] = useState(false);

  const liveProduct = products.find(p => p.id === product.id) || product;
  const isWished = isInWishlist(liveProduct.id);
  const isCompared = comparisonList.includes(liveProduct.id);
  const saveAmount = liveProduct.oldPrice && liveProduct.oldPrice > liveProduct.price
    ? liveProduct.oldPrice - liveProduct.price
    : 0;

  const availableStock = getAvailableStock(liveProduct);
  const stockInfo = getStockStatusInfo(liveProduct, undefined, undefined, language);
  const isOutOfStock = stockInfo.isOutOfStock;
  const isLowStock = stockInfo.isLowStock;

  // Show rating only when real customer reviews exist
  const hasRealReviews = Array.isArray(liveProduct.reviews) && liveProduct.reviews.length > 0;
  const computedRating = hasRealReviews
    ? (
        liveProduct.reviews!.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
        liveProduct.reviews!.length
      ).toFixed(1)
    : null;

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const added = addToCart(liveProduct, 1);
    if (added) {
      setActiveModal('checkout');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(liveProduct, 1);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
    }
  };

  const primaryImage = liveProduct.images?.[0];

  return (
    <div
      onClick={() => {
        setQuickViewProduct(liveProduct);
        setActiveModal('quickView');
      }}
      className="group bg-white rounded-2xl border border-[#e6e3dd] hover:border-gray-400 overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/4] w-full bg-[#faf9f7] overflow-hidden">
        {primaryImage && !imageError ? (
          <img
            src={primaryImage}
            alt={language === 'bn' ? liveProduct.nameBn : liveProduct.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-opacity duration-300 group-hover:opacity-95"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-[#faf9f7]">
            <Package className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}

        {/* Single Restrained Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 bg-[#111827] text-white text-[10px] font-semibold px-2.5 py-1 rounded-md tracking-wide uppercase">
            {t('স্টক শেষ', 'Out of Stock')}
          </span>
        ) : liveProduct.discountPercent && liveProduct.discountPercent > 0 ? (
          <span className="absolute top-2.5 left-2.5 bg-[#881337] text-white text-[11px] font-semibold px-2 py-0.5 rounded-md tabular-nums">
            -{liveProduct.discountPercent}%
          </span>
        ) : null}

        {/* Top Right Actions: Wishlist & Compare */}
        <div className="absolute top-2.5 right-2.5 flex flex-col space-y-1.5 z-10">
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(liveProduct.id);
            }}
            title={t('পছন্দের তালিকায় রাখুন', 'Save to Wishlist')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              isWished
                ? 'bg-[#881337] border-[#881337] text-white'
                : 'bg-white/95 border-[#e6e3dd] text-gray-600 hover:text-[#881337]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-white text-white' : ''}`} />
          </button>

          <button
            onClick={handleToggleCompare}
            title={t('তুলনা করুন', 'Compare')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
              isCompared
                ? 'bg-[#111827] border-[#111827] text-white'
                : 'bg-white/95 border-[#e6e3dd] text-gray-600 hover:text-[#111827]'
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick View on Desktop Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => {
              e.stopPropagation();
              setQuickViewProduct(liveProduct);
              setActiveModal('quickView');
            }}
            className="w-full bg-white hover:bg-[#faf9f7] text-[#111827] border border-[#e6e3dd] text-xs font-medium py-2 rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-gray-600" />
            <span>{t('বিস্তারিত দেখুন', 'Quick View')}</span>
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Genuine Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-medium text-gray-500 truncate max-w-[130px]">
              {language === 'bn' ? liveProduct.categoryBn : liveProduct.category}
            </span>
            {hasRealReviews && computedRating && (
              <div className="flex items-center space-x-1 text-gray-700 shrink-0 font-medium tabular-nums">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{computedRating}</span>
                <span className="text-gray-400 font-normal">({liveProduct.reviews!.length})</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-[13px] sm:text-sm font-medium text-[#111827] line-clamp-2 leading-[1.45] group-hover:text-[#881337] transition-colors mb-1.5 min-h-[2.6em]">
            {language === 'bn' ? liveProduct.nameBn : liveProduct.name}
          </h3>

          {/* Clean Unboxed Stock Status */}
          {isOutOfStock ? (
            <p className="text-[11px] font-medium text-[#b91c1c] mb-2">
              {t('বর্তমানে স্টক নেই', 'Currently out of stock')}
            </p>
          ) : isLowStock ? (
            <p className="text-[11px] font-medium text-amber-700 mb-2 tabular-nums">
              {t(`মাত্র ${availableStock}টি স্টকে আছে`, `Only ${availableStock} left`)}
            </p>
          ) : (
            <p className="text-[11px] font-normal text-[#15803d] mb-2 tabular-nums">
              {t(`স্টকে আছে (${availableStock}টি)`, `In stock (${availableStock})`)}
            </p>
          )}
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mb-2.5">
            <span className="text-sm sm:text-base font-bold text-[#111827] tabular-nums">
              {formatPrice(liveProduct.price)}
            </span>
            {liveProduct.oldPrice && liveProduct.oldPrice > liveProduct.price && (
              <span className="text-xs text-gray-400 line-through tabular-nums">
                {formatPrice(liveProduct.oldPrice)}
              </span>
            )}
            {saveAmount > 0 && (
              <span className="hidden sm:inline text-[11px] font-medium text-[#881337] tabular-nums">
                {t(`সাশ্রয় ${formatPrice(saveAmount)}`, `Save ${formatPrice(saveAmount)}`)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full text-[11px] sm:text-xs font-medium py-2 min-h-[38px] rounded-xl flex items-center justify-center space-x-1 transition-colors border ${
                isOutOfStock
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#faf9f7] hover:bg-gray-100 border-[#e6e3dd] text-[#111827] cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? t('স্টক নেই', 'Out') : t('ব্যাগ', 'Cart')}</span>
            </button>

            <button
              disabled={isOutOfStock}
              onClick={handleQuickBuy}
              className={`w-full text-[11px] sm:text-xs font-semibold py-2 min-h-[38px] rounded-xl flex items-center justify-center transition-colors ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#881337] hover:bg-[#9f1239] text-white cursor-pointer'
              }`}
            >
              <span>{isOutOfStock ? t('স্টক শেষ', 'Unavailable') : t('অর্ডার করুন', 'Order Now')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
