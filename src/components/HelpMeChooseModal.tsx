import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Gift,
  Briefcase,
  GraduationCap,
  Heart,
  Plane,
  PartyPopper,
  Users,
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
    { id: 'friend', labelBn: '👨‍💼 বন্ধু বা সহকর্মীকে', labelEn: 'Friend or Colleague', icon: Users },
    { id: 'myself', labelBn: '🙋‍♂️ নিজের জন্য', labelEn: 'For Myself', icon: CheckCircle },
    { id: 'partner', labelBn: '❤️ স্বামী / স্ত্রী / প্রিয় মানুষ', labelEn: 'Spouse or Partner', icon: Heart },
    { id: 'family', labelBn: '👨‍👩‍👧 পরিবারের সদস্যদের', labelEn: 'Family Member', icon: Gift },
  ];

  const occasionOptions = [
    { id: 'gift', labelBn: '🎁 জন্মদিন বা উপহার', labelEn: 'Birthday or Gift', icon: Gift },
    { id: 'office', labelBn: '💼 অফিস বা চাকরির কাজ', labelEn: 'Office & Work', icon: Briefcase },
    { id: 'campus', labelBn: '🎓 ক্যাম্পাস বা আড্ডা', labelEn: 'Campus & Hangout', icon: GraduationCap },
    { id: 'wedding', labelBn: '💍 বিয়ে বা স্পেশাল অনুষ্ঠান', labelEn: 'Wedding or Festive', icon: PartyPopper },
    { id: 'travel', labelBn: '✈️ ট্যুর বা ভ্রমণ', labelEn: 'Travel & Trips', icon: Plane },
    { id: 'everyday', labelBn: '🔥 নিয়মিত সাধারণ ব্যবহার', labelEn: 'Daily Casual Use', icon: CheckCircle },
  ];

  const budgetOptions = [
    { val: 1000, labelBn: '৳১,০০০ টাকার নিচে', labelEn: 'Under ৳1,000' },
    { val: 2000, labelBn: '৳২,০০০ টাকার নিচে', labelEn: 'Under ৳2,000' },
    { val: 3500, labelBn: '৳৩,৫০০ টাকার নিচে', labelEn: 'Under ৳3,500' },
    { val: 6000, labelBn: '৳৬,০০০+ প্রিমিয়াম', labelEn: '৳6,000+ Premium' },
  ];

  // Matching algorithm
  const matchedProducts = products.filter(p => {
    // Budget
    if (p.price > budget) return false;

    // Occasion/need tag match
    if (occasion && p.needTags.includes(occasion as any)) {
      return true;
    }

    if (occasion === 'gift' && (p.category === 'gift-items' || p.category === 'gadgets' || p.category === 'bags' || p.category === 'accessories')) {
      return true;
    }

    return p.price <= budget;
  }).slice(0, 4);

  const resetWizard = () => {
    setStep(1);
    setForWhom('friend');
    setOccasion('gift');
    setBudget(2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 fill-white stroke-none" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {t('কী কিনব বুঝতে পারছেন না?', 'Help Me Choose')}
              </h3>
              <p className="text-xs text-white/90">
                {t('সহজ ৩টি প্রশ্নের উত্তর দিন — আপনার জন্য সেরা পণ্য খুঁজে দেব!', 'Answer 3 simple questions and we will find the ideal match!')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className={`${step >= 1 ? 'text-rose-600' : ''}`}>
            1. {t('কার জন্য?', 'For Whom?')}
          </span>
          <span>→</span>
          <span className={`${step >= 2 ? 'text-rose-600' : ''}`}>
            2. {t('কী উপলক্ষ?', 'Occasion?')}
          </span>
          <span>→</span>
          <span className={`${step >= 3 ? 'text-rose-600' : ''}`}>
            3. {t('বাজেট কত?', 'Budget?')}
          </span>
          <span>→</span>
          <span className={`${step === 4 ? 'text-rose-600' : ''}`}>
            4. {t('সুপারিশ', 'Results')}
          </span>
        </div>

        {/* Body Steps */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 text-center">
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
                      className={`p-4 rounded-2xl border-2 text-left flex items-center space-x-3 transition-all cursor-pointer ${
                        selected
                          ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm'
                          : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${selected ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm">{t(opt.labelBn, opt.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-full text-sm inline-flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 text-center">
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
                      className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-sm'
                          : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${selected ? 'text-rose-600' : 'text-gray-500'}`} />
                      <span className="font-bold text-xs">{t(opt.labelBn, opt.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {t('পূর্ববর্তী', 'Back')}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-full text-sm inline-flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <span>{t('পরবর্তী ধাপ', 'Next Step')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 text-center">
                {t('আপনার সুবিধাজনক বাজেট কত?', 'What is your comfortable budget?')}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {budgetOptions.map(b => {
                  const selected = budget === b.val;
                  return (
                    <button
                      key={b.val}
                      onClick={() => setBudget(b.val)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-rose-600 bg-rose-50 text-rose-900 font-extrabold shadow-sm'
                          : 'border-gray-200 hover:border-rose-200 hover:bg-gray-50 text-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-sm">{t(b.labelBn, b.labelEn)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {t('পূর্ববর্তী', 'Back')}
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-7 py-2.5 rounded-full text-sm inline-flex items-center space-x-2 shadow-md cursor-pointer transition-all"
                >
                  <span>{t('পণ্য দেখুন', 'Show Matches')}</span>
                  <Sparkles className="w-4 h-4 fill-white stroke-none" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    {t(
                      `আপনার জন্য খুঁজে পাওয়া সেরা সুপারিশমালা (বাজেট ৳${budget})`,
                      `Top recommendations tailored for you (Budget ৳${budget})`
                    )}
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    {t('পণ্যগুলো দ্রুত ডেলিভারি ও মানসম্মত কোয়ালিটি নিশ্চিত।', 'Verified high-rated items ready for instant shipping.')}
                  </p>
                </div>
                <button
                  onClick={resetWizard}
                  className="text-xs font-semibold text-gray-600 hover:text-rose-600 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('পুনরায় করুন', 'Start Over')}</span>
                </button>
              </div>

              {matchedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    {t('কোনো পণ্য এই ফিল্টারে মিলেনি। দয়া করে বাজেট বাড়ান।', 'No exact match. Try adjusting budget.')}
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
