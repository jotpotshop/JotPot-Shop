import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Mic,
  Tag,
  Star,
  Check,
  Truck,
  ArrowRight,
  Filter,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { parseSmartSearchQuery, filterProductsBySmartSearch } from '../utils/searchParser';
import { getAvailableStock } from '../utils/inventory';

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
      setTimeout(() => {
        const sample = language === 'bn' ? 'ছেলেদের কালো শার্ট ১০০০ টাকার মধ্যে' : 'Black shirt under 1000';
        setInputVal(sample);
        setSearchQuery(sample);
        setIsListening(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto sm:my-8 border border-[#e6e3dd]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#e6e3dd] bg-[#faf9f7]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                className="w-full min-h-[44px] bg-white text-[#111827] text-sm sm:text-base pl-11 pr-20 py-2.5 rounded-xl border border-[#e6e3dd] focus:border-[#111827] focus:outline-none"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {inputVal && (
                  <button
                    onClick={() => {
                      setInputVal('');
                      setSearchQuery('');
                    }}
                    aria-label={t('মুছুন', 'Clear')}
                    className="p-1.5 text-gray-400 hover:text-[#111827] rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleVoiceListen}
                  title={t('ভয়েস সার্চ', 'Voice Search')}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isListening
                      ? 'bg-[#881337] text-white'
                      : 'text-gray-500 hover:text-[#881337] hover:bg-[#faf9f7]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              aria-label={t('বন্ধ করুন', 'Close')}
              className="p-2.5 min-h-[44px] min-w-[44px] text-gray-500 hover:text-[#111827] hover:bg-white rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isListening && (
            <div className="mt-2.5 text-xs text-[#881337] font-medium">
              {t('শুনছি... আপনার প্রয়োজনীয় পণ্যের নাম বলুন', 'Listening... speak the product you want')}
            </div>
          )}

          {/* Smart Parsing Filter Indicators */}
          {(parsed.categoryFilter || parsed.colorFilter || parsed.itemKeyword || parsed.maxPrice) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-[#e6e3dd] text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#881337]" />
                <span>{t('শনাক্তকৃত ফিল্টার:', 'Matched filters:')}</span>
              </span>
              {parsed.categoryFilter && (
                <span className="text-[#111827] font-medium bg-white border border-[#e6e3dd] px-2.5 py-0.5 rounded-md">
                  {parsed.categoryFilter}
                </span>
              )}
              {parsed.colorFilter && (
                <span className="text-[#111827] font-medium bg-white border border-[#e6e3dd] px-2.5 py-0.5 rounded-md">
                  {t('রং:', 'Color:')} {parsed.colorFilter}
                </span>
              )}
              {parsed.itemKeyword && (
                <span className="text-[#111827] font-medium bg-white border border-[#e6e3dd] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Tag className="w-3 h-3 text-gray-500" />
                  {parsed.itemKeyword}
                </span>
              )}
              {parsed.maxPrice && (
                <span className="text-[#881337] font-semibold bg-white border border-[#e6e3dd] px-2.5 py-0.5 rounded-md tabular-nums">
                  {t('সর্বোচ্চ:', 'Max:')} {formatPrice(parsed.maxPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 max-h-[65vh] overflow-y-auto">
          {/* Query Suggestions */}
          {!inputVal && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 mb-2.5">
                {t('জনপ্রিয় সার্চ', 'Popular Searches')}
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputVal(sample);
                      setSearchQuery(sample);
                    }}
                    className="bg-[#faf9f7] hover:bg-white text-[#111827] text-xs font-medium px-3 py-1.5 min-h-[34px] rounded-lg transition-colors cursor-pointer border border-[#e6e3dd] hover:border-[#111827] flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-gray-400" />
                    <span>{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions Bar */}
          {inputVal && parsed.suggestions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-gray-500 mr-1">{t('সাজেশন:', 'Suggested:')}</span>
              {parsed.suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputVal(sug);
                    setSearchQuery(sug);
                  }}
                  className="bg-[#faf9f7] hover:bg-[#111827] text-[#111827] hover:text-white border border-[#e6e3dd] text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium tabular-nums">
              <span>
                {t(
                  `পাওয়া গেছে ${filteredProducts.length}টি পণ্য`,
                  `Found ${filteredProducts.length} matching products`
                )}
              </span>
              {inputVal && (
                <span className="text-[#15803d] font-medium">
                  {t('সারা বাংলাদেশে দ্রুত ডেলিভারি', 'Nationwide Delivery')}
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[#faf9f7] border border-[#e6e3dd] text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#111827]">
                  {t('কোনো পণ্য পাওয়া যায়নি', 'No matching products found')}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  {t(
                    'অন্য কোনো শব্দ লিখে খুঁজুন, অথবা আমাদের ক্যাটাগরিগুলো দেখুন।',
                    'Try another keyword or browse our categories.'
                  )}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#e6e3dd]">
                {filteredProducts.map(prod => {
                  const liveProd = products.find(p => p.id === prod.id) || prod;
                  const available = getAvailableStock(liveProd);
                  const isOut = available <= 0;
                  const hasReviews = Array.isArray(liveProd.reviews) && liveProd.reviews.length > 0;

                  return (
                    <div
                      key={prod.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-[#faf9f7] px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-lg border border-[#e6e3dd] bg-[#faf9f7] shrink-0 overflow-hidden flex items-center justify-center">
                          {prod.images[0] ? (
                            <img
                              src={prod.images[0]}
                              alt={language === 'bn' ? prod.nameBn : prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-medium text-gray-500">
                            {language === 'bn' ? prod.categoryBn : prod.category}
                          </span>
                          <h4
                            onClick={() => {
                              setQuickViewProduct(prod);
                              setActiveModal('quickView');
                            }}
                            className="text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#881337] truncate cursor-pointer transition-colors mt-0.5"
                          >
                            {language === 'bn' ? prod.nameBn : prod.name}
                          </h4>

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500 mt-1 tabular-nums">
                            {hasReviews && (
                              <span className="flex items-center text-[#111827] font-semibold">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                                {liveProd.rating} ({liveProd.reviews.length})
                              </span>
                            )}
                            <span className={`flex items-center font-medium ${isOut ? 'text-[#881337]' : 'text-[#15803d]'}`}>
                              <Check className="w-3 h-3 mr-0.5" />
                              {isOut ? t('স্টক শেষ', 'Out of Stock') : t('স্টকে আছে', 'In Stock')}
                            </span>
                            <span className="hidden sm:flex items-center text-gray-400">
                              <Truck className="w-3 h-3 mr-1" />
                              {language === 'bn' ? prod.deliveryDaysBn || '২৪-৪৮ ঘণ্টা' : prod.deliveryDays || '24-48h'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="text-right shrink-0 tabular-nums">
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="text-sm sm:text-base font-bold text-[#111827]">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(prod.oldPrice)}
                            </span>
                          )}
                        </div>
                        {prod.discountPercent && (
                          <span className="text-[11px] font-semibold text-[#881337]">
                            -{prod.discountPercent}%
                          </span>
                        )}

                        <div className="mt-2 flex items-center justify-end">
                          {isOut ? (
                            <span className="text-[11px] font-medium text-gray-400">
                              {t('স্টক আউট', 'Out of Stock')}
                            </span>
                          ) : (
                            <button
                              onClick={() => addToCart(liveProd, 1)}
                              className="bg-[#881337] hover:bg-[#6d0f2c] text-white text-xs font-semibold px-3 py-1.5 min-h-[34px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{t('ব্যাগে নিন', 'Add')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 bg-[#faf9f7] border-t border-[#e6e3dd] flex items-center justify-between text-xs text-gray-600">
          <span>{t('সহজ ও নিরাপদ অর্ডারিং — ক্যাশ অন ডেলিভারি সুবিধা', 'Simple checkout with Cash on Delivery')}</span>
          <button
            onClick={() => setActiveModal(null)}
            className="text-[#881337] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('সব পণ্য দেখুন', 'View All')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
