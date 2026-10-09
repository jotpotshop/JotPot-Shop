import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const InvoiceModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    selectedOrderForInvoice,
    t,
    formatPrice,
    language,
  } = useShop();

  if (activeModal !== 'invoice' || !selectedOrderForInvoice) return null;

  const order = selectedOrderForInvoice;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none">
        {/* Top actions */}
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 print:hidden">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {t('অফিসিয়াল অর্ডার ইনভয়েস', 'Official Order Invoice')}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('প্রিন্ট করুন', 'Print')}</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-900 text-xs sm:text-sm">
          {/* Header Brand */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                JotPot<span className="text-rose-600">Shop</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">jotpotshop.com</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {t('যা দরকার, এক জায়গায় • ঢাকা, বাংলাদেশ', 'Everything you need, in one place • Dhaka, BD')}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-md text-xs uppercase mb-1">
                INVOICE
              </span>
              <p className="font-mono font-bold text-gray-900 text-sm">{order.id}</p>
              <p className="text-[11px] text-gray-500">{order.orderDate}</p>
            </div>
          </div>

          {/* Customer & Courier Details */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                {t('গ্রাহকের তথ্য:', 'BILLED TO:')}
              </span>
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="font-mono text-gray-600">{order.phone}</p>
              <p className="text-gray-600 mt-1">{order.address.fullAddress}</p>
              <p className="text-gray-600 font-semibold">{order.address.area}, {order.address.district}</p>
            </div>

            <div className="text-right">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                {t('অর্ডার স্ট্যাটাস ও পেমেন্ট:', 'ORDER STATUS & PAYMENT:')}
              </span>
              <p className="font-semibold text-gray-900">
                {t('পেমেন্ট মাধ্যম:', 'Method:')} <span className="uppercase font-bold">{order.paymentMethod}</span>
              </p>
              {order.paymentDetails?.trxId && (
                <p className="text-[11px] text-pink-700 font-mono font-bold">
                  TrxID: {order.paymentDetails.trxId}
                </p>
              )}
              {order.paymentDetails?.senderNumber && (
                <p className="text-[10px] text-gray-500 font-mono">
                  প্রেরক: {order.paymentDetails.senderNumber}
                </p>
              )}
              <p className="text-gray-600">
                {t('স্ট্যাটাস:', 'Status:')} <strong className="text-emerald-600">{order.paymentStatus}</strong>
              </p>
              <p className="text-gray-600 mt-1">
                {t('কুরিয়ার:', 'Courier:')} {order.courier}
              </p>
              <p className="font-mono text-[11px] text-gray-500">#{order.trackingNumber}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">SL</th>
                  <th className="py-2.5 px-3">{t('পণ্যের বিবরণ', 'Item Details')}</th>
                  <th className="py-2.5 px-3 text-center">{t('পরিমাণ', 'Qty')}</th>
                  <th className="py-2.5 px-3 text-right">{t('একক দর', 'Rate')}</th>
                  <th className="py-2.5 px-3 text-right">{t('মোট টাকা', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-gray-900">{language === 'bn' ? it.product.nameBn : it.product.name}</p>
                      {(it.selectedColor || it.selectedSize) && (
                        <p className="text-[10px] text-gray-400">
                          {it.selectedColor && `Color: ${it.selectedColor} `}
                          {it.selectedSize && `Size: ${it.selectedSize}`}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{formatPrice(it.product.price)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {formatPrice(it.product.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t('সাবটোটাল:', 'Subtotal:')}</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t('ডিসকাউন্ট:', 'Discount:')}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t('ডেলিভারি চার্জ:', 'Delivery Fee:')}</span>
                <span>{order.deliveryFee === 0 ? t('ফ্রি', 'FREE') : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-gray-200 pt-2 text-gray-900">
                <span>{t('সর্বমোট প্রদেয়:', 'Total Payable:')}</span>
                <span className="text-rose-600 text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer note & Authenticity */}
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
            <div className="flex items-center space-x-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('এটি একটি কম্পিউটার জেনারেটেড ভেরিফাইড ইনভয়েস', 'Verified Computer Generated Tax Invoice')}</span>
            </div>
            <span>JotPotShop Support: support@jotpotshop.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
