import React from 'react';
import { useShop } from '../context/ShopContext';

export const CategoryBar: React.FC = () => {
  const { language, selectedCategory, setSelectedCategory, setSelectedNeed, setSelectedMaxBudget, categories } = useShop();

  const isImageIcon = (icon: string) => {
    return icon && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/') || icon.startsWith('/'));
  };

  return (
    <div id="categories-section" className="my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
          <span>🏷️</span>
          <span>{language === 'bn' ? 'ক্যাটাগরি অনুযায়ী কিনুন' : 'Shop by Category'}</span>
        </h2>
        {selectedCategory && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedNeed(null);
              setSelectedMaxBudget(null);
            }}
            className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'সব ক্যাটাগরি দেখুন' : 'Show All'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          const hasImage = isImageIcon(cat.icon);
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(isSelected ? null : cat.id);
                setSelectedNeed(null);
              }}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center group cursor-pointer ${
                isSelected
                  ? 'bg-rose-50 border-rose-500 shadow-sm shadow-rose-500/10 -translate-y-0.5'
                  : 'bg-white border-gray-100 hover:border-rose-200 hover:bg-gray-50/80 hover:shadow-xs'
              }`}
            >
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-1.5 transition-transform group-hover:scale-110 overflow-hidden ${
                  isSelected ? 'bg-rose-600 text-white shadow-xs' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {hasImage ? (
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                ) : (
                  <span>{cat.icon || '🛍️'}</span>
                )}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-semibold line-clamp-1 ${
                  isSelected ? 'text-rose-600 font-bold' : 'text-gray-700 group-hover:text-rose-600'
                }`}
              >
                {language === 'bn' ? cat.nameBn : cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
