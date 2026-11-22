import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { isImageIconUrl, resolveCategoryIcon } from '../utils/categoryAssets';

export const CategoryBar: React.FC = () => {
  const { language, selectedCategory, setSelectedCategory, setSelectedNeed, setSelectedMaxBudget, categories } = useShop();
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  return (
    <section id="categories-section" className="my-8">
      <div className="flex items-center justify-between mb-4 px-0.5 border-b border-[#e6e3dd] pb-2.5">
        <h2 className="text-base sm:text-lg font-semibold text-[#111827]">
          {language === 'bn' ? 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন' : 'Browse by Category'}
        </h2>
        {selectedCategory && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedNeed(null);
              setSelectedMaxBudget(null);
            }}
            className="text-xs text-[#881337] font-medium hover:underline cursor-pointer min-h-[36px] px-2"
          >
            {language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'Show All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const resolvedIcon = resolveCategoryIcon(cat.id, cat.icon);
          const hasImage = isImageIconUrl(resolvedIcon) && !failedIcons[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(isSelected ? null : cat.id);
                setSelectedNeed(null);
              }}
              className={`flex flex-col items-center justify-start p-2.5 rounded-xl border transition-colors text-center group cursor-pointer ${
                isSelected
                  ? 'bg-[#111827] border-[#111827] text-white'
                  : 'bg-white border-[#e6e3dd] hover:border-gray-400 text-[#111827]'
              }`}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-2 overflow-hidden shrink-0 border ${
                  isSelected
                    ? 'bg-[#fcfaf7] border-white/25'
                    : 'bg-[#fcfaf7] border-[#e6e3dd]/70'
                }`}
              >
                {hasImage ? (
                  <img
                    src={resolvedIcon}
                    alt={language === 'bn' ? cat.nameBn : cat.name}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedIcons(prev => ({ ...prev, [cat.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <span
                className={`text-xs font-medium leading-[1.4] line-clamp-2 w-full ${
                  isSelected ? 'text-white' : 'text-[#111827] group-hover:text-[#881337]'
                }`}
              >
                {language === 'bn' ? cat.nameBn : cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
