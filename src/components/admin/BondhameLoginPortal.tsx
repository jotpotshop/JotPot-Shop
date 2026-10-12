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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = adminLogin(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        // Successful login will automatically trigger AdminPanel view in App.tsx
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', '/bondhame');
        }
      }
    }, 200);
  };

  const handleReturnToStore = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          {websiteSettings.logoUrl && (
            <div className="inline-block p-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md mb-2">
              <img
                src={websiteSettings.logoUrl}
                alt={websiteSettings.storeName}
                className="h-10 max-w-[160px] object-contain"
              />
            </div>
          )}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>সিকিউর এডমিন রুট: /bondhame</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {websiteSettings.storeName || 'JotPotShop'} এডমিন প্যানেল
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            এই পোর্টালটি শুধুমাত্র সুপার এডমিন এবং অনুমোদিত স্টাফদের জন্য সংরক্ষিত।
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600" />

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-300 animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ইমেইল বা ইউজারনেম
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="ইমেইল বা ইউজারনেম লিখুন"
                  autoComplete="off"
                  name="admin_login_identifier"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  name="admin_login_password"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-900/30 hover:shadow-rose-900/50 active:scale-[0.99] transition-all disabled:opacity-70 mt-3"
            >
              {isLoading ? (
                <span className="text-xs">যাচাই করা হচ্ছে...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="text-xs">এডমিন প্যানেলে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Customer Store button */}
        <div className="text-center mt-6">
          <button
            onClick={handleReturnToStore}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('সাধারণ কাস্টমার স্টোরে ফিরে যান', 'Return to Storefront')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
