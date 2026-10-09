import React, { useState } from 'react';
import {
  X,
  Phone,
  PhoneCall,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Package,
  Calendar,
  MessageSquare,
  ShieldCheck,
  PhoneOff,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const OrderCallModal: React.FC = () => {
  const {
    orderForCall,
    setOrderForCall,
    addCallLog,
    confirmOrder,
    holdOrder,
    cancelOrder,
    t,
    formatPrice,
    currentRole,
  } = useShop();

  const [callOutcome, setCallOutcome] = useState<
    'Confirmed' | 'Customer Unreachable' | 'Number Busy' | 'Requested Delay' | 'Customer Cancelled' | 'Wrong Info'
  >('Confirmed');
  const [callNotes, setCallNotes] = useState('');
  const [confirmedAddressChecked, setConfirmedAddressChecked] = useState(true);
  const [confirmedItemsChecked, setConfirmedItemsChecked] = useState(true);
  const [confirmedCodChecked, setConfirmedCodChecked] = useState(true);

  if (!orderForCall) return null;

  const order = orderForCall;

  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();

    addCallLog(order.id, {
      caller: `${currentRole} Agent`,
      callerRole: currentRole,
      callOutcome,
      notes: callNotes || `Verification call completed with status: ${callOutcome}`,
    });

    if (callOutcome === 'Confirmed') {
      confirmOrder(order.id, `${currentRole} Verification`);
    } else if (callOutcome === 'Requested Delay' || callOutcome === 'Customer Unreachable' || callOutcome === 'Number Busy') {
      holdOrder(order.id, `Call Status: ${callOutcome}. Note: ${callNotes}`);
    } else if (callOutcome === 'Customer Cancelled') {
      cancelOrder(order.id, `Cancelled during customer call: ${callNotes}`);
    }

    setOrderForCall(null);
    setCallNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  {t('গ্রাহককে কল ও অর্ডার ভেরিফিকেশন', 'Customer Call & Verification')}
                </h3>
                <span className="font-mono text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t('অর্ডার কনফার্ম করার জন্য গ্রাহকের সাথে সরাসরি কথা বলুন', 'Verify delivery address, items and payment details')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setOrderForCall(null)}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Dial Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  {t('প্রধান মোবাইল নম্বর', 'Primary Phone')}
                </span>
                <span className="font-mono font-bold text-sm text-gray-900">{order.phone}</span>
                <p className="text-[10px] text-gray-500">{order.customerName}</p>
              </div>

              <a
                href={`tel:${order.phone}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('কল করুন', 'Call Now')}</span>
              </a>
            </div>

            {order.alternativePhone ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-800 block">
                    {t('বিকল্প নম্বর (অল্টারনেট)', 'Alternate Phone')}
                  </span>
                  <span className="font-mono font-bold text-sm text-gray-900">{order.alternativePhone}</span>
                  <p className="text-[10px] text-gray-500">{t('দ্বিতীয় যোগাযোগ নম্বর', 'Secondary Contact')}</p>
                </div>

                <a
                  href={`tel:${order.alternativePhone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('কল করুন', 'Call')}</span>
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center text-gray-500">
                <span className="text-[11px] italic">
                  {t('কোনো বিকল্প ফোন নম্বর দেওয়া নেই', 'No alternative phone provided')}
                </span>
              </div>
            )}
          </div>

          {/* Verification Script in Bangla */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
            <span className="font-bold text-amber-900 flex items-center space-x-1.5 text-xs">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>{t('কল ভেরিফিকেশন স্ক্রিপ্ট (সহায়ক গাইড):', 'Call Verification Script:')}</span>
            </span>
            <p className="text-gray-700 italic leading-relaxed text-[11px]">
              "আসসালামু আলাইকুম, আমি JotPotShop থেকে কল করেছি। আপনি কি {order.customerName} বলছেন? আপনার ৳{order.totalAmount} টাকার অর্ডারটি (আইডি: {order.id}) নিশ্চিত করার জন্য কল দিয়েছি। আপনার ডেলিভারি ঠিকানা: {order.address.fullAddress} ঠিক আছে কি না একটু কনফার্ম করবেন?"
            </p>
          </div>

          {/* Verification Checklist */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
              {t('ভেরিফিকেশন চেকলিস্ট:', 'Verification Checklist:')}
            </span>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedAddressChecked}
                onChange={e => setConfirmedAddressChecked(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
              <span className="text-gray-700 font-medium">
                {t(`ডেলিভারি ঠিকানা সঠিক ও নির্ভুল (${order.address.district}, ${order.address.area})`, `Delivery address confirmed (${order.address.district})`)}
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedItemsChecked}
                onChange={e => setConfirmedItemsChecked(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
              <span className="text-gray-700 font-medium">
                {t(`পণ্যের সংখ্যা (${order.items.length}টি) ও কালার/সাইজ ভ্যারিয়েন্ট গ্রাহক নিশ্চিত করেছেন`, `Order items (${order.items.length}) & size/color verified`)}
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedCodChecked}
                onChange={e => setConfirmedCodChecked(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
              <span className="text-gray-700 font-medium">
                {order.paymentMethod === 'cod'
                  ? t(`ক্যাশ অন ডেলিভারি বাবদ ৳${order.totalAmount} প্রস্তুত রাখার বিষয়টি জানানো হয়েছে`, `COD amount ৳${order.totalAmount} communicated to customer`)
                  : t(`অনলাইন পেমেন্ট (${order.paymentMethod.toUpperCase()}) সফলভাবে যাচাই করা হয়েছে`, `Prepaid payment verified`)}
              </span>
            </label>
          </div>

          {/* Call Logging Form */}
          <form onSubmit={handleSaveCall} className="space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {t('কলের ফলাফল (Call Outcome):', 'Call Outcome:')}
              </label>
              <select
                value={callOutcome}
                onChange={e => setCallOutcome(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 cursor-pointer"
              >
                <option value="Confirmed">✓ অর্ডার নিশ্চিত (Confirmed & Ready to Dispatch)</option>
                <option value="Customer Unreachable">⚠️ ফোন ধরেননি (Customer Unreachable)</option>
                <option value="Number Busy">⏳ নম্বর ব্যস্ত (Number Busy)</option>
                <option value="Requested Delay">📅 গ্রাহক পরে ডেলিভারি চেয়েছেন (Requested Delay)</option>
                <option value="Customer Cancelled">❌ গ্রাহক অর্ডার বাতিল করেছেন (Customer Cancelled)</option>
                <option value="Wrong Info">❓ ভুল ঠিকানা বা অনির্ভরযোগ্য তথ্য (Wrong Info)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                {t('কলের বিস্তারিত মন্তব্য বা নোট (Agent Notes):', 'Call Notes & Comments:')}
              </label>
              <textarea
                rows={2}
                value={callNotes}
                onChange={e => setCallNotes(e.target.value)}
                placeholder="যেমন: গ্রাহক বিকাল ৪টার পর ডেলিভারি দিতে বলেছেন। সাইজ L কনফার্ম করেছেন।"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setOrderForCall(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                {t('বন্ধ করুন', 'Cancel')}
              </button>

              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{t('কল লগ সেভ ও স্ট্যাটাস আপডেট করুন', 'Save Call Log & Update')}</span>
              </button>
            </div>
          </form>

          {/* Past Call History */}
          {order.callLogs && order.callLogs.length > 0 && (
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <span className="font-bold text-gray-700 block text-[11px]">
                {t('পূর্ববর্তী কলের ইতিহাস (Previous Call Logs):', 'Previous Call History:')}
              </span>
              <div className="space-y-1.5">
                {order.callLogs.map(log => (
                  <div key={log.id} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">{log.caller}</span>
                      <span className="font-mono text-gray-400 text-[10px]">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {log.callOutcome}
                      </span>
                      <p className="text-gray-600 flex-1">{log.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
