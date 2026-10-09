import React from 'react';
import { Phone, Mail, MapPin, Heart, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { language, t, setSelectedCategory, setActiveModal, setIsAdminView, websiteSettings, categories } = useShop();
  const [logoErr, setLogoErr] = React.useState(false);

  React.useEffect(() => {
    setLogoErr(false);
  }, [websiteSettings.logoUrl]);

  return (
    <footer className="bg-gray-950 text-white pt-12 pb-24 md:pb-12 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800">
          {/* Col 1: Brand Info & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              {websiteSettings.logoUrl && !logoErr ? (
                <div className="h-10 max-w-[140px] flex items-center justify-center p-1 rounded-xl bg-white/10 border border-white/20 overflow-hidden">
                  <img
                    src={websiteSettings.logoUrl}
                    alt={websiteSettings.storeName || 'JotPotShop'}
                    className="h-8 w-auto max-w-[120px] object-contain"
                    onError={() => setLogoErr(true)}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Zap className="w-6 h-6 fill-white stroke-white" />
                </div>
              )}
              <div>
                <span className="text-2xl font-black tracking-tight text-white">
                  {websiteSettings.storeName ? (
                    websiteSettings.storeName.includes('JotPot') ? (
                      <>
                        JotPot<span className="text-rose-500">{websiteSettings.storeName.replace('JotPot', '') || 'Shop'}</span>
                      </>
                    ) : (
                      websiteSettings.storeName
                    )
                  ) : (
                    <>
                      JotPot<span className="text-rose-500">Shop</span>
                    </>
                  )}
                </span>
                <span className="text-gray-400 text-xs block -mt-1 font-medium">
                  {websiteSettings.domain || 'jotpotshop.com'}
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              {language === 'bn'
                ? websiteSettings.taglineBn
                  ? `“${websiteSettings.taglineBn}” — বাংলাদেশের দ্রুততম ও সবচেয়ে আধুনিক মোবাইল-ফার্স্ট ই-কমার্স প্ল্যাটফর্ম।`
                  : '“যা দরকার, এক জায়গায়” — বাংলাদেশের দ্রুততম ও সবচেয়ে আধুনিক মোবাইল-ফার্স্ট ই-কমার্স প্ল্যাটফর্ম।'
                : websiteSettings.tagline
                ? `“${websiteSettings.tagline}” — Bangladesh’s fastest mobile-first e-commerce store.`
                : '“Everything you need, in one place” — Bangladesh’s fastest mobile-first e-commerce store.'}
            </p>

            <div className="space-y-1.5 text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-rose-500" />
                <span>
                  হেল্পলাইন: <strong>{websiteSettings.hotline || '01800-JOTPOT'}</strong> (9 AM - 11 PM)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-rose-500" />
                <span>ইমেইল: {websiteSettings.supportEmail || 'support@jotpotshop.com'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>
                  {language === 'bn'
                    ? websiteSettings.officeAddressBn || websiteSettings.officeAddress || 'লেভেল ৫, কনকর্ড টাওয়ার, রোড ১১, বনানী, ঢাকা-১২১৩'
                    : websiteSettings.officeAddress || 'Level 5, Concord Tower, Road 11, Banani, Dhaka-1213'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 text-rose-400">
              {t('জনপ্রিয় ক্যাটাগরি', 'Top Categories')}
            </h4>
            <ul className="space-y-2 text-gray-400">
              {categories.slice(0, 6).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(c.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {language === 'bn' ? c.nameBn : c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policy */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 text-rose-400">
              {t('গ্রাহক সহায়তা', 'Customer Care')}
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => setActiveModal('tracking')} className="hover:text-white cursor-pointer">
                  {t('অর্ডার ট্র্যাক করুন', 'Track Order')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer">
                  {t('রিটার্ন ও রিফান্ড পলিসি', 'Return & Refund Policy')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer">
                  {t('ডেলিভারি চার্জ ও সময়', 'Delivery Info')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer">
                  {t('সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)', 'FAQ')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('account')} className="hover:text-white cursor-pointer">
                  {t('আমার প্রোফাইল ও উইশলিস্ট', 'My Account & Wishlist')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment Partners & Security */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 text-rose-400">
              {t('নিরাপদ পেমেন্ট পার্টনার', 'Payment Partners')}
            </h4>
            <p className="text-gray-400 text-xs mb-3">
              {t('সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও সুরক্ষিত মোবাইল ব্যাংকিং সুবিধা।', 'Cash on Delivery and 100% secure payment gateways.')}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="bg-pink-900/40 text-pink-300 border border-pink-700/50 px-2.5 py-1 rounded-md font-bold text-[10px]">
                bKash বিকাশ
              </span>
              <span className="bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2.5 py-1 rounded-md font-bold text-[10px]">
                Nagad নগদ
              </span>
              <span className="bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-md font-bold text-[10px]">
                VISA
              </span>
              <span className="bg-rose-900/40 text-rose-300 border border-rose-700/50 px-2.5 py-1 rounded-md font-bold text-[10px]">
                Mastercard
              </span>
              <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2.5 py-1 rounded-md font-bold text-[10px]">
                Cash On Delivery
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800">
              <button
                onClick={() => setIsAdminView(true)}
                className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
              >
                {t('এডমিন পোর্টাল প্রবেশ', 'Admin Portal Login')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} JotPotShop (jotpotshop.com). {t('সর্বস্বত্ব সংরক্ষিত।', 'All Rights Reserved.')}</p>
          <p className="flex items-center space-x-1">
            <span>{t('বাংলাদেশে তৈরি', 'Crafted with')}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{t('ঝটপট কেনাকাটার বিশ্বস্ত ঠিকানা', 'for Bangladesh')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
