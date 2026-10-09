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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = adminLogin(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Clean Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">
            {t('এডমিন লগইন প্যানেল', 'Admin Login Panel')}
          </h2>
          <button
            onClick={() => setShowAdminLoginModal(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700 animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ইমেইল বা ইউজারনেম */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('ইমেইল বা ইউজারনেম:', 'Email or Username:')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="ইমেইল বা ইউজারনেম লিখুন"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* পাসওয়ার্ড */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('পাসওয়ার্ড:', 'Password:')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* এডমিন প্যানেলে প্রবেশ করুন */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-600/25 hover:shadow-rose-600/35 active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="text-xs">{t('যাচাই করা হচ্ছে...', 'Verifying...')}</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span className="text-xs font-black">{t('এডমিন প্যানেলে প্রবেশ করুন', 'Enter Admin Panel')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
