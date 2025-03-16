import { useEffect, useState } from "react";

/**
 * Hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The number of milliseconds to wait before emitting the debounced value.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
