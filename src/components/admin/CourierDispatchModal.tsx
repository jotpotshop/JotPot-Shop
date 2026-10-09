import React, { useState } from 'react';
import {
  X,
  Truck,
  Send,
  CheckCircle,
  Package,
  MapPin,
  DollarSign,
  AlertCircle,
  Printer,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CourierConfig, CourierPartner, Order } from '../../types';

interface CourierDispatchModalContentProps {
  order: Order;
  courierConfigs: CourierConfig[];
  onClose: () => void;
  sendToCourier: (orderId: string, courierName: CourierPartner, weightKg: number, specialInstructions?: string) => void;
  setOrderForShippingLabel: (order: Order | null) => void;
  t: (bn: string, en: string) => string;
  formatPrice: (amount: number) => string;
}

const CourierDispatchModalContent: React.FC<CourierDispatchModalContentProps> = ({
  order,
  courierConfigs,
  onClose,
  sendToCourier,
  setOrderForShippingLabel,
  t,
  formatPrice,
}) => {
  const [selectedCourier, setSelectedCourier] = useState<CourierPartner>('Steadfast');
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [specialInstructions, setSpecialInstructions] = useState('পণ্য ডেলিভারির পূর্বে গ্রাহককে কল দিন। সাবধানে পরিবহন করুন।');

  const courierConfig = courierConfigs.find(c => c.id === selectedCourier);
  const isInsideDhaka = order.address.district.includes('Dhaka') || order.address.district.includes('ঢাকা');

  const calculatedCourierCharge = isInsideDhaka
    ? courierConfig?.baseChargeDhaka || 60
    : courierConfig?.baseChargeOutside || 120;

  const codToCollect = order.paymentMethod === 'cod' ? order.totalAmount : 0;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();

    sendToCourier(order.id, selectedCourier, weightKg, specialInstructions);

    // Close courier modal and ask or open shipping label
    onClose();

    // Find the freshly updated order to show shipping label
    setTimeout(() => {
      setOrderForShippingLabel(order);
    }, 200);
  };

  const courierPartnersList: Array<{
    id: CourierPartner;
    name: string;
    tag: string;
    logoColor: string;
    deliverySpeed: string;
    description: string;
  }> = [
    {
      id: 'Steadfast',
      name: 'Steadfast Courier',
      tag: 'সবচেয়ে দ্রুত ক্যাশ ও ওয়াইড কাভারেজ',
      logoColor: 'bg-emerald-600 text-white',
      deliverySpeed: isInsideDhaka ? '২৪ ঘণ্টা' : '৪৮-৭২ ঘণ্টা',
      description: 'সারাদেশে থানা ও ইউনিয়ন পর্যায়ে হোম ডেলিভারি ও দ্রুত COD পেমেন্ট সেটেলমেন্ট।',
    },
    {
      id: 'Pathao',
      name: 'Pathao Courier',
      tag: 'ঢাকার ভেতরে সেম-ডে / নেক্সট ডে এক্সপ্রেস',
      logoColor: 'bg-red-600 text-white',
      deliverySpeed: isInsideDhaka ? '১২-২৪ ঘণ্টা' : '৪৮ ঘণ্টা',
      description: 'অ্যাডভান্সড টেকনোলজি ট্র্যাকিং ও দক্ষ রাইডার নেটওয়ার্ক।',
    },
    {
      id: 'RedX',
      name: 'RedX Logistics',
      tag: 'লার্জ নেটওয়ার্ক ও ডোরস্টেপ পিকআপ',
      logoColor: 'bg-rose-600 text-white',
      deliverySpeed: isInsideDhaka ? '২৪-৪৮ ঘণ্টা' : '৭২ ঘণ্টা',
      description: '৬৪ জেলায় এক্সপ্রেস ডেলিভারি হাব ও অটো-ইনভয়েস সাপোর্ট।',
    },
    {
      id: 'Paperfly',
      name: 'Paperfly Pvt Ltd',
      tag: 'গ্রাম ও প্রত্যন্ত অঞ্চলে নির্ভরযোগ্য হোম ডেলিভারি',
      logoColor: 'bg-blue-600 text-white',
      deliverySpeed: isInsideDhaka ? '২৪-৪৮ ঘণ্টা' : '৩-৪ দিন',
      description: 'ইউনিয়ন লেভেল পর্যন্ত ডেলিভারি পয়েন্ট ও ক্যাশ অন ডেলিভারি।',
    },
    {
      id: 'Sundarban',
      name: 'Sundarban Courier Service',
      tag: 'ঐতিহ্যবাহী ও দীর্ঘদিনের অভিজ্ঞ কুরিয়ার',
      logoColor: 'bg-amber-600 text-white',
      deliverySpeed: isInsideDhaka ? '২৪ ঘণ্টা' : '৪৮ ঘণ্টা',
      description: 'জেলা সদরের ব্রাঞ্চ ও হোম ডেলিভারি সেবা।',
    },
    {
      id: 'eCourier',
      name: 'eCourier Limited',
      tag: 'স্মার্ট লজিস্টিকস ও এসএমএস ট্র্যাকিং',
      logoColor: 'bg-indigo-600 text-white',
      deliverySpeed: isInsideDhaka ? '২৪ ঘণ্টা' : '৪৮-৭২ ঘণ্টা',
      description: 'রিয়েলটাইম ওটিপি ভেরিফাইড ডেলিভারি।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  {t('কুরিয়ারে পার্সেল বুকিং (Send to Courier)', 'Send to Courier Dispatch')}
                </h3>
                <span className="font-mono text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t('পছন্দের কুরিয়ার পার্টনার নির্বাচন করুন ও ট্র্যাকিং আইডি জেনারেট করুন', 'Select courier service provider and generate consignment ID')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleDispatch} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Order Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">গ্রাহকের নাম ও ফোন:</span>
              <p className="font-bold text-gray-900 mt-0.5">{order.customerName}</p>
              <p className="font-mono text-gray-600">{order.phone}</p>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">গন্তব্য জেলা ও এলাকা:</span>
              <p className="font-bold text-gray-900 mt-0.5">{order.address.district}</p>
              <p className="text-gray-600 truncate">{order.address.fullAddress}</p>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">ক্যাশ অন ডেলিভারি (COD):</span>
              <p className="font-extrabold text-sm text-rose-600 mt-0.5">
                {order.paymentMethod === 'cod' ? formatPrice(codToCollect) : '৳০ (প্রিপেইড/পরিশোধিত)'}
              </p>
              <span className="text-[10px] text-gray-500">পণ্য সংখ্যা: {order.items.length}টি</span>
            </div>
          </div>

          {/* Select Courier Partner */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">
              {t('কুরিয়ার সার্ভিস নির্বাচন করুন (Select Courier Partner):', 'Select Courier Partner:')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {courierPartnersList.map(c => {
                const isSelected = selectedCourier === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCourier(c.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${c.logoColor}`}>
                        {c.id}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 text-xs">{c.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{c.tag}</p>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">ডেলিভারি সময়:</span>
                      <span className="font-bold text-gray-800">{c.deliverySpeed}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parcel Weight and Delivery Charges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                পার্সেলের আনুমানিক ওজন (Weight Kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={weightKg}
                onChange={e => setWeightKg(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                কুরিয়ার চার্জ (Courier Fee)
              </label>
              <input
                type="text"
                disabled
                value={`৳${calculatedCourierCharge} (${isInsideDhaka ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})`}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                গ্রাহক হতে আদায়যোগ্য (COD Amount)
              </label>
              <input
                type="text"
                disabled
                value={formatPrice(codToCollect)}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-black text-rose-600"
              />
            </div>
          </div>

          {/* Special Instructions for Rider */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              কুরিয়ার রাইডারের জন্য বিশেষ নির্দেশনা (Rider Instructions):
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="যেমন: ভঙ্গুর পণ্য, সাবধানে হ্যান্ডেল করুন"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-emerald-500"
            />
          </div>

          {/* API Info Notice */}
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center space-x-2 text-emerald-800 text-[11px]">
            <Zap className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              {selectedCourier} এপিআই (API) কানেকশন সক্রিয়। কনফার্ম করার সাথে সাথে কনসাইনমেন্ট আইডি তৈরি হবে এবং কাস্টমার এসএমএস/ট্র্যাকিং লিংক পেয়ে যাবে।
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
            >
              {t('বাতিল', 'Cancel')}
            </button>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{t('কুরিয়ারে বুকিং সম্পন্ন করুন ও চালান দেখুন', 'Confirm & Generate Consignment')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CourierDispatchModal: React.FC = () => {
  const {
    orderForCourier,
    setOrderForCourier,
    courierConfigs,
    sendToCourier,
    setOrderForShippingLabel,
    t,
    formatPrice,
  } = useShop();

  if (!orderForCourier) return null;

  return (
    <CourierDispatchModalContent
      key={orderForCourier.id}
      order={orderForCourier}
      courierConfigs={courierConfigs}
      onClose={() => setOrderForCourier(null)}
      sendToCourier={sendToCourier}
      setOrderForShippingLabel={setOrderForShippingLabel}
      t={t}
      formatPrice={formatPrice}
    />
  );
};
