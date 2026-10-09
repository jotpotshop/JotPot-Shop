import React, { useState } from 'react';
import {
  X,
  Search,
  Truck,
  CheckCircle,
  Package,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    orders,
    findOrderById,
    trackingOrderId,
    setTrackingOrderId,
    setSelectedOrderForInvoice,
    t,
    formatPrice,
    language,
  } = useShop();

  const [searchId, setSearchId] = useState(trackingOrderId || (orders[0]?.id ?? ''));
  const [searchedOrder, setSearchedOrder] = useState(() => {
    if (trackingOrderId) return findOrderById(trackingOrderId);
    return orders[0];
  });
  const [searchError, setSearchError] = useState('');

  if (activeModal !== 'tracking') return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchId.trim()) return;

    const found = findOrderById(searchId.trim());
    if (found) {
      setSearchedOrder(found);
      setTrackingOrderId(found.id);
    } else {
      setSearchError(t('এই আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি। সঠিক আইডি দিন।', 'No order found with this ID. Please check and try again.'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return CheckCircle;
      case 'Processing': return Clock;
      case 'Packed': return Package;
      case 'Shipped': return Truck;
      case 'Out for Delivery': return MapPin;
      case 'Delivered': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                {t('লাইভ অর্ডার ট্র্যাকিং', 'Live Order Tracking')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('অর্ডার আইডি দিয়ে পার্সেলের বর্তমান অবস্থান জানুন', 'Track real-time courier dispatch and delivery updates')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search input bar */}
        <div className="p-5 border-b border-gray-100 bg-white">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder={t('অর্ডার আইডি লিখুন (যেমন: JPS-2026-8941)', 'Enter Order ID (e.g. JPS-2026-8941)')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono focus:outline-hidden focus:border-rose-500 uppercase"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              {t('ট্র্যাক করুন', 'Track')}
            </button>
          </form>

          {searchError && (
            <div className="mt-2 text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick list of customer recent orders */}
          {orders.length > 0 && (
            <div className="mt-3 flex items-center space-x-2 overflow-x-auto text-xs">
              <span className="text-gray-400 text-[11px] font-semibold">{t('সাম্প্রতিক অর্ডার:', 'Recent:')}</span>
              {orders.slice(0, 3).map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSearchId(o.id);
                    setSearchedOrder(o);
                    setTrackingOrderId(o.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition-colors ${
                    searchedOrder?.id === o.id
                      ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {o.id} ({o.status})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {searchedOrder ? (
            <>
              {/* Order Info Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">{t('অর্ডার নম্বর:', 'Order ID:')}</span>
                  <span className="font-mono font-bold text-gray-900 ml-1.5">{searchedOrder.id}</span>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {t('অর্ডার তারিখ:', 'Date:')} {searchedOrder.orderDate}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 font-medium">{t('কুরিয়ার পার্টনার:', 'Courier:')}</span>
                  <span className="font-semibold text-gray-900 ml-1.5">{searchedOrder.courierInfo?.courierName || searchedOrder.courier}</span>
                  <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                    {t('ট্র্যাকিং কোড:', 'Tracking #:')} {searchedOrder.courierInfo?.trackingCode || searchedOrder.trackingNumber}
                  </div>
                  {searchedOrder.courierInfo?.trackingUrl && (
                    <a
                      href={searchedOrder.courierInfo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t('কুরিয়ার সাইটে লাইভ ট্র্যাক', 'Track on Courier Site')}
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      searchedOrder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchedOrder.status === 'Shipped' || searchedOrder.status === 'Out for Delivery'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {searchedOrder.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedOrderForInvoice(searchedOrder);
                      setActiveModal('invoice');
                    }}
                    className="text-rose-600 hover:underline font-semibold text-xs cursor-pointer"
                  >
                    {t('ইনভয়েস', 'Invoice')}
                  </button>
                </div>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                {searchedOrder.timeline.map((step, idx) => {
                  const Icon = getStatusIcon(step.status);

                  return (
                    <div key={idx} className="relative flex items-start space-x-3.5 group">
                      {/* Step Circle Indicator */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.completed
                            ? 'bg-emerald-600 border-white text-white shadow-xs'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {language === 'bn' ? step.statusBn : step.status}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {language === 'bn' ? step.descriptionBn : step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Courier Support Help */}
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 flex items-center justify-between text-xs text-rose-900">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>
                    {t('ডেলিভারি সংক্রান্ত জরুরি তথ্যে কল করুন:', 'Need immediate help? Call helpline:')}{' '}
                    <strong>01800-JOTPOT</strong>
                  </span>
                </div>
                <button
                  onClick={() => setActiveModal('support')}
                  className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  {t('সহায়তা', 'Support')}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">{t('কোনো অর্ডার তথ্য পাওয়া যায়নি', 'No order found')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
