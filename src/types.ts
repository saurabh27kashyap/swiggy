export type Product = {
  id: number;
  title: string;
  description: string;
  /** Source price from the API (USD-scale). Always render via utils/format. */
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
};

export type Aisle = {
  slug: string;
  name: string;
  emoji: string;
  count: number;
};

export type CartLine = {
  product: Product;
  qty: number;
};

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';
