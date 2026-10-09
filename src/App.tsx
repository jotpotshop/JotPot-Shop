import React, { useState } from 'react';
import { useShop, ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HeroSlider } from './components/HeroSlider';
import { CategoryBar } from './components/CategoryBar';
import { FlashSaleSection } from './components/FlashSaleSection';
import { ShopByNeedSection } from './components/ShopByNeedSection';
import { ShopByBudgetSection } from './components/ShopByBudgetSection';
import { CompleteTheLookSection } from './components/CompleteTheLookSection';
import { ProductCard } from './components/ProductCard';
import { TrustSection } from './components/TrustSection';
import { Footer } from './components/Footer';

// Modals
import { SmartSearchModal } from './components/SmartSearchModal';
import { QuickViewModal } from './components/QuickViewModal';
import { HelpMeChooseModal } from './components/HelpMeChooseModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { CustomerDashboardModal } from './components/CustomerDashboardModal';
import { CustomerSupportModal } from './components/CustomerSupportModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminPanel } from './components/AdminPanel';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';
import { CATEGORIES } from './data/mockData';

const MainContent: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedNeed,
    setSelectedNeed,
    selectedMaxBudget,
    setSelectedMaxBudget,
    isAdminView,
    recentlyViewed,
    language,
    t,
    websiteSettings,
  } = useShop();

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Dynamically sync document title and favicon with Website Branding
  React.useEffect(() => {
    if (websiteSettings.storeName) {
      document.title = `${websiteSettings.storeName} - ${
        language === 'bn'
          ? websiteSettings.taglineBn || 'যা দরকার, এক জায়গায়'
          : websiteSettings.tagline || 'Everything you need, in one place'
      }`;
    }
    if (websiteSettings.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = websiteSettings.faviconUrl;
    }
  }, [websiteSettings, language]);

  if (isAdminView) {
    return <AdminPanel />;
  }

  // Filter products for category view
  const currentCategoryObj = CATEGORIES.find(c => c.id === selectedCategory);

  let displayedProducts = [...products];

  if (selectedCategory) {
    if (selectedCategory === 'deals-offers') {
      displayedProducts = displayedProducts.filter(p => p.isFlashSale || (p.discountPercent && p.discountPercent > 25));
    } else {
      displayedProducts = displayedProducts.filter(p => p.category === selectedCategory);
    }

    if (activeSubcategory) {
      displayedProducts = displayedProducts.filter(p => p.subcategory.toLowerCase() === activeSubcategory.toLowerCase());
    }
  }

  if (selectedNeed) {
    displayedProducts = displayedProducts.filter(p => p.needTags.includes(selectedNeed as any));
  }

  if (selectedMaxBudget !== null) {
    displayedProducts = displayedProducts.filter(p => p.price <= selectedMaxBudget);
  }

  // Sort
  if (sortOption === 'price-asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    displayedProducts.sort((a, b) => b.rating - a.rating);
  }

  // Homepage sections collections
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const recentlyViewedProducts = products.filter(p => recentlyViewed.includes(p.id)).slice(0, 4);

  // Customer Reviews
  const verifiedReviews = [
    {
      name: 'তানভীর আহমেদ',
      city: 'ধানমন্ডি, ঢাকা',
      rating: 5,
      comment: 'জেট ব্ল্যাক অক্সফোর্ড শার্টটি নিয়েছি। কাপড়ের কোয়ালিটি ও ফিটিং অসাধারণ! ২৪ ঘণ্টার মধ্যে ডেলিভারি পেয়েছি।',
      productName: 'Premium Oxford Cotton Shirt',
    },
    {
      name: 'নুসরাত জাহান',
      city: 'হালিশহর, চট্টগ্রাম',
      rating: 5,
      comment: 'জামদানি সিল্ক শাড়ির কালার ছবির চেয়েও সুন্দর বাস্তবে। প্যাকেজিং চমৎকার ছিল, সম্পূর্ণ অক্ষত অবস্থায় পেয়েছি।',
      productName: 'Traditional Jamdani Silk Saree',
    },
    {
      name: 'মাহফুজুর রহমান',
      city: 'উপশহর, সিলেট',
      rating: 5,
      comment: 'AMOLED স্মার্টওয়াচটিতে সুন্দর বাংলা ফন্ট সাপোর্ট করে, নোটিফিকেশন পড়তে কোনো সমস্যা হয় না। ব্যাটারি ব্যাকআপ দারুণ!',
      productName: 'Smart Ultra AMOLED Watch',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60 font-sans max-w-full overflow-x-hidden">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 w-full">
        {/* If category or need is specifically selected, show Category Dedicated View */}
        {selectedCategory || selectedNeed ? (
          <div className="my-6">
            {/* Breadcrumb & Title */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedNeed(null);
                        setSelectedMaxBudget(null);
                      }}
                      className="hover:text-rose-600 font-medium cursor-pointer"
                    >
                      {t('হোম', 'Home')}
                    </button>
                    <span>/</span>
                    <span className="text-gray-900 font-bold">
                      {currentCategoryObj
                        ? (language === 'bn' ? currentCategoryObj.nameBn : currentCategoryObj.name)
                        : (selectedNeed?.toUpperCase() || 'Filter')}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                    {currentCategoryObj
                      ? `${language === 'bn' ? currentCategoryObj.nameBn : currentCategoryObj.name} কালেকশন`
                      : t('নির্বাচিত পণ্যসমূহ', 'Selected Products')}
                  </h1>
                </div>

                {/* Sort selector */}
                <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-600">{t('সর্ট করুন:', 'Sort By:')}</span>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-semibold text-gray-800 cursor-pointer focus:border-rose-500"
                  >
                    <option value="featured">{t('জনপ্রিয়তা', 'Featured')}</option>
                    <option value="price-asc">{t('দাম: কম থেকে বেশি', 'Price: Low to High')}</option>
                    <option value="price-desc">{t('দাম: বেশি থেকে কম', 'Price: High to Low')}</option>
                    <option value="rating">{t('সর্বোচ্চ রেটিং', 'Highest Rated')}</option>
                  </select>
                </div>
              </div>

              {/* Subcategories pills */}
              {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveSubcategory(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      activeSubcategory === null
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t('সকল সাব-ক্যাটাগরি', 'All')}
                  </button>
                  {currentCategoryObj.subcategories.map((sub, i) => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                        activeSubcategory === sub
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {language === 'bn' ? currentCategoryObj.subcategoriesBn[i] || sub : sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products grid */}
            {displayedProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-500">
                <p className="text-base font-bold text-gray-800">
                  {t('এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি।', 'No products found in this category.')}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedNeed(null);
                  }}
                  className="mt-3 text-rose-600 font-bold underline cursor-pointer text-xs"
                >
                  {t('হোমে ফিরে যান', 'Return Home')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {displayedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Rich Homepage Layout */
          <>
            {/* 1. Hero Slider Banner */}
            <HeroSlider />

            {/* 2. Shop by Category Bar */}
            <CategoryBar />

            {/* 3. Flash Sale Section with Countdown */}
            <FlashSaleSection />

            {/* 4. Trending Products */}
            <section className="my-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black text-gray-900">
                      {t('ট্রেন্ডিং পণ্যসমূহ', 'Trending Products')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('এই সপ্তাহে সবচেয়ে বেশি দেখা ও চাহিদাসম্পন্ন পণ্য', 'Most viewed and demanded this week')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategory('men-fashion')}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>{t('সব দেখুন', 'View All')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {trendingProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>

            {/* 5. Shop by Need (“আপনার কী প্রয়োজন?”) */}
            <ShopByNeedSection />

            {/* 6. Complete The Look (Smart Bundle Builder) */}
            <CompleteTheLookSection />

            {/* 7. New Arrivals */}
            <section className="my-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black text-gray-900">
                      {t('নতুন আগমন (New Arrivals)', 'New Arrivals')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('সদ্য যুক্ত হওয়া লেটেস্ট ফ্যাশন ও গ্যাজেট কালেকশন', 'Freshly curated collection just in stock')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategory('gadgets')}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>{t('সব দেখুন', 'View All')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {newArrivals.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>

            {/* 8. Shop by Budget */}
            <ShopByBudgetSection />

            {/* 9. Best Sellers */}
            <section className="my-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-black text-gray-900">
                      {t('বেস্ট সেলার (গ্রাহকদের সেরা পছন্দ)', 'Best Sellers')}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('হাজারো সন্তুষ্ট গ্রাহকের সর্বাধিক অর্ডারকৃত আইটেম', 'Most ordered items with highest customer ratings')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {bestSellers.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </section>

            {/* 10. Recently Viewed Section */}
            {recentlyViewedProducts.length > 0 && (
              <section className="my-8 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                    {t('সম্প্রতি দেখা পণ্য (Recently Viewed)', 'Recently Viewed')}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {recentlyViewedProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>
            )}

            {/* 11. Customer Reviews Testimonial Section */}
            <section className="my-10">
              <div className="text-center max-w-lg mx-auto mb-6">
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  {t('গ্রাহকের মন্তব্য', 'CUSTOMER REVIEWS')}
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 mt-2">
                  {t('গ্রাহকরা ঝটপটশপ সম্পর্কে কী বলছেন?', 'What Customers Say About Us')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {verifiedReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center text-amber-400 mb-2">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-gray-900 block">{rev.name}</strong>
                        <span className="text-[10px] text-gray-400">{rev.city}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        ✓ {t('ভেরিফাইড ক্রেতা', 'Verified Buyer')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 12. Trust & Service Section */}
            <TrustSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Modals & Overlays */}
      <SmartSearchModal />
      <QuickViewModal />
      <HelpMeChooseModal />
      <ProductComparisonModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <OrderTrackingModal />
      <CustomerDashboardModal />
      <CustomerSupportModal />
      <InvoiceModal />
      <AdminLoginModal />

      {/* Floating Contact Widget (Live Chat, Messenger, WhatsApp, Call) */}
      <FloatingContactWidget />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainContent />
    </ShopProvider>
  );
}
