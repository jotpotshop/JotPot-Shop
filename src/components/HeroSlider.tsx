import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HeroSlider: React.FC = () => {
  const { t, setSelectedCategory, setSelectedNeed, setActiveModal, heroBanners } = useShop();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imgFailed, setImgFailed] = useState<Record<number, boolean>>({});

  const activeSlides = (heroBanners && heroBanners.length > 0)
    ? heroBanners.filter(b => b.active !== false)
    : [];

  const slides = activeSlides.length > 0 ? activeSlides : [
    {
      id: 1,
      badgeBn: 'সিজনাল কালেকশন',
      badgeEn: 'SEASONAL COLLECTION',
      titleBn: 'যা দরকার, এক জায়গায় — মানসম্মত ও বিশ্বস্ত পণ্য',
      titleEn: 'Curated Everyday Quality, Delivered Across Bangladesh',
      subtitleBn: 'ছেলেদের প্রিমিয়াম শার্ট, ঐতিহ্যবাহী জামদানি শাড়ি ও নিত্যপ্রয়োজনীয় গ্যাজেটে বিশেষ মূল্যছাড়।',
      subtitleEn: 'Thoughtfully selected fashion, traditional sarees, and lifestyle essentials.',
      ctaBn: 'কালেকশন দেখুন',
      ctaEn: 'Explore Collection',
      category: 'deals-offers',
      bgGradient: '',
      image: '',
    },
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];
  if (!slide) return null;

  const stripEmoji = (str?: string) => (str || '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <section className="relative overflow-hidden bg-[#0f172a] text-white rounded-2xl border border-[#e6e3dd]/20 my-4 sm:my-6">
      <div className="relative min-h-[360px] sm:min-h-[430px] flex items-center">
        {/* Editorial Background Photography with Clean Directional Scrim */}
        <div className="absolute inset-0 z-0">
          {!imgFailed[currentSlide] && slide.image ? (
            <img
              src={slide.image}
              alt={t(slide.titleBn, slide.titleEn)}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(prev => ({ ...prev, [currentSlide]: true }))}
              className="w-full h-full object-cover object-center opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-[#111827]" />
          )}
          <div className="absolute inset-0 bg-[#0f172a]/70" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-12 py-10 sm:py-14 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-medium text-amber-200 tracking-wide uppercase">
              <span className="w-5 h-px bg-amber-300/70" />
              <span>{stripEmoji(t(slide.badgeBn, slide.badgeEn))}</span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.28] text-white">
              {t(slide.titleBn, slide.titleEn)}
            </h1>

            <p className="text-sm sm:text-base text-gray-200 max-w-xl font-normal leading-[1.7]">
              {t(slide.subtitleBn, slide.subtitleEn)}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (slide.need) setSelectedNeed(slide.need);
                  if (slide.category) setSelectedCategory(slide.category);
                }}
                className="bg-[#881337] hover:bg-[#9f1239] text-white font-semibold text-xs sm:text-sm px-6 py-3 min-h-[44px] rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span>{t(slide.ctaBn, slide.ctaEn)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveModal('helpMeChoose')}
                className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-5 py-3 min-h-[44px] rounded-xl border border-white/25 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t('পছন্দ করতে সহায়তা নিন', 'Product Finder')}</span>
              </button>
            </div>

            {/* Restrained Trust Line */}
            <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-300">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('সারা দেশে ক্যাশ অন ডেলিভারি', 'Cash on Delivery Nationwide')}</span>
              </span>
              <span className="text-gray-500">•</span>
              <span>{t('৭ দিনের সহজ রিটার্ন', '7-Day Easy Return')}</span>
              <span className="text-gray-500">•</span>
              <span>{t('মান যাচাইকৃত পণ্য', 'Quality Checked')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Controls (Only rendered when multiple slides exist) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === i ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
