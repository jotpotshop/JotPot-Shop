import React from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const ShopByBudgetSection: React.FC = () => {
  const { t, products, selectedMaxBudget, setSelectedMaxBudget } = useShop();

  const budgetTiers = [
    { labelBn: '৳৫০০ এর নিচে', labelEn: 'Under ৳500', max: 500, min: 0 },
    { labelBn: '৳১,০০০ এর নিচে', labelEn: 'Under ৳1,000', max: 1000, min: 0 },
    { labelBn: '৳২,০০০ এর নিচে', labelEn: 'Under ৳2,000', max: 2000, min: 0 },
    { labelBn: '৳৫,০০০ এর নিচে', labelEn: 'Under ৳5,000', max: 5000, min: 0 },
    { labelBn: '৳৫,০০০+ প্রিমিয়াম', labelEn: '৳5,000+ Premium', max: 15000, min: 5000 },
  ];

  const currentMax = selectedMaxBudget ?? 2000;

  const budgetProducts = products.filter(p => {
    if (p.isPublished === false) return false;
    if (selectedMaxBudget !== null) {
      if (selectedMaxBudget > 5000) return p.price >= 3000;
      return p.price <= selectedMaxBudget;
    }
    return p.price <= 2000;
  }).slice(0, 4);

  return (
    <section className="my-10 bg-white p-5 sm:p-7 rounded-2xl border border-[#e6e3dd]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
            {t('বাজেট অনুযায়ী শপিং', 'Shop by Budget')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('আপনার নির্ধারিত বাজেটের মধ্যে মানসম্মত পণ্য বেছে নিন', 'Find quality products within your comfortable price range')}
          </p>
        </div>

        {/* Price Slider */}
        <div className="flex items-center space-x-3 bg-[#faf9f7] px-3.5 py-2 rounded-xl border border-[#e6e3dd] self-start sm:self-auto text-xs">
          <span className="text-gray-600 font-medium">{t('সর্বোচ্চ সীমা:', 'Max:')}</span>
          <span className="font-bold text-[#881337] tabular-nums">৳{currentMax}</span>
          <input
            type="range"
            min="500"
            max="4000"
            step="100"
            value={currentMax}
            onChange={e => setSelectedMaxBudget(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 accent-[#881337] cursor-pointer"
          />
        </div>
      </div>

      {/* Preset Budget Tier Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        {budgetTiers.map((tier, idx) => {
          const isSelected = selectedMaxBudget === tier.max;
          return (
            <button
              key={idx}
              onClick={() => setSelectedMaxBudget(isSelected ? null : tier.max)}
              className={`py-2.5 px-3 min-h-[42px] rounded-xl text-xs font-medium transition-colors text-center border cursor-pointer tabular-nums ${
                isSelected
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-[#faf9f7] text-[#111827] border-[#e6e3dd] hover:border-gray-400'
              }`}
            >
              {t(tier.labelBn, tier.labelEn)}
            </button>
          );
        })}
      </div>

      {/* Filtered Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {budgetProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </section>
  );
};
