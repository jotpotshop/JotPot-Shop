export const DEFAULT_CATEGORY_STUDIO_ICONS: Record<string, string> = {
  'men-fashion': '/assets/aistudio/01_mens_16592f29.png',
  'women-fashion': '/assets/aistudio/02_womens_391d7b6b.png',
  'gadgets': '/assets/aistudio/03_gadgets_9786b907.png',
  'jewelry': '/assets/aistudio/04_jewellery_4b99eb5f.png',
  'shoes': '/assets/aistudio/05_shoes_d6248519.png',
  'bags': '/assets/aistudio/06_bags_74559288.png',
  'accessories': '/assets/aistudio/07_fashion_a949c011.png',
  'gift-items': '/assets/aistudio/08_gifts_115ba772.png',
  'home-lifestyle': '/assets/aistudio/09_home_2410eca8.png',
  'deals-offers': '/assets/aistudio/10_offers_fb720d7c.png',
};

export function isImageIconUrl(icon?: string): boolean {
  if (!icon) return false;
  return (
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('data:image/') ||
    icon.startsWith('/')
  );
}

/**
 * Resolves a category's display icon:
 * - Preserves custom admin-uploaded URLs / data URIs / local asset paths.
 * - Automatically upgrades legacy default emoji icons (e.g. from older Firestore docs)
 *   to the crisp local studio PNG category visuals.
 */
export function resolveCategoryIcon(categoryId: string, icon?: string): string {
  if (isImageIconUrl(icon)) {
    return icon as string;
  }
  if (categoryId && DEFAULT_CATEGORY_STUDIO_ICONS[categoryId]) {
    return DEFAULT_CATEGORY_STUDIO_ICONS[categoryId];
  }
  return icon || '';
}
