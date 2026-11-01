import React from 'react';
import { useShop } from '../context/ShopContext';
import { getTrustIconComponent } from '../utils/trustIcons';

interface TrustSectionProps {
  // Optional preview mode override for admin live preview
  previewSettings?: import('../types').TrustSectionSettings;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ previewSettings }) => {
  const { t, trustSectionSettings: contextSettings, homepageSections } = useShop();

  const settings = previewSettings || contextSettings;

  // If previewSettings is NOT passed (real customer view), check both homepageSections and settings.isEnabled
  if (!previewSettings && homepageSections && homepageSections.showTrustBadges === false) {
    return null;
  }

  if (!settings || settings.isEnabled === false) {
    return null;
  }

  const activeFeatures = (settings.features || [])
    .filter(f => f.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const accent = settings.accentColor || 'rose';

  // Preset styles based on selected accent color
  const getAccentStyles = () => {
    switch (accent) {
      case 'emerald':
        return {
          tag: 'text-emerald-700 bg-emerald-50 border border-emerald-100',
          iconBox: 'text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
          cardHover: 'hover:border-emerald-200',
          titleHover: 'group-hover:text-emerald-600',
        };
      case 'blue':
        return {
          tag: 'text-blue-700 bg-blue-50 border border-blue-100',
          iconBox: 'text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
          cardHover: 'hover:border-blue-200',
          titleHover: 'group-hover:text-blue-600',
        };
      case 'indigo':
        return {
          tag: 'text-indigo-700 bg-indigo-50 border border-indigo-100',
          iconBox: 'text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
          cardHover: 'hover:border-indigo-200',
          titleHover: 'group-hover:text-indigo-600',
        };
      case 'amber':
        return {
          tag: 'text-amber-800 bg-amber-50 border border-amber-100',
          iconBox: 'text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
          cardHover: 'hover:border-amber-200',
          titleHover: 'group-hover:text-amber-600',
        };
      case 'purple':
        return {
          tag: 'text-purple-700 bg-purple-50 border border-purple-100',
          iconBox: 'text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
          cardHover: 'hover:border-purple-200',
          titleHover: 'group-hover:text-purple-600',
        };
      case 'dark':
        return {
          tag: 'text-gray-900 bg-gray-100 border border-gray-200',
          iconBox: 'text-gray-900 group-hover:bg-gray-900 group-hover:text-white',
          cardHover: 'hover:border-gray-400',
          titleHover: 'group-hover:text-gray-900',
        };
      case 'rose':
      default:
        return {
          tag: 'text-rose-600 bg-rose-50 border border-rose-100',
          iconBox: 'text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
          cardHover: 'hover:border-rose-200',
          titleHover: 'group-hover:text-rose-600',
        };
    }
  };

  const accentStyles = getAccentStyles();
  const sectionBg = settings.bgColor || 'bg-white';
  const sectionTextColor = settings.textColor || 'text-gray-900';
  const cardBg = settings.cardBgColor || 'bg-gray-50/70';

  return (
    <section className={`my-10 ${sectionBg} border border-gray-100 rounded-3xl p-6 sm:p-10 shadow-xs transition-colors duration-200`}>
      <div className="text-center max-w-xl mx-auto mb-8">
        {(settings.tagBn || settings.tagEn) && (
          <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 ${accentStyles.tag}`}>
            {t(settings.tagBn || 'কেন ঝটপটশপ বেছে নেবেন?', settings.tagEn || 'WHY CHOOSE JOTPOTSHOP?')}
          </span>
        )}
        <h2 className={`text-xl sm:text-2xl font-black ${sectionTextColor} tracking-tight`}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeFeatures.map((item, idx) => {
          const Icon = getTrustIconComponent(item.icon);
          return (
            <div
              key={item.id || idx}
              className={`flex items-start space-x-4 p-4 rounded-2xl ${cardBg} border border-gray-100 ${accentStyles.cardHover} transition-all duration-200 group`}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center justify-center transition-colors shrink-0 ${accentStyles.iconBox}`}
              >
                <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold text-gray-900 ${accentStyles.titleHover} transition-colors line-clamp-1`}>
                  {t(item.titleBn, item.titleEn)}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
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
