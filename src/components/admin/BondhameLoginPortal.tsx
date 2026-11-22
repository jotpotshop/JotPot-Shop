import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const BondhameLoginPortal: React.FC = () => {
  const { adminLogin, websiteSettings, t } = useShop();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await adminLogin(identifier, password);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '/bondhame');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'লগইন প্রক্রিয়ায় ত্রুটি হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToStore = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#111827] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2.5">
          {websiteSettings.logoUrl && (
            <div className="inline-flex items-center justify-center p-2.5 bg-white rounded-xl border border-[#e6e3dd] mb-1">
              <img
                src={websiteSettings.logoUrl}
                alt={websiteSettings.storeName}
                referrerPolicy="no-referrer"
                className="h-10 max-w-[160px] object-contain"
              />
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-[#6b7280]">
            <ShieldCheck className="w-4 h-4 text-[#881337]" />
            <span>সিকিউর এডমিন পোর্টাল</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#374151]">/bondhame</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] font-editorial">
            {websiteSettings.storeName || 'JotPotShop'} এডমিন প্যানেল
          </h1>
          <p className="text-xs text-[#6b7280] max-w-sm mx-auto leading-relaxed">
            এই পোর্টালটি শুধুমাত্র সুপার এডমিন এবং অনুমোদিত স্টাফদের জন্য সংরক্ষিত।
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#e6e3dd] rounded-2xl p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-2.5 text-xs text-[#991b1b]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#b91c1c]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                ইমেইল বা ইউজারনেম
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="ইমেইল বা ইউজারনেম লিখুন"
                  autoComplete="off"
                  name="admin_login_identifier"
                  className="w-full min-h-[44px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:bg-white focus:outline-hidden focus:border-[#881337] font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  name="admin_login_password"
                  className="w-full min-h-[44px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:bg-white focus:outline-hidden focus:border-[#881337] font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6b7280] hover:text-[#111827] cursor-pointer"
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <span className="text-sm">যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm">এডমিন প্যানেলে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Customer Store button */}
        <div className="text-center mt-6">
          <button
            onClick={handleReturnToStore}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7280] hover:text-[#111827] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('সাধারণ কাস্টমার স্টোরে ফিরে যান', 'Return to Storefront')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
