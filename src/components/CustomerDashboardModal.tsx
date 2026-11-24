import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Award,
  Edit2,
  Copy,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { BD_DISTRICTS } from '../data/mockData';

export const CustomerDashboardModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    user,
    logoutUser,
    registerCustomer,
    loginCustomerWithPassword,
    resetCustomerPassword,
    updateCustomerProfile,
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
    'orders' | 'profile' | 'wishlist' | 'addresses' | 'recent' | 'coupons' | 'notifications'
  >('orders');

  const [authMode, setAuthMode] = useState<'password' | 'register' | 'forgot'>('password');

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Office'>('Home');
  const [newDistrict, setNewDistrict] = useState('Dhaka (ঢাকা)');
  const [newArea, setNewArea] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');

  useEffect(() => {
    if (activeModal === 'register') {
      setAuthMode('register');
    } else if (activeModal === 'login') {
      setAuthMode('password');
    }
    setAuthError('');
    setAuthSuccess('');
    setIsEditingProfile(false);
  }, [activeModal]);

  useEffect(() => {
    if (user.isLoggedIn) {
      setProfileName(user.name);
      setProfilePhone(user.phone);
      setProfileEmail(user.email);
    }
  }, [user.isLoggedIn, user.name, user.phone, user.email]);

  if (activeModal !== 'account' && activeModal !== 'login' && activeModal !== 'register') return null;

  const wishedProducts = products.filter(p => p.isPublished !== false && wishlist.includes(p.id));
  const recentProducts = products.filter(p => p.isPublished !== false && recentlyViewed.includes(p.id));

  const customerCleanPhone = user.phone ? user.phone.replace(/\D/g, '') : '';
  const customerCleanEmail = (user.email || '').toLowerCase().trim();

  const myOrders = orders.filter(o => {
    if (!user.isLoggedIn) return false;
    const oPhone = (o.phone || '').replace(/\D/g, '');
    const oEmail = (o.email || '').toLowerCase().trim();
    if (customerCleanPhone && oPhone && oPhone === customerCleanPhone) return true;
    if (customerCleanEmail && oEmail && oEmail === customerCleanEmail) return true;
    return false;
  });

  const myAddresses = savedAddresses.filter(a => {
    if (!customerCleanPhone) return true;
    const aPhone = (a.phone || '').replace(/\D/g, '');
    return aPhone === customerCleanPhone;
  });

  const myPoints = myOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + Math.floor(o.totalAmount * 0.05), 0);
  const myCashback = Math.floor(myPoints / 10);
  const myMemberTier =
    myOrders.length >= 5
      ? 'ভিআইপি শপার'
      : myOrders.length >= 1
      ? 'নিয়মিত শপার'
      : 'সদস্য';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!loginIdentifier.trim()) {
      setAuthError('অনুগ্রহ করে মোবাইল নম্বর বা ইমেইল ঠিকানা দিন।');
      return;
    }
    if (!loginPassword) {
      setAuthError('লগইন করার জন্য পাসওয়ার্ড দিন।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginCustomerWithPassword(loginIdentifier, loginPassword);
      if (res.success) {
        setAuthSuccess(res.message);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'লগইন সম্পন্ন করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regName.trim()) {
      setAuthError('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }
    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setAuthError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('উভয় পাসওয়ার্ড এক হতে হবে।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerCustomer({
        name: regName,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
      });
      if (res.success) {
        setAuthSuccess(res.message);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!forgotPhone.trim()) {
      setAuthError('অনুগ্রহ করে নিবন্ধিত মোবাইল নম্বর দিন।');
      return;
    }
    if (forgotNewPass && forgotNewPass.length < 6) {
      setAuthError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (forgotNewPass && forgotNewPass !== forgotConfirmPass) {
      setAuthError('উভয় পাসওয়ার্ড এক হতে হবে।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetCustomerPassword(forgotPhone, forgotNewPass || undefined);
      if (res.success) {
        setAuthSuccess(res.message);
        setAuthMode('password');
        setForgotPhone('');
        setForgotNewPass('');
        setForgotConfirmPass('');
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'পাসওয়ার্ড রিসেট করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const res = await updateCustomerProfile({
        name: profileName,
        phone: profilePhone,
        email: profileEmail,
      });
      if (res.success) {
        setIsEditingProfile(false);
        setAuthSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে।');
        setTimeout(() => setAuthSuccess(''), 3000);
      } else {
        setAuthError(res.error || 'প্রোফাইল সেভ করা যায়নি।');
      }
    } finally {
      setIsLoading(false);
    }
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

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#e6e3dd] flex items-center justify-between bg-[#faf9f7]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-editorial font-bold text-base text-[#111827] truncate">
                  {user.isLoggedIn ? user.name : t('কাস্টমার অ্যাকাউন্ট', 'Customer Account')}
                </h3>
                {user.isLoggedIn && (
                  <span className="text-[11px] text-[#881337] font-semibold whitespace-nowrap">
                    · {myMemberTier}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate tabular-nums">
                {user.isLoggedIn
                  ? `${user.phone || user.email} · ${myOrders.length}টি অর্ডার`
                  : t('মোবাইল নম্বর বা ইমেইল দিয়ে প্রবেশ করুন', 'Sign in with mobile number or email')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user.isLoggedIn && (
              <button
                onClick={logoutUser}
                className="text-xs text-gray-600 hover:text-[#881337] flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-[#e6e3dd] bg-white hover:border-[#881337] cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('লগআউট', 'Logout')}</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              aria-label={t('বন্ধ করুন', 'Close')}
              className="p-2 text-gray-500 hover:text-[#111827] rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Hub */}
        {!user.isLoggedIn ? (
          <div className="p-5 sm:p-10 flex-1 overflow-y-auto font-sans">
            <div className="max-w-md mx-auto space-y-5">
              {/* Segmented Tabs */}
              <div className="flex bg-[#faf9f7] border border-[#e6e3dd] p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2.5 min-h-[40px] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-[#111827] text-white'
                      : 'text-gray-600 hover:text-[#111827]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('লগইন', 'Login')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2.5 min-h-[40px] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#111827] text-white'
                      : 'text-gray-600 hover:text-[#111827]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('রেজিস্ট্রেশন', 'Register')}</span>
                </button>
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="font-sans text-lg sm:text-xl font-bold text-[#111827]">
                  {authMode === 'password'
                    ? t('আপনার অ্যাকাউন্টে লগইন করুন', 'Sign In to Your Account')
                    : authMode === 'register'
                    ? t('নতুন কাস্টমার অ্যাকাউন্ট তৈরি করুন', 'Create New Account')
                    : t('পাসওয়ার্ড রিসেট করুন', 'Reset Password')}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {authMode === 'forgot'
                    ? t('নিবন্ধিত ইমেইল দিয়ে রিসেট লিংক পান অথবা সাইন-ইন অবস্থায় নতুন পাসওয়ার্ড সেট করুন।', 'Enter your registered email for a password reset link.')
                    : t('মোবাইল নম্বর বা ইমেইল দিয়ে প্রবেশ করে অর্ডার হিস্টোরি ও ঠিকানা পরিচালনা করুন।', 'Sign in with mobile number or email to track orders and manage addresses.')}
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-[#881337]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-[#15803d]">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {authMode === 'password' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('মোবাইল নম্বর বা ইমেইল *', 'Mobile Number or Email *')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        {t('পাসওয়ার্ড *', 'Password *')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setAuthError('');
                        }}
                        className="text-xs text-[#881337] hover:underline cursor-pointer font-medium"
                      >
                        {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot Password?')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-10 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827] cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[44px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? t('যাচাই করা হচ্ছে...', 'Verifying...') : t('লগইন করুন', 'Sign In')}</span>
                  </button>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
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
                      className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none"
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
                      className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
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
                      className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('পাসওয়ার্ড সেট করুন * (কমপক্ষে ৬ অক্ষর)', 'Password * (Min 6 chars)')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-10 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827] cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('পাসওয়ার্ড নিশ্চিত করুন *', 'Confirm Password *')}
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[44px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isLoading ? t('প্রসেসিং...', 'Processing...') : t('অ্যাকাউন্ট তৈরি করুন', 'Create Account')}</span>
                  </button>
                </form>
              )}

              {authMode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t('আপনার নিবন্ধিত ইমেইল বা মোবাইল নম্বর দিন *', 'Registered Email or Mobile Number *')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotPhone}
                        onChange={e => setForgotPhone(e.target.value)}
                        placeholder="name@example.com অথবা 017XXXXXXXX"
                        className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {!forgotPhone.includes('@') && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {t('নতুন পাসওয়ার্ড * (কমপক্ষে ৬ অক্ষর)', 'New Password * (Min 6 chars)')}
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showForgotPass ? 'text' : 'password'}
                            required={!forgotPhone.includes('@')}
                            value={forgotNewPass}
                            onChange={e => setForgotNewPass(e.target.value)}
                            placeholder="••••••••"
                            className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-10 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowForgotPass(!showForgotPass)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111827] cursor-pointer"
                          >
                            {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {t('নতুন পাসওয়ার্ড নিশ্চিত করুন *', 'Confirm New Password *')}
                        </label>
                        <input
                          type={showForgotPass ? 'text' : 'password'}
                          required={!forgotPhone.includes('@')}
                          value={forgotConfirmPass}
                          onChange={e => setForgotConfirmPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl px-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#111827] focus:outline-none font-mono"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[44px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {isLoading
                        ? t('প্রসেসিং...', 'Processing...')
                        : forgotPhone.includes('@')
                        ? t('পাসওয়ার্ড রিসেট লিংক পাঠান', 'Send Reset Link')
                        : t('পাসওয়ার্ড পরিবর্তন ও লগইন', 'Reset & Login')}
                    </span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('password')}
                      className="text-xs text-gray-600 hover:text-[#111827] underline cursor-pointer"
                    >
                      {t('লগইন পেজে ফিরে যান', 'Back to Login')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-[#faf9f7] p-3 border-b md:border-b-0 md:border-r border-[#e6e3dd] flex md:flex-col gap-1 overflow-x-auto shrink-0 text-xs font-semibold tabular-nums">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`আমার অর্ডার (${myOrders.length})`, `Orders (${myOrders.length})`)}</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('প্রোফাইল ও রিওয়ার্ড', 'Profile & Rewards')}</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'wishlist' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`উইশলিস্ট (${wishlist.length})`, `Wishlist (${wishlist.length})`)}</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'addresses' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('সংরক্ষিত ঠিকানা', 'Addresses')}</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'coupons' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('আমার কুপন', 'Coupons')}</span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'recent' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('রিসেন্ট দেখা পণ্য', 'Recent')}</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3.5 py-2.5 min-h-[38px] rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'notifications' ? 'bg-[#111827] text-white' : 'text-gray-700 hover:bg-white'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(`নোটিফিকেশন (${notifications.filter(n => !n.read).length})`, `Alerts (${notifications.filter(n => !n.read).length})`)}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto bg-white">
              {/* Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial text-base font-bold text-[#111827]">
                      {t('অর্ডার ইতিহাস ও স্ট্যাটাস', 'Order History & Status')}
                    </h4>
                    <span className="text-xs text-gray-500 tabular-nums">
                      {t(`মোট অর্ডার: ${myOrders.length} টি`, `Total: ${myOrders.length}`)}
                    </span>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#faf9f7] border border-[#e6e3dd] text-gray-400 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('কোনো অর্ডার ইতিহাস পাওয়া যায়নি। শপ থেকে আপনার পছন্দের পণ্য অর্ডার করুন।', 'No order history yet.')}
                      </p>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="bg-[#881337] hover:bg-[#6d0f2c] text-white text-xs font-semibold px-4 py-2 min-h-[38px] rounded-xl cursor-pointer transition-colors"
                      >
                        {t('কেনাকাটা শুরু করুন', 'Start Shopping')}
                      </button>
                    </div>
                  ) : (
                    myOrders.map(ord => (
                      <div key={ord.id} className="bg-[#faf9f7] p-4 rounded-xl border border-[#e6e3dd] space-y-3 tabular-nums">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e3dd] pb-2.5 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[#111827]">{ord.id}</span>
                            <span className="text-gray-500 ml-2">{ord.orderDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 border-emerald-200 text-[#15803d]'
                                  : ord.status === 'Shipped' || ord.status === 'Out for Delivery'
                                  ? 'bg-white border-[#e6e3dd] text-[#111827]'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                            <button
                              onClick={() => {
                                setTrackingOrderId(ord.id);
                                setActiveModal('tracking');
                              }}
                              className="bg-[#881337] hover:bg-[#6d0f2c] text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              {t('ট্র্যাক', 'Track')}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrderForInvoice(ord);
                                setActiveModal('invoice');
                              }}
                              className="bg-white border border-[#e6e3dd] hover:border-[#111827] text-[#111827] px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              {t('ইনভয়েস', 'Invoice')}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-md border border-[#e6e3dd] bg-white shrink-0 overflow-hidden flex items-center justify-center">
                                  {it.product.images[0] ? (
                                    <img
                                      src={it.product.images[0]}
                                      alt={language === 'bn' ? it.product.nameBn : it.product.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#111827] truncate">{language === 'bn' ? it.product.nameBn : it.product.name}</p>
                                  <p className="text-[11px] text-gray-500">
                                    {t('পরিমাণ:', 'Qty:')} {it.quantity} · {formatPrice(it.product.price)}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  const added = addToCart(it.product, it.quantity, it.selectedColor, it.selectedSize);
                                  if (added) {
                                    setActiveModal('cart');
                                  }
                                }}
                                className="bg-white hover:bg-[#111827] hover:text-white text-[#111827] border border-[#e6e3dd] px-3 py-1.5 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>{t('আবার কিনুন', 'Buy Again')}</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#e6e3dd] pt-2.5 flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-500">
                            {t('পেমেন্ট:', 'Payment:')} <span className="uppercase text-[#111827]">{ord.paymentMethod}</span> ({ord.paymentStatus})
                          </span>
                          <span className="text-[#881337] text-sm font-bold">{formatPrice(ord.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Profile & Rewards */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="bg-[#111827] text-white p-5 rounded-xl border border-[#1f2937]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1.5">
                          <Award className="w-4 h-4" />
                          <span>{myMemberTier}</span>
                        </div>
                        <h4 className="font-editorial text-lg font-bold text-white">{user.name}</h4>
                        <p className="text-xs text-gray-300 font-mono mt-0.5 tabular-nums">
                          {user.phone} {user.email ? `· ${user.email}` : ''}
                        </p>
                      </div>

                      <div className="bg-white/10 border border-white/15 p-3.5 rounded-xl text-left sm:text-right shrink-0 tabular-nums">
                        <span className="text-[11px] text-gray-300 block">রিওয়ার্ড পয়েন্ট</span>
                        <div className="text-xl font-bold text-white mt-0.5">
                          {myPoints} পয়েন্ট
                        </div>
                        <span className="text-[11px] text-gray-300 block mt-0.5">
                          সমমূল্য {formatPrice(myCashback)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#faf9f7] p-5 rounded-xl border border-[#e6e3dd] space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#881337]" />
                        <span>ব্যক্তিগত প্রোফাইল তথ্য</span>
                      </h4>
                      {!isEditingProfile && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="text-[#881337] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>এডিট করুন</span>
                        </button>
                      )}
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-3">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">পূর্ণ নাম:</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-[#e6e3dd] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#111827]"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">মোবাইল নম্বর:</label>
                          <input
                            type="tel"
                            required
                            value={profilePhone}
                            onChange={e => setProfilePhone(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-[#e6e3dd] rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#111827]"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">ইমেইল ঠিকানা:</label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={e => setProfileEmail(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-[#e6e3dd] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#111827]"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="submit"
                            className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-4 py-2 min-h-[38px] rounded-lg cursor-pointer transition-colors"
                          >
                            সংরক্ষণ করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="bg-white border border-[#e6e3dd] hover:border-[#111827] text-[#111827] font-semibold px-4 py-2 min-h-[38px] rounded-lg cursor-pointer transition-colors"
                          >
                            বাতিল
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tabular-nums">
                        <div className="p-3 bg-white rounded-lg border border-[#e6e3dd]">
                          <span className="text-gray-500 block text-[11px]">নাম:</span>
                          <strong className="text-[#111827] font-semibold">{user.name}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#e6e3dd]">
                          <span className="text-gray-500 block text-[11px]">মোবাইল:</span>
                          <strong className="text-[#111827] font-mono font-semibold">{user.phone}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#e6e3dd]">
                          <span className="text-gray-500 block text-[11px]">ইমেইল:</span>
                          <strong className="text-[#111827] font-mono">{user.email || 'দেওয়া হয়নি'}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#e6e3dd]">
                          <span className="text-gray-500 block text-[11px]">অ্যাকাউন্ট স্ট্যাটাস:</span>
                          <span className="text-[#15803d] font-semibold flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ভেরিফাইড কাস্টমার</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial text-base font-bold text-[#111827]">
                      {t('আপনার পছন্দের তালিকা (উইশলিস্ট)', 'Your Saved Wishlist')}
                    </h4>
                  </div>

                  {wishedProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">
                      {t('উইশলিস্টে কোনো পণ্য যুক্ত করা নেই। পণ্য কার্ডের হার্ট আইকনে ক্লিক করে যুক্ত করুন।', 'No wishlist items yet.')}
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

              {/* Saved Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-editorial text-base font-bold text-[#111827]">
                      {t('সংরক্ষিত ডেলিভারি ঠিকানা', 'Saved Delivery Addresses')}
                    </h4>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="bg-[#881337] hover:bg-[#6d0f2c] text-white text-xs font-semibold px-3.5 py-2 min-h-[36px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('নতুন ঠিকানা যোগ করুন', 'Add Address')}</span>
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleSaveNewAddress} className="bg-[#faf9f7] p-4 rounded-xl border border-[#e6e3dd] space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-gray-700 mb-1 font-semibold">{t('লেবেল:', 'Label:')}</label>
                          <select
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value as any)}
                            className="w-full min-h-[38px] bg-white border border-[#e6e3dd] rounded-lg p-2 text-xs"
                          >
                            <option value="Home">{t('বাসা (Home)', 'Home')}</option>
                            <option value="Office">{t('অফিস (Office)', 'Office')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 font-semibold">{t('জেলা:', 'District:')}</label>
                          <select
                            value={newDistrict}
                            onChange={e => setNewDistrict(e.target.value)}
                            className="w-full min-h-[38px] bg-white border border-[#e6e3dd] rounded-lg p-2 text-xs"
                          >
                            {BD_DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1 font-semibold">{t('থানা / এরিয়া:', 'Area / Thana:')}</label>
                        <input
                          type="text"
                          required
                          value={newArea}
                          onChange={e => setNewArea(e.target.value)}
                          placeholder="যেমন: ধানমন্ডি, মিরপুর..."
                          className="w-full min-h-[38px] bg-white border border-[#e6e3dd] rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-1 font-semibold">{t('বিস্তারিত ঠিকানা:', 'Full Address:')}</label>
                        <input
                          type="text"
                          required
                          value={newFullAddress}
                          onChange={e => setNewFullAddress(e.target.value)}
                          placeholder="House, Road, Block..."
                          className="w-full min-h-[38px] bg-white border border-[#e6e3dd] rounded-lg p-2 text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="bg-[#881337] hover:bg-[#6d0f2c] text-white text-xs font-semibold px-4 py-2 min-h-[38px] rounded-lg cursor-pointer transition-colors"
                      >
                        {t('ঠিকানা সংরক্ষণ করুন', 'Save Address')}
                      </button>
                    </form>
                  )}

                  {myAddresses.length === 0 && !showAddAddress && (
                    <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-[#e6e3dd] rounded-xl">
                      {t('কোনো সংরক্ষিত ঠিকানা নেই।', 'No saved delivery addresses found.')}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tabular-nums">
                    {myAddresses.map(addr => (
                      <div key={addr.id} className="bg-[#faf9f7] p-4 rounded-xl border border-[#e6e3dd] flex justify-between items-start text-xs">
                        <div>
                          <span className="font-semibold text-[#111827] bg-white px-2 py-0.5 rounded border border-[#e6e3dd] inline-block mb-1.5">
                            {addr.label}
                          </span>
                          <p className="font-semibold text-[#111827]">{addr.name} · {addr.phone}</p>
                          <p className="text-gray-600 mt-1">{addr.fullAddress}</p>
                          <p className="text-gray-500 font-medium mt-0.5">{addr.area}, {addr.district}</p>
                        </div>

                        <button
                          onClick={() => deleteSavedAddress(addr.id)}
                          className="text-gray-400 hover:text-[#881337] p-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupons */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  <h4 className="font-editorial text-base font-bold text-[#111827]">
                    {t('কুপন ও ভাউচার', 'Active Coupons & Vouchers')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 tabular-nums">
                    {coupons.map(cp => (
                      <div key={cp.code} className="bg-[#faf9f7] p-4 rounded-xl border border-[#e6e3dd] flex justify-between items-center gap-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-[#881337] text-sm tracking-wider block">
                            {cp.code}
                          </span>
                          <p className="text-[#111827] font-medium mt-0.5">
                            {language === 'bn' ? cp.descriptionBn : cp.description}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">মেয়াদ: {cp.expiryDate}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(cp.code)}
                          className="bg-white hover:bg-[#111827] hover:text-white text-[#111827] border border-[#e6e3dd] font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                        >
                          {copiedCoupon === cp.code ? <Check className="w-3.5 h-3.5 text-[#15803d]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCoupon === cp.code ? t('কপি হয়েছে', 'Copied') : t('কপি', 'Copy')}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recently Viewed */}
              {activeTab === 'recent' && (
                <div className="space-y-4">
                  <h4 className="font-editorial text-base font-bold text-[#111827]">
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

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <h4 className="font-editorial text-base font-bold text-[#111827]">
                    {t('নোটিফিকেশন', 'Notifications')}
                  </h4>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 py-10 text-center">
                      {t('নতুন কোনো নোটিফিকেশন নেই।', 'No notifications.')}
                    </p>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                          notif.read ? 'bg-white border-[#e6e3dd]' : 'bg-[#faf9f7] border-[#881337]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-[#111827] mb-1">
                          <span>{language === 'bn' ? notif.titleBn : notif.title}</span>
                          <span className="text-[11px] text-gray-400 font-normal tabular-nums">{notif.time}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{language === 'bn' ? notif.messageBn : notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
