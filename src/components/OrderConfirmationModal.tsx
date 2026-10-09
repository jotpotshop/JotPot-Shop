import React from 'react';
import { CheckCircle2, Truck, Printer, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderConfirmationModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedOrderForInvoice,
    setTrackingOrderId,
    t,
    formatPrice,
    language,
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto border border-gray-100 text-center p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-gray-900">
          {t('আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!', 'Order Placed Successfully!')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm mx-auto">
          {t(
            'ঝটপটশপ-এ কেনাকাটা করার জন্য ধন্যবাদ! আপনার পার্সেলটি দ্রুত ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।',
            'Thank you for shopping at JotPotShop! We are preparing your order for fast dispatch.'
          )}
        </p>

        {/* Order Details Card */}
        <div className="bg-gray-50 rounded-2xl p-4 my-5 border border-gray-200 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-gray-500 font-semibold">{t('অর্ডার আইডি:', 'Order ID:')}</span>
            <span className="font-mono font-black text-rose-600 text-sm">{order.id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('গ্রাহকের নাম:', 'Customer:')}</span>
            <span className="font-bold text-gray-900">{order.customerName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('মোবাইল নম্বর:', 'Phone:')}</span>
            <span className="font-mono text-gray-900">{order.phone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('ডেলিভারি ঠিকানা:', 'Address:')}</span>
            <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">
              {order.address.area}, {order.address.district}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">{t('পেমেন্ট মাধ্যম:', 'Payment:')}</span>
            <span className="font-bold uppercase text-gray-900">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-extrabold">
            <span>{t('সর্বমোট মূল্য:', 'Total Amount:')}</span>
            <span className="text-rose-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs flex items-center justify-center space-x-2 mb-5">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>
            {t(
              'আনুমানিক ডেলিভারি: আগামী ২৪-৪৮ ঘণ্টার মধ্যে',
              'Estimated Delivery: Within 24-48 hours'
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleTrackNow}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>{t('অর্ডার ট্র্যাক করুন', 'Track Order Status')}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleOpenInvoice}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('ইনভয়েস দেখুন', 'View Invoice')}</span>
            </button>

            <button
              onClick={() => setActiveModal(null)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
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
