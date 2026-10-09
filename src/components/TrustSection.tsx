import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones, CreditCard, Award } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const TrustSection: React.FC = () => {
  const { t } = useShop();

  const trustItems = [
    {
      icon: Truck,
      titleBn: 'সারা দেশে ক্যাশ অন ডেলিভারি',
      titleEn: 'Cash on Delivery Nationwide',
      descBn: 'পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের ১০০% নিশ্চয়তা',
      descEn: 'Inspect your parcel before paying at your doorstep',
    },
    {
      icon: RotateCcw,
      titleBn: '৭ দিনের সহজ রিটার্ন পলিসি',
      titleEn: '7-Day Easy Return Policy',
      descBn: 'পছন্দ না হলে বা কোনো ত্রুটি থাকলে ঝামেলাহীন এক্সচেঞ্জ',
      descEn: 'Hassle-free return & replacement within 7 days',
    },
    {
      icon: Award,
      titleBn: '১০০% অরিজিনাল ও অথেন্টিক পণ্য',
      titleEn: '100% Authentic Guaranteed',
      descBn: 'সরাসরি প্রস্তুতকারক ও ভেরিফাইড সাপ্লায়ার থেকে সংগৃহীত',
      descEn: 'Directly sourced from verified manufacturers',
    },
    {
      icon: CreditCard,
      titleBn: 'নিরাপদ ডিজিটাল পেমেন্ট',
      titleEn: 'Secure Digital Payments',
      descBn: 'বিকাশ, নগদ ও কার্ডে ব্যাংক-লেভেল এনক্রিপ্টেড পেমেন্ট',
      descEn: 'Bank-grade SSL encrypted bKash, Nagad & Cards',
    },
    {
      icon: Headphones,
      titleBn: 'সার্বক্ষণিক গ্রাহক সেবা',
      titleEn: 'Dedicated Customer Support',
      descBn: 'যেকোনো জিজ্ঞাসা বা সহযোগিতায় কল করুন 01800-JOTPOT',
      descEn: 'Ready to assist via hotline, WhatsApp & live chat',
    },
    {
      icon: ShieldCheck,
      titleBn: 'গুণগত মানের নিশ্চয়তা',
      titleEn: 'Premium Quality Assurance',
      descBn: 'প্রতিটি পার্সেল ডেলিভারির পূর্বে কঠোরভাবে কোয়ালিটি চেকড',
      descEn: 'Every parcel is inspected before secure packaging',
    },
  ];

  return (
    <section className="my-10 bg-white border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
          {t('কেন ঝটপটশপ বেছে নেবেন?', 'WHY CHOOSE JOTPOTSHOP?')}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
          {t('নিশ্চিন্ত কেনাকাটা ও বিশ্বস্ত ডেলিভারি সেবা', 'Trustworthy Shopping & Reliable Delivery')}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t('গ্রাহকের সন্তুষ্টি ও মানসম্মত সেবাই আমাদের প্রধান অঙ্গীকার।', 'Customer satisfaction & authenticity are our top priorities.')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trustItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-rose-200 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {t(item.titleBn, item.titleEn)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t(item.descBn, item.descEn)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
