import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HeroSlider: React.FC = () => {
  const { t, setSelectedCategory, setSelectedNeed, setActiveModal, heroBanners } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = (heroBanners && heroBanners.length > 0)
    ? heroBanners.filter(b => b.active !== false)
    : [];

  const slides = activeSlides.length > 0 ? activeSlides : [
    {
      id: 1,
      badgeBn: '⚡ বৈশাখী ও ঈদ মেগা সেল',
      badgeEn: '⚡ SEASONAL MEGA SALE',
      titleBn: 'যা দরকার, এক জায়গায় — সেরা দামে সেরা কোয়ালিটি!',
      titleEn: 'Everything You Need, In One Place — Best Quality & Price!',
      subtitleBn: 'ছেলেদের প্রিমিয়াম শার্ট, ঐতিহ্যবাহী জামদানি শাড়ি ও এক্সেসরিজে সর্বোচ্চ ৪৫% পর্যন্ত নিশ্চিত ছাড়।',
      subtitleEn: 'Upto 45% discount on Men Fashion, Traditional Sarees & Accessories.',
      ctaBn: 'অফার দেখুন',
      ctaEn: 'Explore Deals',
      category: 'deals-offers',
      bgGradient: 'from-slate-900 via-rose-950 to-slate-900',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];
  const bgGradient = slide?.bgGradient || 'from-slate-900 via-rose-950 to-slate-900';

  if (!slide) return null;

  return (
    <div className="relative overflow-hidden bg-gray-900 text-white rounded-2xl md:rounded-3xl shadow-xl my-3 sm:my-6">
      <div className={`relative min-h-[380px] sm:min-h-[440px] flex items-center bg-gradient-to-r ${bgGradient} transition-all duration-700`}>
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt="Hero banner"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay transition-transform duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/40 to-black/80" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-16 w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/10 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
              <span>{t(slide.badgeBn, slide.badgeEn)}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
              {t(slide.titleBn, slide.titleEn)}
            </h1>

            <p className="text-xs sm:text-base text-gray-300 max-w-xl font-normal leading-relaxed">
              {t(slide.subtitleBn, slide.subtitleEn)}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  if (slide.need) setSelectedNeed(slide.need);
                  if (slide.category) setSelectedCategory(slide.category);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all hover:scale-105 cursor-pointer"
              >
                <span>{t(slide.ctaBn, slide.ctaEn)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveModal('helpMeChoose')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-full border border-white/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{t('কী কিনব বুঝতে পারছেন না?', 'Help Me Choose')}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center justify-center md:justify-start space-x-4 text-[11px] sm:text-xs text-gray-300">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</span>
              </span>
              <span>•</span>
              <span>{t('৭ দিনের রিটার্ন', '7-Day Return')}</span>
              <span>•</span>
              <span>{t('১০০% খাঁটি পণ্য', 'Authentic')}</span>
            </div>
          </div>

          {/* Quick Offer Visual Card */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-xs text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center font-black text-xl mb-3 shadow-md">
              ৳
            </div>
            <h3 className="font-bold text-base text-white">
              {t('ঝটপট কেনাকাটা, নিশ্চিন্ত ডেলিভারি', 'Fast Shopping, Trusted Delivery')}
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              {t('৩০-৬০ সেকেন্ডে পছন্দ করুন এবং অর্ডার করুন কোনো ঝামেলা ছাড়াই!', 'Pick and order in 30-60s with zero friction!')}
            </p>
            <div className="mt-4 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-4/5 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentSlide === i ? 'w-6 bg-rose-500' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
