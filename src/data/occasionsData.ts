import { NeedTag, Product, BundleOffer } from '../types';

export interface OccasionConfig {
  id: NeedTag;
  icon: string;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  color: string;
  keywords: string[];
}

export const OCCASIONS_LIST: OccasionConfig[] = [
  {
    id: 'gift',
    icon: '🎁',
    titleBn: 'উপহার',
    titleEn: 'Gift',
    descriptionBn: 'প্রিয়জনকে উপহার দেওয়ার মতো প্রিমিয়াম ও আকর্ষণীয় পণ্যসমূহ',
    descriptionEn: 'Thoughtful and premium gifts for your loved ones',
    color: 'from-pink-500 to-rose-500',
    keywords: [
      'gift',
      'উপহার',
      'ঘড়ি',
      'watch',
      'wallet',
      'ওয়ালেট',
      'মানিব্যাগ',
      'perfume',
      'পারফিউম',
      'আতর',
      'attar',
      'jewel',
      'জুয়েলারি',
      'বক্স',
      'box',
      'sunglass',
      'সানগ্লাস',
      'স্মার্টওয়াচ',
    ],
  },
  {
    id: 'office',
    icon: '💼',
    titleBn: 'অফিস',
    titleEn: 'Office',
    descriptionBn: 'কর্মক্ষেত্র ও অফিস প্রেজেন্টেশনে মানানসই মার্জিত পোশাক ও গ্যাজেট',
    descriptionEn: 'Formal & smart workwear, bags, and daily executive gadgets',
    color: 'from-blue-600 to-indigo-700',
    keywords: [
      'office',
      'অফিস',
      'shirt',
      'শার্ট',
      'oxford',
      'formal',
      'ফর্মাল',
      'leather',
      'লেদার',
      'laptop',
      'ল্যাপটপ',
      'bag',
      'ব্যাগ',
      'blazer',
      'ব্লেজার',
      'shoe',
      'জুতা',
      'belt',
      'বেল্ট',
      'প্যান্ট',
      'pant',
    ],
  },
  {
    id: 'campus',
    icon: '🎓',
    titleBn: 'ক্যাম্পাস',
    titleEn: 'Campus',
    descriptionBn: 'কলেজ-ভার্সিটির ট্রেন্ডি, স্টাইলিশ ও সাশ্রয়ী নিত্যদিনের ফ্যাশন',
    descriptionEn: 'Trendy, casual, and affordable campus essentials for students',
    color: 'from-amber-500 to-orange-600',
    keywords: [
      'campus',
      'ক্যাম্পাস',
      't-shirt',
      'টি-শার্ট',
      'polo',
      'পোলো',
      'sneaker',
      'স্নিকার্স',
      'backpack',
      'ব্যাকপ্যাক',
      'denim',
      'জিন্স',
      'jeans',
      'earbuds',
      'ইয়ারবাডস',
      'casual',
      'ক্যাজুয়াল',
      'হালকা',
      'হুডি',
      'hoodie',
    ],
  },
  {
    id: 'wedding',
    icon: '💍',
    titleBn: 'বিবাহ/উৎসব',
    titleEn: 'Wedding',
    descriptionBn: 'বিয়ে, গায়ে হলুদ ও উৎসবমুখর পারিবারিক অনুষ্ঠানের বিশেষ কালেকশন',
    descriptionEn: 'Festive, traditional & wedding ceremonial attires and jewelry',
    color: 'from-rose-600 to-red-700',
    keywords: [
      'wedding',
      'বিবাহ',
      'বিয়ে',
      'panjabi',
      'পাঞ্জাবি',
      'saree',
      'শাড়ি',
      'koti',
      'কোটি',
      'gold',
      'গহনা',
      'jewelry',
      'lehenga',
      'শেরওয়ানি',
      'উৎসব',
      'পায়জামা',
      'আতর',
      'পারফিউম',
    ],
  },
  {
    id: 'travel',
    icon: '✈️',
    titleBn: 'ভ্রমণ',
    titleEn: 'Travel',
    descriptionBn: 'ট্যুর, হাইকিং ও ভ্রমণের জন্য টেকসই ব্যাকপ্যাক, ট্রাভেল আনুষঙ্গিক',
    descriptionEn: 'Durable gear, backpacks, and accessories for trips and outdoor travels',
    color: 'from-teal-500 to-cyan-600',
    keywords: [
      'travel',
      'ভ্রমণ',
      'tour',
      'ট্যুর',
      'backpack',
      'ব্যাকপ্যাক',
      'powerbank',
      'পাওয়ারব্যাংক',
      'sunglass',
      'সানগ্লাস',
      'luggage',
      'লাগেজ',
      'jacket',
      'জ্যাকেট',
      'হুডি',
      'স্নিকার্স',
    ],
  },
  {
    id: 'party',
    icon: '🎉',
    titleBn: 'পার্টি',
    titleEn: 'Party',
    descriptionBn: 'নাইট-আউট, পার্টি ও গেট-টুগেদারে আকর্ষণীয় লুক তৈরি করার আইটেম',
    descriptionEn: 'Chic, statement pieces and party-ready looks to stand out',
    color: 'from-purple-600 to-pink-600',
    keywords: [
      'party',
      'পার্টি',
      'stylish',
      'স্মার্ট',
      'watch',
      'ঘড়ি',
      'perfume',
      'পারফিউম',
      'ব্লেজার',
      'blazer',
      'গহনা',
      'জুয়েলারি',
      'প্রিমিয়াম',
      'premium',
      'চকচকে',
    ],
  },
  {
    id: 'couple',
    icon: '❤️',
    titleBn: 'কাপল',
    titleEn: 'Couple',
    descriptionBn: 'ম্যাচিং কাপল পোশাক, যুগল ঘড়ি ও বিশেষ ভালোবাসার কম্বো',
    descriptionEn: 'Matching partner sets, his & hers accessories, and romantic gifts',
    color: 'from-red-500 to-rose-600',
    keywords: [
      'couple',
      'কাপল',
      'combo',
      'কম্বো',
      'pair',
      'ম্যাচিং',
      'matching',
      'ভালোবাসা',
      'gift',
      'উপহার',
      'জোড়া',
    ],
  },
  {
    id: 'formal',
    icon: '👔',
    titleBn: 'ফর্মাল',
    titleEn: 'Formal',
    descriptionBn: 'মিটিং, ইন্টারভিউ ও কনফারেন্সের জন্য কমপ্লিট ক্লাসিক লুক',
    descriptionEn: 'Classic formal attire, leather shoes, belts & accessories',
    color: 'from-slate-700 to-gray-900',
    keywords: [
      'formal',
      'ফর্মাল',
      'oxford',
      'shirt',
      'শার্ট',
      'leather',
      'লেদার',
      'belt',
      'বেল্ট',
      'panjabi',
      'পাঞ্জাবি',
      'জুতা',
      'shoe',
      'টাই',
      'tie',
      'ব্লেজার',
    ],
  },
  {
    id: 'everyday',
    icon: '🔥',
    titleBn: 'দৈনন্দিন',
    titleEn: 'Everyday',
    descriptionBn: 'প্রতিদিনের আরামদায়ক ব্যবহার ও ক্যাজুয়াল চলাফেরার দরকারি আইটেম',
    descriptionEn: 'Everyday essential items, daily casual comfort wear',
    color: 'from-emerald-500 to-teal-600',
    keywords: [
      'everyday',
      'দৈনন্দিন',
      'daily',
      'ক্যাজুয়াল',
      'casual',
      'টি-শার্ট',
      't-shirt',
      'কটন',
      'cotton',
      'নিত্যদিনের',
      'নিয়মিত',
      'আরামদায়ক',
    ],
  },
];

