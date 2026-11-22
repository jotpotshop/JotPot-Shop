import React from 'react';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav: React.FC = () => {
  const {
    t,
    cart,
    wishlist,
    setActiveModal,
    setSelectedCategory,
    setSelectedNeed,
    setSelectedMaxBudget,
  } = useShop();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e6e3dd] px-2 py-1.5 flex items-center justify-around">
      <button
        onClick={() => {
          setSelectedCategory(null);
          setSelectedNeed(null);
          setSelectedMaxBudget(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex flex-col items-center justify-center py-1 px-2 min-h-[44px] text-gray-700 hover:text-[#881337] transition-colors cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{t('হোম', 'Home')}</span>
      </button>

      <button
        onClick={() => {
          const el = document.getElementById('categories-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setSelectedCategory('men-fashion');
          }
        }}
        className="flex flex-col items-center justify-center py-1 px-2 min-h-[44px] text-gray-700 hover:text-[#881337] transition-colors cursor-pointer"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{t('ক্যাটাগরি', 'Categories')}</span>
      </button>

      <button
        onClick={() => setActiveModal('search')}
        className="flex flex-col items-center justify-center py-1 px-2 min-h-[44px] text-[#881337] transition-colors cursor-pointer"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">{t('খুঁজুন', 'Search')}</span>
      </button>

      <button
        onClick={() => setActiveModal('account')}
        className="relative flex flex-col items-center justify-center py-1 px-2 min-h-[44px] text-gray-700 hover:text-[#881337] transition-colors cursor-pointer"
      >
        <Heart className="w-5 h-5" />
        {wishlist.length > 0 && (
          <span className="absolute top-0.5 right-1 bg-[#881337] text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
            {wishlist.length}
          </span>
        )}
        <span className="text-[10px] font-medium mt-0.5">{t('পছন্দ', 'Wishlist')}</span>
      </button>

      <button
        onClick={() => setActiveModal('cart')}
        className="relative flex flex-col items-center justify-center py-1 px-2 min-h-[44px] text-gray-700 hover:text-[#881337] transition-colors cursor-pointer"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-1 bg-[#881337] text-white text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] font-medium mt-0.5">{t('ব্যাগ', 'Cart')}</span>
      </button>
    </nav>
  );
};
