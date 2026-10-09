import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Mic,
  Tag,
  Star,
  CheckCircle,
  Truck,
  ArrowRight,
  Filter,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { parseSmartSearchQuery, filterProductsBySmartSearch } from '../utils/searchParser';

export const SmartSearchModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    searchQuery,
    setSearchQuery,
    products,
    t,
    formatPrice,
    addToCart,
    setQuickViewProduct,
    language,
  } = useShop();

  const [inputVal, setInputVal] = useState(searchQuery);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (activeModal === 'search') {
      setInputVal(searchQuery);
    }
  }, [activeModal, searchQuery]);

  if (activeModal !== 'search') return null;

  const parsed = parseSmartSearchQuery(inputVal);
  const filteredProducts = filterProductsBySmartSearch(products, parsed);

  const sampleQueries = [
    'ছেলেদের কালো শার্ট ১০০০ টাকার মধ্যে',
    'Smartwatch under 2000',
    'লেদার মানিব্যাগ',
    'লাল জামদানি শাড়ি',
    'Lightweight sneakers under 1500',
    'TWS Earbuds with ANC',
  ];

  const handleVoiceListen = () => {
    setIsListening(true);
    const SpeechRecognitionClass: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        recognition.start();
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          setSearchQuery(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => {
          setIsListening(false);
        };
      } catch {
        setIsListening(false);
      }
    } else {
      // simulate for browser environment if no microphone hardware
      setTimeout(() => {
        const sample = language === 'bn' ? 'ছেলেদের কালো শার্ট ১০০০ টাকার মধ্যে' : 'Black shirt under 1000';
        setInputVal(sample);
        setSearchQuery(sample);
        setIsListening(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto sm:my-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputVal}
                onChange={e => {
                  setInputVal(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                autoFocus
                placeholder={t(
                  'আপনি কী খুঁজছেন? যেমন: ছেলেদের কালো শার্ট ১০০০ টাকার মধ্যে...',
                  'What are you looking for? e.g. Men black shirt under 1000...'
                )}
                className="w-full bg-white text-gray-900 text-sm sm:text-base pl-11 pr-20 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 shadow-xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                {inputVal && (
                  <button
                    onClick={() => {
                      setInputVal('');
                      setSearchQuery('');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleVoiceListen}
                  title="ভয়েস সার্চ"
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'text-gray-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {isListening && (
            <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center space-x-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              <span>{t('শুনছি... আপনার প্রয়োজনীয় পণ্যের নাম বলুন', 'Listening... speak the product you want')}</span>
            </div>
          )}

          {/* Smart Parsing Indicator Chips */}
          {(parsed.categoryFilter || parsed.colorFilter || parsed.itemKeyword || parsed.maxPrice) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{t('শনাক্তকৃত ফিল্টার:', 'Smart Filters:')}</span>
              </span>
              {parsed.categoryFilter && (
                <span className="bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <Filter className="w-3 h-3" />
                  <span>{parsed.categoryFilter}</span>
                </span>
              )}
              {parsed.colorFilter && (
                <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  <span>Color: {parsed.colorFilter}</span>
                </span>
              )}
              {parsed.itemKeyword && (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Item: {parsed.itemKeyword}</span>
                </span>
              )}
              {parsed.maxPrice && (
                <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  Max: {formatPrice(parsed.maxPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
          {/* Query Suggestions */}
          {!inputVal && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                {t('জনপ্রিয় সার্চ উদাহরণ (ক্লিক করে দেখুন)', 'Try Popular Queries (1-Click Search)')}
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputVal(sample);
                      setSearchQuery(sample);
                    }}
                    className="bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  >
                    🔍 {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions Pill Bar */}
          {inputVal && parsed.suggestions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-400 mr-1">{t('সাজেশন:', 'Suggested:')}</span>
              {parsed.suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputVal(sug);
                    setSearchQuery(sug);
                  }}
                  className="bg-gray-100 hover:bg-rose-100 text-gray-800 hover:text-rose-700 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Results Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>
                {t(
                  `পাওয়া গেছে ${filteredProducts.length}টি পণ্য`,
                  `Found ${filteredProducts.length} matching products`
                )}
              </span>
              {inputVal && (
                <span className="text-rose-600 font-semibold">
                  {t('দ্রুত ডেলিভারি সুবিধা প্রযোজ্য', 'Fast Delivery Eligible')}
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800">
                  {t('কোনো পণ্য পাওয়া যায়নি', 'No matching products found')}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  {t(
                    'অন্য কোনো শব্দ বা সহজভাবে লিখে খুঁজুন, অথবা আমাদের হট ডিলস চেক করুন।',
                    'Try another keyword or browse our popular categories.'
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 p-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {language === 'bn' ? prod.categoryBn : prod.category}
                        </span>
                        <h4
                          onClick={() => {
                            setQuickViewProduct(prod);
                            setActiveModal('quickView');
                          }}
                          className="text-xs sm:text-sm font-bold text-gray-900 hover:text-rose-600 truncate cursor-pointer transition-colors mt-0.5"
                        >
                          {language === 'bn' ? prod.nameBn : prod.name}
                        </h4>

                        <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-1">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {prod.rating} ({prod.reviewsCount})
                          </span>
                          <span className="flex items-center text-emerald-600">
                            <CheckCircle className="w-3 h-3 mr-0.5" />
                            {prod.stock > 0 ? t('স্টকে আছে', 'In Stock') : t('স্টক শেষ', 'Out of Stock')}
                          </span>
                          <span className="hidden sm:flex items-center text-gray-400">
                            <Truck className="w-3 h-3 mr-0.5" />
                            {t('২৪-৪৮ ঘণ্টা', '24-48h')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end space-x-1.5">
                        <span className="text-sm sm:text-base font-extrabold text-gray-900">
                          {formatPrice(prod.price)}
                        </span>
                        {prod.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(prod.oldPrice)}
                          </span>
                        )}
                      </div>
                      {prod.discountPercent && (
                        <span className="text-[10px] font-bold text-rose-600">
                          {prod.discountPercent}% OFF
                        </span>
                      )}

                      <div className="mt-2 flex items-center space-x-1.5">
                        <button
                          onClick={() => {
                            addToCart(prod, 1);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{t('ব্যাগে নিন', 'Add')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>{t('⚡ দ্রুত কেনাকাটা — ৩০ সেকেন্ডের মধ্যে চেকআউট', '⚡ Fast shopping — checkout in 30 seconds')}</span>
          <button
            onClick={() => setActiveModal(null)}
            className="text-rose-600 font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>{t('সব পণ্য দেখুন', 'View All')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
