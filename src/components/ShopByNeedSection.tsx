import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { OCCASIONS_LIST } from '../data/occasionsData';
import { NeedTag } from '../types';

export const ShopByNeedSection: React.FC = () => {
  const { language, t, products, selectedNeed, setSelectedNeed } = useShop();

  const activeNeed = (selectedNeed || 'gift') as NeedTag;
  const publishedProducts = products.filter(p => p.isPublished !== false);
  const matchingProducts = publishedProducts
    .filter(p => Array.isArray(p.needTags) && p.needTags.includes(activeNeed))
    .slice(0, 8);

  const activeOccasionConfig = OCCASIONS_LIST.find(o => o.id === activeNeed);

  return (
    <section className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 pb-3 border-b border-[#e6e3dd] gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
            {t('প্রয়োজন ও উপলক্ষ অনুযায়ী খুঁজুন', 'Shop by Occasion & Need')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('আপনার উপলক্ষ বা দৈনন্দিন ব্যবহার অনুযায়ী মানানসই পণ্য বেছে নিন', 'Browse items tailored to your occasion or daily routine')}
          </p>
        </div>

        {activeOccasionConfig && (
          <p className="text-xs text-gray-600 font-medium self-start sm:self-auto">
            {language === 'bn' ? activeOccasionConfig.descriptionBn : activeOccasionConfig.descriptionEn}
          </p>
        )}
      </div>

      {/* Tab selection row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {OCCASIONS_LIST.map(opt => {
          const isSelected = activeNeed === opt.id;
          const count = publishedProducts.filter(p => Array.isArray(p.needTags) && p.needTags.includes(opt.id)).length;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedNeed(opt.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-gray-700 border-[#e6e3dd] hover:border-gray-400 hover:bg-[#faf9f7]'
              }`}
            >
              <span>{language === 'bn' ? opt.titleBn : opt.titleEn}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded tabular-nums ${
                isSelected ? 'bg-white/15 text-white' : 'bg-[#faf9f7] text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products list for this need */}
      {matchingProducts.length === 0 ? (
        <div className="mt-4 bg-white border border-[#e6e3dd] rounded-2xl p-8 text-center text-gray-500">
          <p className="text-sm font-medium text-[#111827]">এই উপলক্ষে কোনো পণ্য এখনো যুক্ত করা হয়নি।</p>
          <p className="text-xs text-gray-500 mt-1">অনুগ্রহ করে পাশের অন্য কোনো উপলক্ষ নির্বাচন করুন।</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {matchingProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </section>
  );
};
