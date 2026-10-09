import React, { useState, useEffect } from 'react';
import { Zap, Clock, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const FlashSaleSection: React.FC = () => {
  const { products, t, setSelectedCategory } = useShop();

  // Countdown timer for 8 hours 24 mins 45 secs from start
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

  const flashProducts = products.filter(p => p.isFlashSale).slice(0, 4);

  if (flashProducts.length === 0) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="my-8 bg-gradient-to-br from-rose-50/60 via-amber-50/40 to-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-sm">
      {/* Header with Title and Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
            <Zap className="w-5 h-5 fill-white stroke-none" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                {t('ফ্ল্যাশ সেল ও ধামাকা অফার', 'Flash Sale & Limited Offers')}
              </h2>
              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('সীমিত সময়ের বিশেষ মূল্যছাড় — স্টক শেষ হওয়ার আগেই লুফে নিন!', 'Huge discounts for a limited time — grab before stock runs out!')}
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-rose-200/60 shadow-xs self-start sm:self-auto">
          <Clock className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-bold text-gray-600 mr-1">{t('সময় বাকি:', 'Ends in:')}</span>
          <div className="flex items-center space-x-1 font-mono text-xs font-extrabold text-gray-900">
            <span className="bg-gray-900 text-white px-2 py-1 rounded-md">{pad(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-gray-900 text-white px-2 py-1 rounded-md">{pad(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-rose-600 text-white px-2 py-1 rounded-md">{pad(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {flashProducts.map(prod => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>

      {/* View All Deals button */}
      <div className="mt-5 text-center">
        <button
          onClick={() => setSelectedCategory('deals-offers')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 px-5 py-2.5 rounded-full border border-rose-200 shadow-xs transition-colors cursor-pointer"
        >
          <span>{t('সব ফ্ল্যাশ ডিল দেখুন', 'View All Flash Deals')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
