import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CategoryBar: React.FC = () => {
  const { language, selectedCategory, setSelectedCategory, setSelectedNeed, setSelectedMaxBudget, categories } = useShop();
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  const isImageIcon = (icon: string) => {
    return icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/') || icon.startsWith('/'));
  };

  return (
    <section id="categories-section" className="my-7">
      <div className="flex items-center justify-between mb-3.5 px-0.5">
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
            className="text-xs text-[#881337] font-medium hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'Show All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2.5 sm:gap-3">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const hasImage = isImageIcon(cat.icon) && !failedIcons[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(isSelected ? null : cat.id);
                setSelectedNeed(null);
              }}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-colors text-center group cursor-pointer ${
                isSelected
                  ? 'bg-[#111827] border-[#111827] text-white'
                  : 'bg-white border-[#e6e3dd] hover:border-gray-400 text-[#111827]'
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-lg sm:text-xl mb-1.5 overflow-hidden ${
                  isSelected ? 'bg-white/15 text-white' : 'bg-[#faf9f7] text-gray-700'
                }`}
              >
                {hasImage ? (
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    onError={() => setFailedIcons(prev => ({ ...prev, [cat.id]: true }))}
                    className="w-7 h-7 object-contain"
                  />
                ) : cat.icon && !isImageIcon(cat.icon) ? (
                  <span aria-hidden="true">{cat.icon}</span>
                ) : (
                  <Package className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-medium line-clamp-1 ${
                  isSelected ? 'text-white' : 'text-gray-700 group-hover:text-[#111827]'
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
