import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const FlashSaleSection: React.FC = () => {
  const { products, t, setSelectedCategory } = useShop();

  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 24,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter(p => p.isPublished !== false && p.isFlashSale).slice(0, 4);

  if (flashProducts.length === 0) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="my-8 bg-white rounded-2xl p-5 sm:p-7 border border-[#e6e3dd]">
      {/* Header with Title and Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827]">
              {t('সীমিত সময়ের বিশেষ অফার', 'Limited-Time Offers')}
            </h2>
            <span className="bg-[#881337] text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              {t('চলমান', 'Active')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t('নির্বাচিত পণ্যে বিশেষ মূল্যছাড় — স্টক থাকা সাপেক্ষে', 'Selected items at reduced prices while stock lasts')}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center space-x-2 bg-[#faf9f7] px-3.5 py-2 rounded-xl border border-[#e6e3dd] self-start sm:self-auto">
          <Clock className="w-4 h-4 text-[#881337]" />
          <span className="text-xs font-medium text-gray-600 mr-1">{t('অবশিষ্ট সময়:', 'Ends in:')}</span>
          <div className="flex items-center space-x-1 text-xs font-semibold text-[#111827] tabular-nums">
            <span className="bg-[#111827] text-white px-2 py-1 rounded-md">{pad(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-[#111827] text-white px-2 py-1 rounded-md">{pad(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-[#881337] text-white px-2 py-1 rounded-md">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {flashProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>

      {/* View All Deals */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setSelectedCategory('deals-offers')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#111827] hover:text-[#881337] bg-[#faf9f7] hover:bg-gray-100 px-5 py-2.5 min-h-[40px] rounded-xl border border-[#e6e3dd] transition-colors cursor-pointer"
        >
          <span>{t('সব বিশেষ অফার দেখুন', 'View All Deals')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
