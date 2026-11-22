import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  MapPin,
  Sparkles,
  Layers,
  Truck,
  PhoneCall,
  ChevronDown,
  Mic,
  LogIn,
  Globe,
  Tag,
  Check,
  Store,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BD_DISTRICTS } from '../data/mockData';
import { isImageIconUrl, resolveCategoryIcon } from '../utils/categoryAssets';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    cart,
    wishlist,
    comparisonList,
    user,
    selectedLocation,
    setSelectedLocation,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedNeed,
    setSelectedNeed,
    setSelectedMaxBudget,
    setIsAdminView,
    deliverySettings,
    websiteSettings,
    categories,
  } = useShop();

  const [logoImageError, setLogoImageError] = useState(false);

  // Auto-reset logo error when a new logo URL is saved or uploaded
  useEffect(() => {
    setLogoImageError(false);
  }, [websiteSettings.logoUrl, websiteSettings.mobileLogoUrl]);

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveModal('search');
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognition.start();
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setActiveModal('search');
        };
        recognition.onerror = () => {
          setActiveModal('search');
        };
      } catch {
        setActiveModal('search');
      }
    } else {
      setActiveModal('search');
    }
  };

  const cleanOfferText = (text?: string) =>
    (text || '').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e6e3dd] w-full max-w-full overflow-x-clip">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#111827] text-gray-100 text-xs py-2 px-3 sm:px-4 font-normal w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Promo offer */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
            <span className="bg-white/10 text-amber-200 border border-white/15 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide shrink-0">
              {deliverySettings.chattogramFreeDeliveryOffer
                ? t('চট্টগ্রাম অফার', 'Chattogram Offer')
                : t('বিশেষ সুবিধা', 'Store Offer')}
            </span>
            <span className="truncate text-[11px] sm:text-xs text-gray-200">
              {deliverySettings.chattogramFreeDeliveryOffer && deliverySettings.chattogramOfferTextBn
                ? cleanOfferText(deliverySettings.chattogramOfferTextBn)
                : t(
                    '১৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি (কোড: FREEDEL) ও সারা দেশে ক্যাশ অন ডেলিভারি',
                    'Free Delivery on orders ৳1500+ (Code: FREEDEL) | Cash on Delivery Nationwide'
                  )}
            </span>
          </div>

          {/* Quick utility links */}
          <div className="flex items-center space-x-3 shrink-0 text-gray-300 text-xs">
            <button
              onClick={() => setActiveModal('support')}
              className="hidden lg:flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('সহায়তা কেন্দ্র', 'Help Center')}</span>
            </button>
            <span className="hidden lg:inline text-gray-700">|</span>
            <button
              onClick={() => setActiveModal('tracking')}
              className="hidden sm:flex items-center space-x-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('অর্ডার ট্র্যাক করুন', 'Track Order')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 w-full">
        <div className="flex items-center justify-between gap-2.5 sm:gap-5">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedNeed(null);
                setSelectedMaxBudget(null);
                setIsAdminView(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-hidden"
            >
              {websiteSettings.logoUrl && !logoImageError ? (
                <div className="h-9 sm:h-10 max-w-[140px] sm:max-w-[165px] flex items-center justify-center rounded-lg bg-white overflow-hidden">
                  <picture>
                    {websiteSettings.mobileLogoUrl && (
                      <source media="(max-width: 640px)" srcSet={websiteSettings.mobileLogoUrl} />
                    )}
                    <img
                      src={websiteSettings.logoUrl}
                      alt={websiteSettings.storeName || 'JotPotShop'}
                      referrerPolicy="no-referrer"
                      className="h-8 sm:h-9 w-auto max-w-[135px] sm:max-w-[160px] object-contain"
                      onError={() => setLogoImageError(true)}
                    />
                  </picture>
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#111827] flex items-center justify-center text-white shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111827] block leading-none">
                  {websiteSettings.storeName ? (
                    websiteSettings.storeName.includes('JotPot') ? (
                      <>
                        JotPot<span className="text-[#881337]">{websiteSettings.storeName.replace('JotPot', '') || 'Shop'}</span>
                      </>
                    ) : (
                      websiteSettings.storeName
                    )
                  ) : (
                    <>
                      JotPot<span className="text-[#881337]">Shop</span>
                    </>
                  )}
                </span>
                <span className="hidden sm:block text-[11px] text-gray-500 font-normal mt-0.5 leading-none">
                  {language === 'bn'
                    ? websiteSettings.taglineBn || 'যা দরকার, এক জায়গায়'
                    : websiteSettings.tagline || 'Curated Everyday Essentials'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop/Tablet Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 relative min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={() => setActiveModal('search')}
                placeholder={t(
                  'পণ্য খুঁজুন — শার্ট, জামদানি, গ্যাজেট বা জুয়েলারি...',
                  'Search products — shirts, sarees, gadgets or gifts...'
                )}
                className="w-full bg-[#faf9f7] hover:bg-gray-100/70 focus:bg-white text-[#111827] text-sm pl-10 pr-24 py-2.5 min-h-[42px] rounded-xl border border-[#e6e3dd] focus:border-[#111827] focus:outline-hidden focus:ring-2 focus:ring-[#111827]/10 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title={t('ভয়েস সার্চ', 'Voice Search')}
                  className="p-2 text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="bg-[#111827] hover:bg-[#1f2937] text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  {t('খুঁজুন', 'Search')}
                </button>
              </div>
            </form>
          </div>

          {/* Location Selector (Desktop) */}
          <div className="hidden xl:block relative shrink-0">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center space-x-1.5 text-xs text-gray-700 bg-[#faf9f7] hover:bg-gray-100 border border-[#e6e3dd] px-3 py-2.5 min-h-[40px] rounded-xl cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#881337]" />
              <span className="font-medium max-w-[105px] truncate">{selectedLocation}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e6e3dd] py-2 z-50 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 border-b border-gray-100">
                  {t('ডেলিভারি এলাকা নির্বাচন করুন', 'Select Delivery Area')}
                </div>
                {BD_DISTRICTS.map(dist => (
                  <button
                    key={dist}
                    onClick={() => {
                      setSelectedLocation(dist);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#faf9f7] transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLocation === dist ? 'text-[#881337] font-semibold bg-[#faf9f7]' : 'text-gray-700'
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedLocation === dist && <Check className="w-3.5 h-3.5 text-[#881337]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Cluster */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-medium px-2.5 py-2 min-h-[40px] rounded-xl border border-[#e6e3dd] hover:border-gray-400 text-gray-700 hover:bg-[#faf9f7] transition-colors cursor-pointer"
              title={t('Switch to English', 'বাংলায় দেখুন')}
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveModal('account')}
              className="relative p-2.5 min-w-[40px] min-h-[40px] text-gray-700 hover:text-[#881337] rounded-xl border border-transparent hover:border-[#e6e3dd] hover:bg-[#faf9f7] transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              title={t('পছন্দের তালিকা', 'Wishlist')}
            >
              <Heart className={`w-[18px] h-[18px] ${wishlist.length > 0 ? 'text-[#881337] fill-[#881337]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#881337] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setActiveModal('cart')}
              className="relative flex items-center space-x-1.5 bg-[#faf9f7] hover:bg-gray-100 text-[#111827] px-2.5 sm:px-3.5 py-2 min-h-[40px] rounded-xl transition-colors cursor-pointer border border-[#e6e3dd] shrink-0"
              title={t('আপনার শপিং ব্যাগ খুলুন', 'Open Shopping Cart')}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#111827]" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#881337] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">
                <span className="hidden xl:inline">{t('শপিং ব্যাগ', 'Shopping Bag')}</span>
                <span className="hidden sm:inline xl:hidden">{t('ব্যাগ', 'Bag')}</span>
              </span>
            </button>

            {/* Customer Login & Registration */}
            {user.isLoggedIn ? (
              <button
                onClick={() => setActiveModal('account')}
                className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 min-h-[40px] text-[#111827] hover:bg-[#faf9f7] rounded-xl transition-colors cursor-pointer border border-[#e6e3dd] shrink-0"
                title={t('কাস্টমার ড্যাশবোর্ড', 'Customer Dashboard')}
              >
                <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold max-w-[85px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-gray-500">{t('অ্যাকাউন্ট', 'Account')}</span>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => setActiveModal('login')}
                  className="flex items-center space-x-1.5 bg-white hover:bg-[#faf9f7] text-[#111827] border border-[#e6e3dd] hover:border-gray-400 px-2.5 sm:px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  title={t('কাস্টমার লগইন', 'Customer Login')}
                >
                  <User className="w-3.5 h-3.5 text-gray-600" />
                  <span className="hidden sm:inline">{t('লগইন', 'Login')}</span>
                  <span className="sm:hidden">{t('লগইন', 'Login')}</span>
                </button>

                <button
                  onClick={() => setActiveModal('register')}
                  className="hidden lg:flex items-center space-x-1.5 bg-[#881337] hover:bg-[#9f1239] text-white px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  title={t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create Account')}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('রেজিস্ট্রেশন', 'Register')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={() => setActiveModal('search')}
              placeholder={t(
                'পণ্য খুঁজুন... শার্ট, শাড়ি, গ্যাজেট, জুয়েলারি',
                'Search products... shirts, sarees, gadgets'
              )}
              className="w-full bg-[#faf9f7] focus:bg-white text-[#111827] text-xs pl-9 pr-20 py-2.5 min-h-[42px] rounded-xl border border-[#e6e3dd] focus:border-[#111827] focus:outline-hidden transition-all placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="p-1.5 text-gray-500 hover:text-[#111827] rounded-lg"
                aria-label="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="bg-[#111827] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg"
              >
                {t('খুঁজুন', 'Search')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar */}
      <div className="border-t border-[#e6e3dd] bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium text-gray-700">
          <div className="flex items-center space-x-6">
            {/* All Categories Dropdown */}
            <div className="relative py-1.5">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center space-x-2 bg-[#111827] hover:bg-[#1f2937] text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('সব ক্যাটাগরি', 'All Categories')}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-gray-300" />
              </button>

              {showCategoryMenu && (
                <div
                  onMouseLeave={() => setShowCategoryMenu(false)}
                  className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-lg border border-[#e6e3dd] py-2 z-50"
                >
                  {categories.map(cat => {
                    const resolvedIcon = resolveCategoryIcon(cat.id, cat.icon);
                    const isImg = isImageIconUrl(resolvedIcon);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedNeed(null);
                          setSelectedMaxBudget(null);
                          setShowCategoryMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-[#faf9f7] hover:text-[#881337] flex items-center space-x-3 transition-colors cursor-pointer text-gray-800"
                      >
                        {isImg ? (
                          <img src={resolvedIcon} alt={language === 'bn' ? cat.nameBn : cat.name} referrerPolicy="no-referrer" className="w-6 h-6 object-cover rounded border border-[#e6e3dd] shrink-0" />
                        ) : (
                          <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span className="font-medium">{language === 'bn' ? cat.nameBn : cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedNeed(null);
                setSelectedMaxBudget(null);
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                !selectedCategory && !selectedNeed ? 'text-[#881337] font-semibold' : 'text-gray-700'
              }`}
            >
              {t('হোম', 'Home')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('deals-offers');
                setSelectedNeed(null);
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                selectedCategory === 'deals-offers' ? 'text-[#881337] font-semibold' : 'text-[#881337] font-medium'
              }`}
            >
              {t('বিশেষ অফার', 'Special Deals')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('men-fashion');
                setSelectedNeed(null);
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                selectedCategory === 'men-fashion' ? 'text-[#881337] font-semibold' : 'text-gray-700'
              }`}
            >
              {t('ছেলেদের কালেকশন', 'Men')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('women-fashion');
                setSelectedNeed(null);
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                selectedCategory === 'women-fashion' ? 'text-[#881337] font-semibold' : 'text-gray-700'
              }`}
            >
              {t('মেয়েদের কালেকশন', 'Women')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('gadgets');
                setSelectedNeed(null);
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                selectedCategory === 'gadgets' ? 'text-[#881337] font-semibold' : 'text-gray-700'
              }`}
            >
              {t('গ্যাজেট ও ডিভাইস', 'Gadgets')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('gift-items');
                setSelectedNeed('gift');
              }}
              className={`py-2.5 hover:text-[#881337] transition-colors cursor-pointer ${
                selectedCategory === 'gift-items' ? 'text-[#881337] font-semibold' : 'text-gray-700'
              }`}
            >
              {t('উপহার সামগ্রী', 'Gifts')}
            </button>
          </div>

          {/* Utility actions */}
          <div className="flex items-center space-x-2.5 py-1.5">
            <button
              onClick={() => setActiveModal('helpMeChoose')}
              className="flex items-center space-x-1.5 bg-[#faf9f7] hover:bg-[#111827] text-[#111827] hover:text-white border border-[#e6e3dd] px-3.5 py-1.5 rounded-lg font-medium text-xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('পছন্দ করতে সহায়তা নিন', 'Product Finder')}</span>
            </button>

            {comparisonList.length > 0 && (
              <button
                onClick={() => setActiveModal('compare')}
                className="text-xs text-[#111827] bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer tabular-nums"
              >
                {t(`তুলনা (${comparisonList.length})`, `Compare (${comparisonList.length})`)}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
