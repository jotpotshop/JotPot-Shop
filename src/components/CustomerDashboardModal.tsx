import React, { useState } from 'react';
import {
  X,
  User,
  Package,
  Heart,
  MapPin,
  Clock,
  Tag,
  Bell,
  LogOut,
  LogIn,
  RotateCw,
  Plus,
  Trash2,
  Phone,
  Mail,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { BD_DISTRICTS } from '../data/mockData';

export const CustomerDashboardModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    loginUser,
    logoutUser,
    registerCustomer,
    loginCustomerWithPassword,
    loginWithGoogle,
    orders,
    wishlist,
    products,
    recentlyViewed,
    savedAddresses,
    addSavedAddress,
    deleteSavedAddress,
    coupons,
    notifications,
    markNotificationRead,
    addToCart,
    setSelectedOrderForInvoice,
    setTrackingOrderId,
    t,
    formatPrice,
    language,
  } = useShop();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'wishlist' | 'addresses' | 'recent' | 'coupons' | 'notifications' | 'profile'
  >('orders');

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Customer Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('01712345678');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Customer Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (activeModal === 'register') {
      setAuthMode('register');
    } else if (activeModal === 'login') {
      setAuthMode('login');
    }
    setAuthError('');
    setAuthSuccess('');
  }, [activeModal]);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Office'>('Home');
  const [newDistrict, setNewDistrict] = useState('Dhaka (ঢাকা)');
  const [newArea, setNewArea] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');

  if (activeModal !== 'account' && activeModal !== 'login' && activeModal !== 'register') return null;

  const wishedProducts = products.filter(p => wishlist.includes(p.id));
  const recentProducts = products.filter(p => recentlyViewed.includes(p.id));

  // Handle Customer Login (Mandatory Password required)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginIdentifier.trim()) {
      setAuthError('অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল ঠিকানা দিন।');
      return;
    }
    if (!loginPassword) {
      setAuthError('লগইন করার জন্য অবশ্যই পাসওয়ার্ড প্রয়োজন!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginCustomerWithPassword(loginIdentifier, loginPassword);
      setIsLoading(false);
      if (res.success) {
        setAuthSuccess(res.message);
      } else {
        setAuthError(res.message);
      }
    }, 250);
  };

  // Handle Customer Registration (Mandatory Password required)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regName.trim()) {
      setAuthError('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }
    if (!regPhone.trim()) {
      setAuthError('অনুগ্রহ করে ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setAuthError('পাসওয়ার্ড কমপক্ষে ৬ ডিজিট/অক্ষরের হতে হবে।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('উভয় পাসওয়ার্ড এক হতে হবে!');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerCustomer({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
      });
      setIsLoading(false);
      if (res.success) {
        setAuthSuccess(res.message);
      } else {
        setAuthError(res.message);
      }
    }, 300);
  };

  // Direct Google Sign In
  const handleGoogleSignIn = () => {
    setAuthError('');
    setIsLoading(true);
    setTimeout(() => {
      loginWithGoogle({
        name: 'তানভীর আহমেদ (Google)',
        email: 'tanvir.google@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      });
      setIsLoading(false);
      setAuthSuccess('গুগল অ্যাকাউন্ট সফলভাবে কানেক্ট হয়েছে!');
    }, 300);
  };

  const handleQuickDemoLogin = () => {
    loginCustomerWithPassword('01712345678', 'password123');
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArea || !newFullAddress) return;
    addSavedAddress({
      id: `addr-${Date.now()}`,
      label: newLabel,
      labelBn: newLabel === 'Home' ? 'বাসা' : 'অফিস',
      name: user.name || 'Shopper',
      phone: user.phone || '017XXXXXXXX',
      district: newDistrict,
      area: newArea,
      fullAddress: newFullAddress,
    });
    setShowAddAddress(false);
    setNewArea('');
    setNewFullAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {user.isLoggedIn ? user.name : t('কাস্টমার অ্যাকাউন্ট', 'Customer Account')}
              </h3>
              <p className="text-xs text-gray-500">
                {user.isLoggedIn ? user.phone || user.email : t('লগইন করুন বা অর্ডার হিস্টোরি দেখুন', 'Login or manage your past orders')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user.isLoggedIn && (
              <button
                onClick={logoutUser}
                className="text-xs text-gray-500 hover:text-rose-600 flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('লগআউট', 'Logout')}</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Not Logged In Prompt (With Login / Register tabs & 1-click Quick Demo Login) */}
        {!user.isLoggedIn ? (
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-5">
              {/* Login vs Register Mode Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('কাস্টমার লগইন', 'Customer Login')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('কাস্টমার রেজিস্ট্রেশন', 'Customer Registration')}</span>
                </button>
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-gray-900">
                  {authMode === 'login'
                    ? t('ঝটপটশপ অ্যাকাউন্টে লগইন করুন', 'Sign In to JotPotShop')
                    : t('নতুন কাস্টমার একাউন্ট তৈরি করুন', 'Create New Customer Account')}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('অর্ডার ট্র্যাক, উইশলিস্ট ও সংরক্ষিত ঠিকানার পূর্ণ সুবিধা উপভোগ করুন।', 'Access past orders, tracking, saved addresses & price drop alerts.')}
                </p>
              </div>

              {/* Status alerts */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700 animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* 1. Direct Google Connect Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center space-x-2.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('গুগল (Google) দিয়ে সরাসরি প্রবেশ করুন', 'Continue with Google')}</span>
              </button>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider absolute">
                  {authMode === 'login' ? t('অথবা পাসওয়ার্ড দিয়ে লগইন', 'OR LOGIN WITH PASSWORD') : t('অথবা পাসওয়ার্ড দিয়ে একাউন্ট খুলুন', 'OR REGISTER WITH PASSWORD')}
                </span>
              </div>

              {/* Form */}
              <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-3">
                {authMode === 'register' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('আপনার পূর্ণ নাম *', 'Full Name *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="যেমন: তানভীর আহমেদ"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('মোবাইল নম্বর * (১১ ডিজিট)', 'Mobile Number * (11 Digits)')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('ইমেইল ঠিকানা (ঐচ্ছিক)', 'Email (Optional)')}
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-rose-500"
                      />
                    </div>

                    {/* Registration Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('পাসওয়ার্ড সেট করুন * (কমপক্ষে ৬ অক্ষর/ডিজিট)', 'Set Password * (Min 6 chars)')}
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Registration Password */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('পাসওয়ার্ড নিশ্চিত করুন *', 'Confirm Password *')}
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t('মোবাইল নম্বর বা ইমেইল *', 'Mobile Number or Email *')}
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={e => setLoginIdentifier(e.target.value)}
                          placeholder="017XXXXXXXX বা name@example.com"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          {t('পাসওয়ার্ড * (বাধ্যতামূলক)', 'Password * (Required)')}
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-9 py-2 text-xs focus:outline-hidden focus:border-rose-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-colors disabled:opacity-70 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? t('যাচাই করা হচ্ছে...', 'Processing...')
                      : authMode === 'login'
                      ? t('পাসওয়ার্ড দিয়ে কাস্টমার লগইন করুন', 'Login with Password')
                      : t('পাসওয়ার্ড দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন', 'Register with Password')}
                  </span>
                </button>

                <div className="text-center pt-1">
                  {authMode === 'login' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                    >
                      {t('নতুন গ্রাহক? পাসওয়ার্ড দিয়ে রেজিস্ট্রেশন করুন', 'New customer? Register with password')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                    >
                      {t('ইতিমধ্যে অ্যাকাউন্ট আছে? পাসওয়ার্ড দিয়ে লগইন করুন', 'Already have an account? Login here')}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard with Tabs */
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-gray-50/70 p-3 border-r border-gray-100 flex md:flex-col gap-1 overflow-x-auto shrink-0 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'orders' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`আমার অর্ডার (${orders.length})`, `My Orders (${orders.length})`)}</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'wishlist' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`উইশলিস্ট (${wishlist.length})`, `Wishlist (${wishlist.length})`)}</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'addresses' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('সংরক্ষিত ঠিকানা', 'Saved Addresses')}</span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'recent' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('রিসেন্ট দেখা পণ্য', 'Recently Viewed')}</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'coupons' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('আমার কুপন', 'Coupons')}</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'notifications' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`নোটিফিকেশন (${notifications.filter(n => !n.read).length})`, `Alerts (${notifications.filter(n => !n.read).length})`)}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
              {/* Tab 1: Orders with Buy Again & Invoices */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-gray-900">
                    {t('অর্ডার ইতিহাস ও স্ট্যাটাস', 'Order History & Status')}
                  </h4>

                  {orders.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">
                      {t('কোনো অর্ডার ইতিহাস পাওয়া যায়নি।', 'No order history yet.')}
                    </p>
                  ) : (
                    orders.map(ord => (
                      <div key={ord.id} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2.5 text-xs">
                          <div>
                            <span className="font-mono font-bold text-gray-900">{ord.id}</span>
                            <span className="text-gray-400 ml-2">{ord.orderDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {ord.status}
                            </span>
                            <button
                              onClick={() => {
                                setTrackingOrderId(ord.id);
                                setActiveModal('tracking');
                              }}
                              className="text-rose-600 font-semibold hover:underline"
                            >
                              {t('ট্র্যাক', 'Track')}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrderForInvoice(ord);
                                setActiveModal('invoice');
                              }}
                              className="text-gray-600 font-semibold hover:underline"
                            >
                              {t('ইনভয়েস', 'Invoice')}
                            </button>
                          </div>
                        </div>

                        {/* Items preview & "Buy Again" button */}
                        <div className="space-y-2">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2.5">
                                <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 object-cover rounded-md" />
                                <div>
                                  <p className="font-semibold text-gray-900">{language === 'bn' ? it.product.nameBn : it.product.name}</p>
                                  <p className="text-[10px] text-gray-400">Qty: {it.quantity} • {formatPrice(it.product.price)}</p>
                                </div>
                              </div>

                              {/* Buy Again 1-click CTA */}
                              <button
                                onClick={() => {
                                  addToCart(it.product, it.quantity, it.selectedColor, it.selectedSize);
                                  setActiveModal('cart');
                                }}
                                className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>{t('আবার কিনুন (Buy Again)', 'Buy Again')}</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-500">{t('পেমেন্ট:', 'Payment:')} {ord.paymentMethod.toUpperCase()}</span>
                          <span className="text-rose-600 text-sm">{formatPrice(ord.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Wishlist */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-gray-900">
                      {t('আপনার পছন্দের তালিকা (উইশলিস্ট)', 'Your Saved Wishlist')}
                    </h4>
                    <span className="text-xs text-rose-600 font-semibold">
                      {t('দাম কমলে স্বয়ংক্রিয় নোটিফিকেশন পাবেন!', 'You will get alerts when prices drop!')}
                    </span>
                  </div>

                  {wishedProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">
                      {t('আপনার উইশলিস্টে কোনো পণ্য নেই।', 'Your wishlist is empty.')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {wishedProducts.map(prod => (
                        <ProductCard key={prod.id} product={prod} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Saved Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-gray-900">
                      {t('সংরক্ষিত ডেলিভারি ঠিকানা', 'Saved Delivery Addresses')}
                    </h4>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('নতুন ঠিকানা যোগ করুন', 'Add New')}</span>
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleSaveNewAddress} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewLabel('Home')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            newLabel === 'Home' ? 'bg-rose-600 text-white' : 'bg-white border text-gray-700'
                          }`}
                        >
                          {t('বাসা (Home)', 'Home')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewLabel('Office')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            newLabel === 'Office' ? 'bg-rose-600 text-white' : 'bg-white border text-gray-700'
                          }`}
                        >
                          {t('অফিস (Office)', 'Office')}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">{t('জেলা', 'District')}</label>
                          <select
                            value={newDistrict}
                            onChange={e => setNewDistrict(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                          >
                            {BD_DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">{t('থানা / এরিয়া', 'Area')}</label>
                          <input
                            type="text"
                            required
                            value={newArea || ''}
                            onChange={e => setNewArea(e.target.value)}
                            placeholder="e.g. Uttara Sector 3"
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">{t('বিস্তারিত ঠিকানা', 'Full Address')}</label>
                        <textarea
                          rows={2}
                          required
                          value={newFullAddress || ''}
                          onChange={e => setNewFullAddress(e.target.value)}
                          placeholder="House, Road, Block..."
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        {t('ঠিকানা সংরক্ষণ করুন', 'Save Address')}
                      </button>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map(addr => (
                      <div key={addr.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mb-1">
                            {addr.label}
                          </span>
                          <p className="font-bold text-gray-800">{addr.name} ({addr.phone})</p>
                          <p className="text-gray-600 mt-1">{addr.fullAddress}</p>
                          <p className="text-gray-500 font-semibold">{addr.area}, {addr.district}</p>
                        </div>

                        <button
                          onClick={() => deleteSavedAddress(addr.id)}
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Recently Viewed */}
              {activeTab === 'recent' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-gray-900">
                    {t('সম্প্রতি দেখা পণ্যসমূহ', 'Recently Viewed Products')}
                  </h4>
                  {recentProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">
                      {t('কোনো পণ্য এখনও দেখা হয়নি।', 'No recently viewed items.')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {recentProducts.map(prod => (
                        <ProductCard key={prod.id} product={prod} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Coupons */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-gray-900">
                    {t('আপনার জন্য স্পেশাল কুপন ও ভাউচার', 'Your Active Coupons & Vouchers')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {coupons.map(cp => (
                      <div key={cp.code} className="bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-2xl border border-rose-200 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-black text-rose-600 text-sm tracking-wider block">
                            {cp.code}
                          </span>
                          <p className="text-gray-700 font-medium mt-0.5">
                            {language === 'bn' ? cp.descriptionBn : cp.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">Expiry: {cp.expiryDate}</p>
                        </div>
                        <span className="bg-rose-600 text-white font-bold px-2 py-1 rounded-md text-[10px]">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-gray-900">
                    {t('নোটিফিকেশন সেন্টার', 'Notification Center')}
                  </h4>
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer text-xs ${
                        notif.read ? 'bg-white border-gray-200' : 'bg-rose-50/70 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-gray-900 mb-1">
                        <span>{language === 'bn' ? notif.titleBn : notif.title}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{notif.time}</span>
                      </div>
                      <p className="text-gray-600">{language === 'bn' ? notif.messageBn : notif.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
