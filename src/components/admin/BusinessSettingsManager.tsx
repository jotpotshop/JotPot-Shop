import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  Truck,
  CreditCard,
  Globe,
  RotateCcw,
  Search,
  MessageCircle,
  LayoutGrid,
  Bell,
  Save,
  CheckCircle,
  Shield,
  Key,
  ExternalLink,
  Zap,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Bookmark,
  Database,
  Check,
  Eye,
  Info,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { CourierPartner, WebsiteSettings, HeroBannerSlide } from '../../types';
import {
  uploadBrandingAsset,
  uploadHeroBannerImage,
  FIREBASE_PROJECT_INFO,
} from '../../lib/firebase';

export type SettingsSection =
  | 'general'
  | 'delivery'
  | 'payment'
  | 'courier'
  | 'homepage'
  | 'policy'
  | 'seo'
  | 'livechat'
  | 'orders';

export const BusinessSettingsManager: React.FC<{ initialSection?: SettingsSection }> = ({ initialSection }) => {
  const {
    websiteSettings,
    updateWebsiteSettings,
    deliverySettings,
    updateDeliverySettings,
    paymentSettings,
    updatePaymentSettings,
    courierConfigs,
    updateCourierConfig,
    returnPolicySettings,
    updateReturnPolicySettings,
    seoSettings,
    updateSeoSettings,
    liveChatSettings,
    updateLiveChatSettings,
    homepageSections,
    updateHomepageSections,
    orderSettings,
    updateOrderSettings,
    currentRole,
    categories,
    heroBanners,
    addHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    firebaseStatus,
    isFirebaseConnected,
    refreshFirebaseConnection,
    saveBrandingToRemote,
    t,
    language,
  } = useShop();

  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>(
    initialSection || 'general'
  );

  useEffect(() => {
    if (initialSection) {
      setActiveSettingsSection(initialSection);
    }
  }, [initialSection]);

  const [saveToast, setSaveToast] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [checkingFirebase, setCheckingFirebase] = useState(false);

  // Logo upload state & refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const mobileLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Hero Banner upload state & refs
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadBannerId, setActiveUploadBannerId] = useState<string | number | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerStatusMessage, setBannerStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [logoUploading, setLogoUploading] = useState(false);
  const [mobileLogoUploading, setMobileLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [brandingStatusMessage, setBrandingStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showSaveSuccess = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  // Handle Hero Banner Image Upload
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadBannerId) return;

    if (!isSuperAdmin) {
      setBannerStatusMessage({
        type: 'error',
        text: 'অনুমতি নেই: শুধুমাত্র Super Admin হিরো ব্যানার পরিবর্তন করতে পারবেন।',
      });
      return;
    }

    setIsUploadingBanner(true);
    setBannerStatusMessage(null);

    try {
      const res = await uploadHeroBannerImage(file, String(activeUploadBannerId));
      const target = heroBanners.find(b => b.id === activeUploadBannerId);
      if (target) {
        updateHeroBanner({
          ...target,
          image: res.downloadUrl,
          imageStoragePath: res.storagePath,
        });
        setBannerStatusMessage({
          type: 'success',
          text: `হিরো ব্যানার ইমেজ সফলভাবে আপলোড হয়েছে! (${file.name}, ${(file.size / 1024).toFixed(0)} KB)`,
        });
      }
    } catch (err) {
      setBannerStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'ব্যানার আপলোড ব্যর্থ হয়েছে।',
      });
    } finally {
      setIsUploadingBanner(false);
      setActiveUploadBannerId(null);
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  const handleAddNewBanner = () => {
    if (!isSuperAdmin) return;
    const newId = `banner-${Date.now()}`;
    const newSlide: HeroBannerSlide = {
      id: newId,
      badgeBn: '⚡ স্পেশাল অফার',
      badgeEn: '⚡ SPECIAL OFFER',
      titleBn: 'নতুন প্রিমিয়াম কালেকশন — সেরা অফারে কিনুন!',
      titleEn: 'Fresh Premium Arrivals — Shop with Exclusive Deals!',
      subtitleBn: 'সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন সুবিধা।',
      subtitleEn: 'Express cash on delivery & hassle-free return policy across Bangladesh.',
      ctaBn: 'অফার দেখুন',
      ctaEn: 'Explore Deals',
      category: 'deals-offers',
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
      active: true,
    };
    addHeroBanner(newSlide);
    setBannerStatusMessage({
      type: 'success',
      text: 'নতুন হিরো ব্যানার স্লাইড তৈরি হয়েছে! নিচে ছবি আপলোড করুন ও টেক্সট পরিবর্তন করুন।',
    });
  };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSuperAdmin) {
      setBrandingStatusMessage({
        type: 'error',
        text: 'অনুমতি নেই: শুধুমাত্র Super Admin ওয়েবসাইট লোগো পরিবর্তন করতে পারবেন।',
      });
      return;
    }

    setLogoUploading(true);
    setBrandingStatusMessage(null);

    try {
      const result = await uploadBrandingAsset(file, 'logo');
      const updated = {
        logoUrl: result.downloadUrl,
        logoStoragePath: result.storagePath,
      };
      updateWebsiteSettings(updated);
      saveBrandingToRemote(updated).catch(e => console.warn('Auto-save branding error:', e));

      setBrandingStatusMessage({
        type: 'success',
        text: `ওয়েবসাইট লোগো সফলভাবে আপলোড ও সেভ হয়েছে! (${file.name}, ${(file.size / 1024).toFixed(1)} KB) — হেডার, মোবাইল ও ফুটারে প্রদর্শিত হচ্ছে।`,
      });
    } catch (err) {
      setBrandingStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'লোগো আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Handle Mobile Logo Upload
  const handleMobileLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSuperAdmin) {
      setBrandingStatusMessage({
        type: 'error',
        text: 'অনুমতি নেই: শুধুমাত্র Super Admin মোবাইল লোগো পরিবর্তন করতে পারবেন।',
      });
      return;
    }

    setMobileLogoUploading(true);
    setBrandingStatusMessage(null);

    try {
      const result = await uploadBrandingAsset(file, 'mobile_logo');
      const updated = {
        mobileLogoUrl: result.downloadUrl,
      };
      updateWebsiteSettings(updated);
      saveBrandingToRemote(updated).catch(e => console.warn('Auto-save mobile logo error:', e));

      setBrandingStatusMessage({
        type: 'success',
        text: `মোবাইল লোগো সফলভাবে আপলোড ও সেভ হয়েছে! (${file.name})`,
      });
    } catch (err) {
      setBrandingStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'মোবাইল লোগো আপলোড ব্যর্থ হয়েছে।',
      });
    } finally {
      setMobileLogoUploading(false);
      if (mobileLogoInputRef.current) mobileLogoInputRef.current.value = '';
    }
  };

  // Handle Favicon Upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSuperAdmin) {
      setBrandingStatusMessage({
        type: 'error',
        text: 'অনুমতি নেই: শুধুমাত্র Super Admin ফেভিকন পরিবর্তন করতে পারবেন।',
      });
      return;
    }

    setFaviconUploading(true);
    setBrandingStatusMessage(null);

    try {
      const result = await uploadBrandingAsset(file, 'favicon');
      const updated = {
        faviconUrl: result.downloadUrl,
      };
      updateWebsiteSettings(updated);
      saveBrandingToRemote(updated).catch(e => console.warn('Auto-save favicon error:', e));

      setBrandingStatusMessage({
        type: 'success',
        text: `ব্রাউজার ফেভিকন সফলভাবে আপলোড ও সেভ হয়েছে! (${file.name})`,
      });
    } catch (err) {
      setBrandingStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'ফেভিকন আপলোড ব্যর্থ হয়েছে।',
      });
    } finally {
      setFaviconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  // Handle Remove Logo
  const handleRemoveLogo = () => {
    if (!isSuperAdmin) return;
    updateWebsiteSettings({
      logoUrl: '',
      logoStoragePath: '',
    });
    setBrandingStatusMessage({
      type: 'info',
      text: 'লোগো মুছে ফেলা হয়েছে। ডিফল্ট ব্র্যান্ড আইকন সক্রিয় হয়েছে। সেভ করতে "Save Changes" ক্লিক করুন।',
    });
  };

  // Handle Remove Mobile Logo
  const handleRemoveMobileLogo = () => {
    if (!isSuperAdmin) return;
    updateWebsiteSettings({
      mobileLogoUrl: '',
    });
    setBrandingStatusMessage({
      type: 'info',
      text: 'মোবাইল লোগো মুছে ফেলা হয়েছে। মূল লোগো সব ডিভাইসে ব্যবহৃত হবে।',
    });
  };

  // Handle Remove Favicon
  const handleRemoveFavicon = () => {
    if (!isSuperAdmin) return;
    updateWebsiteSettings({
      faviconUrl: '',
    });
  };

  // Save all branding settings to Firebase
  const handleSaveBranding = async () => {
    if (!isSuperAdmin) {
      setBrandingStatusMessage({
        type: 'error',
        text: 'শুধুমাত্র Super Admin ওয়েবসাইট ব্র্যান্ডিং সংরক্ষণ করতে পারবেন।',
      });
      return;
    }

    setIsSavingBranding(true);
    setBrandingStatusMessage(null);

    try {
      const success = await saveBrandingToRemote(websiteSettings);
      if (success) {
        showSaveSuccess();
        setBrandingStatusMessage({
          type: 'success',
          text: `ওয়েবসাইট ব্র্যান্ডিং ও লোগো সফলভাবে Firebase Storage ও Firestore (settings/branding)-এ স্থায়ীভাবে সংরক্ষিত হয়েছে!`,
        });
      } else {
        setBrandingStatusMessage({
          type: 'error',
          text: 'Firebase-এ সেভ করতে সমস্যা হয়েছে। লোকাল সেভ সম্পন্ন হয়েছে।',
        });
      }
    } catch (err) {
      setBrandingStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'সেভ ব্যর্থ হয়েছে।',
      });
    } finally {
      setIsSavingBranding(false);
    }
  };

  // Test Firebase Connection
  const handleTestConnection = async () => {
    setCheckingFirebase(true);
    try {
      await refreshFirebaseConnection();
    } finally {
      setCheckingFirebase(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{t('বিজনেস কনফিগারেশন সফলভাবে সেভ হয়েছে!', 'Business settings successfully saved!')}</span>
        </div>
      )}

      {/* Header Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-xs flex flex-wrap gap-1.5 text-xs font-bold text-gray-700">
        <button
          onClick={() => setActiveSettingsSection('general')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'general' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t('ওয়েবসাইট ব্র্যান্ডিং ও লোগো', 'Website Branding')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('delivery')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'delivery' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{t('🚚 ডেলিভারি চার্জ ও চট্টগ্রাম অফার', 'Delivery & Chattogram Offer')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('payment')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'payment' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t('পেমেন্ট ও বিকাশ/নগদ', 'Payment Gateways')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('courier')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'courier' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{t('কুরিয়ার পার্টনার্স ও API', 'Courier API & Integrations')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('homepage')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'homepage' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{t('হোমপেজ সেকশন কনফিগ', 'Homepage Sections')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('policy')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'policy' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('রিটার্ন ও রিফান্ড পলিসি', 'Return Policy')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('seo')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'seo' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('SEO ও সোশ্যাল মেটা', 'SEO & Meta')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('livechat')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'livechat' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t('💬 ভাসমান উইজেট ও চ্যাট (WhatsApp, Messenger, Call)', 'Floating Widget, Chat, WhatsApp, Call')}</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('orders')}
          className={`px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors ${
            activeSettingsSection === 'orders' ? 'bg-rose-600 text-white shadow-xs' : 'hover:bg-gray-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t('অর্ডার ও নোটিফিকেশন', 'Order Rules')}</span>
        </button>
      </div>

      {/* 1. Website Branding & Logo Upload Section (Super Admin Full Control) */}
      {activeSettingsSection === 'general' && (
        <div className="space-y-6">
          {/* Hidden File Inputs */}
          <input
            ref={logoInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <input
            ref={mobileLogoInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleMobileLogoUpload}
            className="hidden"
          />
          <input
            ref={faviconInputRef}
            type="file"
            accept=".png,.ico,.svg,image/x-icon,image/png,image/svg+xml"
            onChange={handleFaviconUpload}
            className="hidden"
          />

          {/* Feedback & Status Notification */}
          {brandingStatusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start space-x-3 shadow-xs animate-in fade-in duration-200 ${
                brandingStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : brandingStatusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {brandingStatusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : brandingStatusMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold">{brandingStatusMessage.text}</span>
              </div>
              <button
                onClick={() => setBrandingStatusMessage(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Security Banner if not Super Admin */}
          {!isSuperAdmin && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center space-x-3 text-xs">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-extrabold block">সতর্কবার্তা: শুধুমাত্র Super Admin ব্র্যান্ডিং ও লোগো পরিবর্তন করতে পারবেন</span>
                <span className="text-amber-700">বর্তমানে আপনি {currentRole} রোলে আছেন। এই সেটিংস শুধুমাত্র পাঠযোগ্য (Read-only)।</span>
              </div>
            </div>
          )}

          {/* Firebase Backend Diagnostic Card */}
          <div className="bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-white">Firebase Connected: JotPotShop</h4>
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>লাইভ সংযুক্ত</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Cloud Firestore ও Firebase Storage-এ সমস্ত লোগো ও ব্র্যান্ডিং সরাসরি সিঙ্ক হচ্ছে
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestConnection}
                disabled={checkingFirebase}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/10 flex items-center space-x-1.5 cursor-pointer transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingFirebase ? 'animate-spin' : ''}`} />
                <span>{checkingFirebase ? 'যাচাই করা হচ্ছে...' : 'কানেকশন টেস্ট'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-[11px] font-mono">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px] uppercase font-sans">Firebase Project ID</span>
                <span className="font-bold text-amber-300">{FIREBASE_PROJECT_INFO.projectId}</span>
                <span className="text-gray-500 text-[10px] block">No: {FIREBASE_PROJECT_INFO.projectNumber}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px] uppercase font-sans">Storage Bucket</span>
                <span className="font-bold text-cyan-300 truncate block" title={FIREBASE_PROJECT_INFO.storageBucket}>
                  {FIREBASE_PROJECT_INFO.storageBucket}
                </span>
                <span className="text-gray-500 text-[10px] block">Path: /branding/*</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-gray-400 block text-[10px] uppercase font-sans">Firestore Document</span>
                <span className="font-bold text-emerald-300 truncate block">settings/branding</span>
                <span className="text-gray-500 text-[10px] block">Database: ai-studio-jotpotshop...</span>
              </div>
            </div>
          </div>

          {/* 1. Website Branding & Logo Upload Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6 text-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900">
                      {t('Website Branding (ওয়েবসাইট ব্র্যান্ডিং)', 'Website Branding & Logo Settings')}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {t(
                        'ওয়েবসাইট লোগো, মোবাইল লোগো, ফেভিকন, নাম এবং ট্যাগলাইন নিয়ন্ত্রণ করুন',
                        'Manage website primary logo, mobile logo, favicon, store name & tagline'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Save Changes Button */}
              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding || !isSuperAdmin}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 cursor-pointer shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
              >
                {isSavingBranding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('Save Changes (সেভ করুন)', 'Save Changes')}</span>
                  </>
                )}
              </button>
            </div>

            {/* BRANDING ASSET UPLOAD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Box 1: PRIMARY WEBSITE LOGO UPLOAD (Mandatory Focus) */}
              <div className="lg:col-span-2 bg-gray-50/70 rounded-3xl p-5 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    <h4 className="font-extrabold text-sm text-gray-900">Website Logo Upload (প্রধান লোগো)</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                    PNG / JPG / WebP / SVG (Max 5MB)
                  </span>
                </div>

                <p className="text-gray-500 text-[11px] leading-relaxed">
                  এই লোগোটি ওয়েবসাইটের হেডার (Header), মোবাইল ভিউ এবং ফুটার (Footer)-এ সরাসরি প্রদর্শিত হবে।
                  ট্রান্সপারেন্ট ব্যাকগ্রাউন্ডের জন্য PNG বা SVG ফাইল সেরা।
                </p>

                {/* CURRENT LOGO PREVIEW & UPLOAD TRIGGER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Current Logo Preview Box with Checkered Pattern */}
                  <div className="relative rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 flex flex-col items-center justify-center min-h-[160px] overflow-hidden group">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Current Logo Preview
                    </span>

                    {websiteSettings.logoUrl ? (
                      <div className="relative flex flex-col items-center justify-center w-full">
                        <div
                          className="w-full max-h-[110px] flex items-center justify-center p-3 rounded-xl bg-repeat"
                          style={{
                            backgroundImage:
                              'radial-gradient(#e5e7eb 1px, transparent 1px), radial-gradient(#e5e7eb 1px, #ffffff 1px)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0, 8px 8px',
                          }}
                        >
                          <img
                            src={websiteSettings.logoUrl}
                            alt="Website Logo"
                            className="max-h-[85px] max-w-[200px] object-contain transition-transform group-hover:scale-105"
                          />
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>সক্রিয় লোগো</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 text-xs font-medium">কোনো কাস্টম লোগো আপলোড করা হয়নি</p>
                        <span className="text-[10px] text-gray-400 mt-0.5">ডিফল্ট JotPotShop ব্যাজ প্রদর্শিত হচ্ছে</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Visible Buttons */}
                  <div className="space-y-3">
                    {/* The Prominent Upload Button Specified by User */}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading || !isSuperAdmin}
                      className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-rose-600/20 transition-all text-xs"
                    >
                      {logoUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Website Logo</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      {/* Replace Logo Button */}
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoUploading || !isSuperAdmin}
                        className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-800 border border-gray-300 font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer text-xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                        <span>Replace Logo</span>
                      </button>

                      {/* Remove Logo Button */}
                      {websiteSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          disabled={logoUploading || !isSuperAdmin}
                          className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-2 px-3 rounded-xl flex items-center justify-center space-x-1 cursor-pointer text-xs transition-colors"
                          title="লোগো মুছে ডিফল্ট আইকন ফিরিয়ে আনুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Storage Path Indicator */}
                    {websiteSettings.logoStoragePath && (
                      <div className="bg-white p-2 rounded-xl border border-gray-200 text-[10px] text-gray-500 font-mono break-all">
                        <span className="text-gray-400 font-bold uppercase block text-[9px] font-sans">
                          Firebase Storage Path:
                        </span>
                        {websiteSettings.logoStoragePath}
                      </div>
                    )}

                    {/* Direct File Upload is enabled above */}
                  </div>
                </div>

                {/* Live Header & Footer Preview Strip */}
                <div className="bg-white rounded-2xl p-3 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                    <span>লাইভ প্রিভিউ (হেডার ও ফুটারে যেভাবে দেখাবে)</span>
                    <span className="text-rose-600 font-semibold">রিয়েল-টাইম ডিসপ্লে</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Light Header Mockup */}
                    <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2">
                      <div className="h-8 max-w-[100px] flex items-center justify-center bg-white p-1 rounded-lg border border-gray-200 shrink-0">
                        {websiteSettings.logoUrl ? (
                          <img
                            src={websiteSettings.logoUrl}
                            alt="Header Preview"
                            className="max-h-6 max-w-[80px] object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-gray-900 block truncate">
                          {websiteSettings.storeName || 'JotPotShop'}
                        </span>
                        <span className="text-[10px] text-gray-500 block truncate">Light Header Preview</span>
                      </div>
                    </div>

                    {/* Dark Footer Mockup */}
                    <div className="bg-gray-950 text-white p-2.5 rounded-xl border border-gray-800 flex items-center space-x-2">
                      <div className="h-8 max-w-[100px] flex items-center justify-center bg-white/10 p-1 rounded-lg border border-white/20 shrink-0">
                        {websiteSettings.logoUrl ? (
                          <img
                            src={websiteSettings.logoUrl}
                            alt="Footer Preview"
                            className="max-h-6 max-w-[80px] object-contain"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-white block truncate">
                          {websiteSettings.storeName || 'JotPotShop'}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate">Dark Footer Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2 & 3: MOBILE LOGO & FAVICON UPLOADS */}
              <div className="space-y-4">
                {/* Mobile Logo Upload Box */}
                <div className="bg-gray-50/70 rounded-3xl p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Smartphone className="w-4 h-4 text-rose-600" />
                      <h4 className="font-extrabold text-xs text-gray-900">Mobile Logo Upload (ঐচ্ছিক)</h4>
                    </div>
                    {websiteSettings.mobileLogoUrl && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        সেট করা আছে
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500">
                    মোবাইল স্ক্রিনে ছোট বা ভিন্ন ভার্সনের লোগো প্রদর্শন করতে এটি ব্যবহার করুন।
                  </p>

                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {websiteSettings.mobileLogoUrl ? (
                        <img
                          src={websiteSettings.mobileLogoUrl}
                          alt="Mobile Logo"
                          className="max-h-12 max-w-full object-contain"
                        />
                      ) : (
                        <Smartphone className="w-6 h-6 text-gray-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => mobileLogoInputRef.current?.click()}
                        disabled={mobileLogoUploading || !isSuperAdmin}
                        className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold py-1.5 px-2.5 rounded-xl text-[11px] cursor-pointer flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Upload className="w-3 h-3 text-gray-500" />
                        <span>{mobileLogoUploading ? 'আপলোড হচ্ছে...' : 'Upload Mobile Logo'}</span>
                      </button>

                      {websiteSettings.mobileLogoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveMobileLogo}
                          disabled={!isSuperAdmin}
                          className="text-rose-600 hover:text-rose-800 text-[10px] font-bold block"
                        >
                          Remove Mobile Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Favicon Upload Box */}
                <div className="bg-gray-50/70 rounded-3xl p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Bookmark className="w-4 h-4 text-amber-600" />
                      <h4 className="font-extrabold text-xs text-gray-900">Favicon Upload (ট্যাব আইকন)</h4>
                    </div>
                    {websiteSettings.faviconUrl && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        সেট করা আছে
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-500">
                    ব্রাউজার ট্যাবে প্রদর্শিত ছোট আইকন (.ico, .png, .svg - 32x32 px)।
                  </p>

                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center p-2 shrink-0">
                      {websiteSettings.faviconUrl ? (
                        <img
                          src={websiteSettings.faviconUrl}
                          alt="Favicon"
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                          J
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={faviconUploading || !isSuperAdmin}
                        className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 font-bold py-1.5 px-2.5 rounded-xl text-[11px] cursor-pointer flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Upload className="w-3 h-3 text-gray-500" />
                        <span>{faviconUploading ? 'আপলোড হচ্ছে...' : 'Upload Favicon'}</span>
                      </button>

                      {websiteSettings.faviconUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveFavicon}
                          disabled={!isSuperAdmin}
                          className="text-rose-600 hover:text-rose-800 text-[10px] font-bold block"
                        >
                          Remove Favicon
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WEBSITE NAME & TAGLINE INFORMATION */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h4 className="font-extrabold text-sm text-gray-900">
                {t('ওয়েবসাইটের নাম ও ট্যাগলাইন (Website Identity)', 'Website Name & Taglines')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Website Name (English) *
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.storeName || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ storeName: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="JotPotShop"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    ইংরেজি হেডার, ইনভয়েস ও মেটা টাইটেলে প্রদর্শিত হবে
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ওয়েবসাইটের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.storeNameBn || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ storeNameBn: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="ঝটপট শপ"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    বাংলা ভাষায় স্টোর ও এসএমএস বিজ্ঞপ্তিতে ব্যবহৃত হবে
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Website Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.tagline || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ tagline: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="Everything you need, in one place"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ওয়েবসাইট ট্যাগলাইন ১ (মূল বাংলা ট্যাগলাইন) *
                  </label>
                  <input
                    type="text"
                    value={websiteSettings.taglineBn || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ taglineBn: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="যা দরকার, এক জায়গায়"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    হোমপেজ হেডার ও মূল ব্র্যান্ড পরিচয়ে প্রদর্শিত হবে
                  </span>
                </div>
              </div>

              {/* অতিরিক্ত ২টা বাংলা ট্যাগলাইন (User Request: ওয়েবসাইট ট্যাগলাইন (বাংলা) > আরো দুইটা যুক্ত কর) */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <h5 className="font-extrabold text-xs text-gray-900">
                      অতিরিক্ত বাংলা ট্যাগলাইন ও ব্র্যান্ড স্লোগান (ট্যাগলাইন ২ ও ৩)
                    </h5>
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    ২টি নতুন ট্যাগলাইন যুক্ত
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      ওয়েবসাইট ট্যাগলাইন ২ (বাংলা - বিশ্বাস ও পার্টনারশিপ বার্তা)
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.taglineBn2 || ''}
                      disabled={!isSuperAdmin}
                      onChange={e => updateWebsiteSettings({ taglineBn2: e.target.value })}
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 transition-colors"
                      placeholder="আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      ফুটার, এসএমএস ও সোশ্যাল শেয়ার কার্ডে ব্যবহৃত হবে
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      ওয়েবসাইট ট্যাগলাইন ৩ (বাংলা - সার্ভিস ও কোয়ালিটি নিশ্চয়তা)
                    </label>
                    <input
                      type="text"
                      value={websiteSettings.taglineBn3 || ''}
                      disabled={!isSuperAdmin}
                      onChange={e => updateWebsiteSettings({ taglineBn3: e.target.value })}
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 transition-colors"
                      placeholder="দ্রুততম ডেলিভারি ও সেরা মানের নিশ্চয়তা"
                    />
                    <span className="text-[10px] text-gray-500 mt-0.5 block">
                      চেকআউট পেজ, ইনভয়েস ও ট্রাস্ট ব্যাজে প্রদর্শিত হবে
                    </span>
                  </div>
                </div>

                {/* Quick Presets for Bangla Taglines */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">
                    কুইক ট্যাগলাইন প্রিসেট (ক্লিক করে সেট করুন):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { t1: 'যা দরকার, এক জায়গায়', t2: 'আপনার বিশ্বস্ত অনলাইন শপিং পার্টনার', t3: 'দ্রুততম ডেলিভারি ও সেরা মানের নিশ্চয়তা' },
                      { t1: 'সেরা দামে সেরা কোয়ালিটি', t2: 'দেশজুড়ে বিশ্বস্ত অনলাইন শপিং', t3: '১০০% অরিজিনাল পণ্যের নিশ্চয়তা' },
                      { t1: 'সহজ ও নিরাপদ কেনাকাটা', t2: 'ক্যাশ অন ডেলিভারিতে দ্রুত পণ্য প্রাপ্তি', t3: '২৪/৭ সার্বক্ষণিক কাস্টমার কেয়ার' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isSuperAdmin}
                        onClick={() =>
                          updateWebsiteSettings({
                            taglineBn: preset.t1,
                            taglineBn2: preset.t2,
                            taglineBn3: preset.t3,
                          })
                        }
                        className="bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 text-gray-700 hover:text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                      >
                        প্রিসেট {idx + 1}: “{preset.t1}”
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information & Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Official Domain</label>
                  <input
                    type="text"
                    value={websiteSettings.domain || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ domain: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                    placeholder="jotpotshop.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hotline / হেল্পলাইন</label>
                  <input
                    type="text"
                    value={websiteSettings.hotline || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ hotline: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                    placeholder="01800-JOTPOT"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">WhatsApp Helpdesk</label>
                  <input
                    type="text"
                    value={websiteSettings.whatsappNumber || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ whatsappNumber: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                    placeholder="+8801700000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={websiteSettings.supportEmail || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ supportEmail: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                    placeholder="support@jotpotshop.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Office Address (অফিস ঠিকানা)</label>
                  <input
                    type="text"
                    value={websiteSettings.officeAddress || ''}
                    disabled={!isSuperAdmin}
                    onChange={e => updateWebsiteSettings({ officeAddress: e.target.value })}
                    className="w-full bg-gray-50 disabled:bg-gray-100 border border-gray-200 rounded-xl p-2.5 text-xs"
                    placeholder="Level 5, Concord Tower, Road 11, Banani, Dhaka-1213"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-gray-500 text-[11px]">
                <span>✓ পরিবর্তনগুলো সেভ করলে হেডার, ফুটার এবং মোবাইল নেভিগেশন স্বয়ংক্রিয়ভাবে আপডেট হবে।</span>
              </div>

              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding || !isSuperAdmin}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-rose-600/30 transition-all text-xs"
              >
                {isSavingBranding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Firebase-এ সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes (ব্র্যান্ডিং সেভ করুন)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delivery Rates */}
      {activeSettingsSection === 'delivery' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('ডেলিভারি চার্জ ও ফ্রি ডেলিভারি সীমা', 'Delivery Charges & Rules')}
              </h3>
              <p className="text-gray-500 text-xs">ঢাকার ভেতরে ও বাইরে চার্জ, এক্সপ্রেস ডেলিভারি ও ফ্রি থ্রেশহোল্ড</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Delivery Rates')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="block font-bold text-gray-800 mb-1">ঢাকার ভেতর ডেলিভারি ফি (৳)</label>
              <input
                type="number"
                value={deliverySettings.insideDhakaFee ?? 60}
                onChange={e => updateDeliverySettings({ insideDhakaFee: Number(e.target.value) })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-black text-rose-600"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">ডিফল্ট: ৳৬০</span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-300">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-amber-900">চট্টগ্রাম সিটি ডেলিভারি ফি (৳)</label>
                <span className="bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded">City Zone</span>
              </div>
              <input
                type="number"
                value={deliverySettings.chattogramFee ?? 80}
                onChange={e => updateDeliverySettings({ chattogramFee: Number(e.target.value) })}
                className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-sm font-black text-amber-700"
              />
              <span className="text-[10px] text-amber-800 mt-1 block">ডিফল্ট: ৳৮০</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="block font-bold text-gray-800 mb-1">অন্যান্য জেলা ডেলিভারি ফি (৳)</label>
              <input
                type="number"
                value={deliverySettings.outsideDhakaFee ?? 120}
                onChange={e => updateDeliverySettings({ outsideDhakaFee: Number(e.target.value) })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-black text-rose-600"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">ডিফল্ট: ৳১২০</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="block font-bold text-gray-800 mb-1">ফ্রি ডেলিভারি ন্যূনতম অর্ডার (৳)</label>
              <input
                type="number"
                value={deliverySettings.freeDeliveryThreshold ?? 1500}
                onChange={e => updateDeliverySettings({ freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-black text-emerald-600"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">৳১৫০০ বা তার বেশিতে ফ্রি</span>
            </div>
          </div>

          {/* Chattogram Free Delivery Offer Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-amber-400/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-gray-900 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-2">
                    <span>আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি (Special Offer)</span>
                    {deliverySettings.chattogramFreeDeliveryOffer && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        ACTIVE NOW
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    এই অফারটি চালু করলে চেকআউটে চট্টগ্রাম সিটির গ্রাহকদের থেকে কোনো ডেলিভারি ফি নেওয়া হবে না (৳০)।
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={Boolean(deliverySettings.chattogramFreeDeliveryOffer)}
                  onChange={e => updateDeliverySettings({ chattogramFreeDeliveryOffer: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-gray-800">
                  {deliverySettings.chattogramFreeDeliveryOffer ? 'অফার চালু আছে' : 'অফার বন্ধ'}
                </span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                চট্টগ্রাম অফার নোটিফিকেশন ব্যানার টেক্সট (Storefront Banner)
              </label>
              <input
                type="text"
                value={deliverySettings.chattogramOfferTextBn || ''}
                onChange={e => updateDeliverySettings({ chattogramOfferTextBn: e.target.value })}
                placeholder="🎉 অফার: আজকে চট্টগ্রামের জন্য ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!"
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-medium text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ঢাকার ভেতরের ডেলিভারি সময়</label>
              <input
                type="text"
                value={deliverySettings.insideDhakaDays || ''}
                onChange={e => updateDeliverySettings({ insideDhakaDays: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">চট্টগ্রাম সিটির ডেলিভারি সময়</label>
              <input
                type="text"
                value={deliverySettings.chattogramDays || ''}
                onChange={e => updateDeliverySettings({ chattogramDays: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">অন্যান্য জেলার ডেলিভারি সময়</label>
              <input
                type="text"
                value={deliverySettings.outsideDhakaDays || ''}
                onChange={e => updateDeliverySettings({ outsideDhakaDays: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Payment Gateways */}
      {activeSettingsSection === 'payment' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('পেমেন্ট মেথড ও বিকাশ/নগদ কনফিগারেশন', 'Payment Gateways & Mobile Banking')}
              </h3>
              <p className="text-gray-500 text-xs">ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও কার্ড পেমেন্ট সেটিংস</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Payments')}</span>
            </button>
          </div>

          {/* COD Toggle */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">ক্যাশ অন ডেলিভারি (Cash on Delivery - COD)</h4>
              <p className="text-gray-500 text-[11px]">পণ্য হাতে পেয়ে টাকা পরিশোধ করার সুবিধা</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentSettings.codEnabled}
                onChange={e => updatePaymentSettings({ codEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* bKash Settings */}
          <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-pink-900 text-xs flex items-center space-x-2">
                <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-[10px]">bKash</span>
                <span>বিকাশ পেমেন্ট গেটওয়ে / নাম্বার</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.bkashEnabled}
                  onChange={e => updatePaymentSettings({ bkashEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-pink-600" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">বিকাশ অ্যাকাউন্ট নম্বর</label>
                <input
                  type="text"
                  value={paymentSettings.bkashNumber || ''}
                  onChange={e => updatePaymentSettings({ bkashNumber: e.target.value })}
                  className="w-full bg-white border border-pink-200 rounded-xl p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">অ্যাকাউন্ট টাইপ</label>
                <select
                  value={paymentSettings.bkashAccountType || 'Merchant'}
                  onChange={e => updatePaymentSettings({ bkashAccountType: e.target.value as any })}
                  className="w-full bg-white border border-pink-200 rounded-xl p-2 text-xs font-semibold"
                >
                  <option value="Merchant">Merchant (মার্চেন্ট - পেমেন্ট গেটওয়ে)</option>
                  <option value="Personal">Personal (পার্সোনাল - সেন্ড মানি)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nagad Settings */}
          <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-900 text-xs flex items-center space-x-2">
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded text-[10px]">Nagad</span>
                <span>নগদ পেমেন্ট গেটওয়ে / নাম্বার</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(paymentSettings.nagadEnabled)}
                  onChange={e => updatePaymentSettings({ nagadEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-orange-600" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">নগদ অ্যাকাউন্ট নম্বর</label>
                <input
                  type="text"
                  value={paymentSettings.nagadNumber || ''}
                  onChange={e => updatePaymentSettings({ nagadNumber: e.target.value })}
                  className="w-full bg-white border border-orange-200 rounded-xl p-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">অ্যাকাউন্ট টাইপ</label>
                <select
                  value={paymentSettings.nagadAccountType || 'Merchant'}
                  onChange={e => updatePaymentSettings({ nagadAccountType: e.target.value as any })}
                  className="w-full bg-white border border-orange-200 rounded-xl p-2 text-xs font-semibold"
                >
                  <option value="Merchant">Merchant (মার্চেন্ট)</option>
                  <option value="Personal">Personal (পার্সোনাল)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Courier Partners & API Integrations */}
      {activeSettingsSection === 'courier' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('কুরিয়ার সার্ভিস এপিআই ইন্টিগ্রেশন (Courier APIs)', 'Logistics & Courier API Integrations')}
              </h3>
              <p className="text-gray-500 text-xs">
                Steadfast, RedX, Pathao, Paperfly, Sundarban, eCourier এপিআই কি ও অটোমেটিক বুকিং রুলস
              </p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Courier APIs')}</span>
            </button>
          </div>

          <div className="space-y-4">
            {courierConfigs.map(c => (
              <div key={c.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gray-900 text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                      {c.id}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm">{c.name}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">({c.nameBn})</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-500">
                      {c.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.isActive}
                        onChange={e => updateCourierConfig(c.id, { isActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-emerald-600" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">API Key / Token</label>
                    <input
                      type="password"
                      value={c.apiKey}
                      onChange={e => updateCourierConfig(c.id, { apiKey: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Secret Key / Client ID</label>
                    <input
                      type="password"
                      value={c.secretKey}
                      onChange={e => updateCourierConfig(c.id, { secretKey: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Merchant Store ID</label>
                    <input
                      type="text"
                      value={c.merchantId}
                      onChange={e => updateCourierConfig(c.id, { merchantId: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-gray-600 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={c.autoAssignInsideDhaka}
                      onChange={e => updateCourierConfig(c.id, { autoAssignInsideDhaka: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>ঢাকার ভেতরের অর্ডারে অটোমেটিক সিলেক্ট হবে</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={c.autoAssignOutsideDhaka}
                      onChange={e => updateCourierConfig(c.id, { autoAssignOutsideDhaka: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>ঢাকার বাইরের অর্ডারে অটোমেটিক সিলেক্ট হবে</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Homepage Sections Config & Hero Banner Upload */}
      {activeSettingsSection === 'homepage' && (
        <div className="space-y-6">
          {/* Hidden Hero Banner File Input */}
          <input
            ref={bannerFileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
            onChange={handleBannerImageUpload}
            className="hidden"
          />

          {/* Banner Status Notification */}
          {bannerStatusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center justify-between shadow-xs animate-in fade-in ${
                bannerStatusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                  : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
              }`}
            >
              <div className="flex items-center space-x-2">
                {bannerStatusMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{bannerStatusMessage.text}</span>
              </div>
              <button
                onClick={() => setBannerStatusMessage(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* HERO BANNER UPLOAD & SLIDER MANAGEMENT (USER REQUEST) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {t('হিরো ব্যানার আপলোড ও কনফিগারেশন (Hero Banner Slides)', 'Hero Banner Upload & Management')}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    হোমপেজের মূল স্লাইডার ব্যানার ছবি আপলোড, অফার টেক্সট, ডিসকাউন্ট ব্যাজ ও অ্যাকশন লিংক পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAddNewBanner}
                  disabled={!isSuperAdmin}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-600/20 transition-all text-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>+ নতুন ব্যানার স্লাইড যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* BANNERS LIST */}
            <div className="space-y-6">
              {heroBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="bg-gray-50/80 rounded-3xl p-5 border border-gray-200 space-y-4 hover:border-rose-200 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-5">
                    {/* Left: Banner Image Preview & Upload Button */}
                    <div className="lg:w-72 shrink-0 space-y-3">
                      <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border border-gray-300 shadow-inner group">
                        <img
                          src={banner.image}
                          alt={banner.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                          <span className="text-[10px] font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded-full self-start mb-1">
                            {banner.badgeBn}
                          </span>
                          <span className="font-extrabold text-xs line-clamp-1">{banner.titleBn}</span>
                        </div>
                      </div>

                      {/* Visible Banner Upload Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUploadBannerId(banner.id);
                          bannerFileInputRef.current?.click();
                        }}
                        disabled={isUploadingBanner || !isSuperAdmin}
                        className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm text-xs transition-colors"
                      >
                        {isUploadingBanner && activeUploadBannerId === banner.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Banner Image</span>
                          </>
                        )}
                      </button>

                      {/* Direct Upload Enabled */}
                    </div>

                    {/* Right: Banner Information & Controls */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-200 text-gray-800 font-black text-[10px] px-2 py-0.5 rounded-md">
                            স্লাইড #{index + 1}
                          </span>
                          <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-gray-700">
                            <input
                              type="checkbox"
                              checked={banner.active !== false}
                              disabled={!isSuperAdmin}
                              onChange={e => updateHeroBanner({ ...banner, active: e.target.checked })}
                              className="w-4 h-4 text-rose-600 rounded"
                            />
                            <span>{banner.active !== false ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Hidden)'}</span>
                          </label>
                        </div>

                        {heroBanners.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('আপনি কি এই ব্যানার স্লাইডটি মুছে ফেলতে চান?')) {
                                deleteHeroBanner(banner.id);
                              }
                            }}
                            disabled={!isSuperAdmin}
                            className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                            title="ব্যানার ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Title Bangla & English */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            ব্যানার শিরোনাম (বাংলা) *
                          </label>
                          <input
                            type="text"
                            value={banner.titleBn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, titleBn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Banner Title (English) *
                          </label>
                          <input
                            type="text"
                            value={banner.titleEn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, titleEn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold"
                          />
                        </div>
                      </div>

                      {/* Subtitle Bangla & English */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            ব্যানার সাব-টাইটেল / বিবরণ (বাংলা)
                          </label>
                          <input
                            type="text"
                            value={banner.subtitleBn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, subtitleBn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Banner Subtitle (English)
                          </label>
                          <input
                            type="text"
                            value={banner.subtitleEn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, subtitleEn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Badge & CTA Button */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            অফার ব্যাজ (Badge Text)
                          </label>
                          <input
                            type="text"
                            value={banner.badgeBn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, badgeBn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-amber-600 font-bold"
                            placeholder="⚡ মেগা অফার"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            অ্যাকশন বাটন টেক্সট (CTA)
                          </label>
                          <input
                            type="text"
                            value={banner.ctaBn}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, ctaBn: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold text-rose-600"
                            placeholder="অফার দেখুন"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            লিংক ক্যাটাগরি (Target Category)
                          </label>
                          <select
                            value={banner.category || 'deals-offers'}
                            disabled={!isSuperAdmin}
                            onChange={e => updateHeroBanner({ ...banner, category: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-semibold"
                          >
                            <option value="deals-offers">ধামাকা ডিল (Deals)</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} ({cat.nameBn})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Visibility Controls */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {t('হোমপেজ সেকশন অন/অফ কন্ট্রোল', 'Homepage Sections Display & Visibility')}
                </h3>
                <p className="text-gray-500 text-xs">হোমপেজে কোন কোন সেকশন দেখানো হবে বা বন্ধ থাকবে নির্ধারণ করুন</p>
              </div>
              <button
                onClick={showSaveSuccess}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{t('সেভ করুন', 'Save Sections')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'showHeroBanner', label: '১. হিরো ব্যানার স্লাইডার (Hero Banner)' },
                { key: 'showCategoryGrid', label: '২. ক্যাটাগরি বার ও আইকনস (Shop by Category)' },
                { key: 'showFlashSale', label: '৩. ফ্ল্যাশ সেল অফার (Flash Sale & Countdown)' },
                { key: 'showTrending', label: '৪. ট্রেন্ডিং কালেকশন (Trending Products)' },
                { key: 'showNewArrivals', label: '৫. নতুন আগমন (New Arrivals)' },
                { key: 'showBestSellers', label: '৬. বেস্ট সেলার পণ্য (Best Sellers)' },
                { key: 'showShopByBudget', label: '৭. বাজেট অনুযায়ী শপিং (Shop by Budget)' },
                { key: 'showShopByNeed', label: '৮. প্রয়োজন অনুযায়ী শপিং (Shop by Need)' },
                { key: 'showCompleteTheLook', label: '৯. কমপ্লিট দ্য লুক বান্ডেল (Complete the Look)' },
                { key: 'showReviews', label: '১০. গ্রাহক রিভিউ ও মতামত (Customer Reviews)' },
                { key: 'showTrustBadges', label: '১১. ট্রাস্ট ও সার্ভিস গ্যারান্টি (Trust Badges)' },
              ].map(item => (
                <div
                  key={item.key}
                  className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between"
                >
                  <span className="font-bold text-gray-800 text-xs">{item.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(homepageSections as any)[item.key]}
                      onChange={e => updateHomepageSections({ [item.key]: e.target.checked } as any)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-rose-600" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Return & Refund Policy */}
      {activeSettingsSection === 'policy' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('রিটার্ন, এক্সচেঞ্জ ও রিফান্ড নীতিমালা', 'Return & Refund Policy Settings')}
              </h3>
              <p className="text-gray-500 text-xs">গ্রাহকের জন্য রিটার্ন পলিসির সময়সীমা ও শর্তাবলী</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Policy')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">রিটার্নের সময়সীমা (দিন)</label>
              <input
                type="number"
                value={returnPolicySettings.allowedDays ?? 7}
                onChange={e => updateReturnPolicySettings({ allowedDays: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-800">ক্যাশ রিফান্ড সুবিধা সক্রিয়</span>
              <input
                type="checkbox"
                checked={Boolean(returnPolicySettings.allowRefund)}
                onChange={e => updateReturnPolicySettings({ allowRefund: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-gray-800">ফ্রি সাইজ এক্সচেঞ্জ সুবিধা সক্রিয়</span>
              <input
                type="checkbox"
                checked={Boolean(returnPolicySettings.allowExchange)}
                onChange={e => updateReturnPolicySettings({ allowExchange: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">পলিসি বিস্তারিত বিবরণ (বাংলা)</label>
            <textarea
              rows={3}
              value={returnPolicySettings.policyNotesBn || ''}
              onChange={e => updateReturnPolicySettings({ policyNotesBn: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
            />
          </div>
        </div>
      )}

      {/* 7. SEO & Social Meta */}
      {activeSettingsSection === 'seo' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('সার্চ ইঞ্জিন অপটিমাইজেশন (SEO) ও সোশ্যাল শেয়ার', 'SEO & Social OpenGraph Settings')}
              </h3>
              <p className="text-gray-500 text-xs">গুগল সার্চ ও ফেসবুক শেয়ারের মেটা টাইটেল ও বিবরণী</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save SEO')}</span>
            </button>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Meta Title (English & Bangla)</label>
            <input
              type="text"
              value={seoSettings.metaTitle || ''}
              onChange={e => updateSeoSettings({ metaTitle: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Meta Description</label>
            <textarea
              rows={3}
              value={seoSettings.metaDescription || ''}
              onChange={e => updateSeoSettings({ metaDescription: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Keywords (Comma separated)</label>
            <input
              type="text"
              value={seoSettings.metaKeywords || ''}
              onChange={e => updateSeoSettings({ metaKeywords: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* 8. Live Chat & Support */}
      {activeSettingsSection === 'livechat' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('লাইভ চ্যাট, মেসেঞ্জার, হোয়াটসঅ্যাপ ও কল সেটিংস', 'Live Chat, Messenger, WhatsApp & Call')}
              </h3>
              <p className="text-gray-500 text-xs">ভাসমান কন্টাক্ট উইজেট এবং গ্রাহক সহায়তা চ্যানেলের তথ্য এন্ট্রি করুন</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Live Chat')}</span>
            </button>
          </div>

          {/* Master Widget Toggle & Badge Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-200">
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
              <div>
                <span className="font-bold text-gray-900 block">ভাসমান কন্টাক্ট উইজেট (Floating Widget)</span>
                <span className="text-[10px] text-gray-500">স্ক্রিনের নিচে সরাসরি WhatsApp, Messenger, Call ও চ্যাট অপশন দেখাবে</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(liveChatSettings.enableFloatingButton)}
                onChange={e => updateLiveChatSettings({ enableFloatingButton: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <label className="block font-bold text-gray-900 mb-1">উইজেট কলআউট টেক্সট (Callout Tooltip)</label>
              <input
                type="text"
                value={liveChatSettings.widgetCalloutTextBn || ''}
                onChange={e => updateLiveChatSettings({ widgetCalloutTextBn: e.target.value })}
                placeholder="💬 সাহায্য প্রয়োজন? চ্যাট করুন"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Channel 1: WhatsApp */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-gray-900 text-sm">১. হোয়াটসঅ্যাপ সাপোর্ট চ্যানেল (WhatsApp)</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs font-bold text-emerald-800">
                  {liveChatSettings.enableDirectWhatsApp ? 'চালু' : 'বন্ধ'}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(liveChatSettings.enableDirectWhatsApp)}
                  onChange={e => updateLiveChatSettings({ enableDirectWhatsApp: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">হোয়াটসঅ্যাপ মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={liveChatSettings.whatsappNumber || ''}
                  onChange={e => updateLiveChatSettings({ whatsappNumber: e.target.value })}
                  placeholder="01712-345678"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">হোয়াটসঅ্যাপ প্রি-ফিল্ড মেসেজ টেমপ্লেট</label>
                <input
                  type="text"
                  value={liveChatSettings.whatsappMessageTemplate || ''}
                  onChange={e => updateLiveChatSettings({ whatsappMessageTemplate: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Channel 2: Facebook Messenger */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="font-bold text-gray-900 text-sm">২. ফেসবুক মেসেঞ্জার চ্যানেল (Messenger)</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs font-bold text-blue-800">
                  {liveChatSettings.enableMessenger ? 'চালু' : 'বন্ধ'}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(liveChatSettings.enableMessenger)}
                  onChange={e => updateLiveChatSettings({ enableMessenger: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                মেসেঞ্জার পেজ ইউজারনেম বা লিংক (Page Username / ID)
              </label>
              <input
                type="text"
                value={liveChatSettings.messengerPageUrlOrId || ''}
                onChange={e => updateLiveChatSettings({ messengerPageUrlOrId: e.target.value })}
                placeholder="jotpotshop.bd অথবা m.me/jotpotshop.bd"
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">গ্রাহক ক্লিক করলে সরাসরি m.me/{liveChatSettings.messengerPageUrlOrId || 'jotpotshop.bd'} ওপেন হবে</span>
            </div>
          </div>

          {/* Channel 3: Direct Call Hotline */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="font-bold text-gray-900 text-sm">৩. সরাসরি কল ও কাস্টমার হটলাইন (Direct Call)</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs font-bold text-amber-800">
                  {liveChatSettings.enableDirectCall ? 'চালু' : 'বন্ধ'}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(liveChatSettings.enableDirectCall)}
                  onChange={e => updateLiveChatSettings({ enableDirectCall: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </label>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">হটলাইন ফোন নম্বর</label>
              <input
                type="text"
                value={liveChatSettings.callHotlineNumber || ''}
                onChange={e => updateLiveChatSettings({ callHotlineNumber: e.target.value })}
                placeholder="01812-345678"
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
          </div>

          {/* Channel 4: Live Chat Box & Agent Profile */}
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h4 className="font-bold text-gray-900 text-sm">৪. ওয়েবসাইট লাইভ চ্যাট উইন্ডো (Live Chat Drawer)</h4>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <span className="text-xs font-bold text-rose-800">
                  {liveChatSettings.enableLiveChat ? 'চালু' : 'বন্ধ'}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(liveChatSettings.enableLiveChat)}
                  onChange={e => updateLiveChatSettings({ enableLiveChat: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">সাপোর্ট এজেন্টের নাম</label>
                <input
                  type="text"
                  value={liveChatSettings.agentName || ''}
                  onChange={e => updateLiveChatSettings({ agentName: e.target.value })}
                  placeholder="সুমাইয়া (সাপোর্ট স্পেশালিস্ট)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">এজেন্ট স্ট্যাটাস টেক্সট</label>
                <input
                  type="text"
                  value={liveChatSettings.agentStatusText || ''}
                  onChange={e => updateLiveChatSettings({ agentStatusText: e.target.value })}
                  placeholder="অনলাইন • সাধারণত ২ মিনিটে উত্তর দেয়"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            {/* Direct Agent Avatar File Upload (No URL) */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-700 mb-1">
                এজেন্ট প্রোফাইল ছবি আপলোড (Direct File Upload)
              </label>
              {liveChatSettings.agentAvatarUrl ? (
                <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <img
                    src={liveChatSettings.agentAvatarUrl}
                    alt="Agent Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-800 truncate">এজেন্ট ছবি যুক্ত করা হয়েছে</p>
                    <button
                      type="button"
                      onClick={() => updateLiveChatSettings({ agentAvatarUrl: '' })}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      ছবি মুছুন
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-xs font-bold text-gray-700">ডিভাইস থেকে এজেন্টের ছবি দিন</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP (সরাসরি আপলোড)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateLiveChatSettings({ agentAvatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">লাইভ চ্যাট প্রথম স্বাগতম বার্তা (Bangla Greeting)</label>
              <textarea
                rows={2}
                value={liveChatSettings.liveChatGreetingBn || ''}
                onChange={e => updateLiveChatSettings({ liveChatGreetingBn: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">সাপোর্ট সময়সূচি (Support Working Hours)</label>
              <input
                type="text"
                value={liveChatSettings.supportHours || ''}
                onChange={e => updateLiveChatSettings({ supportHours: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 9. Order & Notification Settings */}
      {activeSettingsSection === 'orders' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {t('অর্ডার প্রসেসিং ও নোটিফিকেশন রুলস', 'Order Rules & Alerts')}
              </h3>
              <p className="text-gray-500 text-xs">নতুন অর্ডার আসলে সাউন্ড এলার্ট, অটো কনফার্মেশন ও ন্যূনতম অর্ডার সীমা</p>
            </div>
            <button
              onClick={showSaveSuccess}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t('সেভ করুন', 'Save Order Rules')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 block">নতুন অর্ডারে রিয়েল-টাইম সাউন্ড অ্যালার্ট</span>
                <span className="text-[10px] text-gray-500">এডমিন ড্যাশবোর্ডে নতুন অর্ডারের সাথে সাথে বেল সাউন্ড বাজবে</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(orderSettings.enableSoundNotificationOnNewOrder)}
                onChange={e => updateOrderSettings({ enableSoundNotificationOnNewOrder: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 block">অনলাইন পেইড অর্ডারে অটো-কনফার্ম</span>
                <span className="text-[10px] text-gray-500">বিকাশ/কার্ডে সফল পেমেন্ট সম্পন্ন হলে স্বয়ংক্রিয় কনফার্ম হবে</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(orderSettings.autoConfirmOnlinePaid)}
                onChange={e => updateOrderSettings({ autoConfirmOnlinePaid: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ন্যূনতম অর্ডার মূল্য (৳ Minimum Order Value)</label>
              <input
                type="number"
                value={orderSettings.minOrderValue ?? 0}
                onChange={e => updateOrderSettings({ minOrderValue: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">গ্রাহক নিজে বাতিল করার সময়সীমা (মিনিট)</label>
              <input
                type="number"
                value={orderSettings.allowCustomerCancelWithinMinutes ?? 30}
                onChange={e => updateOrderSettings({ allowCustomerCancelWithinMinutes: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
