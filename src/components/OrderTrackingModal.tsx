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

  // Search filter query within customer's own orders
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

  // Selected active order
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Determine currently viewed order
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

  // Filtered customer orders if search query is provided
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
        return CheckCircle;
      case 'Processing':
        return Clock;
      case 'Packed':
        return Package;
      case 'Shipped':
        return Truck;
      case 'Out for Delivery':
        return MapPin;
      case 'Delivered':
        return CheckCircle;
      default:
        return Clock;
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
                {user.isLoggedIn
                  ? t('আপনার অ্যাকাউন্টের পার্সেলের বর্তমান অবস্থান ও ডেলিভারি আপডেট', 'Real-time courier dispatch and delivery updates for your orders')
                  : t('অর্ডার তথ্য ও অবস্থান জানতে লগইন করুন', 'Login required to access your order tracking')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 1. GATE: Unauthenticated Visitor -> Mandatory Login Prompt */}
        {!user.isLoggedIn ? (
          <div className="p-7 sm:p-10 text-center space-y-5 my-auto">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="font-extrabold text-gray-900 text-lg sm:text-xl">
                {t('অর্ডার ট্র্যাকিং দেখতে লগইন বাধ্যতামূলক', 'Login Required for Order Tracking')}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t(
                  'আপনার ডেলিভারি ঠিকানা, মোবাইল নম্বর ও পার্সেল তথ্যের শতভাগ নিরাপত্তা নিশ্চিত করতে এবং অপরিচিত কারো হাত থেকে তথ্য সুরক্ষিত রাখতে লগইন বাধ্যতামূলক।',
                  'To protect your personal parcel details, shipping address, and phone number from unauthorized viewers, login is required.'
                )}
              </p>
            </div>

            <div className="pt-2 max-w-sm mx-auto space-y-3">
              <button
                type="button"
                onClick={() => setActiveModal('dashboard')}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:from-rose-700 hover:to-rose-900 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <LogIn className="w-5 h-5" />
                <span>{t('লগইন / রেজিস্টার করুন', 'Login / Register')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
              >
                {t('হোমপেজে ফিরে যান', 'Return to homepage')}
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-gray-200/80 max-w-sm mx-auto text-xs text-gray-600 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('শুধুমাত্র আপনার নিজস্ব অর্ডারসমূহ দৃশ্যমান হবে', 'Only your own verified orders will be accessible')}</span>
            </div>
          </div>
        ) : (
          /* 2. Authenticated Customer Tracking Dashboard */
          <>
            {/* Top Bar: Customer Orders Strip & In-Account Search */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-white space-y-3">
              {customerOrders.length > 1 && (
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t('আপনার অর্ডারের আইডি বা ট্র্যাকিং নম্বর লিখুন...', 'Search within your orders...')}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs font-mono focus:outline-hidden focus:border-rose-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    {t('খুঁজুন', 'Filter')}
                  </button>
                </form>
              )}

              {searchError && (
                <div className="text-xs text-rose-600 flex items-center space-x-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Verified Orders Selector Tabs */}
              {customerOrders.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1 no-scrollbar">
                  <span className="text-gray-400 text-[11px] font-bold shrink-0">
                    {t('আপনার অর্ডারসমূহ:', 'Your Orders:')}
                  </span>
                  {displayedOrders.map(o => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setTrackingOrderId(o.id);
                        setSearchError('');
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono cursor-pointer transition-all shrink-0 flex items-center space-x-1.5 ${
                        activeOrder?.id === o.id
                          ? 'border-rose-600 bg-rose-50 text-rose-700 font-extrabold shadow-2xs'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-100 font-medium'
                      }`}
                    >
                      <span>{o.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'Shipped' || o.status === 'Out for Delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-slate-50/40">
              {customerOrders.length === 0 ? (
                /* Empty state: Logged in customer has placed no orders yet */
                <div className="text-center py-12 px-4 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-base text-gray-900">
                      {t('আপনার অ্যাকাউন্টে কোনো সক্রিয় অর্ডার নেই', 'No Orders Found in Your Account')}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      {t(
                        'আপনি এখনো কোনো অর্ডার করেননি অথবা আপনার মোবাইল নম্বরের সাথে সংযুক্ত অর্ডার প্রক্রিয়াধীন রয়েছে।',
                        'You have not placed any orders yet, or your orders are being processed.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('শপিং শুরু করুন', 'Start Shopping')}</span>
                  </button>
                </div>
              ) : activeOrder ? (
                <>
                  {/* Order Info Summary Card */}
                  <div className="bg-white rounded-2xl p-4.5 border border-gray-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 font-medium">{t('অর্ডার নম্বর:', 'Order ID:')}</span>
                        <span className="font-mono font-extrabold text-gray-900 text-sm">{activeOrder.id}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {t('তারিখ:', 'Date:')} <span className="font-medium text-gray-700">{activeOrder.orderDate}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {t('মোট মূল্য:', 'Total:')} <span className="font-bold text-rose-600 font-mono">{formatPrice(activeOrder.totalAmount)}</span>
                        <span className="ml-1 text-[10px] text-gray-400">({activeOrder.paymentMethod.toUpperCase()})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-gray-500 font-medium">{t('কুরিয়ার:', 'Courier:')}</span>
                        <span className="font-bold text-gray-900">{activeOrder.courierInfo?.courierName || activeOrder.courier}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-600 mt-1">
                        {t('ট্র্যাকিং কোড:', 'Tracking #:')}{' '}
                        <span className="font-bold text-gray-800">
                          {activeOrder.courierInfo?.trackingCode || activeOrder.trackingNumber}
                        </span>
                      </div>
                      {activeOrder.courierInfo?.trackingUrl && (
                        <a
                          href={activeOrder.courierInfo.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-bold mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{t('কুরিয়ার পোর্টালে লাইভ ট্র্যাক', 'Track on Courier Site')}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          activeOrder.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeOrder.status === 'Shipped' || activeOrder.status === 'Out for Delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {activeOrder.status}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOrderForInvoice(activeOrder);
                          setActiveModal('invoice');
                        }}
                        className="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer transition-colors"
                      >
                        {t('ইনভয়েস', 'Invoice')}
                      </button>
                    </div>
                  </div>

                  {/* Delivery Recipient Info */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-200/80 text-xs text-gray-700 flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900">{activeOrder.customerName}</span> •{' '}
                      <span className="font-mono">{activeOrder.phone}</span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {activeOrder.address.fullAddress}, {activeOrder.address.area}, {activeOrder.address.district}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Stepper Timeline */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                    {activeOrder.timeline.map((step, idx) => {
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

                  {/* Courier Helpline Support Box */}
                  <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 flex items-center justify-between text-xs text-rose-900">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        {t('ডেলিভারি তথ্যে জরুরি সহায়তায় কল করুন:', 'Need delivery support? Call helpline:')}{' '}
                        <strong>01800-JOTPOT</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveModal('support')}
                      className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
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
