import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminLoginModal: React.FC = () => {
  const {
    showAdminLoginModal,
    setShowAdminLoginModal,
    adminLogin,
    t,
  } = useShop();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!showAdminLoginModal) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await adminLogin(identifier, password);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'লগইন প্রক্রিয়ায় ত্রুটি হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-[#e6e3dd]">
        {/* Header */}
        <div className="bg-[#111827] px-5 py-4 text-white flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {t('এডমিন লগইন প্যানেল', 'Admin Login Panel')}
          </h2>
          <button
            onClick={() => setShowAdminLoginModal(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} autoComplete="off" className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-2 text-xs text-[#991b1b]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#b91c1c]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email or Username */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              {t('ইমেইল বা ইউজারনেম:', 'Email or Username:')}
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
                name="admin_modal_identifier"
                className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-4 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#881337] focus:outline-hidden transition-colors font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1.5">
              {t('পাসওয়ার্ড:', 'Password:')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                autoComplete="new-password"
                name="admin_modal_password"
                className="w-full min-h-[42px] bg-[#faf9f7] border border-[#e6e3dd] rounded-xl pl-10 pr-10 py-2 text-xs text-[#111827] focus:bg-white focus:border-[#881337] focus:outline-hidden transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827] cursor-pointer p-1"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[42px] bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="text-xs">{t('যাচাই করা হচ্ছে...', 'Verifying...')}</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-semibold">{t('এডমিন প্যানেলে প্রবেশ করুন', 'Enter Admin Panel')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
