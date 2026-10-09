import React, { useState } from 'react';
import {
  X,
  MapPin,
  Truck,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Home,
  Briefcase,
  AlertCircle,
  Phone,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { useShop, FREE_DELIVERY_THRESHOLD } from '../context/ShopContext';
import { BD_DISTRICTS } from '../data/mockData';

export const CheckoutModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    cart,
    cartSubtotal,
    couponDiscount,
    placeOrder,
    savedAddresses,
    setSelectedOrderForInvoice,
    user,
    language,
    deliverySettings,
    paymentSettings,
    t,
    formatPrice,
  } = useShop();

  const [name, setName] = useState(user.name || 'JotPot Customer');
  const [phone, setPhone] = useState(user.phone || '01712345678');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [district, setDistrict] = useState('Dhaka (ঢাকা)');
  const [area, setArea] = useState('Dhanmondi');
  const [fullAddress, setFullAddress] = useState('House 42, Road 15/A, Dhanmondi R/A, Dhaka');
  const [customerNote, setCustomerNote] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'inside' | 'outside' | 'chattogram'>('inside');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [personalSenderNumber, setPersonalSenderNumber] = useState(user.phone || '');
  const [personalTrxId, setPersonalTrxId] = useState('');
  const [personalAmount, setPersonalAmount] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== 'checkout') return null;

  // Delivery fee calculation with Chattogram Zone & Free Delivery Offer support
  const freeThreshold = deliverySettings?.freeDeliveryThreshold ?? FREE_DELIVERY_THRESHOLD;
  const isFreeThresholdMet = cartSubtotal >= freeThreshold;

  let deliveryCharge = 0;
  if (isFreeThresholdMet) {
    deliveryCharge = 0;
  } else if (deliveryOption === 'chattogram') {
    deliveryCharge = deliverySettings.chattogramFreeDeliveryOffer ? 0 : (deliverySettings.chattogramFee ?? 80);
  } else if (deliveryOption === 'inside') {
    deliveryCharge = deliverySettings.dhakaFreeDeliveryOffer ? 0 : (deliverySettings.insideDhakaFee ?? 60);
  } else {
    deliveryCharge = deliverySettings.outsideDhakaFee ?? 120;
  }

  const totalAmount = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  const handleSelectSavedAddress = (addrId: string) => {
    const addr = savedAddresses.find(a => a.id === addrId);
    if (addr) {
      setName(addr.name);
      setPhone(addr.phone);
      setDistrict(addr.district);
      setArea(addr.area);
      setFullAddress(addr.fullAddress);
      const distLower = (addr.district || '').toLowerCase();
      if (distLower.includes('chattogram') || distLower.includes('chittagong') || addr.district.includes('চট্টগ্রাম')) {
        setDeliveryOption('chattogram');
      } else if (distLower.includes('dhaka') || addr.district.includes('ঢাকা')) {
        setDeliveryOption('inside');
      } else {
        setDeliveryOption('outside');
      }
    }
  };

  const handleDistrictChange = (dist: string) => {
    setDistrict(dist);
    const distLower = (dist || '').toLowerCase();
    if (distLower.includes('chattogram') || distLower.includes('chittagong') || dist.includes('চট্টগ্রাম')) {
      setDeliveryOption('chattogram');
    } else if (distLower.includes('dhaka') || dist.includes('ঢাকা')) {
      setDeliveryOption('inside');
    } else {
      setDeliveryOption('outside');
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage(t('দয়া করে আপনার পূর্ণ নাম লিখুন', 'Please enter your full name'));
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage(t('সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 017XXXXXXXX)', 'Please enter a valid 11-digit mobile number'));
      return;
    }

    if (!fullAddress.trim()) {
      setErrorMessage(t('দয়া করে বিস্তারিত ঠিকানা প্রদান করুন', 'Please provide your full delivery address'));
      return;
    }

    if (paymentMethod === 'bkash') {
      const isPersonal = paymentSettings.bkashAccountType === 'Personal';
      if (isPersonal) {
        if (!personalSenderNumber.trim()) {
          setErrorMessage(t('যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন তা প্রদান করুন', 'Please enter your sender bKash number'));
          return;
        }
        if (!personalTrxId.trim()) {
          setErrorMessage(t('বিকাশ সেন্ড মানি করার পর ট্রানজেকশন আইডি (TrxID) প্রদান করুন', 'Please enter your bKash Transaction ID (TrxID)'));
          return;
        }
      } else if (!bkashNumber.trim()) {
        setErrorMessage(t('বিকাশ অ্যাকাউন্ট নম্বর প্রদান করুন', 'Please enter your bKash account number'));
        return;
      }
    }

    if (paymentMethod === 'nagad') {
      const isPersonal = paymentSettings.nagadAccountType === 'Personal';
      if (isPersonal) {
        if (!personalSenderNumber.trim()) {
          setErrorMessage(t('যে নগদ নম্বর থেকে টাকা পাঠিয়েছেন তা প্রদান করুন', 'Please enter your sender Nagad number'));
          return;
        }
        if (!personalTrxId.trim()) {
          setErrorMessage(t('নগদ সেন্ড মানি করার পর ট্রানজেকশন আইডি (TrxID) প্রদান করুন', 'Please enter your Nagad Transaction ID (TrxID)'));
          return;
        }
      } else if (!nagadNumber.trim()) {
        setErrorMessage(t('নগদ অ্যাকাউন্ট নম্বর প্রদান করুন', 'Please enter your Nagad account number'));
        return;
      }
    }

    setIsSubmitting(true);

    let paymentDetailsObj: {
      senderNumber?: string;
      trxId?: string;
      amount?: number;
      accountType?: 'Merchant' | 'Personal';
    } | undefined = undefined;

    if (paymentMethod === 'bkash') {
      const isPersonal = paymentSettings.bkashAccountType === 'Personal';
      paymentDetailsObj = {
        senderNumber: isPersonal ? personalSenderNumber.trim() : bkashNumber.trim(),
        trxId: isPersonal ? personalTrxId.trim().toUpperCase() : undefined,
        amount: isPersonal ? (Number(personalAmount) || totalAmount) : totalAmount,
        accountType: isPersonal ? 'Personal' : 'Merchant',
      };
    } else if (paymentMethod === 'nagad') {
      const isPersonal = paymentSettings.nagadAccountType === 'Personal';
      paymentDetailsObj = {
        senderNumber: isPersonal ? personalSenderNumber.trim() : nagadNumber.trim(),
        trxId: isPersonal ? personalTrxId.trim().toUpperCase() : undefined,
        amount: isPersonal ? (Number(personalAmount) || totalAmount) : totalAmount,
        accountType: isPersonal ? 'Personal' : 'Merchant',
      };
    }

    setTimeout(() => {
      const order = placeOrder({
        customerName: name,
        phone: phone,
        alternativePhone: alternativePhone || undefined,
        district: district,
        area: area,
        fullAddress: fullAddress,
        customerNote: customerNote || undefined,
        deliveryOption: deliveryOption,
        paymentMethod: paymentMethod,
        orderSource: 'Website',
        paymentDetails: paymentDetailsObj,
      });

      setIsSubmitting(false);
      setSelectedOrderForInvoice(order);
      setActiveModal('orderConfirmation');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                {t('ওয়ান-পেজ এক্সপ্রেস চেকআউট', 'One-Page Express Checkout')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('গেস্ট চেকআউট সমর্থিত — কোনো পাসওয়ার্ড ছাড়াই দ্রুত অর্ডার করুন', 'Guest checkout enabled — order quickly without hassle')}
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

        {/* Checkout Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Delivery & Address Info (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            {/* Saved Addresses quick pick */}
            {savedAddresses.length > 0 && (
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  {t('সংরক্ষিত ঠিকানা থেকে নির্বাচন করুন (১-ক্লিক):', 'Quick Pick Saved Address:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map(addr => (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className="bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-200 hover:border-rose-300 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      {addr.label === 'Home' ? <Home className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                      <span>{addr.label}: {addr.area}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Contact */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('গ্রাহকের তথ্য', 'Customer Details')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('আপনার নাম *', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name || ''}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('যেমন: তানভীর আহমেদ', 'e.g. Tanvir Ahmed')}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('মোবাইল নম্বর * (১১ ডিজিট)', 'Phone Number * (11 Digits)')}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone || ''}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('বিকল্প মোবাইল নম্বর (ঐচ্ছিক)', 'Alternative Phone Number (Optional)')}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={alternativePhone || ''}
                    onChange={e => setAlternativePhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location & Address */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('ডেলিভারি ঠিকানা', 'Delivery Address')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('জেলা নির্বাচন করুন *', 'District *')}
                  </label>
                  <select
                    value={district}
                    onChange={e => handleDistrictChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                  >
                    {BD_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('থানা / এলাকা *', 'Area / Thana *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={area || ''}
                    onChange={e => setArea(e.target.value)}
                    placeholder={t('যেমন: ধানমন্ডি / মিরপুর / আগ্রাবাদ', 'e.g. Dhanmondi / Agrabad')}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('পূর্ণ বিস্তারিত ঠিকানা (বাসা, রোড, ব্লক) *', 'Full House Address *')}
                </label>
                <textarea
                  rows={2}
                  required
                  value={fullAddress || ''}
                  onChange={e => setFullAddress(e.target.value)}
                  placeholder={t('বাড়ি নং, রোড নং, ফ্ল্যাট বা ল্যান্ডমার্ক...', 'House No, Road No, Flat or Nearby Landmark...')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('বিশেষ কোনো নির্দেশনা বা নোট (ঐচ্ছিক)', 'Delivery Note / Customer Instructions (Optional)')}
                </label>
                <input
                  type="text"
                  value={customerNote || ''}
                  onChange={e => setCustomerNote(e.target.value)}
                  placeholder={t('যেমন: ৪টার পর ডেলিভারি দিবেন, কল না পেলে অল্টারনেটে দিবেন...', 'e.g. Call before delivery, deliver after 4 PM...')}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {/* Delivery Speed Selector with 3 Zones (Dhaka, Chattogram, Outside) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    {t('ডেলিভারি জোন নির্বাচন:', 'Delivery Speed / Zone:')}
                  </label>
                  {deliverySettings.chattogramFreeDeliveryOffer && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full animate-pulse">
                      🎉 চট্টগ্রাম স্পেশাল অফার এক্টিভ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Inside Dhaka */}
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('inside')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryOption === 'inside'
                        ? 'border-rose-600 bg-rose-50/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{t('ঢাকা সিটি ভেতরে', 'Inside Dhaka City')}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {isFreeThresholdMet ? (
                        <span className="text-emerald-600 font-extrabold uppercase">FREE DELIVERY</span>
                      ) : (
                        `৳${deliverySettings.insideDhakaFee} (${deliverySettings.insideDhakaDays || '১-২ দিন'})`
                      )}
                    </div>
                  </button>

                  {/* Chattogram City Zone */}
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('chattogram')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                      deliveryOption === 'chattogram'
                        ? 'border-amber-500 bg-amber-50/90 text-amber-950 font-bold ring-2 ring-amber-500/30'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{t('চট্টগ্রাম সিটি', 'Chattogram City')}</span>
                      <span className="text-[9px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.2 rounded">Zone</span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {isFreeThresholdMet || deliverySettings.chattogramFreeDeliveryOffer ? (
                        <span className="text-emerald-700 font-black flex items-center">
                          🎉 {t('সম্পূর্ণ ফ্রি ডেলিভারি (৳০)', 'FREE Delivery (৳0)')}
                        </span>
                      ) : (
                        <span className="text-amber-800 font-bold">
                          {`৳${deliverySettings.chattogramFee ?? 80} (${deliverySettings.chattogramDays || '১-২ দিন'})`}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Outside Dhaka & Chattogram */}
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('outside')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      deliveryOption === 'outside'
                        ? 'border-rose-600 bg-rose-50/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{t('অন্যান্য জেলা সমূহ', 'Other Districts')}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {isFreeThresholdMet ? (
                        <span className="text-emerald-600 font-extrabold uppercase">FREE DELIVERY</span>
                      ) : (
                        `৳${deliverySettings.outsideDhakaFee} (${deliverySettings.outsideDhakaDays || '২-৩ দিন'})`
                      )}
                    </div>
                  </button>
                </div>

                {/* Special Chattogram Banner when selected */}
                {deliveryOption === 'chattogram' && deliverySettings.chattogramFreeDeliveryOffer && (
                  <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center space-x-2 animate-in fade-in">
                    <span className="text-sm">🎉</span>
                    <span className="font-semibold">
                      {deliverySettings.chattogramOfferTextBn || 'আজকে চট্টগ্রাম সিটির গ্রাহকদের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('পেমেন্ট মাধ্যম নির্বাচন করুন', 'Payment Method')}</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">💵</span>
                    <span className="text-xs font-bold">{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{t('পণ্য হাতে পেয়ে টাকা দিন', 'Pay when delivered')}</p>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-bold flex items-center justify-center">b</span>
                    <span className="text-xs font-bold text-pink-700">bKash (বিকাশ)</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{t('ইন্সট্যান্ট মোবাইল ব্যাংকিং', 'Instant Mobile Pay')}</p>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">ন</span>
                    <span className="text-xs font-bold text-amber-700">Nagad (নগদ)</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{t('নগদ মোবাইল পেমেন্ট', 'Nagad Online Pay')}</p>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold">{t('কার্ড / অনলাইন', 'Debit / Credit Card')}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Visa, Mastercard, Amex</p>
                </button>
              </div>

              {/* bKash Payment Form & Instructions */}
              {paymentMethod === 'bkash' && (
                <div className="mt-2 bg-pink-50/80 p-3.5 rounded-2xl border border-pink-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-pink-200/60">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
                        b
                      </span>
                      <span className="text-xs font-black text-pink-900">
                        {paymentSettings.bkashAccountType === 'Personal'
                          ? t('বিকাশ পার্সোনাল সেন্ড মানি', 'bKash Personal Send Money')
                          : t('বিকাশ অনলাইন মার্চেন্ট পেমেন্ট', 'bKash Merchant Payment')}
                      </span>
                    </div>
                    <span className="bg-pink-200/70 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {paymentSettings.bkashAccountType === 'Personal' ? 'Personal Account' : 'Merchant Gateway'}
                    </span>
                  </div>

                  {paymentSettings.bkashAccountType === 'Personal' ? (
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-xl border border-pink-200 space-y-2">
                        <p className="text-[11px] text-pink-900 font-medium">
                          {paymentSettings.bkashInstructionsBn ||
                            'বিকাশ অ্যাপ অথবা *247# ডায়াল করে নিচের নম্বরে সেন্ড মানি (Send Money) সম্পন্ন করুন:'}
                        </p>
                        <div className="flex items-center justify-between bg-pink-50 p-2 rounded-lg border border-pink-100">
                          <div>
                            <span className="text-[10px] text-gray-500 block">পার্সোনাল বিকাশ নম্বর:</span>
                            <span className="text-xs font-mono font-black text-pink-700">
                              {paymentSettings.bkashNumber || '01712-345678'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentSettings.bkashNumber || '01712-345678');
                              setCopiedNumber(true);
                              setTimeout(() => setCopiedNumber(false), 2000);
                            }}
                            className="bg-white hover:bg-pink-100 text-pink-700 border border-pink-200 px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-pink-950 font-bold pt-1">
                          <span>সেন্ড মানি অ্যামাউন্ট:</span>
                          <span className="text-rose-600 font-extrabold">{formatPrice(totalAmount)}</span>
                        </div>
                      </div>

                      {/* Customer inputs after sending money */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-pink-950 mb-1">
                            {t('১. আপনার বিকাশ নম্বর *', '1. Your Sender bKash Number *')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={personalSenderNumber}
                            onChange={e => setPersonalSenderNumber(e.target.value)}
                            placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                            className="w-full bg-white border border-pink-300 rounded-xl p-2 text-xs font-mono focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-pink-950 mb-1">
                            {t('২. ট্রানজেকশন আইডি (TrxID) *', '2. Transaction ID (TrxID) *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={personalTrxId}
                            onChange={e => setPersonalTrxId(e.target.value)}
                            placeholder="যেমন: BL9A7K2M4P"
                            className="w-full bg-white border border-pink-300 rounded-xl p-2 text-xs font-mono uppercase focus:border-pink-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-pink-950 mb-1">
                          {t('৩. প্রেরিত টাকার পরিমাণ (৳ অ্যামাউন্ট)', '3. Paid Amount (৳) *')}
                        </label>
                        <input
                          type="number"
                          value={personalAmount || totalAmount}
                          onChange={e => setPersonalAmount(e.target.value)}
                          placeholder={String(totalAmount)}
                          className="w-full bg-white border border-pink-300 rounded-xl p-2 text-xs font-bold text-gray-900 focus:border-pink-500 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-pink-900 mb-1">
                        {t('আপনার বিকাশ নম্বর প্রদান করুন:', 'Enter Your bKash Number:')}
                      </label>
                      <input
                        type="tel"
                        value={bkashNumber}
                        onChange={e => setBkashNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-pink-300 rounded-xl p-2 text-xs font-mono"
                      />
                      <p className="text-[10px] text-pink-700 mt-1">
                        {t(
                          'অর্ডার কনফার্ম করার পর বিকাশ মার্চেন্ট ওটিপি পপআপে পেমেন্ট যাচাই হবে।',
                          'bKash gateway will verify payment upon confirmation.'
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Nagad Payment Form & Instructions */}
              {paymentMethod === 'nagad' && (
                <div className="mt-2 bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                        ন
                      </span>
                      <span className="text-xs font-black text-amber-900">
                        {paymentSettings.nagadAccountType === 'Personal'
                          ? t('নগদ পার্সোনাল সেন্ড মানি', 'Nagad Personal Send Money')
                          : t('নগদ অনলাইন মার্চেন্ট পেমেন্ট', 'Nagad Merchant Payment')}
                      </span>
                    </div>
                    <span className="bg-amber-200/70 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {paymentSettings.nagadAccountType === 'Personal' ? 'Personal Account' : 'Merchant Gateway'}
                    </span>
                  </div>

                  {paymentSettings.nagadAccountType === 'Personal' ? (
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2">
                        <p className="text-[11px] text-amber-900 font-medium">
                          {paymentSettings.nagadInstructionsBn ||
                            'নগদ অ্যাপ অথবা *167# ডায়াল করে নিচের নম্বরে সেন্ড মানি (Send Money) সম্পন্ন করুন:'}
                        </p>
                        <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <div>
                            <span className="text-[10px] text-gray-500 block">পার্সোনাল নগদ নম্বর:</span>
                            <span className="text-xs font-mono font-black text-amber-700">
                              {paymentSettings.nagadNumber || '01812-345678'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentSettings.nagadNumber || '01812-345678');
                              setCopiedNumber(true);
                              setTimeout(() => setCopiedNumber(false), 2000);
                            }}
                            className="bg-white hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-amber-950 font-bold pt-1">
                          <span>সেন্ড মানি অ্যামাউন্ট:</span>
                          <span className="text-rose-600 font-extrabold">{formatPrice(totalAmount)}</span>
                        </div>
                      </div>

                      {/* Customer inputs after sending money */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            {t('১. আপনার নগদ নম্বর *', '1. Your Sender Nagad Number *')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={personalSenderNumber}
                            onChange={e => setPersonalSenderNumber(e.target.value)}
                            placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                            className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-mono focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1">
                            {t('২. ট্রানজেকশন আইডি (TrxID) *', '2. Transaction ID (TrxID) *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={personalTrxId}
                            onChange={e => setPersonalTrxId(e.target.value)}
                            placeholder="যেমন: 72K9M2P"
                            className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-mono uppercase focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-950 mb-1">
                          {t('৩. প্রেরিত টাকার পরিমাণ (৳ অ্যামাউন্ট)', '3. Paid Amount (৳) *')}
                        </label>
                        <input
                          type="number"
                          value={personalAmount || totalAmount}
                          onChange={e => setPersonalAmount(e.target.value)}
                          placeholder={String(totalAmount)}
                          className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-gray-900 focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        {t('আপনার নগদ নম্বর প্রদান করুন:', 'Enter Your Nagad Number:')}
                      </label>
                      <input
                        type="tel"
                        value={nagadNumber}
                        onChange={e => setNagadNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Place Button (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                {t('অর্ডার সারাংশ', 'Order Summary')}
              </h4>

              {/* Preview items */}
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-200 space-y-2 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded-md shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {language === 'bn' ? item.product.nameBn : item.product.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{t('সাবটোটাল', 'Subtotal')}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(cartSubtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t('ডিসকাউন্ট', 'Discount')}</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t('ডেলিভারি চার্জ', 'Delivery Fee')}</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase">{t('ফ্রি', 'FREE')}</span>
                    ) : (
                      formatPrice(deliveryCharge)
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-gray-900">
                  <span>{t('মোট প্রদেয় টাকা', 'Total Payable')}</span>
                  <span className="text-rose-600 text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Place Order CTA Button */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm sm:text-base py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{t('অর্ডার প্রসেস হচ্ছে...', 'Processing Order...')}</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('অর্ডার নিশ্চিত করুন (Place Order)', 'Place Order Now')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('১০০% নিরাপদ শপিং ও ক্যাশ অন ডেলিভারি নিশ্চয়তা', '100% Safe Shopping & Cash on Delivery Guarantee')}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
