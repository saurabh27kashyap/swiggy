import type { Product } from '../types';
import { aisleMeta } from './aisles';
import { rupees, toInr } from './format';

/**
 * Sorting and filtering live here as pure functions — no React, no store.
 * One consequence worth the trouble: this file is unit-testable on its own, and
 * every screen that lists products shares exactly the same rules.
 */

export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'discount';
export type PriceBand = 'under-100' | 'mid' | 'above-300';

export type CatalogQuery = {
  sort: SortKey;
  price?: PriceBand;
  minRating?: number;
  minDiscount?: number;
  inStockOnly: boolean;
};

export type FilterKey = 'price' | 'minRating' | 'minDiscount' | 'inStockOnly';

export const DEFAULT_QUERY: CatalogQuery = { sort: 'popular', inStockOnly: false };

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Popularity' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'discount', label: 'Discount' },
];

export const PRICE_BANDS: {
  key: PriceBand;
  label: string;
  test: (inr: number) => boolean;
}[] = [
  { key: 'under-100', label: 'Under ' + rupees(100), test: (v) => v < 100 },
  { key: 'mid', label: rupees(100) + ' - ' + rupees(300), test: (v) => v >= 100 && v <= 300 },
  { key: 'above-300', label: 'Above ' + rupees(300), test: (v) => v > 300 },
];

export const RATING_OPTIONS = [4, 4.5];
export const DISCOUNT_OPTIONS = [10, 20];

// --- route params <-> query -------------------------------------------------

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const positive = (v: string | undefined): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** Route params are strings and can be absent or malformed — never trust them. */
export function parseQuery(raw: RawParams): CatalogQuery {
  const sort = first(raw.sort);
  const price = first(raw.price);

  return {
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? (sort as SortKey) : 'popular',
    price: PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBand) : undefined,
    minRating: positive(first(raw.rating)),
    minDiscount: positive(first(raw.off)),
    inStockOnly: first(raw.stock) === '1',
  };
}

/**
 * Empty strings rather than omitted keys, so clearing a filter actually removes
 * it from the URL instead of leaving the old value behind.
 */
export function serializeQuery(q: CatalogQuery): Record<string, string> {
  return {
    sort: q.sort === DEFAULT_QUERY.sort ? '' : q.sort,
    price: q.price ?? '',
    rating: q.minRating ? String(q.minRating) : '',
    off: q.minDiscount ? String(q.minDiscount) : '',
    stock: q.inStockOnly ? '1' : '',
  };
}

// --- filter chips -----------------------------------------------------------

export function activeFilterCount(q: CatalogQuery): number {
  let n = 0;
  if (q.price) n++;
  if (q.minRating) n++;
  if (q.minDiscount) n++;
  if (q.inStockOnly) n++;
  return n;
}

export function describeFilters(q: CatalogQuery): { key: FilterKey; label: string }[] {
  const chips: { key: FilterKey; label: string }[] = [];
  const band = PRICE_BANDS.find((b) => b.key === q.price);
  if (band) chips.push({ key: 'price', label: band.label });
  if (q.minRating) chips.push({ key: 'minRating', label: q.minRating + '★ & above' });
  if (q.minDiscount) chips.push({ key: 'minDiscount', label: q.minDiscount + '% off or more' });
  if (q.inStockOnly) chips.push({ key: 'inStockOnly', label: 'In stock only' });
  return chips;
}

export function withoutFilter(q: CatalogQuery, key: FilterKey): CatalogQuery {
  switch (key) {
    case 'price':
      return { ...q, price: undefined };
    case 'minRating':
      return { ...q, minRating: undefined };
    case 'minDiscount':
      return { ...q, minDiscount: undefined };
    case 'inStockOnly':
      return { ...q, inStockOnly: false };
  }
}

/** Clears filters but keeps the chosen sort — users rarely want both reset. */
export function clearFilters(q: CatalogQuery): CatalogQuery {
  return { sort: q.sort, inStockOnly: false };
}

// --- the pipeline -----------------------------------------------------------

/**
 * Equal values must keep a fixed order, otherwise rows swap places on every
 * re-render and the grid visibly twitches. Hence the id tie-breaker.
 */
const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.rating - a.rating || a.id - b.id,
  'price-asc': (a, b) => a.price - b.price || a.id - b.id,
  'price-desc': (a, b) => b.price - a.price || a.id - b.id,
  discount: (a, b) => b.discountPercentage - a.discountPercentage || a.id - b.id,
};

function matchesSearch(product: Product, needle: string): boolean {
  const haystack = `${product.title} ${product.brand ?? ''} ${aisleMeta(product.category).name}`;
  return haystack.toLowerCase().includes(needle);
}

export type QueryScope = {
  aisle?: string;
  search?: string;
};

export function applyQuery(
  products: Product[],
  query: CatalogQuery,
  scope: QueryScope = {}
): Product[] {
  const needle = scope.search?.trim().toLowerCase() ?? '';
  const band = PRICE_BANDS.find((b) => b.key === query.price);

  const filtered = products.filter((p) => {
    if (scope.aisle && p.category !== scope.aisle) return false;
    if (needle && !matchesSearch(p, needle)) return false;
    if (band && !band.test(toInr(p.price))) return false;
    if (query.minRating && p.rating < query.minRating) return false;
    if (query.minDiscount && p.discountPercentage < query.minDiscount) return false;
    if (query.inStockOnly && p.stock <= 0) return false;
    return true;
  });

  // filter() already copied the array, so sorting in place is safe here.
  return filtered.sort(comparators[query.sort]);
}
