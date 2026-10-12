import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  Package,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Edit3,
  Percent,
  Check,
  Sliders,
} from 'lucide-react';
import { Product, NeedTag } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { OCCASIONS_LIST, detectProductOccasions } from '../../data/occasionsData';

// -------------------------------------------------------------
// 1. PRODUCT EDIT MODAL
// -------------------------------------------------------------
interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('men-fashion');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [colors, setColors] = useState('');
  const [sizes, setSizes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [needTags, setNeedTags] = useState<NeedTag[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setNameBn(product.nameBn || '');
      setCategory(product.category || 'men-fashion');
      setSubcategory(product.subcategory || '');
      setBrand(product.brand || 'JotPot Brand');
      setSku(product.sku || '');
      setPrice(product.price || 0);
      setOldPrice(product.oldPrice || 0);
      setCostPrice(product.costPrice || 0);
      setStock(product.stock || 0);
      setLowStockThreshold(product.lowStockThreshold || 5);
      setColors(product.colors ? product.colors.join(', ') : '');
      setSizes(product.sizes ? product.sizes.join(', ') : '');
      setImageUrl(product.images?.[0] || '');
      setDescription(product.description || '');
      setDescriptionBn(product.descriptionBn || '');
      setIsFlashSale(Boolean(product.isFlashSale));
      setIsBestSeller(Boolean(product.isBestSeller));
      setIsTrending(Boolean(product.isTrending));
      setNeedTags(
        product.needTags && product.needTags.length > 0
          ? product.needTags
          : detectProductOccasions(product)
      );
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const discountP =
      oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0;

    const catObj = CATEGORIES.find(c => c.id === category);

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      category,
      categoryBn: catObj?.nameBn || product.categoryBn || 'ফ্যাশন',
      subcategory: subcategory.trim() || product.subcategory,
      subcategoryBn: subcategory.trim() || product.subcategoryBn,
      brand: brand.trim() || product.brand,
      sku: sku.trim() || product.sku,
      price: Number(price),
      oldPrice: Number(oldPrice),
      discountPercent: discountP,
      costPrice: Number(costPrice),
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      colors: colors
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      sizes: sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      images: imageUrl ? [imageUrl, ...(product.images?.slice(1) || [])] : product.images,
      description: description.trim(),
      descriptionBn: descriptionBn.trim() || description.trim(),
      isFlashSale,
      isBestSeller,
      isTrending,
      needTags:
        needTags.length > 0
          ? needTags
          : detectProductOccasions({ name, nameBn, category, subcategory, description }),
    };

    onSave(updatedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                পণ্য সম্পাদনা (Edit Product)
              </h3>
              <p className="text-[10px] text-gray-300 font-mono">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Title Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="e.g. Premium Cotton Casual Shirt"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পণ্যের নাম (বাংলা) *
              </label>
              <input
                type="text"
                value={nameBn}
                onChange={e => setNameBn(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="যেমন: প্রিমিয়াম কটন ক্যাজুয়াল শার্ট"
              />
            </div>
          </div>

          {/* Category, Subcategory, Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">ক্যাটাগরি</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">সাবক্যাটাগরি</label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs transition-colors"
                placeholder="e.g. Shirts, Pants"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">SKU কোড</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold transition-colors"
              />
            </div>
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                বিক্রয় মূল্য (৳) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-rose-600 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                পূর্বের মূল্য (৳)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={e => setOldPrice(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs text-gray-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                ক্রয় খরচ (৳)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs text-gray-700 transition-colors"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                বর্তমান স্টক (pcs) *
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Image Upload & Preview */}
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <label className="block font-bold text-gray-800">
              পণ্যের ছবি পরিবর্তন (Image Upload / URL)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {imageUrl && (
                <div className="relative group shrink-0">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="w-20 h-20 object-cover rounded-2xl border border-gray-200 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 cursor-pointer"
                    title="ছবি মুছুন"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 hover:bg-rose-50/20 rounded-2xl p-3 flex items-center justify-center space-x-2 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold text-gray-700">
                    {isUploading ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে নতুন ছবি আপলোড করুন'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                </label>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="অথবা সরাসরি ইমেজ লিংক (https://...)"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block font-bold text-gray-800 mb-1">বিবরণ (বাংলা)</label>
              <textarea
                rows={3}
                value={descriptionBn}
                onChange={e => setDescriptionBn(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs"
                placeholder="পণ্যের বিস্তারিত বৈশিষ্ট্য..."
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">Description (English)</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-rose-500 focus:bg-white rounded-xl p-2.5 text-xs"
                placeholder="Product highlights and details..."
              />
            </div>
          </div>

          {/* Variants & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">রং / Colors (কমা দিয়ে)</label>
              <input
                type="text"
                value={colors}
                onChange={e => setColors(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="Black, White, Blue"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">সাইজ / Sizes (কমা দিয়ে)</label>
              <input
                type="text"
                value={sizes}
                onChange={e => setSizes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="M, L, XL, XXL"
              />
            </div>
          </div>

          {/* Badges / Flags */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={e => setIsBestSeller(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>বেস্ট সেলার (Best Seller)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isFlashSale}
                onChange={e => setIsFlashSale(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>ফ্ল্যাশ সেল (Flash Sale)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={e => setIsTrending(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>ট্রেন্ডিং পণ্য (Trending)</span>
            </label>
          </div>

          {/* Occasion / Shop by Need Badges */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-800 flex items-center space-x-1.5 text-xs">
                <span>🎯 উপলক্ষ ও প্রয়োজন নির্বাচন (আপনার কী প্রয়োজন?)</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setNeedTags(
                    detectProductOccasions({ name, nameBn, category, subcategory, description })
                  )
                }
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center space-x-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100"
              >
                <span>⚡ স্মার্ট অটো-ডিটেক্ট</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500">
              যেসব উপলক্ষ টিক দেবেন, স্টোরফ্রন্টে "আপনার কী প্রয়োজন?" ট্যাবে পণ্যটি স্বয়ংক্রিয়ভাবে ভেসে উঠবে:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS_LIST.map(occ => {
                const isSelected = needTags.includes(occ.id);
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setNeedTags(needTags.filter(t => t !== occ.id));
                      } else {
                        setNeedTags([...needTags, occ.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{occ.icon}</span>
                    <span>{occ.titleBn}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer transition-colors"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-md shadow-rose-600/25 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. PRODUCT DELETE CONFIRMATION MODAL
// -------------------------------------------------------------
interface ProductDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => void;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 p-6 space-y-5 text-center">
        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <Trash2 className="w-7 h-7" />
        </div>

        {/* Title & Warning */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-gray-900">
            পণ্য মুছে ফেলতে চান?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান? এটি মুছে ফেললে গ্রাহক ক্যাটালগ এবং ইনভেন্টরি থেকে স্থায়ীভাবে অপসারিত হবে।
          </p>
        </div>

        {/* Product Summary Card */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center space-x-3 text-left">
          <img
            src={product.images?.[0] || ''}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-xl border border-gray-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-gray-900 truncate">
              {product.nameBn || product.name}
            </h4>
            <p className="text-[10px] text-gray-500 font-mono">
              SKU: {product.sku} • স্টক: {product.stock} pcs
            </p>
            <p className="text-xs font-black text-rose-600">
              ৳{product.price}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer transition-colors text-xs"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-md shadow-rose-600/25 text-xs flex items-center justify-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. BULK PRODUCT DELETE MODAL
// -------------------------------------------------------------
interface BulkProductDeleteModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productIds: string[]) => void;
}

export const BulkProductDeleteModal: React.FC<BulkProductDeleteModalProps> = ({
  products,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 p-6 space-y-5 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <Trash2 className="w-8 h-8" />
        </div>

        {/* Title & Warning */}
        <div className="space-y-1.5">
          <div className="inline-block bg-rose-50 text-rose-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
            বাল্ক ডিলিট সতর্কতা (Bulk Action)
          </div>
          <h3 className="text-xl font-black text-gray-900">
            {products.length}টি পণ্য একসাথে মুছে ফেলতে চান?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-md mx-auto">
            নির্বাচিত <strong>{products.length}টি পণ্য</strong> স্থায়ীভাবে দোকান ও ইনভেন্টরি ক্যাটালগ থেকে মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা যাবে না।
          </p>
        </div>

        {/* Scrollable Products List */}
        <div className="max-h-60 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-left">
          {products.map(p => (
            <div key={p.id} className="p-2 bg-white rounded-xl border border-gray-200 flex items-center space-x-3 text-xs">
              <img
                src={p.images?.[0] || ''}
                alt={p.name}
                className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 truncate">
                  {p.nameBn || p.name}
                </h4>
                <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono mt-0.5">
                  <span>SKU: {p.sku}</span>
                  <span>•</span>
                  <span>স্টক: {p.stock} pcs</span>
                  <span>•</span>
                  <span className="font-bold text-rose-600">৳{p.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 cursor-pointer transition-colors text-xs"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={() => onConfirm(products.map(p => p.id))}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition-colors shadow-lg shadow-rose-600/30 text-xs flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>হ্যাঁ, {products.length}টি পণ্য মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. BULK PRODUCT EDIT MODAL
// -------------------------------------------------------------
interface BulkProductEditModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (productIds: string[], updates: Partial<Product>) => void;
}

export const BulkProductEditModal: React.FC<BulkProductEditModalProps> = ({
  products,
  isOpen,
  onClose,
  onSave,
}) => {
  // Field activation toggles
  const [updateCategory, setUpdateCategory] = useState(false);
  const [targetCategory, setTargetCategory] = useState('men-fashion');
  const [targetSubcategory, setTargetSubcategory] = useState('');

  const [updatePrice, setUpdatePrice] = useState(false);
  const [priceAction, setPriceAction] = useState<'fixed' | 'discount_percent' | 'add' | 'subtract'>('discount_percent');
  const [priceValue, setPriceValue] = useState<number>(10);

  const [updateStock, setUpdateStock] = useState(false);
  const [stockAction, setStockAction] = useState<'fixed' | 'add' | 'subtract'>('add');
  const [stockValue, setStockValue] = useState<number>(10);

  const [updateOccasions, setUpdateOccasions] = useState(false);
  const [selectedOccasions, setSelectedOccasions] = useState<NeedTag[]>([]);
  const [occasionMode, setOccasionMode] = useState<'add' | 'replace'>('add');

  const [updateBadges, setUpdateBadges] = useState(false);
  const [isTrending, setIsTrending] = useState<boolean | null>(null);
  const [isNewArrival, setIsNewArrival] = useState<boolean | null>(null);
  const [isBestSeller, setIsBestSeller] = useState<boolean | null>(null);

  if (!isOpen || products.length === 0) return null;

  const currentCatObj = CATEGORIES.find(c => c.id === targetCategory);

  const handleToggleOccasion = (tag: NeedTag) => {
    setSelectedOccasions(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();

    // Collect updates
    const updates: Partial<Product> = {};

    if (updateCategory) {
      updates.category = targetCategory;
      updates.categoryBn = currentCatObj?.nameBn || targetCategory;
      if (targetSubcategory) {
        updates.subcategory = targetSubcategory;
      }
    }

    if (updateBadges) {
      if (isTrending !== null) updates.isTrending = isTrending;
      if (isNewArrival !== null) updates.isNewArrival = isNewArrival;
      if (isBestSeller !== null) updates.isBestSeller = isBestSeller;
    }

    // Apply per-product custom logic in onSave
    products.forEach(p => {
      const singleUpdate: Partial<Product> = { ...updates };

      if (updatePrice) {
        if (priceAction === 'fixed') {
          singleUpdate.price = Math.max(0, priceValue);
        } else if (priceAction === 'discount_percent') {
          const discountAmt = Math.round((p.price * priceValue) / 100);
          singleUpdate.oldPrice = p.price;
          singleUpdate.price = Math.max(1, p.price - discountAmt);
          singleUpdate.discountPercent = priceValue;
        } else if (priceAction === 'add') {
          singleUpdate.price = p.price + priceValue;
        } else if (priceAction === 'subtract') {
          singleUpdate.price = Math.max(1, p.price - priceValue);
        }
      }

      if (updateStock) {
        if (stockAction === 'fixed') {
          singleUpdate.stock = Math.max(0, stockValue);
        } else if (stockAction === 'add') {
          singleUpdate.stock = p.stock + stockValue;
        } else if (stockAction === 'subtract') {
          singleUpdate.stock = Math.max(0, p.stock - stockValue);
        }
      }

      if (updateOccasions && selectedOccasions.length > 0) {
        if (occasionMode === 'replace') {
          singleUpdate.needTags = selectedOccasions;
        } else {
          const existing = p.needTags || [];
          singleUpdate.needTags = Array.from(new Set([...existing, ...selectedOccasions]));
        }
      }

      onSave([p.id], singleUpdate);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-gray-900">
                  বাল্ক প্রোডাক্ট এডিটর (Bulk Product Editor)
                </h3>
                <span className="font-mono text-xs bg-blue-100 text-blue-800 font-black px-2.5 py-0.5 rounded-full">
                  {products.length}টি পণ্য নির্বাচিত
                </span>
              </div>
              <p className="text-xs text-gray-500">
                একসাথে একাধিক পণ্যের মূল্য, স্টক, ক্যাটাগরি, উপলক্ষ ও ব্যাজ পরিবর্তন করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Target products preview badge */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
            <span className="text-gray-700 font-bold">
              নির্বাচিত পণ্য সংখ্যা: <strong className="text-blue-700">{products.length}টি</strong>
            </span>
            <span className="text-[11px] text-gray-500">
              শুধুমাত্র টিক দেওয়া ফিল্ডগুলোই পরিবর্তিত হবে
            </span>
          </div>

          {/* 1. Price Adjustment */}
          <div className={`p-4 rounded-2xl border transition-all ${updatePrice ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updatePrice}
                onChange={e => setUpdatePrice(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>মূল্য ও ডিসকাউন্ট পরিবর্তন (Bulk Price Adjustments)</span>
              </span>
            </label>

            {updatePrice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">অ্যাকশন নির্বাচন করুন:</label>
                  <select
                    value={priceAction}
                    onChange={e => setPriceAction(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="discount_percent">শতাংশ (%) ডিসকাউন্ট দিন</option>
                    <option value="fixed">নির্দিষ্ট বিক্রয় মূল্য সেট করুন (৳)</option>
                    <option value="add">বর্তমান মূল্যের সাথে যোগ করুন (+৳)</option>
                    <option value="subtract">বর্তমান মূল্য থেকে কমান (-৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    {priceAction === 'discount_percent' ? 'ডিসকাউন্টের শতকরা হার (%):' : 'টাকার পরিমাণ (৳):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required={updatePrice}
                    value={priceValue}
                    onChange={e => setPriceValue(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Stock Adjustment */}
          <div className={`p-4 rounded-2xl border transition-all ${updateStock ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateStock}
                onChange={e => setUpdateStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>স্টক ও ইনভেন্টরি আপডেট (Bulk Stock Update)</span>
              </span>
            </label>

            {updateStock && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">স্টক অ্যাকশন:</label>
                  <select
                    value={stockAction}
                    onChange={e => setStockAction(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="add">বর্তমান স্টকে নতুন পিস যোগ করুন (+)</option>
                    <option value="fixed">নির্দিষ্ট স্টক সংখ্যা নির্ধারণ করুন</option>
                    <option value="subtract">স্টক থেকে কমান (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">পরিমাণ (Pieces):</label>
                  <input
                    type="number"
                    min="0"
                    required={updateStock}
                    value={stockValue}
                    onChange={e => setStockValue(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Category Reassignment */}
          <div className={`p-4 rounded-2xl border transition-all ${updateCategory ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateCategory}
                onChange={e => setUpdateCategory(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>ক্যাটাগরি স্থানান্তর (Reassign Category)</span>
              </span>
            </label>

            {updateCategory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">টার্গেট ক্যাটাগরি:</label>
                  <select
                    value={targetCategory}
                    onChange={e => setTargetCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.nameBn} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">সাব-ক্যাটাগরি (ঐচ্ছিক):</label>
                  <select
                    value={targetSubcategory}
                    onChange={e => setTargetSubcategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs"
                  >
                    <option value="">সাবক্যাটাগরি রাখুন যেমন আছে</option>
                    {currentCatObj?.subcategories?.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Occasion Tags */}
          <div className={`p-4 rounded-2xl border transition-all ${updateOccasions ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateOccasions}
                onChange={e => setUpdateOccasions(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>উপলক্ষ ও কালেকশন ট্যাগ (Occasion / Need Tags)</span>
              </span>
            </label>

            {updateOccasions && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs">
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name="occasionMode"
                      value="add"
                      checked={occasionMode === 'add'}
                      onChange={() => setOccasionMode('add')}
                      className="text-blue-600"
                    />
                    <span>বর্তমান ট্যাগের সাথে যোগ করুন</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-gray-700">
                    <input
                      type="radio"
                      name="occasionMode"
                      value="replace"
                      checked={occasionMode === 'replace'}
                      onChange={() => setOccasionMode('replace')}
                      className="text-blue-600"
                    />
                    <span>পূর্বের ট্যাগ মুছে নতুন ট্যাগ বসান</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {OCCASIONS_LIST.map(occ => {
                    const isSelected = selectedOccasions.includes(occ.id);
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => handleToggleOccasion(occ.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{occ.icon}</span>
                        <span>{occ.titleBn}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Badges & Product Flags */}
          <div className={`p-4 rounded-2xl border transition-all ${updateBadges ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10' : 'bg-gray-50 border-gray-200'}`}>
            <label className="flex items-center space-x-2.5 cursor-pointer font-bold text-gray-900 mb-2">
              <input
                type="checkbox"
                checked={updateBadges}
                onChange={e => setUpdateBadges(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>প্রদর্শনী ব্যাজ ও ফ্ল্যাগ (Trending / Best Seller / New Arrival)</span>
              </span>
            </label>

            {updateBadges && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">ট্রেন্ডিং প্রোডাক্ট:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsTrending(isTrending === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isTrending === true ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTrending(isTrending === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isTrending === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">নিউ অ্যারাইভাল:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsNewArrival(isNewArrival === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isNewArrival === true ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewArrival(isNewArrival === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isNewArrival === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1">
                  <span className="font-bold text-gray-800 block text-xs">বেস্টসেলার:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsBestSeller(isBestSeller === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isBestSeller === true ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBestSeller(isBestSeller === false ? null : false)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${isBestSeller === false ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      না (No)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer transition-colors text-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={!updatePrice && !updateStock && !updateCategory && !updateOccasions && !updateBadges}
              className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-lg shadow-blue-600/25 text-xs flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{products.length}টি পণ্যে পরিবর্তন প্রয়োগ করুন (Apply Changes)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

