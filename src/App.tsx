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
import { BondhameLoginPortal } from './components/admin/BondhameLoginPortal';

import {
  ArrowRight,
  Clock,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedNeed,
    setSelectedNeed,
    selectedMaxBudget,
    setSelectedMaxBudget,
    isAdminView,
    setIsAdminView,
    adminUser,
    recentlyViewed,
    language,
    t,
    websiteSettings,
    shopToast,
    setShopToast,
  } = useShop();

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Track route to handle /bondhame vs / (and block /admin)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');
    const hash = (window.location.hash || '').toLowerCase();
    if (
      path === '/bondhame' ||
      path.startsWith('/bondhame/') ||
      hash === '#bondhame' ||
      hash.startsWith('#bondhame')
    ) {
      return '/bondhame';
    }
    if (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash.startsWith('#admin')
    ) {
      return '/admin';
    }
    return path || '/';
  });

  React.useEffect(() => {
    const handleUrlCheck = () => {
      if (typeof window === 'undefined') return;
      const path = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '');
      const hash = (window.location.hash || '').toLowerCase();

      if (
        path === '/bondhame' ||
        path.startsWith('/bondhame/') ||
        hash === '#bondhame' ||
        hash.startsWith('#bondhame')
      ) {
        setCurrentRoute('/bondhame');
        setIsAdminView(true);
      } else if (
        path === '/admin' ||
        path.startsWith('/admin/') ||
        hash === '#admin' ||
        hash.startsWith('#admin')
      ) {
        // Obsolete /admin: strictly forbidden as admin entry. Do not set admin view.
        setCurrentRoute('/admin');
        setIsAdminView(false);
      } else {
        setCurrentRoute('/');
        setIsAdminView(false);
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, [setIsAdminView]);

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
  }, [websiteSettings.storeName, websiteSettings.taglineBn, websiteSettings.tagline, websiteSettings.faviconUrl, language]);

  // Obsolete /admin entry route: Render standard 404 directly at /admin without redirecting or exposing admin panel
  if (currentRoute === '/admin') {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#e6e3dd]">
          <div className="w-16 h-16 rounded-2xl bg-[#faf9f7] text-[#111827] flex items-center justify-center mx-auto mb-4 font-bold text-2xl border border-[#e6e3dd] tabular-nums">
            404
          </div>
          <h1 className="text-xl font-semibold text-[#111827] mb-2">পৃষ্ঠাটি পাওয়া যায়নি</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            আপনি যে ঠিকানায় প্রবেশ করতে চেয়েছেন তা কার্যকর নয়।
          </p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.pushState(null, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="w-full py-3 min-h-[44px] bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  // Handle /bondhame as the ONLY valid admin entry route
  if (currentRoute === '/bondhame' || (isAdminView && adminUser)) {
    if (adminUser) {
      return <AdminPanel />;
    }
    return <BondhameLoginPortal />;
  }

  // Filter products for category view (exclude unpublished/hidden products from storefront)
  const publishedProducts = products.filter(p => p.isPublished !== false);
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  let displayedProducts = [...publishedProducts];

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

  // Homepage sections collections (only published products)
  const trendingProducts = publishedProducts.filter(p => p.isTrending).slice(0, 4);
  const newArrivals = publishedProducts.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = publishedProducts.filter(p => p.isBestSeller).slice(0, 4);
  const recentlyViewedProducts = publishedProducts.filter(p => recentlyViewed.includes(p.id)).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7] text-[#111827] font-sans max-w-full overflow-x-hidden">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 w-full">
        {/* If category or need is specifically selected, show Category Dedicated View */}
        {selectedCategory || selectedNeed ? (
          <div className="my-6">
            {/* Breadcrumb & Title */}
            <div className="bg-white p-5 rounded-2xl border border-[#e6e3dd] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedNeed(null);
                        setSelectedMaxBudget(null);
                      }}
                      className="hover:text-[#881337] font-medium cursor-pointer"
                    >
                      {t('হোম', 'Home')}
                    </button>
                    <span>/</span>
                    <span className="text-[#111827] font-semibold">
                      {currentCategoryObj
                        ? (language === 'bn' ? currentCategoryObj.nameBn : currentCategoryObj.name)
                        : (selectedNeed?.toUpperCase() || 'Filter')}
                    </span>
                  </div>

                  <h1 className="font-editorial text-xl sm:text-2xl font-semibold text-[#111827]">
                    {currentCategoryObj
                      ? `${language === 'bn' ? currentCategoryObj.nameBn : currentCategoryObj.name} কালেকশন`
                      : t('নির্বাচিত পণ্যসমূহ', 'Selected Products')}
                  </h1>
                </div>

                {/* Sort selector */}
                <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
                  <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-600">{t('সাজান:', 'Sort By:')}</span>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                    className="bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-3 py-2 min-h-[38px] font-medium text-[#111827] cursor-pointer focus:border-[#111827] focus:outline-hidden"
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                      activeSubcategory === null
                        ? 'bg-[#111827] text-white'
                        : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {t('সব সাব-ক্যাটাগরি', 'All')}
                  </button>
                  {currentCategoryObj.subcategories.map((sub, i) => (
                    <button
                      key={sub}
                      onClick={() => setActiveSubcategory(sub)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                        activeSubcategory === sub
                          ? 'bg-[#111827] text-white'
                          : 'bg-[#faf9f7] border border-[#e6e3dd] text-gray-700 hover:border-gray-400'
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
            <section className="my-10">
              <div className="flex items-end justify-between mb-5 border-b border-[#e6e3dd] pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
                    {t('জনপ্রিয় কালেকশন', 'Trending Collection')}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {t('এই সপ্তাহে ক্রেতাদের সবচেয়ে পছন্দের পণ্যসমূহ', 'Most explored products this week')}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCategory('men-fashion')}
                  className="text-xs font-semibold text-[#881337] hover:underline flex items-center space-x-1 cursor-pointer shrink-0"
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

            {/* 5. Shop by Need */}
            <ShopByNeedSection />

            {/* 6. Complete The Look */}
            <CompleteTheLookSection />

            {/* 7. New Arrivals */}
            <section className="my-10">
              <div className="flex items-end justify-between mb-5 border-b border-[#e6e3dd] pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
                    {t('নতুন কালেকশন', 'New Arrivals')}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {t('সদ্য যুক্ত হওয়া ফ্যাশন, গ্যাজেট ও নিত্যপ্রয়োজনীয় পণ্য', 'Freshly added fashion, gadgets and essentials')}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCategory('gadgets')}
                  className="text-xs font-semibold text-[#881337] hover:underline flex items-center space-x-1 cursor-pointer shrink-0"
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
            <section className="my-10">
              <div className="flex items-end justify-between mb-5 border-b border-[#e6e3dd] pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
                    {t('গ্রাহকদের সেরা পছন্দ', 'Customer Favorites')}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {t('সর্বাধিক অর্ডারকৃত ও পরীক্ষিত মানের পণ্যসমূহ', 'Top ordered essentials across Bangladesh')}
                  </p>
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
              <section className="my-10 bg-white p-5 rounded-2xl border border-[#e6e3dd]">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm sm:text-base font-semibold text-[#111827]">
                    {t('সম্প্রতি দেখা পণ্য', 'Recently Viewed')}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {recentlyViewedProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>
            )}

            {/* 11. Trust & Service Section */}
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

      {/* Floating Contact Widget (Live Chat, Messenger, WhatsApp, Call) */}
      <FloatingContactWidget />

      {/* Global Shop Notification Toast */}
      {shopToast && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full mx-4 sm:mx-0 bg-[#111827] text-white p-4 rounded-xl shadow-xl border border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-xs font-medium leading-relaxed">
            {shopToast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {shopToast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {shopToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {shopToast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{shopToast.message}</span>
          </div>
          <button
            onClick={() => setShopToast(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
