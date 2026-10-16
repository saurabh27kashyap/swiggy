import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../types';
import { isStocked } from '../utils/aisles';

const FIELDS = 'id,title,description,price,discountPercentage,rating,stock,brand,category,thumbnail,images';
const ENDPOINT = `https://dummyjson.com/products?limit=0&select=${FIELDS}`;
const CACHE_KEY = 'instamini.catalog.v1';
const REQUEST_TIMEOUT = 8000;

export type CatalogSource = 'network' | 'cache';

type CacheEnvelope = { at: number; products: Product[] };

/**
 * Reads the last good catalog. Called before the network so the storefront can
 * paint instantly (and still work with the phone in airplane mode).
 */
export async function readCachedCatalog(): Promise<Product[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope;
    return parsed.products?.length ? parsed.products : null;
  } catch {
    return null;
  }
}

export async function fetchCatalog(): Promise<Product[]> {
  // A hung socket on a flaky mobile network must not hang the UI forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const res = await fetch(ENDPOINT, { signal: controller.signal });
    if (!res.ok) throw new Error(`Catalog request failed (${res.status})`);
    const json = (await res.json()) as { products?: Product[] };
    const products = (json.products ?? []).filter((p) => p?.thumbnail && isStocked(p));
    if (!products.length) throw new Error('Catalog came back empty');
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ at: Date.now(), products } satisfies CacheEnvelope)
    );
    return products;
  } finally {
    clearTimeout(timer);
  }
}
