import React from 'react';
import { Phone, Mail, MapPin, Store } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { language, t, setSelectedCategory, setActiveModal, websiteSettings, categories } = useShop();
  const [logoErr, setLogoErr] = React.useState(false);

  React.useEffect(() => {
    setLogoErr(false);
  }, [websiteSettings.logoUrl]);

  return (
    <footer className="bg-[#0f172a] text-white pt-12 pb-24 md:pb-12 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-gray-800">
          {/* Col 1: Brand Info & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {websiteSettings.logoUrl && !logoErr ? (
                <div className="h-10 max-w-[140px] flex items-center justify-center p-1 rounded-lg bg-white overflow-hidden">
                  <img
                    src={websiteSettings.logoUrl}
                    alt={websiteSettings.storeName || 'JotPotShop'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-auto max-w-[125px] object-contain"
                    onError={() => setLogoErr(true)}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#881337] flex items-center justify-center text-white">
                  <Store className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none">
                  {websiteSettings.storeName ? (
                    websiteSettings.storeName.includes('JotPot') ? (
                      <>
                        JotPot<span className="text-rose-300">{websiteSettings.storeName.replace('JotPot', '') || 'Shop'}</span>
                      </>
                    ) : (
                      websiteSettings.storeName
                    )
                  ) : (
                    <>
                      JotPot<span className="text-rose-300">Shop</span>
                    </>
                  )}
                </span>
                <span className="text-gray-400 text-[11px] block mt-1 font-normal">
                  {websiteSettings.domain || 'jotpotshop.com'}
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-xs leading-[1.7] max-w-sm">
              {language === 'bn'
                ? websiteSettings.taglineBn
                  ? `“${websiteSettings.taglineBn}” — মানসম্মত পণ্য, স্বচ্ছ মূল্য ও নির্ভরযোগ্য ডেলিভারির একটি বিশ্বস্ত বাংলাদেশি অনলাইন স্টোর।`
                  : '“যা দরকার, এক জায়গায়” — মানসম্মত পণ্য, স্বচ্ছ মূল্য ও নির্ভরযোগ্য ডেলিভারির একটি বিশ্বস্ত বাংলাদেশি অনলাইন স্টোর।'
                : websiteSettings.tagline
                ? `“${websiteSettings.tagline}” — A trusted Bangladeshi online store for curated everyday quality.`
                : '“Everything you need, in one place” — A trusted Bangladeshi online store for curated everyday quality.'}
            </p>

            <div className="space-y-2 text-gray-300 pt-1">
              <div className="flex items-center space-x-2.5 tabular-nums">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  {t('হেল্পলাইন:', 'Helpline:')} <strong className="text-white">{websiteSettings.hotline || '01800-JOTPOT'}</strong> (৯টা – রাত ১১টা)
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{t('ইমেইল:', 'Email:')} {websiteSettings.supportEmail || 'support@jotpotshop.com'}</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {language === 'bn'
                    ? websiteSettings.officeAddressBn || websiteSettings.officeAddress || 'লেভেল ৫, কনকর্ড টাওয়ার, রোড ১১, বনানী, ঢাকা-১২১৩'
                    : websiteSettings.officeAddress || 'Level 5, Concord Tower, Road 11, Banani, Dhaka-1213'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-semibold text-white text-xs tracking-wide mb-3.5">
              {t('ক্যাটাগরিসমূহ', 'Categories')}
            </h4>
            <ul className="space-y-2.5 text-gray-400">
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
            <h4 className="font-semibold text-white text-xs tracking-wide mb-3.5">
              {t('গ্রাহক সহায়তা', 'Customer Service')}
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <button onClick={() => setActiveModal('tracking')} className="hover:text-white cursor-pointer text-left">
                  {t('অর্ডার ট্র্যাক করুন', 'Track Order')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer text-left">
                  {t('রিটার্ন ও রিফান্ড নীতিমালা', 'Return & Refund Policy')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer text-left">
                  {t('ডেলিভারি চার্জ ও সময়সীমা', 'Delivery Info')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('support')} className="hover:text-white cursor-pointer text-left">
                  {t('সচরাচর জিজ্ঞাসিত প্রশ্ন', 'FAQ')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveModal('account')} className="hover:text-white cursor-pointer text-left">
                  {t('আমার অ্যাকাউন্ট ও পছন্দের তালিকা', 'My Account & Wishlist')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Payment & Delivery */}
          <div>
            <h4 className="font-semibold text-white text-xs tracking-wide mb-3.5">
              {t('পেমেন্ট মাধ্যম', 'Payment Methods')}
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3.5">
              {t('সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং নিরাপদ মোবাইল ব্যাংকিং সুবিধা।', 'Nationwide Cash on Delivery and verified mobile banking.')}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="bg-white/5 text-gray-200 border border-white/15 px-2.5 py-1 rounded-md font-medium text-[11px]">
                বিকাশ (bKash)
              </span>
              <span className="bg-white/5 text-gray-200 border border-white/15 px-2.5 py-1 rounded-md font-medium text-[11px]">
                নগদ (Nagad)
              </span>
              <span className="bg-white/5 text-gray-200 border border-white/15 px-2.5 py-1 rounded-md font-medium text-[11px]">
                ক্যাশ অন ডেলিভারি
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2 tabular-nums">
          <p>© {new Date().getFullYear()} {websiteSettings.storeName || 'JotPotShop'} ({websiteSettings.domain || 'jotpotshop.com'}). {t('সর্বস্বত্ব সংরক্ষিত।', 'All Rights Reserved.')}</p>
          <p className="text-gray-500">
            {t('নিরাপদ ও নির্ভরযোগ্য বাংলাদেশি অনলাইন শপিং প্ল্যাটফর্ম', 'Trusted Bangladeshi Online Storefront')}
          </p>
        </div>
      </div>
    </footer>
  );
};
