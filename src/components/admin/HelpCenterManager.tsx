import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Phone,
  MessageCircle,
  MessageSquare,
  Clock,
  Mail,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
  Send,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import {
  HelpCenterSettings,
  HelpCenterFaqItem,
  HelpCenterArticle,
  HelpCenterFaqCategory,
} from '../../types';

export const HelpCenterManager: React.FC = () => {
  const {
    helpCenterSettings,
    updateHelpCenterSettings,
    currentRole,
    adminUser,
    t,
    language,
  } = useShop();

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  // Local draft state for editing before saving
  const [draftSettings, setDraftSettings] = useState<HelpCenterSettings>(() => ({
    ...helpCenterSettings,
    faqs: [...helpCenterSettings.faqs],
    supportArticles: [...helpCenterSettings.supportArticles],
  }));

  const [activeTab, setActiveTab] = useState<'general' | 'faqs' | 'articles' | 'buttons' | 'preview'>('faqs');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'all' | HelpCenterFaqCategory>('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // FAQ Modal state (Add / Edit)
  const [editingFaq, setEditingFaq] = useState<HelpCenterFaqItem | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Article Modal state (Add / Edit)
  const [editingArticle, setEditingArticle] = useState<HelpCenterArticle | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Preview interactive state
  const [previewFaqCategory, setPreviewFaqCategory] = useState<HelpCenterFaqCategory>('delivery');
  const [previewOpenIdx, setPreviewOpenIdx] = useState<string | null>(null);

  // Filtered FAQs for management table
  const filteredFaqs = draftSettings.faqs
    .filter(f => (faqCategoryFilter === 'all' ? true : f.category === faqCategoryFilter))
    .filter(f => {
      if (!faqSearch.trim()) return true;
      const q = faqSearch.toLowerCase();
      return (
        f.question.toLowerCase().includes(q) ||
        f.questionBn.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.answerBn.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.order - b.order);

  // Save changes to Firebase Firestore
  const handleSaveToFirestore = async () => {
    if (!isSuperAdmin) {
      alert('শুধুমাত্র সুপার এডমিন হেল্প সেন্টার সেটিংস ও প্রশ্নোত্তর পাবলিশ করতে পারেন।');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const res = await updateHelpCenterSettings(draftSettings);
      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3500);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset draft to current saved settings
  const handleResetDraft = () => {
    if (window.confirm('সকল ড্রাফট পরিবর্তন বাতিল করে পূর্বের সংরক্ষিত অবস্থায় ফিরে যেতে চান?')) {
      setDraftSettings({
        ...helpCenterSettings,
        faqs: [...helpCenterSettings.faqs],
        supportArticles: [...helpCenterSettings.supportArticles],
      });
    }
  };

  // FAQ CRUD handlers
  const handleOpenAddFaq = () => {
    const nextOrder = draftSettings.faqs.length + 1;
    setEditingFaq({
      id: `faq-${Date.now()}`,
      category: 'delivery',
      categoryBn: 'ডেলিভারি',
      question: '',
      questionBn: '',
      answer: '',
      answerBn: '',
      isPublished: true,
      order: nextOrder,
    });
    setIsFaqModalOpen(true);
  };

  const handleSaveFaqModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.questionBn.trim() || !editingFaq.answerBn.trim()) {
      alert('অনুগ্রহ করে প্রশ্ন ও উত্তর সঠিকভাবে লিখুন।');
      return;
    }

    const catBnMap: Record<HelpCenterFaqCategory, string> = {
      delivery: 'ডেলিভারি',
      order: 'অর্ডার',
      payment: 'পেমেন্ট',
      return: 'রিটার্ন ও এক্সচেঞ্জ',
      general: 'সাধারণ',
    };

    const finalFaq: HelpCenterFaqItem = {
      ...editingFaq,
      categoryBn: catBnMap[editingFaq.category] || 'সাধারণ',
      question: editingFaq.question.trim() || editingFaq.questionBn.trim(),
      answer: editingFaq.answer.trim() || editingFaq.answerBn.trim(),
    };

    setDraftSettings(prev => {
      const exists = prev.faqs.some(f => f.id === finalFaq.id);
      const nextFaqs = exists
        ? prev.faqs.map(f => (f.id === finalFaq.id ? finalFaq : f))
        : [...prev.faqs, finalFaq];
      return { ...prev, faqs: nextFaqs };
    });

    setIsFaqModalOpen(false);
    setEditingFaq(null);
  };

  const handleToggleFaqPublish = (id: string) => {
    setDraftSettings(prev => ({
      ...prev,
      faqs: prev.faqs.map(f => (f.id === id ? { ...f, isPublished: !f.isPublished } : f)),
    }));
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('আপনি কি এই প্রশ্নোত্তরটি মুছে ফেলতে চান?')) {
      setDraftSettings(prev => ({
        ...prev,
        faqs: prev.faqs.filter(f => f.id !== id),
      }));
    }
  };

  const handleMoveFaqOrder = (id: string, direction: 'up' | 'down') => {
    setDraftSettings(prev => {
      const list = [...prev.faqs].sort((a, b) => a.order - b.order);
      const index = list.findIndex(f => f.id === id);
      if (index < 0) return prev;

      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;

      const tempOrder = list[index].order;
      list[index].order = list[targetIdx].order;
      list[targetIdx].order = tempOrder;

      return { ...prev, faqs: list };
    });
  };

  // Article CRUD handlers
  const handleOpenAddArticle = () => {
    const nextOrder = draftSettings.supportArticles.length + 1;
    setEditingArticle({
      id: `art-${Date.now()}`,
      category: 'order',
      title: '',
      titleBn: '',
      content: '',
      contentBn: '',
      isPublished: true,
      order: nextOrder,
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.titleBn.trim() || !editingArticle.contentBn.trim()) {
      alert('অনুগ্রহ করে আর্টিকেলের শিরোনাম ও বিস্তারিত লিখুন।');
      return;
    }

    const finalArt: HelpCenterArticle = {
      ...editingArticle,
      title: editingArticle.title.trim() || editingArticle.titleBn.trim(),
      content: editingArticle.content.trim() || editingArticle.contentBn.trim(),
    };

    setDraftSettings(prev => {
      const exists = prev.supportArticles.some(a => a.id === finalArt.id);
      const nextArts = exists
        ? prev.supportArticles.map(a => (a.id === finalArt.id ? finalArt : a))
        : [...prev.supportArticles, finalArt];
      return { ...prev, supportArticles: nextArts };
    });

    setIsArticleModalOpen(false);
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('আপনি কি এই সাপোর্ট আর্টিকেলটি মুছে ফেলতে চান?')) {
      setDraftSettings(prev => ({
        ...prev,
        supportArticles: prev.supportArticles.filter(a => a.id !== id),
      }));
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-rose-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-rose-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Super Admin Exclusive</span>
              </span>
              <span className="text-xs text-rose-300">•</span>
              <span className="text-xs text-rose-200 font-mono">
                ফায়ারবেস ক্লাউড স্টোরেজ: <strong className="text-white">settings/help_center</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              <span>{t('কাস্টমার সাপোর্ট ও হেল্প সেন্টার কন্ট্রোল', 'Customer Support & Help Center Control')}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              সুপার এডমিন হিসেবে গ্রাহক সহায়তা পৃষ্ঠার সকল শিরোনাম, প্রশ্নোত্তর (FAQ), হেল্প আর্টিকেল, সাপোর্ট নম্বর ও কন্টাক্ট চ্যানেল বাটন সরাসরি কনফিগার করুন।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDraft}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>রিসেট</span>
            </button>

            <button
              type="button"
              disabled={isSaving || !isSuperAdmin}
              onClick={handleSaveToFirestore}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg hover:shadow-rose-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ক্লাউডে সেভ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t('ক্লাউডে পাবলিশ ও সেভ করুন', 'Save & Publish to Cloud')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveStatus === 'success' && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>সফলভাবে ফায়ারবেস ক্লাউডে হেল্প সেন্টার ডেটা সেভ ও পাবলিশ সম্পন্ন হয়েছে!</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট বা ফায়ারবেস পারমিশন চেক করুন।</span>
          </div>
        )}

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1.5 mt-5 overflow-x-auto pb-1 text-xs font-bold border-t border-white/10 pt-4 scrollbar-none">
          {[
            { key: 'faqs', label: 'প্রশ্নোত্তর (FAQs)', count: draftSettings.faqs.length, icon: HelpCircle },
            { key: 'general', label: 'সাধারণ ও সাপোর্ট কন্টাক্ট', icon: Phone },
            { key: 'articles', label: 'সাপোর্ট নির্দেশিকা ও আর্টিকেল', count: draftSettings.supportArticles.length, icon: BookOpen },
            { key: 'buttons', label: 'কন্টাক্ট বাটন কনফিগ', icon: MessageCircle },
            { key: 'preview', label: 'লাইভ প্রিভিউ (Customer Preview)', icon: Eye },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                  isActive
                    ? 'bg-white text-gray-950 font-black shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-white/70'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-rose-100 text-rose-800' : 'bg-white/20 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: FAQ MANAGEMENT */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {t('প্রশ্নোত্তর তালিকা ও ক্যাটাগরি নিয়ন্ত্রণ', 'Frequently Asked Questions (FAQ)')}
              </h3>
              <p className="text-xs text-gray-500">
                নতুন FAQ যোগ করুন, এডিট করুন, ড্রাফট বা পাবলিশ টগল করুন এবং ক্যাটাগরি অনুযায়ী সাজান।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddFaq}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন FAQ যোগ করুন', 'Add New FAQ')}</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-bold">
              {[
                { key: 'all', label: 'সকল ক্যাটাগরি' },
                { key: 'delivery', label: 'ডেলিভারি (Delivery)' },
                { key: 'order', label: 'অর্ডার (Order)' },
                { key: 'payment', label: 'পেমেন্ট (Payment)' },
                { key: 'return', label: 'রিটার্ন (Return)' },
                { key: 'general', label: 'সাধারণ (General)' },
              ].map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFaqCategoryFilter(cat.key as any)}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-colors whitespace-nowrap ${
                    faqCategoryFilter === cat.key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={faqSearch}
                onChange={e => setFaqSearch(e.target.value)}
                placeholder="প্রশ্ন বা উত্তর দিয়ে খুঁজুন..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">কোনো FAQ পাওয়া যায়নি</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                উপরে "+ নতুন FAQ যোগ করুন" বাটনে ক্লিক করে সরাসরি প্রথম প্রশ্নোত্তরটি যুক্ত করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  className={`border rounded-2xl p-4 transition-all ${
                    faq.isPublished
                      ? 'border-gray-200 bg-white hover:border-gray-300'
                      : 'border-dashed border-amber-300 bg-amber-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          #{faq.order} • {faq.categoryBn || faq.category}
                        </span>
                        {faq.isPublished ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>প্রকাশিত (Live)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            ড্রাফট (অপ্রকাশিত)
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 leading-snug">
                        {faq.questionBn}
                      </h4>
                      {faq.question && faq.question !== faq.questionBn && (
                        <p className="text-xs text-gray-400 italic">{faq.question}</p>
                      )}

                      <p className="text-xs text-gray-600 leading-relaxed pt-1 whitespace-pre-line">
                        {faq.answerBn}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-start">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => handleMoveFaqOrder(faq.id, 'up')}
                        disabled={idx === 0}
                        title="উপরে নিন"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => handleMoveFaqOrder(faq.id, 'down')}
                        disabled={idx === filteredFaqs.length - 1}
                        title="নিচে নিন"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Publish */}
                      <button
                        type="button"
                        onClick={() => handleToggleFaqPublish(faq.id)}
                        title={faq.isPublished ? 'আনপাবলিশ করুন' : 'পাবলিশ করুন'}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          faq.isPublished
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {faq.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFaq({ ...faq });
                          setIsFaqModalOpen(true);
                        }}
                        title="এডিট করুন"
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GENERAL & CONTACT SETTINGS */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              {t('সাধারণ তথ্য ও সরাসরি কন্টাক্ট চ্যানেল', 'General Info & Support Contacts')}
            </h3>
            <p className="text-xs text-gray-500">
              হেল্প সেন্টারের মূল টাইটেল, সাবটাইটেল, সাপোর্ট ইমেইল, হটলাইন ও সাপোর্ট সময়সূচি নির্ধারণ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                হেল্প সেন্টার শিরোনাম (বাংলা) *
              </label>
              <input
                type="text"
                value={draftSettings.titleBn}
                onChange={e => setDraftSettings({ ...draftSettings, titleBn: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Help Center Title (English) *
              </label>
              <input
                type="text"
                value={draftSettings.title}
                onChange={e => setDraftSettings({ ...draftSettings, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                সাবটাইটেল / বিবরণ (বাংলা)
              </label>
              <input
                type="text"
                value={draftSettings.subtitleBn}
                onChange={e => setDraftSettings({ ...draftSettings, subtitleBn: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Subtitle / Description (English)
              </label>
              <input
                type="text"
                value={draftSettings.subtitle}
                onChange={e => setDraftSettings({ ...draftSettings, subtitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>সাপোর্ট হটলাইন / ফোন নম্বর *</span>
              </label>
              <input
                type="text"
                value={draftSettings.supportPhone}
                onChange={e => setDraftSettings({ ...draftSettings, supportPhone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>সাপোর্ট ইমেইল এড্রেস *</span>
              </label>
              <input
                type="email"
                value={draftSettings.supportEmail}
                onChange={e => setDraftSettings({ ...draftSettings, supportEmail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>সাপোর্ট সময়সূচি (Business Hours)</span>
              </label>
              <input
                type="text"
                value={draftSettings.businessHoursBn}
                onChange={e => setDraftSettings({ ...draftSettings, businessHoursBn: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              ওয়েলকাম মেসেজ / গ্রিটিংস (বাংলা)
            </label>
            <textarea
              rows={2}
              value={draftSettings.welcomeMessageBn}
              onChange={e => setDraftSettings({ ...draftSettings, welcomeMessageBn: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:border-rose-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORT ARTICLES & GUIDES */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {t('সাপোর্ট নির্দেশিকা ও পলিসি আর্টিকেল', 'Support Guides & Policy Articles')}
              </h3>
              <p className="text-xs text-gray-500">
                অর্ডার পদ্ধতি, ডেলিভারি নিয়ম ও রিটার্ন/রিপ্লেসমেন্ট বিস্তারিত গাইড তৈরি ও আপডেট করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddArticle}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন আর্টিকেল তৈরি', 'Add New Article')}</span>
            </button>
          </div>

          {draftSettings.supportArticles.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl space-y-2">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">কোনো আর্টিকেল যোগ করা হয়নি</p>
              <p className="text-xs text-gray-400">উপরে বাটনে ক্লিক করে নির্দেশিকা যুক্ত করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftSettings.supportArticles.map(art => (
                <div key={art.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                      {art.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingArticle({ ...art });
                          setIsArticleModalOpen(true);
                        }}
                        className="p-1 rounded-md text-gray-500 hover:text-gray-900 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1 rounded-md text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-gray-900">{art.titleBn}</h4>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {art.contentBn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTACT BUTTONS CONFIGURATION */}
      {activeTab === 'buttons' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-5 text-xs">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              {t('সরাসরি কন্টাক্ট বাটন ভিজিবিলিটি ও অর্ডার', 'Floating & Direct Contact Buttons')}
            </h3>
            <p className="text-xs text-gray-500">
              হোয়াটসঅ্যাপ, মেসেঞ্জার, লাইভ চ্যাট ও ডিরেক্ট কল বাটনের সক্রিয়তা ও নম্বর/লিংক সমন্বয় করুন।
            </p>
          </div>

          <div className="space-y-4">
            {/* WhatsApp Config */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">হোয়াটসঅ্যাপ (WhatsApp Direct)</h4>
                  <p className="text-[11px] text-gray-500">সরাসরি হোয়াটসঅ্যাপে চ্যাট করার বাটন</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="8801XXXXXXXXX"
                  value={draftSettings.contactButtons.whatsapp.number}
                  onChange={e =>
                    setDraftSettings({
                      ...draftSettings,
                      contactButtons: {
                        ...draftSettings.contactButtons,
                        whatsapp: {
                          ...draftSettings.contactButtons.whatsapp,
                          number: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono w-44"
                />

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={draftSettings.contactButtons.whatsapp.enabled}
                    onChange={e =>
                      setDraftSettings({
                        ...draftSettings,
                        contactButtons: {
                          ...draftSettings.contactButtons,
                          whatsapp: {
                            ...draftSettings.contactButtons.whatsapp,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>সক্রিয় রাখুন</span>
                </label>
              </div>
            </div>

            {/* Messenger Config */}
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">ফেসবুক মেসেঞ্জার (Messenger Direct)</h4>
                  <p className="text-[11px] text-gray-500">পেজ ইউজারনেম বা m.me লিংক</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="jotpotshop.bd"
                  value={draftSettings.contactButtons.messenger.urlOrId}
                  onChange={e =>
                    setDraftSettings({
                      ...draftSettings,
                      contactButtons: {
                        ...draftSettings.contactButtons,
                        messenger: {
                          ...draftSettings.contactButtons.messenger,
                          urlOrId: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono w-44"
                />

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={draftSettings.contactButtons.messenger.enabled}
                    onChange={e =>
                      setDraftSettings({
                        ...draftSettings,
                        contactButtons: {
                          ...draftSettings.contactButtons,
                          messenger: {
                            ...draftSettings.contactButtons.messenger,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>সক্রিয় রাখুন</span>
                </label>
              </div>
            </div>

            {/* Live Chat Config */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">ওয়েবসাইট লাইভ চ্যাট (Instant Live Chat)</h4>
                  <p className="text-[11px] text-gray-500">স্টোরে সরাসরি ফ্লটিং লাইভ চ্যাট উইন্ডো</p>
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={draftSettings.contactButtons.liveChat.enabled}
                  onChange={e =>
                    setDraftSettings({
                      ...draftSettings,
                      contactButtons: {
                        ...draftSettings.contactButtons,
                        liveChat: {
                          ...draftSettings.contactButtons.liveChat,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>সক্রিয় রাখুন</span>
              </label>
            </div>

            {/* Direct Call Config */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">সরাসরি ফোন কল (Direct Call Hotline)</h4>
                  <p className="text-[11px] text-gray-500">ওয়ান-ট্যাপ জরুরি ফোন কল বাটন</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="01800568768"
                  value={draftSettings.contactButtons.directCall.phone}
                  onChange={e =>
                    setDraftSettings({
                      ...draftSettings,
                      contactButtons: {
                        ...draftSettings.contactButtons,
                        directCall: {
                          ...draftSettings.contactButtons.directCall,
                          phone: e.target.value,
                        },
                      },
                    })
                  }
                  className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-mono w-44"
                />

                <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={draftSettings.contactButtons.directCall.enabled}
                    onChange={e =>
                      setDraftSettings({
                        ...draftSettings,
                        contactButtons: {
                          ...draftSettings.contactButtons,
                          directCall: {
                            ...draftSettings.contactButtons.directCall,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>সক্রিয় রাখুন</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE CUSTOMER PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
              <h3 className="text-base font-extrabold text-gray-900 mt-1">
                গ্রাহক ভিউ প্রিভিউ (Live Help Center Preview)
              </h3>
            </div>
          </div>

          {/* Render customer support modal preview */}
          <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white max-w-3xl mx-auto">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">{draftSettings.titleBn}</h4>
                  <p className="text-xs text-gray-300">{draftSettings.subtitleBn}</p>
                </div>
              </div>
            </div>

            {/* Quick Contacts Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {draftSettings.contactButtons.directCall.enabled && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">DIRECT CALL</span>
                    <strong className="text-xs text-gray-900">{draftSettings.supportPhone}</strong>
                  </div>
                </div>
              )}

              {draftSettings.contactButtons.whatsapp.enabled && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">WHATSAPP</span>
                    <strong className="text-xs text-emerald-700">+{draftSettings.contactButtons.whatsapp.number}</strong>
                  </div>
                </div>
              )}

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold block uppercase">HOURS</span>
                  <strong className="text-xs text-gray-900">{draftSettings.businessHoursBn}</strong>
                </div>
              </div>
            </div>

            {/* Preview FAQs */}
            <div className="p-6 space-y-4 text-xs">
              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                {(['delivery', 'order', 'payment', 'return'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPreviewFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                      previewFaqCategory === cat
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Accordion List */}
              <div className="space-y-2">
                {draftSettings.faqs
                  .filter(f => f.category === previewFaqCategory && f.isPublished)
                  .map(faq => {
                    const isOpen = previewOpenIdx === faq.id;
                    return (
                      <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white text-xs">
                        <button
                          onClick={() => setPreviewOpenIdx(isOpen ? null : faq.id)}
                          className="w-full text-left p-3 font-bold text-gray-900 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                        >
                          <span>{faq.questionBn}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </button>
                        {isOpen && (
                          <div className="p-3 bg-gray-50/60 text-gray-600 border-t border-gray-100 leading-relaxed whitespace-pre-line">
                            {faq.answerBn}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FAQ */}
      {isFaqModalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingFaq.id.startsWith('faq-') && draftSettings.faqs.some(f => f.id === editingFaq.id)
                  ? 'FAQ সম্পাদনা করুন (Edit FAQ)'
                  : 'নতুন FAQ তৈরি করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaqModal} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={editingFaq.category}
                    onChange={e =>
                      setEditingFaq({ ...editingFaq, category: e.target.value as HelpCenterFaqCategory })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="delivery">ডেলিভারি (Delivery)</option>
                    <option value="order">অর্ডার (Order)</option>
                    <option value="payment">পেমেন্ট (Payment)</option>
                    <option value="return">রিটার্ন (Return)</option>
                    <option value="general">সাধারণ (General)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রদর্শন ক্রম (Order Number)</label>
                  <input
                    type="number"
                    value={editingFaq.order}
                    onChange={e => setEditingFaq({ ...editingFaq, order: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">প্রশ্ন (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ডেলিভারি চার্জ কত?"
                  value={editingFaq.questionBn}
                  onChange={e => setEditingFaq({ ...editingFaq, questionBn: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Question (English)</label>
                <input
                  type="text"
                  placeholder="e.g. How much is the delivery charge?"
                  value={editingFaq.question}
                  onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">উত্তর (বাংলায়) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="বিস্তারিত উত্তর লিখুন..."
                  value={editingFaq.answerBn}
                  onChange={e => setEditingFaq({ ...editingFaq, answerBn: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Answer (English)</label>
                <textarea
                  rows={2}
                  placeholder="Answer in English..."
                  value={editingFaq.answer}
                  onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="faqPublished"
                  checked={editingFaq.isPublished}
                  onChange={e => setEditingFaq({ ...editingFaq, isPublished: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="faqPublished" className="font-bold text-gray-800 cursor-pointer">
                  তাত্ক্ষণিক ওয়েবসাইটে প্রকাশ করুন (Publish Live)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
              >
                FAQ সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ARTICLE */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingArticle.titleBn ? 'আর্টিকেল সম্পাদনা' : 'নতুন সাপোর্ট নির্দেশিকা'}
              </h3>
              <button
                type="button"
                onClick={() => setIsArticleModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticleModal} className="space-y-3.5">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={editingArticle.category}
                  onChange={e =>
                    setEditingArticle({ ...editingArticle, category: e.target.value as any })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                >
                  <option value="order">অর্ডার সহায়িকা (Order Guide)</option>
                  <option value="delivery">ডেলিভারি পলিসি (Delivery)</option>
                  <option value="return">রিটার্ন ও রিপ্লেসমেন্ট (Return)</option>
                  <option value="general">সাধারণ নির্দেশিকা (General)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শিরোনাম (বাংলায়) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ৭ দিনের সহজ রিটার্ন পলিসি"
                  value={editingArticle.titleBn}
                  onChange={e => setEditingArticle({ ...editingArticle, titleBn: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বিস্তারিত নির্দেশিকা (বাংলায়) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="বিস্তারিত নির্দেশিকা লিখুন..."
                  value={editingArticle.contentBn}
                  onChange={e => setEditingArticle({ ...editingArticle, contentBn: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
              >
                আর্টিকেল সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
