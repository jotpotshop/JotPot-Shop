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
  ShieldCheck,
  ChevronDown,
  Scale,
  Mic,
  Zap,
  Lock,
  LogIn,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BD_DISTRICTS } from '../data/mockData';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    cart,
    wishlist,
    comparisonList,
    notifications,
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
    isAdminView,
    setIsAdminView,
    adminUser,
    setShowAdminLoginModal,
    adminLogout,
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

  // Dynamic Bangla Date and Rotating Header Greeting Messages
  const [greetingIndex, setGreetingIndex] = useState(0);

  const getBanglaDateString = () => {
    const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const now = new Date();
    const dayName = daysBn[now.getDay()];
    const monthName = monthsBn[now.getMonth()];
    const dateNum = String(now.getDate()).replace(/[0-9]/g, d => banglaDigits[Number(d)]);
    return `আজ ${dayName}, ${dateNum} ${monthName}`;
  };

  const greetingMessages = [
    getBanglaDateString(),
    'আসসালামু আলাইকুম স্যার',
    'আপনার দিনটা শুভ হোক',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, []);
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

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100 w-full max-w-full overflow-x-clip">
      {/* 1. Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white text-xs py-1.5 px-3 sm:px-4 font-medium w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Promo offer ticker */}
          <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
            <span className="bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
              {deliverySettings.chattogramFreeDeliveryOffer ? '🎉 চট্টগ্রাম অফার' : t('ধামাকা অফার', 'HOT OFFER')}
            </span>
            <span className="truncate text-[11px] sm:text-xs">
              {deliverySettings.chattogramFreeDeliveryOffer && deliverySettings.chattogramOfferTextBn
                ? deliverySettings.chattogramOfferTextBn
                : t(
                    '🎉 ফ্রি ডেলিভারি ৳১৫০০+ অর্ডারে! কোড: FREEDEL | সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা',
                    '🎉 FREE Delivery on orders ৳1500+! Code: FREEDEL | Cash on Delivery Available'
                  )}
            </span>
          </div>

          {/* Quick links & Admin Login */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 text-white/90 text-xs">
            <button
              onClick={() => setActiveModal('support')}
              className="hidden lg:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('হেল্পলাইন', 'Help')}</span>
            </button>
            <span className="hidden lg:inline text-white/40">|</span>
            <button
              onClick={() => setActiveModal('tracking')}
              className="hidden sm:flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('অর্ডার ট্র্যাক', 'Track')}</span>
            </button>
            <span className="hidden sm:inline text-white/40">|</span>

            {/* Admin Access Button */}
            {adminUser ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsAdminView(!isAdminView)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs ${
                    isAdminView
                      ? 'bg-amber-400 text-gray-950 font-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAdminView ? t('এডমিন মোড এক্টিভ', 'Admin Active') : t('এডমিন প্যানেল', 'Admin Panel')}</span>
                </button>
                <button
                  onClick={adminLogout}
                  title={t('লগআউট', 'Logout')}
                  className="px-1.5 py-0.5 rounded bg-black/25 hover:bg-black/40 text-[10px] text-white font-semibold cursor-pointer transition-colors"
                >
                  {t('লগআউট', 'Logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black px-2.5 py-0.5 rounded text-[11px] flex items-center space-x-1 cursor-pointer transition-all shadow-xs hover:scale-102"
              >
                <Lock className="w-3 h-3" />
                <span>{t('এডমিন লগইন', 'Admin Login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
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
              className="flex items-center space-x-2 text-left cursor-pointer group"
            >
              {websiteSettings.logoUrl && !logoImageError ? (
                <div className="h-9 sm:h-10 max-w-[130px] sm:max-w-[150px] flex items-center justify-center p-0.5 rounded-xl bg-white border border-gray-100 shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                  <picture>
                    {websiteSettings.mobileLogoUrl && (
                      <source media="(max-width: 640px)" srcSet={websiteSettings.mobileLogoUrl} />
                    )}
                    <img
                      src={websiteSettings.logoUrl}
                      alt={websiteSettings.storeName || 'JotPotShop'}
                      className="h-8 sm:h-9 w-auto max-w-[120px] sm:max-w-[140px] object-contain"
                      onError={() => setLogoImageError(true)}
                    />
                  </picture>
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-white stroke-white" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-gray-900">
                    {websiteSettings.storeName ? (
                      websiteSettings.storeName.includes('JotPot') ? (
                        <>
                          JotPot<span className="text-rose-600">{websiteSettings.storeName.replace('JotPot', '') || 'Shop'}</span>
                        </>
                      ) : (
                        websiteSettings.storeName
                      )
                    ) : (
                      <>
                        JotPot<span className="text-rose-600">Shop</span>
                      </>
                    )}
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-bold bg-rose-100 text-rose-700 px-1 py-0.5 rounded">
                    .com
                  </span>
                </div>
                {/* Rotating greeting and date banner directly below the logo */}
                <div className="flex items-center space-x-1.5 mt-0.5 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span
                    key={greetingIndex}
                    className="text-[10px] sm:text-[11px] font-black text-rose-700 bg-rose-50/95 border border-rose-200/70 px-2 py-0.5 rounded-full tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-2xs whitespace-nowrap"
                  >
                    {greetingMessages[greetingIndex]}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop/Tablet Smart Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 relative min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onClick={() => setActiveModal('search')}
                placeholder={t(
                  'আপনি কী খুঁজছেন? যেমন: ছেলেদের কালো শার্ট ১০০০ টাকার মধ্যে...',
                  'What are you looking for? e.g. Men black shirt under 1000...'
                )}
                className="w-full bg-gray-100/90 hover:bg-gray-100 focus:bg-white text-gray-900 text-xs md:text-sm pl-10 pr-24 py-2.5 rounded-full border border-transparent focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title={t('ভয়েস সার্চ', 'Voice Search')}
                  className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs cursor-pointer transition-colors"
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
              className="flex items-center space-x-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-medium max-w-[105px] truncate">{selectedLocation}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t('ডেলিভারি লোকেশন নির্বাচন করুন', 'Select Delivery Location')}
                </div>
                {BD_DISTRICTS.map(dist => (
                  <button
                    key={dist}
                    onClick={() => {
                      setSelectedLocation(dist);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedLocation === dist ? 'text-rose-600 font-semibold bg-rose-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedLocation === dist && <span className="text-rose-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Cluster (Responsive & Guaranteed Fit) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="hidden sm:flex items-center space-x-1 text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              title={t('Switch to English', 'বাংলায় দেখুন')}
            >
              <span className="text-xs">🌐</span>
              <span className="text-[11px]">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveModal('account')}
              className="relative p-2 text-gray-700 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer hidden sm:flex"
              title={t('উইশলিস্ট', 'Wishlist')}
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* "আপনার শপিং ব্যাগ" (Your Shopping Bag) Button */}
            <button
              onClick={() => setActiveModal('cart')}
              className="relative flex items-center space-x-1 sm:space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 sm:px-3 py-2 rounded-xl transition-colors cursor-pointer border border-rose-200/50 shadow-2xs shrink-0"
              title={t('আপনার শপিং ব্যাগ খুলুন', 'Open Your Shopping Cart')}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold whitespace-nowrap">
                <span className="hidden xl:inline">{t('আপনার শপিং ব্যাগ', 'Shopping Cart')}</span>
                <span className="hidden sm:inline xl:hidden">{t('ব্যাগ', 'Cart')}</span>
              </span>
            </button>

            {/* Customer Login & Registration Buttons */}
            {user.isLoggedIn ? (
              <button
                onClick={() => setActiveModal('account')}
                className="flex items-center space-x-1.5 p-1 sm:px-2.5 sm:py-2 text-gray-800 hover:text-rose-600 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200/60 shrink-0"
                title={t('কাস্টমার ড্যাশবোর্ড', 'Customer Dashboard')}
              >
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold max-w-[85px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-gray-500 font-medium">{t('অ্যাকাউন্ট', 'Account')}</span>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                {/* কাস্টমার লগইন Button */}
                <button
                  onClick={() => setActiveModal('login')}
                  className="flex items-center space-x-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-gray-300 px-2 sm:px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  title={t('কাস্টমার লগইন', 'Customer Login')}
                >
                  <User className="w-3.5 h-3.5 text-gray-600" />
                  <span className="hidden sm:inline">{t('কাস্টমার লগইন', 'Customer Login')}</span>
                  <span className="sm:hidden">{t('লগইন', 'Login')}</span>
                </button>

                {/* কাস্টমার রেজিস্ট্রেশন Button */}
                <button
                  onClick={() => setActiveModal('register')}
                  className="hidden lg:flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  title={t('কাস্টমার রেজিস্ট্রেশন', 'Customer Registration')}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('রেজিস্ট্রেশন', 'Register')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dedicated Search Bar (Ensures zero overflow and perfect touch target) */}
        <div className="mt-2 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={() => setActiveModal('search')}
              placeholder={t(
                'পণ্য খুঁজুন... যেমন: শার্ট, গ্যাজেট, জুয়েলারি',
                'Search products... e.g. shirts, gadgets'
              )}
              className="w-full bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-gray-900 text-xs pl-9 pr-20 py-2 rounded-xl border border-transparent focus:border-rose-500 focus:outline-hidden transition-all placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="p-1 text-gray-500 hover:text-rose-600 rounded-full"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="submit"
                className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
              >
                {t('সার্চ', 'Search')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar */}
      <div className="border-t border-gray-100 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-medium text-gray-700">
          <div className="flex items-center space-x-6">
            {/* All Categories Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-black text-white font-semibold px-4 py-2.5 rounded-t-md cursor-pointer transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>{t('সব ক্যাটাগরি', 'All Categories')}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {showCategoryMenu && (
                <div
                  onMouseLeave={() => setShowCategoryMenu(false)}
                  className="absolute left-0 top-full w-64 bg-white rounded-b-xl shadow-2xl border border-gray-100 py-2 z-50"
                >
                  {categories.map(cat => {
                    const isImg = cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('data:image/') || cat.icon.startsWith('/'));
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedNeed(null);
                          setSelectedMaxBudget(null);
                          setShowCategoryMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-600 flex items-center space-x-3 transition-colors cursor-pointer text-gray-800"
                      >
                        {isImg ? (
                          <img src={cat.icon} alt={cat.name} className="w-5 h-5 object-contain rounded" />
                        ) : (
                          <span className="text-base">{cat.icon || '🛍️'}</span>
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
              className={`hover:text-rose-600 transition-colors cursor-pointer ${
                !selectedCategory && !selectedNeed ? 'text-rose-600 font-bold' : ''
              }`}
            >
              {t('হোম', 'Home')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('deals-offers');
                setSelectedNeed(null);
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer flex items-center space-x-1 text-rose-600 font-bold"
            >
              <span>🔥</span>
              <span>{t('ধামাকা ডিল', 'Flash Deals')}</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategory('men-fashion');
                setSelectedNeed(null);
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              {t('ছেলেদের কালেকশন', 'Men')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('women-fashion');
                setSelectedNeed(null);
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              {t('মেয়েদের কালেকশন', 'Women')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('gadgets');
                setSelectedNeed(null);
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              {t('গ্যাজেট ও ডিভাইস', 'Gadgets')}
            </button>
            <button
              onClick={() => {
                setSelectedCategory('gift-items');
                setSelectedNeed('gift');
              }}
              className="hover:text-rose-600 transition-colors cursor-pointer flex items-center space-x-1"
            >
              <span>🎁</span>
              <span>{t('উপহার আইডিয়া', 'Gift Ideas')}</span>
            </button>
          </div>

          {/* Interactive Feature: "Help Me Choose" (কী কিনব বুঝতে পারছেন না?) */}
          <div className="flex items-center space-x-3 py-1.5">
            <button
              onClick={() => setActiveModal('helpMeChoose')}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-full font-bold text-xs shadow-xs cursor-pointer transition-all hover:scale-102"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white stroke-none" />
              <span>{t('কী কিনব বুঝতে পারছেন না?', 'Help Me Choose?')}</span>
            </button>

            {comparisonList.length > 0 && (
              <button
                onClick={() => setActiveModal('compare')}
                className="text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer"
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
