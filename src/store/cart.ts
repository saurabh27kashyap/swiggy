import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartLine, Product } from '../types';
import { toInr } from '../utils/format';

export const FREE_DELIVERY_ABOVE = 199;
export const DELIVERY_FEE = 25;
export const HANDLING_FEE = 7;

type CartState = {
  /** Keyed by product id so a row can read its own qty in O(1). */
  lines: Record<number, CartLine>;
  add: (product: Product) => void;
  inc: (id: number) => void;
  dec: (id: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: {},

      add: (product) =>
        set((s) => ({
          lines: {
            ...s.lines,
            [product.id]: { product, qty: (s.lines[product.id]?.qty ?? 0) + 1 },
          },
        })),

      inc: (id) => {
        const line = get().lines[id];
        if (!line) return;
        set((s) => ({ lines: { ...s.lines, [id]: { ...line, qty: line.qty + 1 } } }));
      },

      dec: (id) => {
        const line = get().lines[id];
        if (!line) return;
        if (line.qty <= 1) return get().remove(id);
        set((s) => ({ lines: { ...s.lines, [id]: { ...line, qty: line.qty - 1 } } }));
      },

      remove: (id) =>
        set((s) => {
          const next = { ...s.lines };
          delete next[id];
          return { lines: next };
        }),

      clear: () => set({ lines: {} }),
    }),
    {
      // Survives an app restart, the way a real cart has to.
      name: 'instamini.cart.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Subscribes a row to one number, so adding item #40 never re-renders item #1. */
export const useQty = (id: number) => useCart((s) => s.lines[id]?.qty ?? 0);

export const useCartCount = () =>
  useCart((s) => Object.values(s.lines).reduce((n, l) => n + l.qty, 0));

export const useCartLines = () => useCart((s) => s.lines);

export type Bill = {
  items: number;
  itemTotal: number;
  delivery: number;
  handling: number;
  toPay: number;
  savings: number;
};

export function billFor(lines: Record<number, CartLine>): Bill {
  let items = 0;
  let itemTotal = 0;
  let savings = 0;

  for (const line of Object.values(lines)) {
    const unit = toInr(line.product.price);
    items += line.qty;
    itemTotal += unit * line.qty;
    const off = line.product.discountPercentage;
    if (off) savings += Math.round((unit / (1 - off / 100) - unit) * line.qty);
  }

  const delivery = itemTotal === 0 || itemTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const handling = itemTotal === 0 ? 0 : HANDLING_FEE;

  return { items, itemTotal, delivery, handling, toPay: itemTotal + delivery + handling, savings };
}
