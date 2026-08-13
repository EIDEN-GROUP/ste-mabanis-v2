import { useCallback, useEffect, useState } from "react";

const KEY = "mabanis:favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(read());
    const onStorage = () => setFavorites(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("mabanis:favorites", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mabanis:favorites", onStorage);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const next = read().includes(slug)
      ? read().filter((s) => s !== slug)
      : [...read(), slug];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new Event("mabanis:favorites"));
  }, []);

  return { favorites, toggle, isFavorite: (slug: string) => favorites.includes(slug) };
}
