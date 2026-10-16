import { create } from 'zustand';
import { fetchCatalog, readCachedCatalog, type CatalogSource } from '../api/products';
import type { Aisle, LoadStatus, Product } from '../types';
import { buildAisles } from '../utils/aisles';

type Derived = {
  products: Product[];
  byId: Record<number, Product>;
  aisles: Aisle[];
};

type CatalogState = Derived & {
  status: LoadStatus;
  source: CatalogSource | null;
  error?: string;
  /** Perf-lab only: renders the catalog N times over to stress the list. */
  stress: number;
  load: () => Promise<void>;
  setStress: (n: number) => void;
};

function derive(products: Product[]): Derived {
  // byId keeps the product screen an O(1) lookup instead of a scan per navigation.
  const byId: Record<number, Product> = {};
  for (const p of products) byId[p.id] = p;
  return { products, byId, aisles: buildAisles(products) };
}

export const useCatalog = create<CatalogState>((set, get) => ({
  products: [],
  byId: {},
  aisles: [],
  status: 'idle',
  source: null,
  stress: 1,

  /**
   * Stale-while-revalidate: show the cached catalog immediately, then quietly
   * swap in fresh data. If the network is dead and we already have cache on
   * screen, the user never sees an error — the store just stays on cache.
   */
  async load() {
    if (get().status === 'loading') return;
    set({ status: 'loading', error: undefined });

    const cached = await readCachedCatalog();
    if (cached) set({ ...derive(cached), status: 'ready', source: 'cache' });

    try {
      const fresh = await fetchCatalog();
      set({ ...derive(fresh), status: 'ready', source: 'network' });
    } catch (err) {
      if (get().products.length) return;
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Could not reach the store',
      });
    }
  },

  setStress: (stress) => set({ stress }),
}));

export const useProducts = () => useCatalog((s) => s.products);
export const useCatalogStatus = () => useCatalog((s) => s.status);
export const useProduct = (id: number) => useCatalog((s) => s.byId[id]);

/** Duplicates the catalog with offset ids so keys stay unique under stress. */
export function inflate(products: Product[], times: number): Product[] {
  if (times <= 1) return products;
  const out: Product[] = [];
  for (let copy = 0; copy < times; copy++) {
    for (const p of products) {
      out.push(copy === 0 ? p : { ...p, id: p.id + copy * 100_000 });
    }
  }
  return out;
}
