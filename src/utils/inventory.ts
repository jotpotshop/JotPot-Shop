import { Product } from '../types';

/**
 * Calculates the exact available stock for a product, factoring in
 * specific variant selection (color/size/color-size combination) and base product stock.
 *
 * Safety Invariant (Requirement 10):
 * - Never treats missing, undefined, null, or NaN stock data as unlimited inventory.
 * - Always returns a non-negative integer.
 */
export function getAvailableStock(
  product?: Product | null,
  color?: string,
  size?: string
): number {
  if (!product) return 0;

  // 1. Base product stock inspection first
  const baseStock =
    typeof product.stock === 'number' && !isNaN(product.stock)
      ? Math.max(0, Math.floor(product.stock))
      : 0;

  // If base product is 0, no units exist regardless of variants
  if (baseStock <= 0) {
    return 0;
  }

  // 2. Variant-level stock inspection
  if (product.variantStocks && typeof product.variantStocks === 'object') {
    const trimmedColor = color?.trim();
    const trimmedSize = size?.trim();

    // 2a. Color and Size combined key (e.g. "Black-XL", "Navy Blue-M")
    if (trimmedColor && trimmedSize) {
      const comboKey = `${trimmedColor}-${trimmedSize}`;
      if (typeof product.variantStocks[comboKey] === 'number') {
        const val = product.variantStocks[comboKey];
        const vStock = isNaN(val) || val < 0 ? 0 : Math.floor(val);
        return Math.min(baseStock, vStock);
      }
    }

    // 2b. Color-specific stock key (e.g. "Black", "Navy Blue")
    if (trimmedColor && typeof product.variantStocks[trimmedColor] === 'number') {
      const val = product.variantStocks[trimmedColor];
      const vStock = isNaN(val) || val < 0 ? 0 : Math.floor(val);
      return Math.min(baseStock, vStock);
    }

    // 2c. Size-specific stock key (e.g. "XL", "42")
    if (trimmedSize && typeof product.variantStocks[trimmedSize] === 'number') {
      const val = product.variantStocks[trimmedSize];
      const vStock = isNaN(val) || val < 0 ? 0 : Math.floor(val);
      return Math.min(baseStock, vStock);
    }
  }

  return baseStock;
}

/**
 * Returns true if the product (or selected variant) has at least 1 unit in stock.
 */
export function isProductInStock(
  product?: Product | null,
  color?: string,
  size?: string
): boolean {
  return getAvailableStock(product, color, size) > 0;
}

/**
 * Returns localized stock status metadata for UI rendering.
 */
export function getStockStatusInfo(
  product?: Product | null,
  color?: string,
  size?: string,
  language: 'bn' | 'en' = 'bn'
): {
  stock: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  statusBadgeText: string;
  badgeClass: string;
} {
  const stock = getAvailableStock(product, color, size);
  const threshold = product?.lowStockThreshold ?? 5;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= threshold;

  if (isOutOfStock) {
    return {
      stock: 0,
      isOutOfStock: true,
      isLowStock: false,
      statusBadgeText: language === 'bn' ? 'স্টক আউট' : 'Out of Stock',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    };
  }

  if (isLowStock) {
    return {
      stock,
      isOutOfStock: false,
      isLowStock: true,
      statusBadgeText:
        language === 'bn'
          ? `⚠️ মাত্র ${stock}টি বাকি আছে!`
          : `⚠️ Only ${stock} left!`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }

  return {
    stock,
    isOutOfStock: false,
    isLowStock: false,
    statusBadgeText:
      language === 'bn'
        ? `✓ ইন স্টক (${stock}টি উপলব্ধ)`
        : `✓ In Stock (${stock} available)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}
