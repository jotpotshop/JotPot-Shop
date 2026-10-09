import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Search,
  Sparkles,
  Layers,
  Tag,
  Package,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { Category } from '../../types';
import { uploadCategoryIcon } from '../../lib/firebase';

const PRESET_EMOJIS = ['👨', '👩', '📱', '💍', '👟', '👜', '🕶️', '🏠', '💄', '🎁', '⚡', '👕', '👗', '🎮', '🎧', '⌚', '🧸', '📚'];

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products, t, language } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [catName, setCatName] = useState('');
  const [catNameBn, setCatNameBn] = useState('');
  const [catIcon, setCatIcon] = useState('🛍️');
  const [catSubcategories, setCatSubcategories] = useState('');
  const [catSubcategoriesBn, setCatSubcategoriesBn] = useState('');
  const [catBannerImage, setCatBannerImage] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickIconUploadRef = useRef<HTMLInputElement>(null);
  const [quickUploadTargetId, setQuickUploadTargetId] = useState<string | null>(null);

  const isImageIcon = (icon: string) => {
    return icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/') || icon.startsWith('/'));
  };

  const handleOpenAdd = () => {
    setCatName('');
    setCatNameBn('');
    setCatIcon('🛍️');
    setCatSubcategories('New Subcategory 1, New Subcategory 2');
    setCatSubcategoriesBn('সাবক্যাটাগরি ১, সাবক্যাটাগরি ২');
    setCatBannerImage('');
    setEditingCategory(null);
    setShowAddModal(true);
    setStatusMessage(null);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatNameBn(c.nameBn);
    setCatIcon(c.icon);
    setCatSubcategories(c.subcategories.join(', '));
    setCatSubcategoriesBn(c.subcategoriesBn?.join(', ') || '');
    setCatBannerImage(c.bannerImage || '');
    setShowAddModal(true);
    setStatusMessage(null);
  };

  // Handle Icon File Upload
  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isQuickUpload = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingIcon(true);
    try {
      const res = await uploadCategoryIcon(file, editingCategory?.id || 'new');
      if (isQuickUpload && quickUploadTargetId) {
        const target = categories.find(c => c.id === quickUploadTargetId);
        if (target) {
          updateCategory({ ...target, icon: res.downloadUrl });
          setStatusMessage({
            type: 'success',
            text: `"${target.name}" ক্যাটাগরি আইকন সফলভাবে আপলোড ও আপডেট হয়েছে!`,
          });
        }
      } else {
        setCatIcon(res.downloadUrl);
        setStatusMessage({
          type: 'success',
          text: `আইকন ইমেজ সফলভাবে তৈরি হয়েছে! (${file.name})`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'আইকন আপলোড ব্যর্থ হয়েছে।',
      });
    } finally {
      setIsUploadingIcon(false);
      setQuickUploadTargetId(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catNameBn.trim()) {
      setStatusMessage({ type: 'error', text: 'দয়া করে ইংরেজি ও বাংলা ক্যাটাগরি নাম লিখুন।' });
      return;
    }

    const subList = catSubcategories
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const subListBn = catSubcategoriesBn
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingCategory) {
      const updated: Category = {
        ...editingCategory,
        name: catName.trim(),
        nameBn: catNameBn.trim(),
        icon: catIcon,
        subcategories: subList.length > 0 ? subList : editingCategory.subcategories,
        subcategoriesBn: subListBn.length > 0 ? subListBn : (editingCategory.subcategoriesBn || subList),
        bannerImage: catBannerImage || editingCategory.bannerImage,
      };
      updateCategory(updated);
      setStatusMessage({ type: 'success', text: `"${updated.name}" ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!` });
      setShowAddModal(false);
    } else {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
      const newCat: Category = {
        id: slug,
        name: catName.trim(),
        nameBn: catNameBn.trim(),
        icon: catIcon || '🛍️',
        subcategories: subList.length > 0 ? subList : ['General'],
        subcategoriesBn: subListBn.length > 0 ? subListBn : ['সাধারণ'],
        bannerImage: catBannerImage || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      };
      addCategory(newCat);
      setStatusMessage({ type: 'success', text: `নতুন ক্যাটাগরি "${newCat.name}" সফলভাবে যুক্ত হয়েছে!` });
      setShowAddModal(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    deleteCategory(id);
    setDeletingCatId(null);
    setStatusMessage({ type: 'success', text: `ক্যাটাগরি "${cat.name}" মুছে ফেলা হয়েছে।` });
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.nameBn.includes(searchQuery) ||
    c.subcategories.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 text-xs">
      {/* Quick Hidden File Input for card-level instant upload */}
      <input
        ref={quickIconUploadRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
        onChange={e => handleIconFileUpload(e, true)}
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {t('ক্যাটাগরি ও আইকন ম্যানেজমেন্ট', 'Category & Icon Management')}
                </h3>
                <p className="text-gray-500 text-xs">
                  ক্যাটাগরি আইকন আপলোড, নাম ও সাব-ক্যাটাগরি ইডিট এবং ডিলিট নিয়ন্ত্রণ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ক্যাটাগরি খুঁজুন..."
                className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-48 focus:bg-white focus:border-rose-500 transition-colors"
              />
            </div>

            <button
              onClick={handleOpenAdd}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-600/20 transition-all text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('নতুন ক্যাটাগরি', 'Add Category')}</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-gray-700 cursor-pointer font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(c => {
            const hasImage = isImageIcon(c.icon);
            const productCount = products.filter(p => p.category === c.id || p.category === c.name).length;

            return (
              <div
                key={c.id}
                className="p-4 bg-gray-50/80 hover:bg-white rounded-2xl border border-gray-200 hover:border-rose-200 hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  {/* Category Top Row: Icon + Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Icon Display / Direct Upload Area */}
                      <div
                        onClick={() => {
                          setQuickUploadTargetId(c.id);
                          quickIconUploadRef.current?.click();
                        }}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-rose-500 hover:shadow-xs transition-all relative group/icon"
                        title="আইকন পরিবর্তন করতে ক্লিক করুন"
                      >
                        {hasImage ? (
                          <img src={c.icon} alt={c.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-2xl">{c.icon || '🛍️'}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover/icon:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                          <Upload className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-sm text-gray-900 truncate">{c.name}</span>
                          <span className="text-gray-400 text-[10px]">({c.nameBn})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold">
                            {c.id}
                          </span>
                          <span className="flex items-center space-x-1 font-semibold text-rose-600">
                            <Package className="w-3 h-3" />
                            <span>{productCount} টি পণ্য</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        title="ক্যাটাগরি ইডিট করুন"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingCatId(c.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="ক্যাটাগরি ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {c.subcategories.slice(0, 5).map(sub => (
                      <span
                        key={sub}
                        className="bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-gray-600"
                      >
                        {sub}
                      </span>
                    ))}
                    {c.subcategories.length > 5 && (
                      <span className="text-[10px] text-gray-400 px-1 py-0.5 font-bold">
                        +{c.subcategories.length - 5} আরও
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer: Quick Icon Upload Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                  <button
                    onClick={() => {
                      setQuickUploadTargetId(c.id);
                      quickIconUploadRef.current?.click();
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>আইকন আপলোড / পরিবর্তন</span>
                  </button>

                  <span className="text-gray-400">
                    {hasImage ? 'কাস্টম ইমেজ' : 'ইমোজি আইকন'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  {editingCategory ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
                <h4 className="font-extrabold text-base text-gray-900">
                  {editingCategory ? `ক্যাটাগরি ইডিট: ${editingCategory.name}` : 'নতুন ক্যাটাগরি যুক্ত করুন'}
                </h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Category Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Category Name (English) *
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={e => setCatName(e.target.value)}
                    required
                    placeholder="e.g. Men Fashion"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ক্যাটাগরি নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    value={catNameBn}
                    onChange={e => setCatNameBn(e.target.value)}
                    required
                    placeholder="যেমন: ছেলেদের ফ্যাশন"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category Icon Upload & Selection Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 text-xs">
                    ক্যাটাগরি আইকন (Category Icon)
                  </label>
                  <span className="text-[10px] text-gray-400">ইমেজ ফাইল আপলোড বা ইমোজি পছন্দ করুন</span>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Current Icon Preview */}
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {isImageIcon(catIcon) ? (
                      <img src={catIcon} alt="Icon Preview" className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-3xl">{catIcon || '🛍️'}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Hidden input for modal upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
                      onChange={e => handleIconFileUpload(e, false)}
                      className="hidden"
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingIcon}
                        className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 cursor-pointer text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isUploadingIcon ? 'আপলোড হচ্ছে...' : 'কাস্টম আইকন ইমেজ আপলোড (PNG/SVG)'}</span>
                      </button>

                      {isImageIcon(catIcon) && (
                        <button
                          type="button"
                          onClick={() => setCatIcon('🛍️')}
                          className="text-rose-600 text-[10px] font-bold hover:underline cursor-pointer"
                        >
                          রিমুভ আইকন
                        </button>
                      )}
                    </div>

                    {/* Or Manual Icon / URL */}
                    <input
                      type="text"
                      value={catIcon}
                      onChange={e => setCatIcon(e.target.value)}
                      placeholder="ইমোজি (👨) অথবা ইমেজ লিংক পেস্ট করুন"
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Preset Emoji Picker */}
                <div>
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">কুইক ইমোজি সিলেক্টর:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_EMOJIS.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCatIcon(em)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-base hover:bg-rose-100 cursor-pointer transition-colors ${
                          catIcon === em ? 'bg-rose-500 text-white' : 'bg-white border border-gray-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subcategories (English & Bengali) */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Subcategories (English - কমা দিয়ে লিখুন)
                  </label>
                  <input
                    type="text"
                    value={catSubcategories}
                    onChange={e => setCatSubcategories(e.target.value)}
                    placeholder="Shirts, T-Shirts, Panjabi, Pants"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-rose-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    সাব-ক্যাটাগরি তালিকা (বাংলা - কমা দিয়ে লিখুন)
                  </label>
                  <input
                    type="text"
                    value={catSubcategoriesBn}
                    onChange={e => setCatSubcategoriesBn(e.target.value)}
                    placeholder="শার্ট, টি-শার্ট, পাঞ্জাবি, প্যান্ট"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:border-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Direct Category Banner Image Upload (No URL) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs">
                  ক্যাটাগরি ব্যানার ছবি আপলোড (Direct File Upload)
                </label>
                {catBannerImage ? (
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <img
                      src={catBannerImage}
                      alt="Banner Preview"
                      className="w-16 h-10 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">ব্যানার ছবি যুক্ত হয়েছে</p>
                      <button
                        type="button"
                        onClick={() => setCatBannerImage('')}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold mt-0.5 cursor-pointer"
                      >
                        ছবি সরান বা পরিবর্তন করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-xs font-bold text-gray-700">ডিভাইস থেকে ব্যানার নির্বাচন করুন</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP (সরাসরি আপলোড)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCatBannerImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-md shadow-rose-600/20"
                >
                  {editingCategory ? 'পরিবর্তন সেভ করুন' : 'ক্যাটাগরি তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCatId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-gray-900">ক্যাটাগরি মুছে ফেলতে চান?</h4>
              <p className="text-gray-500 text-xs mt-1">
                এই ক্যাটাগরিটি ওয়েবসাইট এবং নেভিগেশন মেনু থেকে স্থায়ীভাবে মুছে যাবে।
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeletingCatId(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                না, ফিরে যান
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingCatId)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl cursor-pointer shadow-md shadow-rose-600/20"
              >
                হ্যাঁ, নিশ্চিত ডিলিট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
