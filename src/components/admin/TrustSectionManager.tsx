import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Search,
  X,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Sliders,
  Layout,
  Layers,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { TrustSectionSettings, TrustFeatureItem } from '../../types';
import { TRUST_ICON_CATALOG, getTrustIconComponent } from '../../utils/trustIcons';
import { TrustSection } from '../TrustSection';

export const TrustSectionManager: React.FC = () => {
  const {
    trustSectionSettings,
    updateTrustSectionSettings,
    currentRole,
    adminUser,
    t,
  } = useShop();

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  // Local draft state for editing before saving
  const [draftSettings, setDraftSettings] = useState<TrustSectionSettings>(() => ({
    ...trustSectionSettings,
    features: [...(trustSectionSettings.features || [])],
  }));

  const [activeTab, setActiveTab] = useState<'features' | 'content' | 'appearance' | 'preview'>('features');
  const [featureSearch, setFeatureSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal state for Add / Edit Feature
  const [editingFeature, setEditingFeature] = useState<TrustFeatureItem | null>(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [iconPickerSearch, setIconPickerSearch] = useState('');

  // Delete confirmation
  const [featureToDelete, setFeatureToDelete] = useState<TrustFeatureItem | null>(null);

  // Live preview device switcher
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Filtered features
  const filteredFeatures = (draftSettings.features || [])
    .filter(f => {
      if (!featureSearch.trim()) return true;
      const q = featureSearch.toLowerCase();
      return (
        f.titleBn.toLowerCase().includes(q) ||
        f.titleEn.toLowerCase().includes(q) ||
        f.descBn.toLowerCase().includes(q) ||
        f.descEn.toLowerCase().includes(q) ||
        f.icon.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Save changes to Firestore
  const handleSaveToFirestore = async () => {
    if (!isSuperAdmin) {
      alert('শুধুমাত্র সুপার এডমিন নিশ্চিন্ত কেনাকাটা (Trust Section) কনফিগারেশন সেভ করতে পারেন।');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const result = await updateTrustSectionSettings(draftSettings);
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        setSaveStatus('error');
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err?.message || 'সেভ করার সময় ত্রুটি হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to currently saved version
  const handleResetToSaved = () => {
    if (window.confirm('আপনি কি ড্রাফট বাতিল করে সংরক্ষিত সংস্করণে ফিরে যেতে চান?')) {
      setDraftSettings({
        ...trustSectionSettings,
        features: [...(trustSectionSettings.features || [])],
      });
      setSaveStatus('idle');
    }
  };

  // Toggle Section Enabled
  const handleToggleSectionEnabled = () => {
    setDraftSettings(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled,
    }));
  };

  // Move Feature Up / Down
  const handleMoveOrder = (featureId: string, direction: 'up' | 'down') => {
    const sorted = [...draftSettings.features].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex(f => f.id === featureId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentItem = sorted[idx];
    const targetItem = sorted[targetIdx];

    // Swap order values
    const currentOrder = currentItem.order;
    currentItem.order = targetItem.order;
    targetItem.order = currentOrder;

    setDraftSettings(prev => ({
      ...prev,
      features: [...sorted],
    }));
  };

  // Toggle Feature active status
  const handleToggleFeatureActive = (featureId: string) => {
    setDraftSettings(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.id === featureId ? { ...f, isActive: !f.isActive } : f
      ),
    }));
  };

  // Open modal for new feature
  const handleOpenAddFeature = () => {
    const nextOrder = (draftSettings.features || []).length + 1;
    setEditingFeature({
      id: `trust-${Date.now()}`,
      icon: 'ShieldCheck',
      titleBn: '',
      titleEn: '',
      descBn: '',
      descEn: '',
      order: nextOrder,
      isActive: true,
    });
    setIconPickerSearch('');
    setIsFeatureModalOpen(true);
  };

  // Open modal for editing feature
  const handleOpenEditFeature = (feature: TrustFeatureItem) => {
    setEditingFeature({ ...feature });
    setIconPickerSearch('');
    setIsFeatureModalOpen(true);
  };

  // Save feature from modal into draft
  const handleSaveFeatureModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;

    if (!editingFeature.titleBn.trim() && !editingFeature.titleEn.trim()) {
      alert('অনুগ্রহ করে ফিচারের শিরোনাম (Title) পূরণ করুন।');
      return;
    }

    setDraftSettings(prev => {
      const exists = prev.features.some(f => f.id === editingFeature.id);
      let updatedFeatures: TrustFeatureItem[];
      if (exists) {
        updatedFeatures = prev.features.map(f =>
          f.id === editingFeature.id ? editingFeature : f
        );
      } else {
        updatedFeatures = [...prev.features, editingFeature];
      }
      return {
        ...prev,
        features: updatedFeatures,
      };
    });

    setIsFeatureModalOpen(false);
    setEditingFeature(null);
  };

  // Confirm delete feature
  const handleConfirmDeleteFeature = () => {
    if (!featureToDelete) return;
    setDraftSettings(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== featureToDelete.id),
    }));
    setFeatureToDelete(null);
  };

  // Theme Preset selector
  const applyThemePreset = (preset: 'white' | 'cream' | 'slate' | 'darkLuxury') => {
    switch (preset) {
      case 'white':
        setDraftSettings(prev => ({
          ...prev,
          bgColor: 'bg-white',
          textColor: 'text-gray-900',
          cardBgColor: 'bg-gray-50/70',
          accentColor: 'rose',
        }));
        break;
      case 'cream':
        setDraftSettings(prev => ({
          ...prev,
          bgColor: 'bg-amber-50/40',
          textColor: 'text-stone-900',
          cardBgColor: 'bg-white',
          accentColor: 'amber',
        }));
        break;
      case 'slate':
        setDraftSettings(prev => ({
          ...prev,
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          cardBgColor: 'bg-white',
          accentColor: 'blue',
        }));
        break;
      case 'darkLuxury':
        setDraftSettings(prev => ({
          ...prev,
          bgColor: 'bg-gray-950',
          textColor: 'text-white',
          cardBgColor: 'bg-gray-900/90',
          accentColor: 'rose',
        }));
        break;
    }
  };

  // Icons for modal icon picker
  const filteredIcons = TRUST_ICON_CATALOG.filter(opt => {
    if (!iconPickerSearch.trim()) return true;
    const q = iconPickerSearch.toLowerCase();
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.labelBn.toLowerCase().includes(q) ||
      opt.labelEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-xs text-gray-800">
      {/* Top Banner & Super Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-rose-950 text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 font-mono">
                SECTION MANAGEMENT • সেকশন কন্ট্রোল
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                নিশ্চিন্ত কেনাকাটা ও বিশ্বস্ত ডেলিভারি সেবা
              </h2>
            </div>
          </div>
          <p className="text-gray-300 text-xs max-w-2xl leading-relaxed">
            গ্রাহকের মূল হোমপেজে প্রদর্শিত ট্রাস্ট ব্যাজ, ডেলিভারি গ্যারান্টি, ক্যাশ অন ডেলিভারি, ৭ দিনের রিটার্ন পলিসি ও কাস্টমার কেয়ার নির্দেশনাসমূহ পরিবর্তন, যোগ ও সাজান।
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Visibility Switch */}
          <button
            onClick={handleToggleSectionEnabled}
            className={`px-3 py-2 rounded-xl font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
              draftSettings.isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title="হোমপেজে এই সেকশন দেখানো বা লুকানো"
          >
            {draftSettings.isEnabled ? (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>সেকশন চালু (Visible)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-rose-400" />
                <span>সেকশন বন্ধ (Hidden)</span>
              </>
            )}
          </button>

          {/* Reset to saved */}
          <button
            onClick={handleResetToSaved}
            className="px-3 py-2 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center space-x-1.5 cursor-pointer transition-colors"
            title="পরিবর্তন বাতিল করে পুনরায় লোড করুন"
          >
            <RotateCcw className="w-4 h-4" />
            <span>রিসেট</span>
          </button>

          {/* Save to Firestore */}
          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving || !isSuperAdmin}
            className={`px-4 py-2 rounded-xl font-black flex items-center space-x-2 shadow-md transition-all cursor-pointer ${
              isSaving
                ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                : !isSuperAdmin
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'সেভ হচ্ছে...' : 'সেভ ও পাবলিশ'}</span>
          </button>
        </div>
      </div>

      {/* Security notice if non-Super Admin */}
      {!isSuperAdmin && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs">সীমাবদ্ধ এক্সেস (Super Admin Restricted)</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              নিরাপত্তা নীতি অনুযায়ী শুধুমাত্র সুপার এডমিন ট্রাস্ট সেকশনের টেক্সট, আইকন ও ডাটা পরিবর্তন করে ক্লাউড ফায়ারবেসে পাবলিশ করতে পারেন।
            </p>
          </div>
        </div>
      )}

      {/* Success / Error Toast notification banner */}
      {saveStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2.5 text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold text-xs">
            ✓ "নিশ্চিন্ত কেনাকাটা" সেকশন সেটিংস ক্লাউড ফায়ারবেসে সফলভাবে সেভ হয়েছে এবং গ্রাহক সাইটে আপডেট হয়েছে!
          </span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2.5 text-rose-800 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-bold text-xs">
            ত্রুটি: {errorMessage || 'ক্লাউডে সেভ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট ও অনুমতি যাচাই করুন।'}
          </span>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-gray-200 space-x-1 sm:space-x-3 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2.5 font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
            activeTab === 'features'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ফিচার আইটেমসমূহ ({draftSettings.features?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
            activeTab === 'content'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>হেডিং, সাবটাইটেল ও ট্যাগ</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2.5 font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
            activeTab === 'appearance'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>কালার ও থিম প্রেফারেন্স</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
            activeTab === 'preview'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>লাইভ প্রিভিউ (Live Preview)</span>
        </button>
      </div>

      {/* TAB 1: FEATURES LIST & MANAGEMENT */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="ফিচার বা আইকন খুঁজুন..."
                value={featureSearch}
                onChange={e => setFeatureSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-rose-500"
              />
            </div>

            <button
              onClick={handleOpenAddFeature}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ফিচার যোগ করুন</span>
            </button>
          </div>

          {/* Features Table / List */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            {filteredFeatures.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">কোনো ফিচার আইটেম পাওয়া যায়নি</p>
                <p className="text-xs text-gray-400">নতুন ফিচার যোগ করতে উপরের বাটনে ক্লিক করুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredFeatures.map((feat, idx) => {
                  const IconComp = getTrustIconComponent(feat.icon);
                  const isFirst = idx === 0;
                  const isLast = idx === filteredFeatures.length - 1;

                  return (
                    <div
                      key={feat.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        !feat.isActive ? 'bg-gray-50/70 opacity-60' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                        {/* Icon Badge */}
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-xs">
                          <IconComp className="w-6 h-6" />
                        </div>

                        {/* Title and details */}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">
                              {feat.titleBn || feat.titleEn || '(নামবিহীন ফিচার)'}
                            </span>
                            {feat.titleEn && feat.titleBn && (
                              <span className="text-[11px] text-gray-400 font-normal">
                                ({feat.titleEn})
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-mono text-[10px]">
                              আইকন: {feat.icon}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-mono text-[10px]">
                              অর্ডার: #{feat.order}
                            </span>
                            {!feat.isActive && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                                নিষ্ক্রিয়
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-2">
                            {feat.descBn || feat.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                        {/* Reorder Up */}
                        <button
                          onClick={() => handleMoveOrder(feat.id, 'up')}
                          disabled={isFirst}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Reorder Down */}
                        <button
                          onClick={() => handleMoveOrder(feat.id, 'down')}
                          disabled={isLast}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggleFeatureActive(feat.id)}
                          className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                            feat.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={feat.isActive ? 'লুকান' : 'প্রকাশ করুন'}
                        >
                          {feat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditFeature(feat)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-rose-600 cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setFeatureToDelete(feat)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-rose-500 cursor-pointer"
                          title="মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT & HEADINGS */}
      {activeTab === 'content' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">সেকশন হেডলাইন ও টেক্সট কনফিগারেশন</h3>
            <p className="text-gray-500 text-xs">গ্রাহকের হোমপেজে প্রদর্শিত মূল শিরোনাম, সাবটাইটেল এবং ব্যাজ ট্যাগ সম্পাদনা করুন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tag / Badge Bangla */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                ট্যাগ / ব্যাজ (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draftSettings.tagBn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, tagBn: e.target.value }))}
                placeholder="যেমন: কেন ঝটপটশপ বেছে নেবেন?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-rose-500"
              />
            </div>

            {/* Tag / Badge English */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                ট্যাগ / ব্যাজ (English)
              </label>
              <input
                type="text"
                value={draftSettings.tagEn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, tagEn: e.target.value }))}
                placeholder="e.g. WHY CHOOSE JOTPOTSHOP?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-rose-500"
              />
            </div>

            {/* Main Heading Bangla */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                মূল শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={draftSettings.headingBn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, headingBn: e.target.value }))}
                placeholder="যেমন: নিশ্চিন্ত কেনাকাটা ও বিশ্বস্ত ডেলিভারি সেবা"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:outline-rose-500"
              />
            </div>

            {/* Main Heading English */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5">
                মূল শিরোনাম (English)
              </label>
              <input
                type="text"
                value={draftSettings.headingEn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, headingEn: e.target.value }))}
                placeholder="e.g. Trustworthy Shopping & Reliable Delivery"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:outline-rose-500"
              />
            </div>

            {/* Subtitle Bangla */}
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1.5">
                সাবটাইটেল বা বিবরণ (বাংলা)
              </label>
              <textarea
                rows={2}
                value={draftSettings.subheadingBn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, subheadingBn: e.target.value }))}
                placeholder="যেমন: গ্রাহকের সন্তুষ্টি ও মানসম্মত সেবাই আমাদের প্রধান অঙ্গীকার।"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-rose-500"
              />
            </div>

            {/* Subtitle English */}
            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1.5">
                সাবটাইটেল বা বিবরণ (English)
              </label>
              <textarea
                rows={2}
                value={draftSettings.subheadingEn || ''}
                onChange={e => setDraftSettings(prev => ({ ...prev, subheadingEn: e.target.value }))}
                placeholder="e.g. Customer satisfaction & authenticity are our top priorities."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPEARANCE & THEME */}
      {activeTab === 'appearance' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">রং, থিম ও ভিজ্যুয়াল স্টাইল</h3>
            <p className="text-gray-500 text-xs">আপনার ব্র্যান্ড আইডেন্টিটির সাথে মিল রেখে সেকশনের ব্যাকগ্রাউন্ড ও কালার প্যালেট নির্বাচন করুন।</p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">রেডিমেড থিম প্রিসেট (Quick Presets):</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => applyThemePreset('white')}
                className="p-3 rounded-2xl border-2 border-gray-200 hover:border-rose-500 text-left bg-white transition-all cursor-pointer shadow-xs"
              >
                <div className="w-full h-3 rounded-md bg-rose-500 mb-2" />
                <span className="font-bold text-xs block text-gray-900">ক্লাসিক হোয়াইট</span>
                <span className="text-[10px] text-gray-400">সাদা ব্যাকগ্রাউন্ড + রোজ অ্যাকসেন্ট</span>
              </button>

              <button
                type="button"
                onClick={() => applyThemePreset('cream')}
                className="p-3 rounded-2xl border-2 border-gray-200 hover:border-amber-500 text-left bg-amber-50/50 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-full h-3 rounded-md bg-amber-500 mb-2" />
                <span className="font-bold text-xs block text-stone-900">ওয়ার্ম ক্রিম</span>
                <span className="text-[10px] text-gray-400">নরম ক্রিম + অ্যাম্বার গোল্ড</span>
              </button>

              <button
                type="button"
                onClick={() => applyThemePreset('slate')}
                className="p-3 rounded-2xl border-2 border-gray-200 hover:border-blue-500 text-left bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-full h-3 rounded-md bg-blue-600 mb-2" />
                <span className="font-bold text-xs block text-slate-900">কুল স্লেট</span>
                <span className="text-[10px] text-gray-400">মডার্ন স্লেট + রয়্যাল ব্লু</span>
              </button>

              <button
                type="button"
                onClick={() => applyThemePreset('darkLuxury')}
                className="p-3 rounded-2xl border-2 border-gray-200 hover:border-rose-500 text-left bg-gray-950 text-white transition-all cursor-pointer shadow-xs"
              >
                <div className="w-full h-3 rounded-md bg-rose-600 mb-2" />
                <span className="font-bold text-xs block text-white">ডার্ক লাক্সারি</span>
                <span className="text-[10px] text-gray-400">ডিপ ব্ল্যাক + রুবি রেড</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
            {/* Accent Color */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                অ্যাকসেন্ট কালার (Accent Color):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { id: 'rose', label: 'রোজ (Rose)', class: 'bg-rose-500' },
                  { id: 'emerald', label: 'সবুজ (Emerald)', class: 'bg-emerald-500' },
                  { id: 'blue', label: 'নীল (Blue)', class: 'bg-blue-600' },
                  { id: 'indigo', label: 'ইন্ডিগো (Indigo)', class: 'bg-indigo-600' },
                  { id: 'amber', label: 'গোল্ড (Amber)', class: 'bg-amber-500' },
                  { id: 'purple', label: 'পার্পল (Purple)', class: 'bg-purple-600' },
                  { id: 'dark', label: 'ডার্ক (Dark)', class: 'bg-gray-900' },
                ].map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setDraftSettings(prev => ({ ...prev, accentColor: col.id }))}
                    className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                      draftSettings.accentColor === col.id
                        ? 'border-gray-900 bg-gray-100 font-bold'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${col.class} shrink-0`} />
                    <span className="text-[11px] truncate">{col.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                সেকশন ব্যাকগ্রাউন্ড (Background Color):
              </label>
              <select
                value={draftSettings.bgColor || 'bg-white'}
                onChange={e => setDraftSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
              >
                <option value="bg-white">হোয়াইট (Pure White)</option>
                <option value="bg-gray-50">সফট গ্রে (Soft Gray 50)</option>
                <option value="bg-slate-50">স্লেট হোয়াইট (Slate 50)</option>
                <option value="bg-rose-50/30">লাইট রোজ টিন্ট (Subtle Rose)</option>
                <option value="bg-amber-50/40">ওয়ার্ম ক্রিম (Warm Cream)</option>
                <option value="bg-gray-950">ডার্ক মোড (Dark Gray 950)</option>
              </select>

              <label className="block font-bold text-gray-700 mt-4 mb-2">
                ফিচার কার্ড ব্যাকগ্রাউন্ড (Card Background):
              </label>
              <select
                value={draftSettings.cardBgColor || 'bg-gray-50/70'}
                onChange={e => setDraftSettings(prev => ({ ...prev, cardBgColor: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-rose-500"
              >
                <option value="bg-gray-50/70">হালকা ছাই (Gray 50)</option>
                <option value="bg-white">সলিড হোয়াইট (Pure White)</option>
                <option value="bg-slate-50">স্লেট গ্রে (Slate 50)</option>
                <option value="bg-gray-900/90">ডার্ক কার্ড (Dark Gray 900)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE INTERACTIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">ইন্টারেক্টিভ লাইভ প্রিভিউ</h3>
              <p className="text-gray-500 text-xs">আপনার সম্পাদিত পরিবর্তনগুলো গ্রাহকের ডিভাইসে কেমন দেখাবে তা পরীক্ষা করুন।</p>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold cursor-pointer transition-colors ${
                  previewDevice === 'desktop' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">ডেস্কটপ</span>
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold cursor-pointer transition-colors ${
                  previewDevice === 'tablet' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="text-[11px]">ট্যাবলেট</span>
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold cursor-pointer transition-colors ${
                  previewDevice === 'mobile' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">মোবাইল</span>
              </button>
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="p-4 sm:p-6 bg-gray-100 rounded-3xl flex justify-center overflow-x-auto">
            <div
              className={`transition-all duration-300 ${
                previewDevice === 'desktop'
                  ? 'w-full'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] max-w-full'
                  : 'w-[375px] max-w-full'
              }`}
            >
              <div className="bg-white rounded-2xl shadow-md p-2">
                <TrustSection previewSettings={draftSettings} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Feature */}
      {isFeatureModalOpen && editingFeature && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-gray-900">
                  {editingFeature.id.startsWith('trust-') && draftSettings.features.some(f => f.id === editingFeature.id)
                    ? 'ফিচার সম্পাদনা (Edit Feature)'
                    : 'নতুন ফিচার যোগ করুন (Add Feature)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFeatureModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeatureModal} className="space-y-4">
              {/* Feature Title Bangla & English */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ফিচারের শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFeature.titleBn}
                    onChange={e => setEditingFeature({ ...editingFeature, titleBn: e.target.value })}
                    placeholder="যেমন: সারা দেশে ক্যাশ অন ডেলিভারি"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ফিচারের শিরোনাম (English)
                  </label>
                  <input
                    type="text"
                    value={editingFeature.titleEn}
                    onChange={e => setEditingFeature({ ...editingFeature, titleEn: e.target.value })}
                    placeholder="e.g. Cash on Delivery Nationwide"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold focus:outline-rose-500"
                  />
                </div>
              </div>

              {/* Description Bangla & English */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    বিস্তারিত বিবরণ (বাংলা) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingFeature.descBn}
                    onChange={e => setEditingFeature({ ...editingFeature, descBn: e.target.value })}
                    placeholder="যেমন: পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের ১০০% নিশ্চয়তা"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    বিস্তারিত বিবরণ (English)
                  </label>
                  <textarea
                    rows={2}
                    value={editingFeature.descEn}
                    onChange={e => setEditingFeature({ ...editingFeature, descEn: e.target.value })}
                    placeholder="e.g. Inspect your parcel before paying at your doorstep"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-rose-500"
                  />
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-700">
                    আইকন নির্বাচন (Select Icon):
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    নির্বাচিত: {editingFeature.icon}
                  </span>
                </div>

                {/* Icon Search */}
                <input
                  type="text"
                  placeholder="আইকন খুঁজুন (যেমন: Truck, Shield, Clock, Return...)"
                  value={iconPickerSearch}
                  onChange={e => setIconPickerSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs focus:outline-rose-500"
                />

                {/* Icon Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-100 rounded-2xl bg-gray-50">
                  {filteredIcons.map(opt => {
                    const IconItem = opt.icon;
                    const isSelected = editingFeature.icon === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setEditingFeature({ ...editingFeature, icon: opt.name })}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-400'
                        }`}
                        title={`${opt.name} - ${opt.labelBn}`}
                      >
                        <IconItem className="w-5 h-5 mb-1" />
                        <span className="text-[9px] truncate w-full text-center">
                          {opt.labelBn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    প্রদর্শনের ক্রম (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingFeature.order}
                    onChange={e => setEditingFeature({ ...editingFeature, order: Number(e.target.value) || 1 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featureActiveCheck"
                    checked={editingFeature.isActive}
                    onChange={e => setEditingFeature({ ...editingFeature, isActive: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 cursor-pointer"
                  />
                  <label htmlFor="featureActiveCheck" className="font-bold text-gray-700 cursor-pointer text-xs">
                    হোমপেজে সক্রিয় রাখুন
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFeatureModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {featureToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-gray-900">ফিচারটি ডিলিট করতে চান?</h4>
              <p className="text-gray-500 text-xs mt-1">
                "{featureToDelete.titleBn || featureToDelete.titleEn}" ফিচারটি ট্রাস্ট সেকশন থেকে স্থায়ীভাবে মুছে যাবে।
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFeatureToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold hover:bg-gray-100 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmDeleteFeature}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
