import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Gift,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  Calendar,
  Users,
  Compass,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const HelpMeChooseModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    products,
    t,
  } = useShop();

  const [step, setStep] = useState<number>(1);
  const [forWhom, setForWhom] = useState<string>('friend');
  const [occasion, setOccasion] = useState<string>('gift');
  const [budget, setBudget] = useState<number>(2000);

  if (activeModal !== 'helpMeChoose') return null;

  const forWhomOptions = [
    { id: 'friend', labelBn: 'বন্ধু বা সহকর্মীর জন্য', labelEn: 'Friend or Colleague', icon: Users },
    { id: 'myself', labelBn: 'নিজের ব্যবহারের জন্য', labelEn: 'For Myself', icon: CheckCircle },
    { id: 'partner', labelBn: 'পরিবারের প্রিয়জনের জন্য', labelEn: 'Spouse or Partner', icon: Heart },
    { id: 'family', labelBn: 'বাসার সবার জন্য', labelEn: 'Family Member', icon: Gift },
  ];

  const occasionOptions = [
    { id: 'gift', labelBn: 'জন্মদিন বা উপহার', labelEn: 'Birthday or Gift', icon: Gift },
    { id: 'office', labelBn: 'অফিস বা পেশাদার কাজ', labelEn: 'Office & Work', icon: Briefcase },
    { id: 'campus', labelBn: 'ক্যাম্পাস বা নিয়মিত পড়াশোনা', labelEn: 'Campus & Study', icon: GraduationCap },
    { id: 'wedding', labelBn: 'উৎসব বা বিশেষ অনুষ্ঠান', labelEn: 'Wedding or Festive', icon: Calendar },
    { id: 'travel', labelBn: 'ভ্রমণ বা ট্যুর', labelEn: 'Travel & Trips', icon: Plane },
    { id: 'everyday', labelBn: 'দৈনন্দিন ব্যবহার', labelEn: 'Daily Casual Use', icon: CheckCircle },
  ];

  const budgetOptions = [
    { val: 1000, labelBn: '৳১,০০০ টাকার নিচে', labelEn: 'Under ৳1,000' },
    { val: 2000, labelBn: '৳২,০০০ টাকার নিচে', labelEn: 'Under ৳2,000' },
    { val: 3500, labelBn: '৳৩,৫০০ টাকার নিচে', labelEn: 'Under ৳3,500' },
    { val: 6000, labelBn: '৳৬,০০০ পর্যন্ত প্রিমিয়াম', labelEn: 'Up to ৳6,000 Premium' },
  ];

  const matchedProducts = products
    .filter(p => {
      if (p.isPublished === false) return false;
      if (p.price > budget) return false;
      if (occasion && p.needTags?.includes(occasion as any)) {
        return true;
      }
      if (
        occasion === 'gift' &&
        (p.category === 'gift-items' || p.category === 'gadgets' || p.category === 'bags' || p.category === 'accessories')
      ) {
        return true;
      }
      return p.price <= budget;
    })
    .slice(0, 4);

  const resetWizard = () => {
    setStep(1);
    setForWhom('friend');
    setOccasion('gift');
    setBudget(2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-[#e6e3dd] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-editorial font-bold text-base sm:text-lg text-white">
                {t('সঠিক পণ্য বেছে নিতে সহায়তা', 'Product Finder')}
              </h3>
              <p className="text-xs text-gray-300">
                {t('সহজ ৩টি প্রশ্নের উত্তর দিন — প্রয়োজন অনুযায়ী সেরা পণ্য দেখুন', 'Answer 3 quick questions to see tailored recommendations')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            aria-label={t('বন্ধ করুন', 'Close')}
            className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 py-3 bg-[#faf9f7] border-b border-[#e6e3dd] flex items-center justify-between text-xs font-semibold text-gray-500 tabular-nums overflow-x-auto gap-2">
          <span className={step >= 1 ? 'text-[#881337] whitespace-nowrap' : 'whitespace-nowrap'}>
            ১. {t('কার জন্য?', 'For Whom?')}
          </span>
          <span className="text-gray-300">·</span>
          <span className={step >= 2 ? 'text-[#881337] whitespace-nowrap' : 'whitespace-nowrap'}>
            ২. {t('উপলক্ষ', 'Occasion')}
          </span>
          <span className="text-gray-300">·</span>
          <span className={step >= 3 ? 'text-[#881337] whitespace-nowrap' : 'whitespace-nowrap'}>
            ৩. {t('বাজেট', 'Budget')}
          </span>
          <span className="text-gray-300">·</span>
          <span className={step === 4 ? 'text-[#881337] whitespace-nowrap' : 'whitespace-nowrap'}>
            ৪. {t('সুপারিশ', 'Matches')}
          </span>
        </div>

        {/* Body Steps */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-5">
              <h4 className="font-editorial text-base sm:text-lg font-bold text-[#111827] text-center">
                {t('কার জন্য পণ্যটি কিনতে চান?', 'Who are you shopping for?')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {forWhomOptions.map(opt => {
                  const Icon = opt.icon;
                  const selected = forWhom === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setForWhom(opt.id)}
                      className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#111827] bg-[#faf9f7] text-[#111827] ring-1 ring-[#111827]'
                          : 'border-[#e6e3dd] bg-white hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${selected ? 'bg-[#111827] text-white' : 'bg-[#faf9f7] text-gray-600 border border-[#e6e3dd]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm">{t(opt.labelBn, opt.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-3">
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-6 py-2.5 min-h-[42px] rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h4 className="font-editorial text-base sm:text-lg font-bold text-[#111827] text-center">
                {t('প্রধান ব্যবহার বা উপলক্ষ নির্বাচন করুন', 'Select the primary occasion or need')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                {occasionOptions.map(opt => {
                  const Icon = opt.icon;
                  const selected = occasion === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setOccasion(opt.id)}
                      className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2.5 transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#111827] bg-[#faf9f7] text-[#111827] ring-1 ring-[#111827]'
                          : 'border-[#e6e3dd] bg-white hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-[#881337]' : 'text-gray-500'}`} />
                      <span className="font-semibold text-xs leading-snug">{t(opt.labelBn, opt.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 min-h-[40px] rounded-xl border border-[#e6e3dd] text-xs font-semibold text-gray-600 hover:text-[#111827] hover:bg-[#faf9f7] cursor-pointer transition-colors"
                >
                  {t('পূর্ববর্তী', 'Back')}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-6 py-2.5 min-h-[40px] rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 max-w-lg mx-auto">
              <h4 className="font-editorial text-base sm:text-lg font-bold text-[#111827] text-center">
                {t('আপনার সুবিধাজনক বাজেট কত?', 'What is your comfortable budget?')}
              </h4>
              <div className="grid grid-cols-2 gap-3 tabular-nums">
                {budgetOptions.map(b => {
                  const selected = budget === b.val;
                  return (
                    <button
                      key={b.val}
                      onClick={() => setBudget(b.val)}
                      className={`p-4 rounded-xl border text-center transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#111827] bg-[#faf9f7] text-[#111827] font-bold ring-1 ring-[#111827]'
                          : 'border-[#e6e3dd] bg-white hover:border-gray-400 text-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-sm">{t(b.labelBn, b.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 min-h-[40px] rounded-xl border border-[#e6e3dd] text-xs font-semibold text-gray-600 hover:text-[#111827] hover:bg-[#faf9f7] cursor-pointer transition-colors"
                >
                  {t('পূর্ববর্তী', 'Back')}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-[#881337] hover:bg-[#6d0f2c] text-white font-semibold px-7 py-2.5 min-h-[40px] rounded-xl text-sm inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span>{t('পণ্য দেখুন', 'Show Matches')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-[#faf9f7] border border-[#e6e3dd] p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#111827] tabular-nums">
                    {t(
                      `আপনার পছন্দ অনুযায়ী সুপারিশ (বাজেট ৳${budget})`,
                      `Tailored recommendations (Budget ৳${budget})`
                    )}
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {t('স্টকে থাকা মানসম্মত পণ্যগুলো নিচে দেওয়া হলো', 'Verified in-stock items matching your preferences')}
                  </p>
                </div>
                <button
                  onClick={resetWizard}
                  className="text-xs font-semibold text-[#881337] hover:underline flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('পুনরায় করুন', 'Start Over')}</span>
                </button>
              </div>

              {matchedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    {t('এই বাজেটে কোনো পণ্য পাওয়া যায়নি। দয়া করে বাজেট বাড়িয়ে দেখুন।', 'No exact match found. Try increasing your budget.')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {matchedProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
