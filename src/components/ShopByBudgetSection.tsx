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
    { labelBn: '৳৫,০০০+ প্রিমিয়াম', labelEn: '৳5,000+ Luxury', max: 15000, min: 5000 },
  ];

  const currentMax = selectedMaxBudget ?? 2000;

  const budgetProducts = products.filter(p => {
    if (selectedMaxBudget !== null) {
      if (selectedMaxBudget > 5000) return p.price >= 3000;
      return p.price <= selectedMaxBudget;
    }
    return p.price <= 2000;
  }).slice(0, 4);

  return (
    <section className="my-8 bg-gray-50/70 p-5 sm:p-7 rounded-3xl border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-xl font-black text-gray-900 flex items-center space-x-2">
            <span>💰</span>
            <span>{t('বাজেট অনুযায়ী শপিং', 'Shop by Budget')}</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {t('আপনার সুবিধাজনক খরচের সীমার মধ্যে সেরা পণ্য বেছে নিন', 'Stay within your target spending')}
          </p>
        </div>

        {/* Custom Price Slider */}
        <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-2xl border border-gray-200 self-start sm:self-auto text-xs">
          <span className="text-gray-500 font-semibold">{t('সর্বোচ্চ:', 'Max:')}</span>
          <span className="font-extrabold text-rose-600">৳{currentMax}</span>
          <input
            type="range"
            min="500"
            max="4000"
            step="100"
            value={currentMax}
            onChange={e => setSelectedMaxBudget(parseInt(e.target.value, 10))}
            className="w-24 sm:w-32 accent-rose-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Preset Budget Tier Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        {budgetTiers.map((tier, idx) => {
          const isSelected = selectedMaxBudget === tier.max;
          return (
            <button
              key={idx}
              onClick={() => setSelectedMaxBudget(isSelected ? null : tier.max)}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all text-center border cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-rose-300 hover:bg-rose-50/40'
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
