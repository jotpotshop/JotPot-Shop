import React from 'react';
import { CheckCircle2, Truck, Printer, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderConfirmationModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedOrderForInvoice,
    setTrackingOrderId,
    t,
    formatPrice,
  } = useShop();

  if (activeModal !== 'orderConfirmation' || !selectedOrderForInvoice) return null;

  const order = selectedOrderForInvoice;

  const handleTrackNow = () => {
    setTrackingOrderId(order.id);
    setActiveModal('tracking');
  };

  const handleOpenInvoice = () => {
    setActiveModal('invoice');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] text-center p-6 sm:p-8">
        {/* Success Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803d] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#111827]">
          {t('আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে', 'Order Placed Successfully')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-sm mx-auto leading-relaxed">
          {t(
            'ঝটপটশপ-এ কেনাকাটা করার জন্য ধন্যবাদ। আপনার পার্সেলটি দ্রুত ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।',
            'Thank you for shopping at JotPotShop. Your order is now being prepared for dispatch.'
          )}
        </p>

        {/* Order Details Card */}
        <div className="bg-[#faf9f7] rounded-xl p-4 my-5 border border-[#e6e3dd] text-left space-y-2.5 text-xs tabular-nums">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#e6e3dd]">
            <span className="text-gray-500 font-medium">{t('অর্ডার আইডি:', 'Order ID:')}</span>
            <span className="font-mono font-bold text-[#881337] text-sm">{order.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('গ্রাহকের নাম:', 'Customer:')}</span>
            <span className="font-semibold text-[#111827]">{order.customerName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('মোবাইল নম্বর:', 'Phone:')}</span>
            <span className="font-mono text-[#111827]">{order.phone}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-500 shrink-0">{t('ডেলিভারি ঠিকানা:', 'Address:')}</span>
            <span className="font-medium text-[#111827] text-right truncate">
              {order.address.area}, {order.address.district}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('পেমেন্ট মাধ্যম:', 'Payment:')}</span>
            <span className="font-semibold uppercase text-[#111827]">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between pt-2.5 border-t border-[#e6e3dd] text-sm font-bold text-[#111827]">
            <span>{t('সর্বমোট মূল্য:', 'Total Amount:')}</span>
            <span className="text-[#881337]">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="bg-white border border-[#e6e3dd] text-[#111827] p-3 rounded-xl text-xs flex items-center justify-center gap-2 mb-5">
          <Truck className="w-4 h-4 text-[#15803d] shrink-0" />
          <span>
            {t(
              'আনুমানিক ডেলিভারি: আগামী ২৪-৪৮ ঘণ্টার মধ্যে',
              'Estimated delivery: within 24-48 hours'
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleTrackNow}
            className="w-full bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-sm py-3 min-h-[44px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>{t('অর্ডার ট্র্যাক করুন', 'Track Order Status')}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleOpenInvoice}
              className="bg-[#faf9f7] hover:bg-white border border-[#e6e3dd] hover:border-[#111827] text-[#111827] font-semibold text-xs py-2.5 min-h-[40px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('ইনভয়েস দেখুন', 'View Invoice')}</span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="bg-[#faf9f7] hover:bg-white border border-[#e6e3dd] hover:border-[#111827] text-[#111827] font-semibold text-xs py-2.5 min-h-[40px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('আরো কিনুন', 'Keep Shopping')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
