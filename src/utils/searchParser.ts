import { Product } from '../types';

export interface ParsedSearchQuery {
  originalQuery: string;
  categoryFilter?: string;
  colorFilter?: string;
  detectedColor?: string;
  itemKeyword?: string;
  maxPrice?: number;
  suggestions: string[];
  rawQuery?: string;
  keywords?: string[];
}

// Convert Bengali numerals to standard numbers (১০০০ -> 1000)
export function parseBanglaNumber(str: string): number | null {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };

  const converted = str.replace(/[০-৯]/g, match => bnToEnMap[match] || match);
  const numMatch = converted.match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : null;
}

export function parseBanglaAndEnglishSearch(query: string): ParsedSearchQuery {
  return parseSmartSearchQuery(query);
}

export function parseSmartSearchQuery(query: string): ParsedSearchQuery {
  const lower = query.toLowerCase().trim();
  const result: ParsedSearchQuery = {
    originalQuery: query,
    rawQuery: query,
    suggestions: [],
    keywords: [],
  };

  if (!lower) return result;

  // 1. Detect Price constraint (e.g., "১০০০ টাকার মধ্যে", "under 1000", "below 1500", "১০০০ টাকা")
  const priceRegex = /(?:under|below|less than|সর্বোচ্চ|মধ্যে|নিচে|বাজেট|budget)?\s*([০-৯\d]+)\s*(?:টাকা|টাকার|tk|taka|bdt)?\s*(?:এর মধ্যে|মধ্যে|নিচে|under|below)?/i;
  const priceMatch = lower.match(priceRegex);
  if (priceMatch && priceMatch[1]) {
    const parsedNum = parseBanglaNumber(priceMatch[1]);
    if (parsedNum && parsedNum > 100) {
      result.maxPrice = parsedNum;
    }
  }

  // 2. Detect Color
  const colorMap: Record<string, string> = {
    'কালো': 'Black',
    'black': 'Black',
    'সাদা': 'White',
    'white': 'White',
    'নীল': 'Navy Blue',
    'blue': 'Navy Blue',
    'লাল': 'Ruby Red',
    'red': 'Ruby Red',
    'সবুজ': 'Green',
    'green': 'Green',
    'ধূসর': 'Grey',
    'grey': 'Grey',
    'gray': 'Grey',
    'বাদামী': 'Brown',
    'brown': 'Brown',
    'গোল্ড': 'Gold',
    'সোনালী': 'Gold',
    'gold': 'Gold',
  };

  for (const [key, colorVal] of Object.entries(colorMap)) {
    if (lower.includes(key)) {
      result.colorFilter = colorVal;
      result.detectedColor = colorVal;
      break;
    }
  }

  // 3. Detect Category / Gender
  if (lower.includes('ছেলেদের') || lower.includes('পুরুষ') || lower.includes('men') || lower.includes('boys')) {
    result.categoryFilter = 'men-fashion';
  } else if (lower.includes('মেয়েদের') || lower.includes('মহিলা') || lower.includes('women') || lower.includes('ladies') || lower.includes('girls')) {
    result.categoryFilter = 'women-fashion';
  } else if (lower.includes('গ্যাজেট') || lower.includes('gadget') || lower.includes('টেক') || lower.includes('tech')) {
    result.categoryFilter = 'gadgets';
  } else if (lower.includes('জুয়েলারি') || lower.includes('গহনা') || lower.includes('গয়না') || lower.includes('jewelry')) {
    result.categoryFilter = 'jewelry';
  } else if (lower.includes('জুতো') || lower.includes('জুতা') || lower.includes('shoe') || lower.includes('sneaker')) {
    result.categoryFilter = 'shoes';
  } else if (lower.includes('ব্যাগ') || lower.includes('bag') || lower.includes('ব্যাকপ্যাক') || lower.includes('backpack')) {
    result.categoryFilter = 'bags';
  } else if (lower.includes('সানগ্লাস') || lower.includes('sunglass') || lower.includes('চশমা')) {
    result.categoryFilter = 'accessories';
  } else if (lower.includes('উপহার') || lower.includes('gift') || lower.includes('গিফট')) {
    result.categoryFilter = 'gift-items';
  }

  // 4. Item Keyword
  const itemKeywords = [
    { en: 'shirt', bn: 'শার্ট' },
    { en: 't-shirt', bn: 'টি-শার্ট' },
    { en: 'panjabi', bn: 'পাঞ্জাবি' },
    { en: 'saree', bn: 'শাড়ি' },
    { en: 'smartwatch', bn: 'স্মার্টওয়াচ' },
    { en: 'watch', bn: 'ঘড়ি' },
    { en: 'earbuds', bn: 'ইয়ারবাডস' },
    { en: 'wallet', bn: 'মানিব্যাগ' },
    { en: 'sneakers', bn: 'স্নিকার্স' },
    { en: 'necklace', bn: 'নেকলেস' },
    { en: 'lamp', bn: 'ল্যাম্প' },
    { en: 'power bank', bn: 'পাওয়ার ব্যাংক' },
  ];

  for (const item of itemKeywords) {
    if (lower.includes(item.bn) || lower.includes(item.en)) {
      result.itemKeyword = item.en;
      break;
    }
  }

  // 5. Generate Smart Suggestions based on extracted elements
  const suggestionsSet = new Set<string>();

  if (result.colorFilter && result.itemKeyword) {
    suggestionsSet.add(`${result.colorFilter} ${result.itemKeyword.charAt(0).toUpperCase() + result.itemKeyword.slice(1)}`);
    suggestionsSet.add(`Men's ${result.colorFilter} ${result.itemKeyword}`);
    if (result.maxPrice) {
      suggestionsSet.add(`${result.colorFilter} ${result.itemKeyword} under ৳${result.maxPrice}`);
    }
  } else if (result.itemKeyword) {
    suggestionsSet.add(`Best ${result.itemKeyword}`);
    suggestionsSet.add(`Black ${result.itemKeyword}`);
    suggestionsSet.add(`${result.itemKeyword} on sale`);
  } else if (result.colorFilter) {
    suggestionsSet.add(`${result.colorFilter} Shirt`);
    suggestionsSet.add(`${result.colorFilter} Sneakers`);
  } else {
    suggestionsSet.add('Black Shirt (কালো শার্ট)');
    suggestionsSet.add('Smartwatch (স্মার্টওয়াচ)');
    suggestionsSet.add('Jamdani Saree (জামদানি শাড়ি)');
    suggestionsSet.add('TWS Earbuds (ইয়ারবাডস)');
    suggestionsSet.add('Leather Wallet (লেদার ওয়ালেট)');
  }

  result.suggestions = Array.from(suggestionsSet);
  result.keywords = lower.split(/\s+/).filter(w => w.length > 1);
  return result;
}