/**
 * Intelligent auto-detection of occasions for any product
 * Analyzes name, category, subcategory, brand, description, and keywords
 */
export function detectProductOccasions(product: {
  name?: string;
  nameBn?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
  descriptionBn?: string;
}): NeedTag[] {
  const fullText = [
    product.name || '',
    product.nameBn || '',
    product.category || '',
    product.subcategory || '',
    product.brand || '',
    product.description || '',
    product.descriptionBn || '',
  ]
    .join(' ')
    .toLowerCase();

  const detected: NeedTag[] = [];

  for (const occasion of OCCASIONS_LIST) {
    const hasMatch = occasion.keywords.some(keyword =>
      fullText.includes(keyword.toLowerCase())
    );
    if (hasMatch) {
      detected.push(occasion.id);
    }
  }

  // Smart fallbacks based on category if empty
  if (detected.length === 0) {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('men') || cat.includes('women') || cat.includes('fashion')) {
      detected.push('office', 'campus', 'everyday');
    } else if (cat.includes('gadget') || cat.includes('tech') || cat.includes('watch')) {
      detected.push('gift', 'campus', 'office');
    } else if (cat.includes('bag') || cat.includes('luggage')) {
      detected.push('office', 'campus', 'travel');
    } else {
      detected.push('everyday', 'gift');
    }
  }

  // Ensure unique
  return Array.from(new Set(detected));
}

