import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Check,
  Store,
  ChevronRight,
  Share2,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getAvailableStock, getStockStatusInfo } from '../utils/inventory';
import { renderFormattedDescription } from '../utils/sanitizeHtml';

export const QuickViewModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    quickViewProduct,
    setQuickViewProduct,
    language,
    t,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    products,
  } = useShop();

  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);

  useEffect(() => {
    setSelectedImgIdx(0);
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setActiveTab('details');
    setMainImageError(false);
  }, [quickViewProduct?.id]);

  if (activeModal !== 'quickView' || !quickViewProduct) return null;

  const product = products.find(p => p.id === quickViewProduct.id) || quickViewProduct;
  const isWished = isInWishlist(product.id);
  const currentColor = selectedColor || product.colors[0] || '';
  const currentSize = selectedSize || product.sizes[0] || '';

  const availableStock = getAvailableStock(product, currentColor, currentSize);
  const stockInfo = getStockStatusInfo(product, currentColor, currentSize, language);
  const isOutOfStock = stockInfo.isOutOfStock;
  const isLowStock = stockInfo.isLowStock;
  const validQuantity = isOutOfStock ? 0 : Math.min(Math.max(1, quantity), availableStock);

  const publishedProducts = products.filter(p => p.isPublished !== false);
  const relatedProduct =
    publishedProducts.find(p => p.id !== product.id && p.category === product.category) ||
    publishedProducts.find(p => p.id !== product.id);

  const hasVerifiedReviews = Array.isArray(product.reviews) && product.reviews.length > 0;
  const activeImageSrc = product.images[selectedImgIdx] || product.images[0];

  const handleAddToCart = () => {
    if (isOutOfStock || validQuantity <= 0) return;
    const added = addToCart(product, validQuantity, currentColor, currentSize);
    if (added) {
      setActiveModal('cart');
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock || validQuantity <= 0) return;
    const added = addToCart(product, validQuantity, currentColor, currentSize);
    if (added) {
      setActiveModal('checkout');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#e6e3dd]">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-2 text-xs text-gray-600 min-w-0">
            <span className="font-semibold text-[#881337] whitespace-nowrap">
              {language === 'bn' ? product.categoryBn : product.category}
            </span>
            {product.subcategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate max-w-[200px] text-gray-600">
                  {language === 'bn' ? product.subcategoryBn : product.subcategory}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="px-2.5 py-1.5 min-h-[36px] text-gray-600 hover:text-[#111827] rounded-lg hover:bg-white border border-transparent hover:border-[#e6e3dd] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title={t('শেয়ার করুন', 'Share')}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copiedLink ? t('লিংক কপি হয়েছে', 'Copied') : t('শেয়ার', 'Share')}</span>
            </button>
            <button
              onClick={() => {
                setActiveModal(null);
                setQuickViewProduct(null);
              }}
              aria-label={t('বন্ধ করুন', 'Close')}
              className="p-2 min-h-[36px] min-w-[36px] text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#faf9f7] border border-[#e6e3dd] flex items-center justify-center">
              {activeImageSrc && !mainImageError ? (
                <img
                  src={activeImageSrc}
                  alt={language === 'bn' ? product.nameBn : product.name}
                  referrerPolicy="no-referrer"
                  onError={() => setMainImageError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                  <Package className="w-12 h-12 mb-2 text-gray-300" />
                  <span className="text-xs font-medium text-gray-500">
                    {language === 'bn' ? product.nameBn : product.name}
                  </span>
                </div>
              )}

              {isOutOfStock ? (
                <div className="absolute top-3 left-3 bg-[#111827] text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                  {t('স্টক আউট', 'Out of Stock')}
                </div>
              ) : product.discountPercent ? (
                <div className="absolute top-3 left-3 bg-[#881337] text-white text-[11px] font-semibold px-2.5 py-1 rounded tabular-nums">
                  -{product.discountPercent}%
                </div>
              ) : null}
            </div>

            {/* Thumbnail switcher */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImgIdx(idx);
                      setMainImageError(false);
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border transition-all cursor-pointer shrink-0 ${
                      selectedImgIdx === idx
                        ? 'border-[#111827] ring-1 ring-[#111827]'
                        : 'border-[#e6e3dd] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust and Guarantee notes */}
            <div className="bg-[#faf9f7] rounded-xl p-4 space-y-2.5 border border-[#e6e3dd] text-xs text-gray-700">
              <div className="flex items-center gap-2.5 text-[#111827] font-medium">
                <Truck className="w-4 h-4 text-[#881337] shrink-0" />
                <span>{language === 'bn' ? product.deliveryDaysBn : product.deliveryDays}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>{language === 'bn' ? product.returnPolicyBn : product.returnPolicy}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#111827] shrink-0" />
                <span>{language === 'bn' ? product.warrantyBn : product.warranty}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-gray-500">
                <span>
                  {t('ব্র্যান্ড:', 'Brand:')}{' '}
                  <strong className="text-[#111827] font-semibold">{product.brand}</strong>
                </span>
                {hasVerifiedReviews && (
                  <div className="flex items-center gap-1 text-[#111827] font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{product.rating}</span>
                    <span className="text-gray-500 font-normal">({product.reviews.length})</span>
                  </div>
                )}
              </div>

              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#111827] leading-snug">
                {language === 'bn' ? product.nameBn : product.name}
              </h2>

              <p className="text-xs text-gray-500 mt-1 tabular-nums">
                SKU: <span className="font-mono text-gray-700">{product.sku}</span>
              </p>

              {/* Price Row */}
              <div className="mt-3.5 flex flex-wrap items-baseline gap-2.5 tabular-nums">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827]">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-xs font-semibold text-[#881337]">
                    · {t(
                      `সাশ্রয় ${formatPrice(product.oldPrice - product.price)}`,
                      `Save ${formatPrice(product.oldPrice - product.price)}`
                    )}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-2.5">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-[#881337] text-xs font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {t('স্টক আউট — এই ভ্যারিয়েন্ট বর্তমানে শেষ', 'Out of stock — this variant is currently unavailable')}
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 text-xs font-semibold tabular-nums">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {stockInfo.statusBadgeText} · {t('সীমিত স্টক', 'Limited stock')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[#15803d] text-xs font-semibold tabular-nums">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    {t(`ইন স্টক (${availableStock}টি উপলব্ধ) — ডেলিভারির জন্য প্রস্তুত`, `In Stock (${availableStock} available) — Ready to ship`)}
                  </span>
                )}
              </div>

              {/* Variant Selector: Color */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#111827] mb-2">
                    <span>{t('রং নির্বাচন করুন:', 'Select Color:')}</span>
                    <span className="text-[#881337]">{currentColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => {
                      const colorStock = getAvailableStock(product, col, currentSize || undefined);
                      const isColorOut = colorStock <= 0;
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            currentColor === col
                              ? 'border-[#111827] bg-[#111827] text-white'
                              : isColorOut
                              ? 'border-[#e6e3dd] text-gray-400 bg-[#faf9f7]'
                              : 'border-[#e6e3dd] text-[#111827] bg-white hover:border-gray-400'
                          }`}
                        >
                          {currentColor === col && <Check className="w-3 h-3" />}
                          <span>{col}</span>
                          {isColorOut && (
                            <span className="text-[10px] opacity-80">({t('স্টক নেই', 'Out')})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variant Selector: Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#111827] mb-2">
                    <span>{t('সাইজ নির্বাচন করুন:', 'Select Size:')}</span>
                    <span className="text-[#881337]">{currentSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(sz => {
                      const sizeStock = getAvailableStock(product, currentColor || undefined, sz);
                      const isSizeOut = sizeStock <= 0;
                      return (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                            currentSize === sz
                              ? 'border-[#111827] bg-[#111827] text-white'
                              : isSizeOut
                              ? 'border-[#e6e3dd] text-gray-400 bg-[#faf9f7]'
                              : 'border-[#e6e3dd] text-[#111827] bg-white hover:border-gray-400'
                          }`}
                        >
                          <span>{sz}</span>
                          {isSizeOut && (
                            <span className="text-[10px] opacity-80">({t('শেষ', 'Out')})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-semibold text-[#111827]">{t('পরিমাণ:', 'Quantity:')}</span>
                <div className="flex items-center border border-[#e6e3dd] rounded-lg overflow-hidden bg-[#faf9f7]">
                  <button
                    disabled={isOutOfStock || validQuantity <= 1}
                    onClick={() => setQuantity(Math.max(1, validQuantity - 1))}
                    className={`px-3.5 py-1.5 min-h-[36px] text-sm font-bold transition-colors ${
                      isOutOfStock || validQuantity <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-[#111827] hover:bg-gray-200/70 cursor-pointer'
                    }`}
                  >
                    −
                  </button>
                  <span className={`px-3.5 py-1.5 text-sm font-bold bg-white tabular-nums ${isOutOfStock ? 'text-gray-400' : 'text-[#111827]'}`}>
                    {validQuantity}
                  </span>
                  <button
                    disabled={isOutOfStock || validQuantity >= availableStock}
                    onClick={() => setQuantity(Math.min(availableStock, validQuantity + 1))}
                    className={`px-3.5 py-1.5 min-h-[36px] text-sm font-bold transition-colors ${
                      isOutOfStock || validQuantity >= availableStock
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-[#111827] hover:bg-gray-200/70 cursor-pointer'
                    }`}
                  >
                    +
                  </button>
                </div>
                {availableStock > 0 && (
                  <span className="text-xs text-gray-500 tabular-nums">
                    ({t(`সর্বোচ্চ ${availableStock}টি`, `Max ${availableStock}`)})
                  </span>
                )}
              </div>

              {/* Seller details */}
              <div className="mt-4 pt-4 border-t border-[#e6e3dd] flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span>
                    {t('বিক্রেতা:', 'Seller:')}{' '}
                    <strong className="text-[#111827]">{product.sellerName || 'JotPot Official Store'}</strong>
                  </span>
                </div>
                <span className="text-[#15803d] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {t('ভেরিফাইড মার্চেন্ট', 'Verified')}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-4 border-t border-[#e6e3dd]">
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`w-full font-semibold text-xs sm:text-sm py-3 min-h-[44px] rounded-xl flex items-center justify-center gap-2 border transition-colors ${
                    isOutOfStock
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#faf9f7] border-[#e6e3dd] hover:border-[#111827] text-[#111827] cursor-pointer'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? t('স্টক আউট', 'Out of Stock') : t('ব্যাগে যোগ করুন', 'Add to Cart')}</span>
                </button>

                <button
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className={`w-full font-semibold text-xs sm:text-sm py-3 min-h-[44px] rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#881337] hover:bg-[#6d0f2c] text-white cursor-pointer'
                  }`}
                >
                  <span>{isOutOfStock ? t('স্টক নেই', 'No Stock') : t('এখনই কিনুন', 'Buy Now')}</span>
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full text-xs font-medium text-gray-600 hover:text-[#881337] py-1.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isWished ? 'fill-[#881337] text-[#881337]' : ''}`} />
                <span>
                  {isWished
                    ? t('উইশলিস্ট থেকে বাদ দিন', 'Remove from Wishlist')
                    : t('উইশলিস্টে রাখুন', 'Save to Wishlist')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabbed Info */}
        <div className="border-t border-[#e6e3dd] bg-[#faf9f7] p-5 sm:p-7">
          <div className="flex border-b border-[#e6e3dd] mb-5 gap-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details' ? 'border-[#881337] text-[#881337]' : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              {t('পণ্যের বিবরণ', 'Description')}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs' ? 'border-[#881337] text-[#881337]' : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              {t('স্পেসিফিকেশন', 'Specifications')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer tabular-nums ${
                activeTab === 'reviews' ? 'border-[#881337] text-[#881337]' : 'border-transparent text-gray-500 hover:text-[#111827]'
              }`}
            >
              {t(`কাস্টমার রিভিউ (${product.reviews.length})`, `Reviews (${product.reviews.length})`)}
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="rich-description-preview text-sm text-[#374151]">
                {renderFormattedDescription(
                  language === 'bn'
                    ? (product.descriptionBn || product.description)
                    : (product.description || product.descriptionBn)
                )}
              </div>

              {/* Frequently Bought Together Box */}
              {relatedProduct && (
                <div className="bg-white p-4 rounded-xl border border-[#e6e3dd] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#111827]">
                      {t('এই পণ্যের সাথে মানানসই আরও একটি পণ্য', 'Often paired with this item')}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {language === 'bn' ? relatedProduct.nameBn : relatedProduct.name}
                    </p>
                  </div>

                  {(() => {
                    const liveRelated = products.find(p => p.id === relatedProduct.id) || relatedProduct;
                    const isRelatedOut = getAvailableStock(liveRelated) <= 0;

                    return (
                      <div className="flex items-center gap-3 shrink-0 tabular-nums">
                        <span className="text-sm font-bold text-[#111827]">{formatPrice(liveRelated.price)}</span>
                        <button
                          disabled={isRelatedOut}
                          onClick={() => {
                            if (isRelatedOut) return;
                            addToCart(liveRelated, 1);
                          }}
                          className={`text-xs font-semibold px-3.5 py-2 min-h-[36px] rounded-lg transition-colors ${
                            isRelatedOut
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-[#e6e3dd]'
                              : 'bg-[#111827] hover:bg-black text-white cursor-pointer'
                          }`}
                        >
                          {isRelatedOut ? t('স্টক নেই', 'No Stock') : t('ব্যাগে যোগ করুন', 'Add')}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="bg-white p-3 rounded-xl border border-[#e6e3dd] flex justify-between gap-3">
                  <span className="text-gray-500 font-medium">{key}</span>
                  <span className="text-[#111827] font-semibold text-right">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  {t('এখনও কোনো রিভিউ যুক্ত হয়নি। পণ্যটি কিনে প্রথম রিভিউ দিন।', 'No reviews yet. Be the first to review!')}
                </p>
              ) : (
                product.reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-[#e6e3dd] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#111827]">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[11px] text-[#15803d] font-medium flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            {t('ভেরিফাইড বায়ার', 'Verified Purchase')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 tabular-nums">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{language === 'bn' ? rev.commentBn || rev.comment : rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