export function filterProductsBySmartSearch(products: Product[], parsed: ParsedSearchQuery): Product[] {
  const queryLower = parsed.originalQuery.toLowerCase().trim();
  if (!queryLower) return products;

  return products.filter(product => {
    // 1. Max price check
    if (parsed.maxPrice && product.price > parsed.maxPrice) {
      return false;
    }

    // 2. Category check if explicitly identified
    if (parsed.categoryFilter && product.category !== parsed.categoryFilter) {
      return false;
    }

    // 3. Color check if identified
    if (parsed.colorFilter) {
      const hasColor = product.colors.some(c =>
        c.toLowerCase().includes(parsed.colorFilter!.toLowerCase()) ||
        (parsed.colorFilter === 'Black' && c.toLowerCase().includes('black'))
      );
      if (!hasColor && !product.name.toLowerCase().includes(parsed.colorFilter.toLowerCase()) && !product.nameBn.includes('কালো')) {
        return false;
      }
    }

    // 4. Item keyword or query substring match
    if (parsed.itemKeyword) {
      const matchItem = product.subcategory.toLowerCase().includes(parsed.itemKeyword) ||
        product.name.toLowerCase().includes(parsed.itemKeyword) ||
        product.tags.some(t => t.toLowerCase().includes(parsed.itemKeyword!));
      if (matchItem) return true;
    }

    // Fallback: general text match in name, nameBn, category, brand, tags
    const searchTokens = queryLower.split(/\s+/).filter(token =>
      !['এর', 'মধ্যে', 'টাকা', 'টাকার', 'under', 'in', 'and', 'for'].includes(token)
    );

    const matchesAllOrAny = searchTokens.some(token =>
      product.name.toLowerCase().includes(token) ||
      product.nameBn.toLowerCase().includes(token) ||
      product.categoryBn.toLowerCase().includes(token) ||
      product.brand.toLowerCase().includes(token) ||
      product.tags.some(t => t.toLowerCase().includes(token))
    );

    return matchesAllOrAny;
  });
}