/**
 * Smart Auto-Bundle Generator:
 * Pairs complementary catalog items into an executive or smart combo bundle
 */
export function generateSmartComboBundle(
  allProducts: Product[],
  existingBundles: BundleOffer[]
): BundleOffer | null {
  if (allProducts.length < 2) return null;

  // Find complementary pairs:
  // e.g. 1 shirt/panjabi + 1 wallet/watch/glasses OR 1 watch + 1 earbuds
  const fashionItems = allProducts.filter(
    p =>
      p.category === 'men-fashion' ||
      p.category === 'women-fashion' ||
      p.categoryBn?.includes('ফ্যাশন')
  );
  const accessories = allProducts.filter(
    p =>
      p.category === 'accessories' ||
      p.category === 'leather' ||
      p.categoryBn?.includes('এক্সেসরিজ') ||
      p.categoryBn?.includes('ব্যাগ') ||
      p.categoryBn?.includes('ঘড়ি')
  );
  const techItems = allProducts.filter(
    p =>
      p.category === 'gadgets' ||
      p.category === 'electronics' ||
      p.categoryBn?.includes('গ্যাজেট')
  );

  let selectedItems: Product[] = [];
  let titleBn = '';
  let titleEn = '';
  let descBn = '';
  let descEn = '';

  // Try to create Fashion + Accessory bundle first
  const unusedFashion = fashionItems.find(
    f => !existingBundles.some(b => b.productIds.includes(f.id))
  ) || fashionItems[0];

  const unusedAccessory = accessories.find(
    a => !existingBundles.some(b => b.productIds.includes(a.id)) && a.id !== unusedFashion?.id
  ) || accessories[0];

  if (unusedFashion && unusedAccessory) {
    selectedItems = [unusedFashion, unusedAccessory];
    titleBn = `${unusedFashion.nameBn || unusedFashion.name} + ${unusedAccessory.nameBn || unusedAccessory.name} স্পেশাল কম্বো`;
    titleEn = `${unusedFashion.name} + ${unusedAccessory.name} Style Combo`;
    descBn = 'অফিস বা বিশেষ অনুষ্ঠানের জন্য সম্পূর্ণ লুক। একসাথে কিনে সাশ্রয় করুন আকর্ষণীয় ছাড়!';
    descEn = 'Complete stylish look for office or special events. Save big with combo discount!';
  } else if (techItems.length >= 2) {
    selectedItems = [techItems[0], techItems[1]];
    titleBn = `${techItems[0].nameBn || techItems[0].name} + ${techItems[1].nameBn || techItems[1].name} স্মার্ট টেক কম্বো`;
    titleEn = `${techItems[0].name} + ${techItems[1].name} Tech Combo`;
    descBn = 'নিত্যদিনের গ্যাজেট কম্বো অফার। একসাথে কিনে স্পেশাল ডিসকাউন্ট পান!';
    descEn = 'Everyday tech combo deal. Get special bundled savings!';
  } else {
    // Pick any 2 distinct items
    selectedItems = [allProducts[0], allProducts[1]];
    titleBn = `${selectedItems[0].nameBn || selectedItems[0].name} + ${selectedItems[1].nameBn || selectedItems[1].name} কম্বো`;
    titleEn = `${selectedItems[0].name} + ${selectedItems[1].name} Combo`;
    descBn = 'বিশেষ কম্বো অফার। একসাথে কিনে দারুণ সাশ্রয় করুন!';
    descEn = 'Special combo offer. Buy together and save instantly!';
  }

  const regularPrice = selectedItems.reduce((sum, p) => sum + p.price, 0);
  // 15% - 20% discount on combo
  const discountAmount = Math.round(regularPrice * 0.17);
  const bundlePrice = Math.max(100, regularPrice - discountAmount);
  const saveAmount = regularPrice - bundlePrice;

  return {
    id: `bundle-${Date.now()}`,
    title: titleEn,
    titleBn,
    description: descEn,
    descriptionBn: descBn,
    productIds: selectedItems.map(p => p.id),
    regularPrice,
    bundlePrice,
    badge: `SAVE ৳${saveAmount}`,
    isActive: true,
  };
}
