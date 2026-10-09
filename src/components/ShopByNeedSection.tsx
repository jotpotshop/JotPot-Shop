import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const ShopByNeedSection: React.FC = () => {
  const { language, t, products, selectedNeed, setSelectedNeed } = useShop();

  const needOptions = [
    { id: 'gift', icon: '🎁', titleBn: 'উপহার', titleEn: 'Gift' },
    { id: 'office', icon: '💼', titleBn: 'অফিস', titleEn: 'Office' },
    { id: 'campus', icon: '🎓', titleBn: 'ক্যাম্পাস', titleEn: 'Campus' },
    { id: 'wedding', icon: '💍', titleBn: 'বিবাহ/উৎসব', titleEn: 'Wedding' },
    { id: 'travel', icon: '✈️', titleBn: 'ভ্রমণ', titleEn: 'Travel' },
    { id: 'party', icon: '🎉', titleBn: 'পার্টি', titleEn: 'Party' },
    { id: 'couple', icon: '❤️', titleBn: 'কাপল', titleEn: 'Couple' },
    { id: 'formal', icon: '👔', titleBn: 'ফর্মাল', titleEn: 'Formal' },
    { id: 'everyday', icon: '🔥', titleBn: 'দৈনন্দিন', titleEn: 'Everyday' },
  ];

  const activeNeed = selectedNeed || 'gift';
  const matchingProducts = products.filter(p => p.needTags.includes(activeNeed as 'gift' | 'office' | 'campus' | 'wedding' | 'travel' | 'party' | 'couple' | 'formal' | 'everyday')).slice(0, 4);

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-xl font-black text-gray-900 flex items-center space-x-2">
            <span>🎯</span>
            <span>{t('আপনার কী প্রয়োজন?', 'Shop by Need')}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('উপলক্ষ অনুযায়ী দ্রুত ও মানানসই কেনাকাটা করুন', 'Pick your occasion or daily routine')}
          </p>
        </div>
      </div>

      {/* Pill selection row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {needOptions.map(opt => {
          const isSelected = activeNeed === opt.id;
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
            </button>
          );
        })}
      </div>

      {/* Products list for this need */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {matchingProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};
