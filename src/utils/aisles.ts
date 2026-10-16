import type { Aisle, Product } from '../types';

type Meta = { name: string; emoji: string; rank: number };

/**
 * The catalog API ships raw category slugs. A quick-commerce storefront needs
 * shop-floor aisle names, so the mapping lives here instead of inside screens.
 * Anything unmapped still renders (title-cased) — the grid never breaks on new data.
 */
const AISLE_META: Record<string, Meta> = {
  groceries: { name: 'Fresh & Staples', emoji: '\u{1F96C}', rank: 0 },
  beauty: { name: 'Beauty', emoji: '\u{1F484}', rank: 1 },
  'skin-care': { name: 'Skin Care', emoji: '\u{1F9F4}', rank: 2 },
  fragrances: { name: 'Fragrances', emoji: '\u{1F338}', rank: 3 },
  'kitchen-accessories': { name: 'Kitchen', emoji: '\u{1F373}', rank: 4 },
  'home-decoration': { name: 'Home & Decor', emoji: '\u{1FAB4}', rank: 5 },
  furniture: { name: 'Furniture', emoji: '\u{1F6CB}', rank: 6 },
  'mobile-accessories': { name: 'Mobile Gear', emoji: '\u{1F50C}', rank: 7 },
  smartphones: { name: 'Smartphones', emoji: '\u{1F4F1}', rank: 8 },
  laptops: { name: 'Laptops', emoji: '\u{1F4BB}', rank: 9 },
  tablets: { name: 'Tablets', emoji: '\u{1F4DF}', rank: 10 },
  'sports-accessories': { name: 'Sports', emoji: '\u{1F3CF}', rank: 11 },
  sunglasses: { name: 'Sunglasses', emoji: '\u{1F576}', rank: 12 },
  'womens-bags': { name: 'Bags', emoji: '\u{1F45C}', rank: 13 },
  'womens-jewellery': { name: 'Jewellery', emoji: '\u{1F48D}', rank: 14 },
  'mens-watches': { name: 'Men Watches', emoji: '\u{231A}', rank: 15 },
  'womens-watches': { name: 'Women Watches', emoji: '\u{1F570}', rank: 16 },
  'mens-shirts': { name: 'Men Shirts', emoji: '\u{1F454}', rank: 17 },
  'mens-shoes': { name: 'Men Shoes', emoji: '\u{1F45F}', rank: 18 },
  'womens-shoes': { name: 'Women Shoes', emoji: '\u{1F460}', rank: 19 },
  'womens-dresses': { name: 'Dresses', emoji: '\u{1F457}', rank: 20 },
  tops: { name: 'Tops', emoji: '\u{1F455}', rank: 21 },
};

/** Categories a 10-minute grocery store would not stock. */
const EXCLUDED = new Set(['motorcycle', 'vehicle']);

export function isStocked(product: Product): boolean {
  return !EXCLUDED.has(product.category);
}

export function aisleMeta(slug: string): Meta {
  return (
    AISLE_META[slug] ?? {
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      emoji: '\u{1F6D2}',
      rank: 99,
    }
  );
}

export function buildAisles(products: Product[]): Aisle[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count, ...aisleMeta(slug) }))
    .sort((a, b) => aisleMeta(a.slug).rank - aisleMeta(b.slug).rank);
}
