import React, { useState } from 'react';
import {
  X,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Zap,
  Check,
  Store,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

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

  if (activeModal !== 'quickView' || !quickViewProduct) return null;

  const product = quickViewProduct;
  const isWished = isInWishlist(product.id);
  const currentColor = selectedColor || product.colors[0] || '';
  const currentSize = selectedSize || product.sizes[0] || '';

  // Frequently bought together item
  const relatedProduct = products.find(p => p.id !== product.id && p.category === product.category) || products[0];

  const handleAddToCart = () => {
    addToCart(product, quantity, currentColor, currentSize);
    setActiveModal('cart');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, currentColor, currentSize);
    setActiveModal('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {language === 'bn' ? product.categoryBn : product.category}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="truncate max-w-[200px]">{language === 'bn' ? product.subcategoryBn : product.subcategory}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center space-x-1 text-xs"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? t('লিংক কপিড!', 'Copied!') : t('শেয়ার', 'Share')}</span>
            </button>
            <button
              onClick={() => {
                setActiveModal(null);
                setQuickViewProduct(null);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-xs">
              <img
                src={product.images[selectedImgIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {product.discountPercent && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-xs">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail switcher */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImgIdx === idx ? 'border-rose-600 scale-105 shadow-sm' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust and Guarantee badges */}
            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 border border-gray-100 text-xs text-gray-700">
              <div className="flex items-center space-x-2.5 text-gray-800 font-semibold">
                <Truck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{language === 'bn' ? product.deliveryDaysBn : product.deliveryDays}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'bn' ? product.returnPolicyBn : product.returnPolicy}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{language === 'bn' ? product.warrantyBn : product.warranty}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Brand: <span className="text-gray-900">{product.brand}</span>
                </span>
                <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-gray-500">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-gray-900 leading-snug">
                {language === 'bn' ? product.nameBn : product.name}
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>

              {/* Price Row */}
              <div className="mt-3 flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {product.oldPrice && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {t(
                      `সাশ্রয় ${formatPrice(product.oldPrice - product.price)}`,
                      `Save ${formatPrice(product.oldPrice - product.price)}`
                    )}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mt-2.5">
                {product.stock <= 5 && product.stock > 0 ? (
                  <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-md animate-pulse">
                    {t(`⚠️ মাত্র ${product.stock}টি বাকি আছে! ঝটপট অর্ডার করুন`, `⚠️ Only ${product.stock} left in stock! Order quickly`)}
                  </span>
                ) : (
                  <span className="inline-block text-emerald-600 text-xs font-semibold">
                    ✓ {t('ইন স্টক — এখনই অর্ডারে প্রস্তুত', 'In Stock — Ready to ship')}
                  </span>
                )}
              </div>

              {/* Variant Selector: Color */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>{t('রং নির্বাচন করুন:', 'Select Color:')}</span>
                    <span className="text-rose-600">{currentColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                          currentColor === col
                            ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {currentColor === col && <Check className="w-3 h-3 text-rose-600" />}
                        <span>{col}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Selector: Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2">
                    <span>{t('সাইজ নির্বাচন করুন:', 'Select Size:')}</span>
                    <span className="text-rose-600">{currentSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          currentSize === sz
                            ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                            : 'border-gray-200 text-gray-800 hover:border-gray-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-700">{t('পরিমাণ:', 'Quantity:')}</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-gray-900 bg-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Seller details */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span>
                    {t('বিক্রেতা:', 'Seller:')}{' '}
                    <strong className="text-gray-900">{product.sellerName || 'JotPot Official Store'}</strong>
                  </span>
                </div>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                  ✓ {t('ভেরিফাইড মার্চেন্ট', 'Verified')}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm py-3 rounded-2xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('ব্যাগে যোগ করুন', 'Add to Cart')}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm py-3 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white stroke-none" />
                  <span>{t('এখনই কিনুন (১-ক্লিক)', 'Buy Now (1-Click)')}</span>
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full text-xs font-semibold text-gray-600 hover:text-rose-600 py-1 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600 text-rose-600' : ''}`} />
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
        <div className="border-t border-gray-100 bg-gray-50/70 p-5 sm:p-7">
          <div className="flex border-b border-gray-200 mb-4 space-x-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t('পণ্যের বিবরণ', 'Description')}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t('স্পেসিফিকেশন', 'Specifications')}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'reviews' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t(`কাস্টমার রিভিউ (${product.reviews.length})`, `Reviews (${product.reviews.length})`)}
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4">
              <p>{language === 'bn' ? product.descriptionBn : product.description}</p>

              {/* Frequently Bought Together Box */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">✨</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {t('এই পণ্যের সাথে সবচেয়ে বেশি কেনা হয়:', 'Frequently Bought Together:')}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {language === 'bn' ? relatedProduct.nameBn : relatedProduct.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(relatedProduct.price)}</span>
                  <button
                    onClick={() => addToCart(relatedProduct, 1)}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                  >
                    + {t('যোগ করুন', 'Add')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="bg-white p-2.5 rounded-xl border border-gray-200 flex justify-between">
                  <span className="text-gray-500 font-medium">{key}</span>
                  <span className="text-gray-900 font-bold text-right">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">
                  {t('এখনও কোনো রিভিউ যুক্ত হয়নি। পণ্যটি কিনে প্রথম রিভিউ দিন!', 'No reviews yet. Be the first to review!')}
                </p>
              ) : (
                product.reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.2 rounded">
                            ✓ {t('ভেরিফাইড বায়ার', 'Verified Purchase')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700">{language === 'bn' ? rev.commentBn || rev.comment : rev.comment}</p>
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
