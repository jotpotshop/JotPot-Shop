import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { OCCASIONS_LIST } from '../data/occasionsData';
import { NeedTag } from '../types';

export const ShopByNeedSection: React.FC = () => {
  const { language, t, products, selectedNeed, setSelectedNeed } = useShop();

  const activeNeed = (selectedNeed || 'gift') as NeedTag;
  const matchingProducts = products
    .filter(p => Array.isArray(p.needTags) && p.needTags.includes(activeNeed))
    .slice(0, 8);

  const activeOccasionConfig = OCCASIONS_LIST.find(o => o.id === activeNeed);

  return (
    <section className="my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="text-base sm:text-xl font-black text-gray-900 flex items-center space-x-2">
            <span>🎯</span>
            <span>{t('আপনার কী প্রয়োজন?', 'Shop by Need')}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('উপলক্ষ অনুযায়ী দ্রুত ও মানানসই কেনাকাটা করুন', 'Pick your occasion or daily routine')}
          </p>
        </div>

        {activeOccasionConfig && (
          <div className="text-[11px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium self-start sm:self-auto flex items-center space-x-1">
            <span>{activeOccasionConfig.icon}</span>
            <span>{language === 'bn' ? activeOccasionConfig.descriptionBn : activeOccasionConfig.descriptionEn}</span>
          </div>
        )}
      </div>

      {/* Pill selection row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {OCCASIONS_LIST.map(opt => {
          const isSelected = activeNeed === opt.id;
          const count = products.filter(p => Array.isArray(p.needTags) && p.needTags.includes(opt.id)).length;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedNeed(opt.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-102'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{opt.icon}</span>
              <span>{language === 'bn' ? opt.titleBn : opt.titleEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products list for this need */}
      {matchingProducts.length === 0 ? (
        <div className="mt-4 bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-500">
          <p className="text-xs font-bold">এই উপলক্ষে কোনো পণ্য এখনো পাওয়া যায়নি।</p>
          <p className="text-[11px] text-gray-400 mt-1">অন্য কোনো উপলক্ষ বেছে নিন অথবা এডমিন প্যানেল থেকে পণ্য যুক্ত করুন।</p>
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
