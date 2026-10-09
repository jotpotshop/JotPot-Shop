import React, { useState } from 'react';
import {
  X,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Check,
  Tag,
  Truck,
} from 'lucide-react';
import { useShop, FREE_DELIVERY_THRESHOLD } from '../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-base text-gray-900">
              {t('আপনার শপিং ব্যাগ', 'Your Shopping Cart')}
            </h3>
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-gray-400 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-50 to-rose-50 border-b border-rose-100/60">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center text-gray-800">
              <Truck className="w-3.5 h-3.5 text-rose-600 mr-1.5" />
              {freeDeliveryRemaining > 0 ? (
                <span>
                  {t(
                    `আরও ${formatPrice(freeDeliveryRemaining)}-এর পণ্য কিনলে FREE DELIVERY!`,
                    `Add ${formatPrice(freeDeliveryRemaining)} more for FREE DELIVERY!`
                  )}
                </span>
              ) : (
                <span className="text-emerald-700 font-extrabold flex items-center">
                  <Check className="w-4 h-4 mr-1 text-emerald-600" />
                  {t('অভিনন্দন! আপনি পাচ্ছেন ফ্রি ডেলিভারি 🎉', 'Congratulations! You unlocked FREE Delivery 🎉')}
                </span>
              )}
            </span>
            <span className="text-rose-600">{freeDeliveryPercent}%</span>
          </div>
          <div className="w-full bg-rose-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${freeDeliveryPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-gray-800 text-base">
                {t('আপনার ব্যাগ খালি আছে', 'Your cart is empty')}
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1 mb-4">
                {t('পছন্দের পণ্যটি বেছে নিয়ে দ্রুত ব্যাগে যোগ করুন!', 'Explore our collections and add products to start shopping!')}
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md cursor-pointer transition-colors"
              >
                {t('কেনাকাটা শুরু করুন', 'Start Shopping')}
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const { product, quantity, selectedColor, selectedSize } = item;
              return (
                <div
                  key={`${product.id}-${selectedColor}-${selectedSize}-${idx}`}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs flex gap-3 relative group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                        {language === 'bn' ? product.nameBn : product.name}
                      </h4>

                      {/* Variant tags */}
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-gray-500">
                        {selectedColor && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {selectedColor}
                          </span>
                        )}
                        {selectedSize && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            Size: {selectedSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-extrabold text-sm text-gray-900">
                          {formatPrice(product.price * quantity)}
                        </span>
                        {quantity > 1 && (
                          <span className="text-[10px] text-gray-400">
                            ({formatPrice(product.price)} × {quantity})
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 text-xs">
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity - 1, selectedColor, selectedSize)}
                          className="px-2 py-0.5 font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-gray-900 bg-white">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(product.id, quantity + 1, selectedColor, selectedSize)}
                          className="px-2 py-0.5 font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Bottom row actions: Remove & Save for Later (Wishlist) */}
                    <div className="flex items-center justify-end space-x-3 mt-2 text-[11px] text-gray-500">
                      <button
                        onClick={() => {
                          toggleWishlist(product.id);
                          removeFromCart(product.id, selectedColor, selectedSize);
                        }}
                        className="hover:text-rose-600 flex items-center space-x-1 cursor-pointer"
                      >
                        <Heart className="w-3 h-3" />
                        <span>{t('পরে কিনব', 'Save for Later')}</span>
                      </button>

                      <button
                        onClick={() => removeFromCart(product.id, selectedColor, selectedSize)}
                        className="text-gray-400 hover:text-rose-600 cursor-pointer p-0.5"
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
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/70 space-y-3.5">
            {/* Promo Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      কুপন <strong>{appliedCoupon.code}</strong> কার্যকর (-{formatPrice(couponDiscount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
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
                    placeholder={t('কুপন কোড (যেমন: JOTPOT100)', 'Promo Code (e.g. JOTPOT100)')}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    {t('প্রয়োগ', 'Apply')}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}

              {/* Quick coupons pills */}
              {!appliedCoupon && (
                <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto">
                  <span className="text-[10px] text-gray-400 font-semibold">{t('অফার:', 'Coupons:')}</span>
                  {coupons.map(c => (
                    <button
                      key={c.code}
                      onClick={() => applyCoupon(c.code)}
                      className="text-[10px] bg-white border border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded-md font-mono font-bold cursor-pointer transition-colors"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-200 pt-2.5">
              <div className="flex justify-between">
                <span>{t('সাবটোটাল', 'Subtotal')}</span>
                <span className="font-bold text-gray-900">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{t('কুপন ডিসকাউন্ট', 'Coupon Discount')}</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('ডেলিভারি চার্জ (ঢাকা সিটি)', 'Delivery Charge (Dhaka)')}</span>
                <span className="font-bold text-gray-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold uppercase">{t('ফ্রি', 'FREE')}</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>{t('সর্বমোট প্রদেয়', 'Total Amount')}</span>
                <span className="text-rose-600 text-lg">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedCheckout}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white stroke-none" />
              <span>{t('অর্ডার সম্পন্ন করুন (চেকআউট)', 'Proceed to Checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
