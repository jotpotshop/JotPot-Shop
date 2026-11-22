import React, { useState, useMemo } from 'react';
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
  Lock,
  LogIn,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    orders,
    trackingOrderId,
    setTrackingOrderId,
    setSelectedOrderForInvoice,
    t,
    formatPrice,
    language,
  } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  // Strictly filter only orders belonging to the authenticated customer
  const customerOrders = useMemo(() => {
    if (!user.isLoggedIn) return [];
    const cleanUserPhone = (user.phone || '').replace(/\D/g, '');
    const cleanUserEmail = (user.email || '').trim().toLowerCase();
    const userUid = user.uid || '';

    return orders.filter(o => {
      if (userUid && o.customerUid && o.customerUid === userUid) return true;
      if (cleanUserPhone && o.phone) {
        const orderPhone = o.phone.replace(/\D/g, '');
        if (orderPhone && (orderPhone === cleanUserPhone || orderPhone.endsWith(cleanUserPhone) || cleanUserPhone.endsWith(orderPhone))) {
          return true;
        }
      }
      if (cleanUserEmail && o.email && o.email.trim().toLowerCase() === cleanUserEmail) return true;
      return false;
    });
  }, [orders, user.isLoggedIn, user.uid, user.phone, user.email]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const activeOrder: Order | undefined = useMemo(() => {
    if (customerOrders.length === 0) return undefined;
    if (selectedOrderId) {
      const found = customerOrders.find(o => o.id === selectedOrderId);
      if (found) return found;
    }
    if (trackingOrderId) {
      const found = customerOrders.find(o => o.id === trackingOrderId);
      if (found) return found;
    }
    return customerOrders[0];
  }, [customerOrders, selectedOrderId, trackingOrderId]);

  if (activeModal !== 'tracking') return null;

  const displayedOrders = customerOrders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toUpperCase();
    return (
      o.id.toUpperCase().includes(q) ||
      o.trackingNumber.toUpperCase().includes(q) ||
      (o.courierInfo?.consignmentId && o.courierInfo.consignmentId.toUpperCase().includes(q)) ||
      o.items.some(i => (i.product.nameBn || i.product.name).toUpperCase().includes(q))
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) return;

    const clean = searchQuery.trim().toUpperCase();
    const found = customerOrders.find(
      o =>
        o.id.toUpperCase() === clean ||
        o.trackingNumber.toUpperCase() === clean ||
        (o.courierInfo && o.courierInfo.consignmentId.toUpperCase() === clean)
    );

    if (found) {
      setSelectedOrderId(found.id);
      setTrackingOrderId(found.id);
    } else {
      setSearchError(
        t(
          'আপনার অ্যাকাউন্টে এই আইডি দিয়ে কোনো অর্ডার পাওয়া যায়নি।',
          'No order found with this ID in your personal account.'
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
      case 'Delivered':
        return CheckCircle;
      case 'Packed':
        return Package;
      case 'Shipped':
        return Truck;
      case 'Out for Delivery':
        return MapPin;
      default:
        return Clock;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] text-white flex items-center justify-center shrink-0">
              <Truck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base sm:text-lg text-[#111827]">
                {t('অর্ডার ট্র্যাকিং', 'Order Tracking')}
              </h3>
              <p className="text-xs text-gray-500">
                {user.isLoggedIn
                  ? t('আপনার পার্সেলের বর্তমান অবস্থান ও ডেলিভারি আপডেট', 'Real-time dispatch and delivery status for your orders')
                  : t('অর্ডারের অবস্থান দেখতে লগইন করুন', 'Sign in to track your personal orders')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated Gate */}
        {!user.isLoggedIn ? (
          <div className="p-7 sm:p-10 text-center space-y-5 my-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf9f7] border border-[#e6e3dd] text-[#881337] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="font-editorial font-bold text-[#111827] text-lg sm:text-xl">
                {t('অর্ডার ট্র্যাকিং দেখতে লগইন প্রয়োজন', 'Sign In to View Order Tracking')}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t(
                  'আপনার ডেলিভারি ঠিকানা, ফোন নম্বর এবং পার্সেলের নিরাপত্তা নিশ্চিত করতে লগইন করে অর্ডার ট্র্যাক করুন।',
                  'To keep your delivery address, phone number, and order details private, please log in first.'
                )}
              </p>
            </div>

            <div className="pt-2 max-w-sm mx-auto space-y-3">
              <button
                type="button"
                onClick={() => setActiveModal('login')}
                className="w-full py-3 px-6 min-h-[44px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('লগইন / রেজিস্টার করুন', 'Login / Register')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2 text-xs text-gray-500 hover:text-[#111827] font-medium cursor-pointer"
              >
                {t('হোমপেজে ফিরে যান', 'Return to homepage')}
              </button>
            </div>

            <div className="p-3 bg-[#faf9f7] rounded-xl border border-[#e6e3dd] max-w-sm mx-auto text-xs text-gray-600 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
              <span>{t('শুধুমাত্র আপনার নিজস্ব অর্ডারসমূহ দৃশ্যমান হবে', 'Only your own verified orders are accessible')}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Top Bar: Customer Orders Strip & Search */}
            <div className="p-4 sm:p-5 border-b border-[#e6e3dd] bg-white space-y-3">
              {customerOrders.length > 1 && (
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t('আপনার অর্ডার আইডি বা ট্র্যাকিং নম্বর লিখুন...', 'Search by Order ID or Tracking #...')}
                      className="w-full min-h-[40px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-[#111827] uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#111827] hover:bg-black text-white font-semibold text-xs px-4 py-2 min-h-[40px] rounded-xl transition-colors cursor-pointer"
                  >
                    {t('খুঁজুন', 'Filter')}
                  </button>
                </form>
              )}

              {searchError && (
                <div className="text-xs text-[#881337] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {customerOrders.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 no-scrollbar">
                  <span className="text-gray-500 text-xs font-medium shrink-0">
                    {t('আপনার অর্ডার:', 'Your Orders:')}
                  </span>
                  {displayedOrders.map(o => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setTrackingOrderId(o.id);
                        setSearchError('');
                      }}
                      className={`px-3 py-1.5 min-h-[34px] rounded-lg border text-xs font-mono cursor-pointer transition-colors shrink-0 flex items-center gap-2 tabular-nums ${
                        activeOrder?.id === o.id
                          ? 'border-[#111827] bg-[#111827] text-white font-semibold'
                          : 'border-[#e6e3dd] bg-[#faf9f7] text-[#111827] hover:border-gray-400 font-medium'
                      }`}
                    >
                      <span>{o.id}</span>
                      <span className={`text-[10px] ${activeOrder?.id === o.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        · {o.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5 bg-[#faf9f7]">
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#e6e3dd] text-gray-400 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-[#111827]">
                      {t('আপনার অ্যাকাউন্টে কোনো সক্রিয় অর্ডার নেই', 'No Orders Found in Your Account')}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      {t(
                        'আপনি এখনো কোনো অর্ডার করেননি। পছন্দের পণ্য অর্ডার করে এখান থেকে স্ট্যাটাস দেখতে পারবেন।',
                        'You have not placed any orders yet.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs cursor-pointer transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('শপিং শুরু করুন', 'Start Shopping')}</span>
                  </button>
                </div>
              ) : activeOrder ? (
                <>
                  {/* Order Info Summary Card */}
                  <div className="bg-white rounded-xl p-4 border border-[#e6e3dd] flex flex-wrap items-center justify-between gap-4 text-xs tabular-nums">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{t('অর্ডার নম্বর:', 'Order ID:')}</span>
                        <span className="font-mono font-bold text-[#111827] text-sm">{activeOrder.id}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {t('তারিখ:', 'Date:')} <span className="font-medium text-[#111827]">{activeOrder.orderDate}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {t('মোট:', 'Total:')} <span className="font-bold text-[#881337] font-mono">{formatPrice(activeOrder.totalAmount)}</span>
                        <span className="ml-1 text-gray-400">({activeOrder.paymentMethod.toUpperCase()})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">{t('কুরিয়ার:', 'Courier:')}</span>
                        <span className="font-semibold text-[#111827]">{activeOrder.courierInfo?.courierName || activeOrder.courier}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-600 mt-1">
                        {t('ট্র্যাকিং কোড:', 'Tracking #:')}{' '}
                        <span className="font-semibold text-[#111827]">
                          {activeOrder.courierInfo?.trackingCode || activeOrder.trackingNumber}
                        </span>
                      </div>
                      {activeOrder.courierInfo?.trackingUrl && (
                        <a
                          href={activeOrder.courierInfo.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#881337] hover:underline font-semibold mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t('কুরিয়ার পোর্টালে ট্র্যাক করুন', 'Track on Courier Site')}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          activeOrder.status === 'Delivered'
                            ? 'bg-emerald-50 border-emerald-200 text-[#15803d]'
                            : activeOrder.status === 'Shipped' || activeOrder.status === 'Out for Delivery'
                            ? 'bg-slate-100 border-slate-300 text-[#111827]'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {activeOrder.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrderForInvoice(activeOrder);
                          setActiveModal('invoice');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#e6e3dd] text-[#111827] hover:border-[#111827] font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {t('ইনভয়েস', 'Invoice')}
                      </button>
                    </div>
                  </div>

                  {/* Delivery Recipient Info */}
                  <div className="bg-white rounded-xl p-4 border border-[#e6e3dd] text-xs text-gray-700 flex items-start gap-3 tabular-nums">
                    <MapPin className="w-4 h-4 text-[#881337] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[#111827]">{activeOrder.customerName}</span>
                      <span className="mx-1.5 text-gray-400">·</span>
                      <span className="font-mono">{activeOrder.phone}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeOrder.address.fullAddress}, {activeOrder.address.area}, {activeOrder.address.district}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Stepper Timeline */}
                  <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-px before:bg-[#e6e3dd]">
                    {activeOrder.timeline.map((step, idx) => {
                      const Icon = getStatusIcon(step.status);

                      return (
                        <div key={idx} className="relative flex items-start gap-3.5">
                          <div
                            className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center border transition-colors ${
                              step.completed
                                ? 'bg-[#15803d] border-[#15803d] text-white'
                                : 'bg-white border-[#e6e3dd] text-gray-400'
                            }`}
                          >
                            <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          </div>

                          <div className="flex-1 min-w-0 bg-white p-3.5 rounded-xl border border-[#e6e3dd]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4
                                className={`text-xs sm:text-sm font-semibold ${
                                  step.completed ? 'text-[#111827]' : 'text-gray-500'
                                }`}
                              >
                                {language === 'bn' ? step.statusBn : step.status}
                              </h4>
                              <span className="text-[11px] text-gray-400 font-mono tabular-nums">
                                {step.date}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {language === 'bn' ? step.descriptionBn : step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Courier Helpline Support Box */}
                  <div className="bg-white p-4 rounded-xl border border-[#e6e3dd] flex flex-wrap items-center justify-between gap-2 text-xs text-[#111827]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#881337] shrink-0" />
                      <span>
                        {t('ডেলিভারি সহায়তা হটলাইন:', 'Delivery helpline:')}{' '}
                        <strong className="font-mono tabular-nums">01800-JOTPOT</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveModal('support')}
                      className="text-xs font-semibold text-[#881337] hover:underline cursor-pointer"
                    >
                      {t('সহায়তা কেন্দ্র', 'Help Center')}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
