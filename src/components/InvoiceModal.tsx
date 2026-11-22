import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none">
        {/* Top actions */}
        <div className="px-6 py-3.5 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7] print:hidden">
          <span className="text-xs font-semibold text-gray-600">
            {t('অফিসিয়াল অর্ডার ইনভয়েস', 'Official Order Invoice')}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#111827] hover:bg-black text-white text-xs font-semibold px-3.5 py-2 min-h-[36px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('প্রিন্ট করুন', 'Print')}</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              aria-label={t('বন্ধ করুন', 'Close')}
              className="p-1.5 text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#111827] text-xs sm:text-sm">
          {/* Header Brand */}
          <div className="flex items-start justify-between border-b border-[#e6e3dd] pb-5">
            <div>
              <h2 className="font-editorial text-2xl font-bold tracking-tight text-[#111827]">
                JotPot<span className="text-[#881337]">Shop</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">jotpotshop.com</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {t('বিশ্বস্ত অনলাইন শপ · ঢাকা, বাংলাদেশ', 'Trusted Online Shopping · Dhaka, Bangladesh')}
              </p>
            </div>

            <div className="text-right tabular-nums">
              <span className="inline-block bg-[#faf9f7] border border-[#e6e3dd] text-[#881337] font-bold px-2.5 py-0.5 rounded text-xs mb-1.5">
                INVOICE
              </span>
              <p className="font-mono font-bold text-[#111827] text-sm">{order.id}</p>
              <p className="text-[11px] text-gray-500">{order.orderDate}</p>
            </div>
          </div>

          {/* Customer & Courier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf9f7] p-4 rounded-xl border border-[#e6e3dd] text-xs tabular-nums">
            <div>
              <span className="text-gray-500 font-semibold text-[11px] block mb-1">
                {t('গ্রাহকের তথ্য:', 'Billed To:')}
              </span>
              <p className="font-bold text-[#111827]">{order.customerName}</p>
              <p className="font-mono text-gray-700 mt-0.5">{order.phone}</p>
              <p className="text-gray-600 mt-1 leading-relaxed">{order.address.fullAddress}</p>
              <p className="text-gray-700 font-medium">{order.address.area}, {order.address.district}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-gray-500 font-semibold text-[11px] block mb-1">
                {t('অর্ডার ও পেমেন্ট তথ্য:', 'Order & Payment:')}
              </span>
              <p className="font-medium text-[#111827]">
                {t('পেমেন্ট মাধ্যম:', 'Method:')} <span className="uppercase font-bold">{order.paymentMethod}</span>
              </p>
              {order.paymentDetails?.trxId && (
                <p className="text-[11px] text-[#881337] font-mono font-semibold mt-0.5">
                  TrxID: {order.paymentDetails.trxId}
                </p>
              )}
              {order.paymentDetails?.senderNumber && (
                <p className="text-[11px] text-gray-500 font-mono">
                  প্রেরক: {order.paymentDetails.senderNumber}
                </p>
              )}
              <p className="text-gray-600 mt-0.5">
                {t('স্ট্যাটাস:', 'Status:')} <strong className="text-[#15803d]">{order.paymentStatus}</strong>
              </p>
              <p className="text-gray-600 mt-1">
                {t('কুরিয়ার:', 'Courier:')} {order.courier}
              </p>
              <p className="font-mono text-[11px] text-gray-500">#{order.trackingNumber}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#e6e3dd] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-[#faf9f7] text-[#111827] font-semibold border-b border-[#e6e3dd]">
                <tr>
                  <th className="py-2.5 px-3">নং</th>
                  <th className="py-2.5 px-3">{t('পণ্যের বিবরণ', 'Item Details')}</th>
                  <th className="py-2.5 px-3 text-center">{t('পরিমাণ', 'Qty')}</th>
                  <th className="py-2.5 px-3 text-right">{t('একক দর', 'Rate')}</th>
                  <th className="py-2.5 px-3 text-right">{t('মোট টাকা', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e3dd]">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-[#111827]">{language === 'bn' ? it.product.nameBn : it.product.name}</p>
                      {(it.selectedColor || it.selectedSize) && (
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {it.selectedColor && `${it.selectedColor} `}
                          {it.selectedSize && `· Size: ${it.selectedSize}`}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{formatPrice(it.product.price)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-[#111827]">
                      {formatPrice(it.product.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end tabular-nums">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t('সাবটোটাল:', 'Subtotal:')}</span>
                <span className="font-semibold text-[#111827]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#15803d] font-medium">
                  <span>{t('ডিসকাউন্ট:', 'Discount:')}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>{t('ডেলিভারি চার্জ:', 'Delivery Fee:')}</span>
                <span className="font-semibold text-[#111827]">
                  {order.deliveryFee === 0 ? t('ফ্রি', 'Free') : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-[#e6e3dd] pt-2.5 text-[#111827]">
                <span>{t('সর্বমোট প্রদেয়:', 'Total Payable:')}</span>
                <span className="text-[#881337] text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer note & Authenticity */}
          <div className="border-t border-[#e6e3dd] pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
            <div className="flex items-center gap-1.5 text-[#15803d]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t('সিস্টেম জেনারেটেড অফিসিয়াল ইনভয়েস', 'Verified System-Generated Invoice')}</span>
            </div>
            <span>support@jotpotshop.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
