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
  Mail,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Award,
  Sparkles,
  Edit2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
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
    loginCustomerWithOtp,
    resetCustomerPassword,
    updateCustomerProfile,
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
    'orders' | 'profile' | 'wishlist' | 'addresses' | 'recent' | 'coupons' | 'notifications'
  >('orders');

  const [authMode, setAuthMode] = useState<'otp' | 'password' | 'register' | 'forgot'>('otp');

  // 1. Phone OTP State
  const [otpPhone, setOtpPhone] = useState('01712345678');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // 2. Password Login State
  const [loginIdentifier, setLoginIdentifier] = useState('01712345678');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // 3. Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // 4. Forgot Password State
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState('');

  // 5. Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  // Status & Feedback
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Office'>('Home');
  const [newDistrict, setNewDistrict] = useState('Dhaka (ঢাকা)');
  const [newArea, setNewArea] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');

  // Sync initial mode based on modal trigger
  useEffect(() => {
    if (activeModal === 'register') {
      setAuthMode('register');
    } else if (activeModal === 'login') {
      setAuthMode('otp');
    }
    setAuthError('');
    setAuthSuccess('');
    setIsEditingProfile(false);
  }, [activeModal]);

  // Sync profile editing state when user logs in
  useEffect(() => {
    if (user.isLoggedIn) {
      setProfileName(user.name);
      setProfilePhone(user.phone);
      setProfileEmail(user.email);
    }
  }, [user]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  if (activeModal !== 'account' && activeModal !== 'login' && activeModal !== 'register') return null;

  const wishedProducts = products.filter(p => wishlist.includes(p.id));
  const recentProducts = products.filter(p => recentlyViewed.includes(p.id));

  // --- Handlers ---

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const clean = otpPhone.trim().replace(/\D/g, '');
    if (clean.length < 11) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpTimer(60);
      setIsLoading(false);
      setAuthSuccess(`এসএমএস ওটিপি সফলভাবে পাঠানো হয়েছে!`);
    }, 300);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!inputOtp.trim()) {
      setAuthError('অনুগ্রহ করে ৬ ডিজিটের ওটিপি কোডটি লিখুন।');
      return;
    }

    if (inputOtp.trim() !== generatedOtp.trim() && inputOtp.trim() !== '123456') {
      setAuthError('ভুল ওটিপি কোড! অনুগ্রহ করে আপনার ফোনে প্রেরিত সঠিক কোড দিন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginCustomerWithOtp(otpPhone);
      setIsLoading(false);
      if (res.success) {
        setAuthSuccess(res.message);
        setOtpSent(false);
        setInputOtp('');
      } else {
        setAuthError(res.message);
      }
    }, 250);
  };

  // Quick auto fill OTP
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setInputOtp(generatedOtp);
    }
  };

  // Handle Password Login
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

  // Handle Customer Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regName.trim()) {
      setAuthError('অনুগ্রহ করে আপনার নাম প্রদান করুন।');
      return;
    }
    const cleanPhone = regPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
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

  // Handle Forgot Password Step 1 (Request OTP)
  const handleForgotRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const clean = forgotPhone.trim().replace(/\D/g, '');
    if (clean.length < 11) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedForgotOtp(code);
      setForgotStep('verify');
      setIsLoading(false);
      setAuthSuccess('পাসওয়ার্ড রিসেট ওটিপি কোড তৈরি হয়েছে!');
    }, 300);
  };

  // Handle Forgot Password Step 2 (Reset Password)
  const handleForgotResetPass = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (forgotOtp.trim() !== generatedForgotOtp.trim() && forgotOtp.trim() !== '123456') {
      setAuthError('ভুল ওটিপি কোড! অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      return;
    }
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setAuthError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = resetCustomerPassword(forgotPhone, forgotNewPass);
      setIsLoading(false);
      if (res.success) {
        setAuthSuccess(res.message);
        setAuthMode('otp');
        setForgotStep('request');
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
    }, 250);
  };

  const handleQuickDemoLogin = () => {
    loginCustomerWithPassword('01712345678', 'password123');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name: profileName,
      phone: profilePhone,
      email: profileEmail,
    });
    setIsEditingProfile(false);
    setAuthSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setAuthSuccess(''), 3000);
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-amber-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-600/20">
              {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-gray-900">
                  {user.isLoggedIn ? user.name : t('কাস্টমার অ্যাকাউন্ট', 'Customer Account')}
                </h3>
                {user.isLoggedIn && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>Gold Member</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {user.isLoggedIn
                  ? `${user.phone || user.email} • ঝটপটশপ প্রিমিয়াম শপার`
                  : t('সহজ মোবাইল ওটিপি বা পাসওয়ার্ড দিয়ে লগইন করুন', 'Login with Mobile OTP or password')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user.isLoggedIn && (
              <button
                onClick={logoutUser}
                className="text-xs text-gray-500 hover:text-rose-600 flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-rose-50/50 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('লগআউট', 'Logout')}</span>
              </button>
            )}
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Not Logged In View (Clean, Modern Bangladesh E-commerce Auth Hub) */}
        {!user.isLoggedIn ? (
          <div className="p-6 sm:p-10 flex-1 overflow-y-auto">
            <div className="max-w-md mx-auto space-y-5">
              {/* Login vs Register Mode Tabs */}
              <div className="flex bg-gray-100/80 p-1.5 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authMode === 'otp'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('মোবাইল ওটিপি', 'Phone OTP')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t('পাসওয়ার্ড লগইন', 'Password')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('রেজিস্ট্রেশন', 'Register')}</span>
                </button>
              </div>

              {/* Title & subtitle */}
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-gray-900">
                  {authMode === 'otp'
                    ? t('মোবাইল ওটিপি দিয়ে দ্রুত প্রবেশ করুন', 'Fast Login with Mobile OTP')
                    : authMode === 'password'
                    ? t('পাসওয়ার্ড দিয়ে অ্যাকাউন্টে লগইন করুন', 'Login with Password')
                    : authMode === 'register'
                    ? t('নতুন কাস্টমার অ্যাকাউন্ট তৈরি করুন', 'Create New Account')
                    : t('পাসওয়ার্ড রিসেট করুন', 'Reset Your Password')}
                </h4>
                <p className="text-xs text-gray-500">
                  {authMode === 'otp'
                    ? t('কোনো পাসওয়ার্ড মনে রাখার ঝামেলা ছাড়াই নিরাপদ ওটিপিতে লগইন করুন।', 'Instant SMS code login without remembering password.')
                    : t('আপনার অর্ডার হিস্টোরি, ট্র্যাকিং ও সংরক্ষিত ঠিকানার পূর্ণ সুবিধা পান।', 'Track orders, manage addresses & get discount alerts.')}
                </p>
              </div>

              {/* Status Alerts */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-xs text-red-700 animate-in shake duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2 text-xs text-emerald-800 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* 1. Fast Mobile OTP Login Flow */}
              {authMode === 'otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {t('আপনার মোবাইল নম্বর লিখুন (১১ ডিজিট):', 'Enter Mobile Number (11 Digits):')}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            value={otpPhone}
                            onChange={e => setOtpPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono font-bold"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {t('এই নম্বরে একটি ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হবে।', 'A 6-digit OTP code will be sent to this number.')}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-rose-600/20 transition-all disabled:opacity-70"
                      >
                        {isLoading ? (
                          <span>{t('কোড পাঠানো হচ্ছে...', 'Sending Code...')}</span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>{t('ওটিপি কোড পাঠান (Send OTP)', 'Send OTP Code')}</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      {/* Simulated SMS Toast / Preview */}
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                          <span className="flex items-center space-x-1.5">
                            <span>📩</span>
                            <span>ইনকামিং এসএমএস ওটিপি (SMS Preview):</span>
                          </span>
                          <span className="font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-black text-xs">
                            {generatedOtp}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          {otpPhone} নম্বরে প্রেরিত ওটিপি কোড: <strong className="font-mono text-base">{generatedOtp}</strong>
                        </p>
                        <button
                          type="button"
                          onClick={handleAutoFillOtp}
                          className="w-full bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('১-ক্লিকে ওটিপি অটো-ফিল করুন (Auto-fill)', 'Auto-fill OTP Code')}</span>
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-gray-700">
                            {t('৬ ডিজিটের ওটিপি লিখুন:', 'Enter 6-digit OTP:')}
                          </label>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {otpTimer > 0 ? `পুনরায় পাঠান: ${otpTimer}s` : ''}
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={inputOtp}
                          onChange={e => setInputOtp(e.target.value)}
                          placeholder="••••••"
                          className="w-full text-center tracking-[0.5em] text-lg font-black font-mono bg-gray-50 border border-gray-200 rounded-2xl py-2.5 text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-rose-600/20 transition-all disabled:opacity-70"
                      >
                        {isLoading ? (
                          <span>{t('যাচাই করা হচ্ছে...', 'Verifying...')}</span>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('যাচাই করুন ও প্রবেশ করুন (Verify & Login)', 'Verify & Login')}</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-gray-500 hover:text-gray-800 underline cursor-pointer"
                        >
                          {t('নম্বর পরিবর্তন করুন', 'Change Number')}
                        </button>

                        {otpTimer === 0 && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-rose-600 font-bold hover:underline cursor-pointer"
                          >
                            {t('আবার ওটিপি পাঠান', 'Resend OTP')}
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* 2. Password Login Flow */}
              {authMode === 'password' && (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('মোবাইল নম্বর বা ইমেইল *', 'Mobile Number or Email *')}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="017XXXXXXXX বা name@example.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        {t('পাসওয়ার্ড *', 'Password *')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setAuthError('');
                        }}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer font-semibold"
                      >
                        {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot Password?')}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 cursor-pointer transition-colors disabled:opacity-70 mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? t('যাচাই করা হচ্ছে...', 'Verifying...') : t('লগইন করুন', 'Login')}</span>
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      className="text-[11px] text-slate-500 hover:text-rose-600 underline font-semibold cursor-pointer"
                    >
                      ⚡ ডেমো অ্যাকাউন্ট দিয়ে ১-ক্লিক লগইন
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Register Flow */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('আপনার পূর্ণ নাম *', 'Full Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('মোবাইল নম্বর * (১১ ডিজিট)', 'Mobile Number * (11 Digits)')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('ইমেইল ঠিকানা (ঐচ্ছিক)', 'Email (Optional)')}
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('পাসওয়ার্ড সেট করুন * (কমপক্ষে ৬ অক্ষর/ডিজিট)', 'Set Password * (Min 6 chars)')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('পাসওয়ার্ড নিশ্চিত করুন *', 'Confirm Password *')}
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 cursor-pointer transition-colors disabled:opacity-70 mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isLoading ? t('প্রসেসিং...', 'Processing...') : t('অ্যাকাউন্ট তৈরি করুন', 'Create Account')}</span>
                  </button>
                </form>
              )}

              {/* 4. Forgot Password Flow */}
              {authMode === 'forgot' && (
                <div className="space-y-3">
                  {forgotStep === 'request' ? (
                    <form onSubmit={handleForgotRequestOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {t('আপনার নিবন্ধিত মোবাইল নম্বর দিন:', 'Enter Registered Mobile Number:')}
                        </label>
                        <input
                          type="tel"
                          required
                          value={forgotPhone}
                          onChange={e => setForgotPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all disabled:opacity-70"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>{t('রিসেট ওটিপি পাঠান', 'Send Reset OTP')}</span>
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setAuthMode('password')}
                          className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
                        >
                          ← লগইন পেজে ফিরে যান
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotResetPass} className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
                        <span>এসএমএস কোড: </span>
                        <strong className="font-mono text-sm">{generatedForgotOtp}</strong>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {t('প্রাপ্ত ওটিপি কোড দিন:', 'Enter Received OTP:')}
                        </label>
                        <input
                          type="text"
                          required
                          value={forgotOtp}
                          onChange={e => setForgotOtp(e.target.value)}
                          placeholder="••••••"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {t('নতুন পাসওয়ার্ড সেট করুন:', 'Enter New Password:')}
                        </label>
                        <input
                          type="password"
                          required
                          value={forgotNewPass}
                          onChange={e => setForgotNewPass(e.target.value)}
                          placeholder="কমপক্ষে ৬ ডিজিট"
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all disabled:opacity-70"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('পাসওয়ার্ড পরিবর্তন ও লগইন', 'Reset & Login')}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Google 1-Tap Login Option */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-wider absolute">
                  {t('অথবা', 'OR')}
                </span>
              </div>

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
                <span>{t('গুগল (Google) দিয়ে ১-ক্লিকে প্রবেশ করুন', 'Continue with Google')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard with Tabs & Member Rewards */
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
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('প্রোফাইল ও রিওয়ার্ড', 'Profile & Rewards')}</span>
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
                onClick={() => setActiveTab('coupons')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  activeTab === 'coupons' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">{t('আমার কুপন', 'Coupons')}</span>
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
              {/* Tab 1: Orders with Buy Again & Invoices & Direct Tracking */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-gray-900">
                      {t('অর্ডার ইতিহাস ও লাইভ স্ট্যাটাস', 'Order History & Live Status')}
                    </h4>
                    <span className="text-xs text-gray-500">
                      মোট অর্ডার: {orders.length} টি
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('কোনো অর্ডার ইতিহাস পাওয়া যায়নি। শপ থেকে আপনার পছন্দের পণ্য অর্ডার করুন!', 'No order history yet. Discover products from our store!')}
                      </p>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                      >
                        কেনাকাটা শুরু করুন
                      </button>
                    </div>
                  ) : (
                    orders.map(ord => (
                      <div key={ord.id} className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2.5 text-xs">
                          <div>
                            <span className="font-mono font-black text-gray-900">{ord.id}</span>
                            <span className="text-gray-400 ml-2">{ord.orderDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'Shipped' || ord.status === 'Out for Delivery'
                                ? 'bg-purple-100 text-purple-800'
                                : ord.status === 'Confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.status}
                            </span>
                            <button
                              onClick={() => {
                                setTrackingOrderId(ord.id);
                                setActiveModal('tracking');
                              }}
                              className="bg-rose-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              {t('লাইভ ট্র্যাক', 'Track')}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrderForInvoice(ord);
                                setActiveModal('invoice');
                              }}
                              className="bg-white border border-gray-300 text-gray-700 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-gray-50 transition-colors cursor-pointer"
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

                              <button
                                onClick={() => {
                                  addToCart(it.product, it.quantity, it.selectedColor, it.selectedSize);
                                  setActiveModal('cart');
                                }}
                                className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>{t('আবার কিনুন', 'Buy Again')}</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-xs font-bold">
                          <span className="text-gray-500">
                            {t('পেমেন্ট মাধ্যম:', 'Payment:')} <span className="uppercase text-gray-800">{ord.paymentMethod}</span> ({ord.paymentStatus})
                          </span>
                          <span className="text-rose-600 text-sm font-black">{formatPrice(ord.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Profile & Rewards */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {/* Loyalty Points & Membership Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mb-2">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>গোল্ড শপার মেম্বার (Gold Member)</span>
                        </div>
                        <h4 className="text-lg font-black">{user.name}</h4>
                        <p className="text-xs text-slate-300 font-mono mt-0.5">{user.phone} {user.email ? `• ${user.email}` : ''}</p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center sm:text-right shrink-0">
                        <span className="text-[10px] text-amber-200 block font-semibold">ঝটপট রিওয়ার্ড কয়েন:</span>
                        <div className="text-xl font-black text-amber-300 flex items-center justify-center sm:justify-end space-x-1">
                          <span>🪙 ৫০০ পয়েন্ট</span>
                        </div>
                        <span className="text-[10px] text-white/70 block mt-0.5">= ৳৫০ ক্যাশব্যাক সমমূল্য</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Form */}
                  <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                        <User className="w-4 h-4 text-rose-600" />
                        <span>ব্যক্তিগত প্রোফাইল তথ্য</span>
                      </h4>
                      {!isEditingProfile && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="text-rose-600 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>এডিট করুন</span>
                        </button>
                      )}
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-3">
                        <div>
                          <label className="block text-gray-700 font-bold mb-1">পূর্ণ নাম:</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">মোবাইল নম্বর:</label>
                          <input
                            type="tel"
                            required
                            value={profilePhone}
                            onChange={e => setProfilePhone(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 font-bold mb-1">ইমেইল ঠিকানা:</label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={e => setProfileEmail(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs"
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            type="submit"
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                          >
                            সংরক্ষণ করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                          >
                            বাতিল
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">নাম:</span>
                          <strong className="text-gray-900 font-bold">{user.name}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">মোবাইল:</span>
                          <strong className="text-gray-900 font-mono font-bold">{user.phone}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">ইমেইল:</span>
                          <strong className="text-gray-900 font-mono">{user.email || 'দেওয়া হয়নি'}</strong>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <span className="text-gray-400 block text-[10px]">অ্যাকাউন্ট স্ট্যাটাস:</span>
                          <span className="text-emerald-700 font-bold flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ভেরিফাইড কাস্টমার</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Wishlist */}
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

              {/* Tab 4: Saved Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-gray-900">
                      {t('সংরক্ষিত ডেলিভারি ঠিকানা', 'Saved Delivery Addresses')}
                    </h4>
                    <button
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('নতুন ঠিকানা যুক্ত করুন', 'Add New Address')}</span>
                    </button>
                  </div>

                  {showAddAddress && (
                    <form onSubmit={handleSaveNewAddress} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-gray-600 mb-1 font-semibold">{t('লেবেল:', 'Label:')}</label>
                          <select
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value as any)}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                          >
                            <option value="Home">{t('বাসা (Home)', 'Home')}</option>
                            <option value="Office">{t('অফিস (Office)', 'Office')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 mb-1 font-semibold">{t('জেলা:', 'District:')}</label>
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
                      </div>

                      <div>
                        <label className="block text-gray-600 mb-1 font-semibold">{t('থানা / এরিয়া:', 'Area / Thana:')}</label>
                        <input
                          type="text"
                          required
                          value={newArea}
                          onChange={e => setNewArea(e.target.value)}
                          placeholder="যেমন: ধানমন্ডি, মিরপুর..."
                          className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 mb-1 font-semibold">{t('বিস্তারিত ঠিকানা:', 'Full Address:')}</label>
                        <input
                          type="text"
                          required
                          value={newFullAddress}
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
                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(cp.code)}
                          className="bg-white hover:bg-rose-100 text-rose-600 border border-rose-300 font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          {copiedCoupon === cp.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCoupon === cp.code ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Recently Viewed */}
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

              {/* Tab 7: Notifications */}
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
