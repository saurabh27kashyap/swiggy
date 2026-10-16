/**
 * The catalog API prices in USD-scale decimals. We show rupees, so every price
 * goes through one conversion point instead of being massaged per screen.
 */
const INR_FACTOR = 10;

export function toInr(price: number): number {
  return Math.round(price * INR_FACTOR);
}

export function rupees(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

/** Struck-through MRP implied by the discount percentage. */
export function mrp(price: number, discountPercentage: number): number {
  const inr = toInr(price);
  if (!discountPercentage) return inr;
  return Math.round(inr / (1 - discountPercentage / 100));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** "500 g", "1 L" style pack labels, derived so the grid never looks empty. */
const PACKS = ['250 g', '500 g', '1 kg', '200 ml', '500 ml', '1 L', '6 pcs', '12 pcs'];
export function packLabel(id: number): string {
  return PACKS[id % PACKS.length];
}
