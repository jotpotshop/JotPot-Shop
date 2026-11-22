import React, { useState } from 'react';
import {
  X,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  Check,
  Tag,
  Truck,
  Package,
  AlertCircle,
} from 'lucide-react';
import { useShop, FREE_DELIVERY_THRESHOLD } from '../context/ShopContext';
import { getAvailableStock } from '../utils/inventory';

export const CartDrawer: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    products,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    cartSubtotal,
    couponDiscount,
    deliveryFee,
    cartTotal,
    freeDeliveryRemaining,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    language,
    t,
    formatPrice,
    user,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (activeModal !== 'cart') return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    setActiveModal('checkout');
  };

  const freeDeliveryPercent = Math.min(100, Math.round((cartSubtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const totalItemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#e6e3dd]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#111827] shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-editorial font-bold text-base text-[#111827] leading-tight">
                  {t('আপনার শপিং ব্যাগ', 'Your Shopping Bag')}
                </h3>
                <span className="text-xs font-semibold text-[#881337] tabular-nums">
                  ({totalItemCount})
                </span>
              </div>
              {user.isLoggedIn && (
                <span className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                  {t('অ্যাকাউন্ট:', 'Account:')} <strong className="text-[#111827]">{user.name || user.phone}</strong>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            aria-label={t('বন্ধ করুন', 'Close')}
            className="p-2 text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#e6e3dd]">
          <div className="flex items-center justify-between text-xs font-medium mb-2 tabular-nums">
            <span className="flex items-center text-[#111827]">
              <Truck className="w-3.5 h-3.5 text-[#881337] mr-1.5 shrink-0" />
              {freeDeliveryRemaining > 0 ? (
                <span>
                  {t(
                    `আরও ${formatPrice(freeDeliveryRemaining)}-এর পণ্য কিনলে ফ্রি ডেলিভারি`,
                    `Add ${formatPrice(freeDeliveryRemaining)} more for free delivery`
                  )}
                </span>
              ) : (
                <span className="text-[#15803d] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  {t('ফ্রি ডেলিভারি সুবিধার আওতাভুক্ত হয়েছেন', 'You unlocked free delivery')}
                </span>
              )}
            </span>
            <span className="text-gray-600 font-semibold">{freeDeliveryPercent}%</span>
          </div>
          <div className="w-full bg-[#faf9f7] border border-[#e6e3dd] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#881337] h-full rounded-full transition-all duration-300"
              style={{ width: `${freeDeliveryPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#faf9f7] border border-[#e6e3dd] text-gray-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#111827] text-base">
                {t('আপনার ব্যাগ খালি আছে', 'Your bag is empty')}
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-5">
                {t('পছন্দের পণ্যটি বেছে নিয়ে ব্যাগে যোগ করুন।', 'Explore our collections and add items to your bag.')}
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs px-5 py-2.5 min-h-[40px] rounded-xl cursor-pointer transition-colors"
              >
                {t('কেনাকাটা শুরু করুন', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const { product, quantity, selectedColor, selectedSize } = item;
              const live = products.find(p => p.id === product.id) || product;
              const available = getAvailableStock(live, selectedColor, selectedSize);
              const isOutOfStock = available <= 0;
              const isOverStock = quantity > available;

              return (
                <div
                  key={`${product.id}-${selectedColor}-${selectedSize}-${idx}`}
                  className={`p-3.5 rounded-xl border flex gap-3 transition-colors ${
                    isOutOfStock
                      ? 'bg-rose-50/40 border-rose-200'
                      : isOverStock
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-white border-[#e6e3dd]'
                  }`}
                >
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-lg border border-[#e6e3dd] bg-[#faf9f7] shrink-0 overflow-hidden flex items-center justify-center">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={language === 'bn' ? product.nameBn : product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#111827] line-clamp-1">
                        {language === 'bn' ? product.nameBn : product.name}
                      </h4>

                      {/* Variant metadata */}
                      {(selectedColor || selectedSize) && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                          {selectedColor && <span>{selectedColor}</span>}
                          {selectedColor && selectedSize && <span aria-hidden="true">·</span>}
                          {selectedSize && <span>{t('সাইজ:', 'Size:')} {selectedSize}</span>}
                        </div>
                      )}

                      {/* Live Stock Warnings */}
                      {isOutOfStock ? (
                        <div className="text-[11px] font-medium text-[#881337] flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t('স্টক আউট — অনুগ্রহ করে বাদ দিন', 'Out of stock — please remove')}</span>
                        </div>
                      ) : isOverStock ? (
                        <div className="text-[11px] font-medium text-amber-800 flex items-center gap-1 mt-1 tabular-nums">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{t(`স্টকে মাত্র ${available}টি আছে`, `Only ${available} left in stock`)}</span>
                        </div>
                      ) : available <= 5 ? (
                        <div className="text-[11px] font-medium text-amber-700 mt-1 tabular-nums">
                          {t(`মাত্র ${available}টি বাকি`, `Only ${available} left`)}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between mt-2.5 tabular-nums">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-sm text-[#111827]">
                          {formatPrice(product.price * quantity)}
                        </span>
                        {quantity > 1 && (
                          <span className="text-[11px] text-gray-400">
                            ({formatPrice(product.price)} × {quantity})
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#e6e3dd] rounded-lg overflow-hidden bg-[#faf9f7] text-xs">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1, selectedColor, selectedSize)}
                          className="px-2.5 py-1 min-h-[30px] font-bold text-[#111827] hover:bg-gray-200/70 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="px-2.5 py-1 font-semibold text-[#111827] bg-white">{quantity}</span>
                        <button
                          disabled={quantity >= available}
                          onClick={() => updateCartQuantity(product.id, quantity + 1, selectedColor, selectedSize)}
                          className={`px-2.5 py-1 min-h-[30px] font-bold ${
                            quantity >= available
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-[#111827] hover:bg-gray-200/70 cursor-pointer'
                          }`}
                          title={quantity >= available ? t(`সর্বোচ্চ ${available}টি`, `Max ${available}`) : undefined}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Bottom row actions */}
                    <div className="flex items-center justify-end gap-3 mt-2 text-[11px] text-gray-500">
                      <button
                        onClick={() => {
                          toggleWishlist(product.id);
                          removeFromCart(product.id, selectedColor, selectedSize);
                        }}
                        className="hover:text-[#881337] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Heart className="w-3 h-3" />
                        <span>{t('পরে কিনব', 'Save for Later')}</span>
                      </button>

                      <button
                        onClick={() => removeFromCart(product.id, selectedColor, selectedSize)}
                        className="text-gray-400 hover:text-[#881337] cursor-pointer p-0.5 transition-colors"
                        title={t('বাদ দিন', 'Remove')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e6e3dd] bg-[#faf9f7] space-y-3.5">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="bg-white border border-[#15803d]/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-[#15803d] tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      {t('কুপন', 'Coupon')} <strong>{appliedCoupon.code}</strong> {t('কার্যকর', 'applied')} (−{formatPrice(couponDiscount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#881337] font-semibold hover:underline cursor-pointer"
                  >
                    {t('বাতিল', 'Remove')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder={t('কুপন কোড লিখুন', 'Enter promo code')}
                    className="flex-1 min-h-[40px] bg-white border border-[#e6e3dd] rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-[#111827]"
                  />
                  <button
                    type="submit"
                    className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-4 py-2 min-h-[40px] rounded-xl cursor-pointer transition-colors"
                  >
                    {t('প্রয়োগ', 'Apply')}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-[#881337] mt-1">{couponError}</p>}

              {!appliedCoupon && coupons.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto">
                  <span className="text-[11px] text-gray-500 shrink-0">{t('কুপন:', 'Coupons:')}</span>
                  {coupons.map(c => (
                    <button
                      key={c.code}
                      onClick={() => applyCoupon(c.code)}
                      className="text-[11px] bg-white border border-[#e6e3dd] text-[#111827] hover:border-[#881337] hover:text-[#881337] px-2 py-0.5 rounded font-mono font-semibold cursor-pointer transition-colors"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 border-t border-[#e6e3dd] pt-3 tabular-nums">
              <div className="flex justify-between">
                <span>{t('সাবটোটাল', 'Subtotal')}</span>
                <span className="font-semibold text-[#111827]">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#15803d] font-medium">
                  <span>{t('কুপন ডিসকাউন্ট', 'Coupon Discount')}</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('ডেলিভারি চার্জ (ঢাকা সিটি)', 'Delivery Charge (Dhaka)')}</span>
                <span className="font-semibold text-[#111827]">
                  {deliveryFee === 0 ? (
                    <span className="text-[#15803d] font-semibold">{t('ফ্রি', 'Free')}</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#111827] pt-2 border-t border-[#e6e3dd]">
                <span>{t('সর্বমোট প্রদেয়', 'Total Amount')}</span>
                <span className="text-[#881337] text-lg">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            {(() => {
              const hasInventoryIssues = cart.some(item => {
                const live = products.find(p => p.id === item.product.id) || item.product;
                return getAvailableStock(live, item.selectedColor, item.selectedSize) < item.quantity;
              });

              return (
                <button
                  disabled={hasInventoryIssues}
                  onClick={handleProceedCheckout}
                  className={`w-full font-semibold text-sm py-3.5 min-h-[46px] rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    hasInventoryIssues
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#881337] hover:bg-[#6d0f2c] text-white cursor-pointer'
                  }`}
                >
                  <span>
                    {hasInventoryIssues
                      ? t('স্টক সমস্যা রয়েছে — পরিমাণ ঠিক করুন', 'Stock unavailable — adjust quantity')
                      : t('চেকআউট সম্পন্ন করুন', 'Proceed to Checkout')}
                  </span>
                  {!hasInventoryIssues && <ArrowRight className="w-4 h-4" />}
                </button>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
