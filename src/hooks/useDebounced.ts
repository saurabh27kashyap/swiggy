import { useEffect, useState } from 'react';

/**
 * Keeps the text input responsive while the (expensive) filter runs only after
 * the user pauses — the difference between a laggy and an instant-feeling search.
 */
export function useDebounced<T>(value: T, delay = 220): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return settled;
}
