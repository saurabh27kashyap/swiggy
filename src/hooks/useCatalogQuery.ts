import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useCatalog } from '../store/catalog';
import {
  applyQuery,
  parseQuery,
  serializeQuery,
  type CatalogQuery,
  type QueryScope,
} from '../utils/query';

type Params = {
  sort?: string;
  price?: string;
  rating?: string;
  off?: string;
  stock?: string;
};

/**
 * The single place where catalog + search + filters + sort come together.
 *
 * Filter state is held in the route's params, not in component state. That buys
 * three things for free: the back button restores the previous filters, a
 * filtered list can be shared as a link, and navigating away and returning does
 * not silently reset what the user chose.
 *
 * Search text deliberately stays local to the search screen — it changes on
 * every keystroke, and writing that to the route would be noise.
 */
export function useCatalogQuery({ aisle, search }: QueryScope) {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const products = useCatalog((s) => s.products);

  const query = useMemo(
    () =>
      parseQuery({
        sort: params.sort,
        price: params.price,
        rating: params.rating,
        off: params.off,
        stock: params.stock,
      }),
    [params.sort, params.price, params.rating, params.off, params.stock]
  );

  const setQuery = useCallback(
    (next: CatalogQuery) => {
      router.setParams(serializeQuery(next));
    },
    [router]
  );

  const items = useMemo(
    () => applyQuery(products, query, { aisle, search }),
    [products, query, aisle, search]
  );

  /** Pre-filter size, so the UI can say "12 of 27" instead of just "12". */
  const total = useMemo(
    () => (aisle ? products.filter((p) => p.category === aisle).length : products.length),
    [products, aisle]
  );

  return { query, setQuery, items, total };
}
