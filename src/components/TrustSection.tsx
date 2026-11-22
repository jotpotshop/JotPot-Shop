import React from 'react';
import { useShop } from '../context/ShopContext';
import { getTrustIconComponent } from '../utils/trustIcons';

interface TrustSectionProps {
  previewSettings?: import('../types').TrustSectionSettings;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ previewSettings }) => {
  const { t, trustSectionSettings: contextSettings, homepageSections } = useShop();

  const settings = previewSettings || contextSettings;

  if (!previewSettings && homepageSections && homepageSections.showTrustBadges === false) {
    return null;
  }

  if (!settings || settings.isEnabled === false) {
    return null;
  }

  const activeFeatures = (settings.features || [])
    .filter(f => f.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const accent = settings.accentColor || 'dark';

  const getAccentStyles = () => {
    switch (accent) {
      case 'emerald':
        return {
          tag: 'text-[#15803d] bg-emerald-50 border border-emerald-200',
          iconBox: 'text-[#15803d] group-hover:bg-[#15803d] group-hover:text-white',
          cardHover: 'hover:border-emerald-300',
          titleHover: 'group-hover:text-[#15803d]',
        };
      case 'blue':
        return {
          tag: 'text-blue-800 bg-blue-50 border border-blue-200',
          iconBox: 'text-blue-700 group-hover:bg-blue-700 group-hover:text-white',
          cardHover: 'hover:border-blue-300',
          titleHover: 'group-hover:text-blue-700',
        };
      case 'indigo':
        return {
          tag: 'text-indigo-800 bg-indigo-50 border border-indigo-200',
          iconBox: 'text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white',
          cardHover: 'hover:border-indigo-300',
          titleHover: 'group-hover:text-indigo-700',
        };
      case 'amber':
        return {
          tag: 'text-amber-800 bg-amber-50 border border-amber-200',
          iconBox: 'text-amber-700 group-hover:bg-amber-700 group-hover:text-white',
          cardHover: 'hover:border-amber-300',
          titleHover: 'group-hover:text-amber-800',
        };
      case 'purple':
        return {
          tag: 'text-purple-800 bg-purple-50 border border-purple-200',
          iconBox: 'text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
          cardHover: 'hover:border-purple-300',
          titleHover: 'group-hover:text-purple-700',
        };
      case 'rose':
        return {
          tag: 'text-[#881337] bg-rose-50 border border-rose-200',
          iconBox: 'text-[#881337] group-hover:bg-[#881337] group-hover:text-white',
          cardHover: 'hover:border-rose-300',
          titleHover: 'group-hover:text-[#881337]',
        };
      case 'dark':
      default:
        return {
          tag: 'text-[#111827] bg-[#faf9f7] border border-[#e6e3dd]',
          iconBox: 'text-[#111827] group-hover:bg-[#111827] group-hover:text-white',
          cardHover: 'hover:border-gray-400',
          titleHover: 'group-hover:text-[#881337]',
        };
    }
  };

  const accentStyles = getAccentStyles();
  const sectionBg = settings.bgColor || 'bg-white';
  const sectionTextColor = settings.textColor || 'text-[#111827]';
  const cardBg = settings.cardBgColor || 'bg-[#faf9f7]';

  return (
    <section className={`my-10 ${sectionBg} border border-[#e6e3dd] rounded-2xl p-6 sm:p-10 transition-colors duration-200`}>
      <div className="text-center max-w-xl mx-auto mb-8">
        {(settings.tagBn || settings.tagEn) && (
          <span className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-lg uppercase tracking-wider mb-2.5 ${accentStyles.tag}`}>
            {t(settings.tagBn || 'আমাদের প্রতিশ্রুতি', settings.tagEn || 'OUR COMMITMENT')}
          </span>
        )}
        <h2 className={`font-editorial text-xl sm:text-2xl font-semibold ${sectionTextColor} tracking-tight`}>
          {t(
            settings.headingBn || 'নিশ্চিন্ত কেনাকাটা ও বিশ্বস্ত ডেলিভারি সেবা',
            settings.headingEn || 'Trustworthy Shopping & Reliable Delivery'
          )}
        </h2>
        {(settings.subheadingBn || settings.subheadingEn) && (
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
            {t(settings.subheadingBn, settings.subheadingEn)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {activeFeatures.map((item, idx) => {
          const Icon = getTrustIconComponent(item.icon);
          return (
            <div
              key={item.id || idx}
              className={`flex items-start space-x-4 p-4 rounded-xl ${cardBg} border border-[#e6e3dd] ${accentStyles.cardHover} transition-colors duration-200 group`}
            >
              <div
                className={`w-11 h-11 rounded-xl bg-white border border-[#e6e3dd] flex items-center justify-center transition-colors shrink-0 ${accentStyles.iconBox}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold text-[#111827] ${accentStyles.titleHover} transition-colors leading-snug line-clamp-2`}>
                  {t(item.titleBn, item.titleEn)}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-[1.65] line-clamp-2">
                  {t(item.descBn, item.descEn)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
