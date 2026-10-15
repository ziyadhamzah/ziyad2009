"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useWishlist } from "./wishlist";
import { getProduct, products } from "./products";
import { notify } from "./events";
import { rupiah } from "./format";

type Snap = { price: number; stock: number };
type Ctx = { watched: number; check: () => number; simulateDrop: () => string | null };

const PriceWatchContext = createContext<Ctx | null>(null);
const KEY = "temanta.watch.v1";

function load(): Record<string, Snap> {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Record<string, Snap>) : {}; } catch { return {}; }
}
function save(m: Record<string, Snap>) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {} }

export function PriceWatchProvider({ children }: { children: ReactNode }) {
  const { ready, slugs } = useWishlist();
  const snapRef = useRef<Record<string, Snap>>({});
  const [watched, setWatched] = useState(0);

  const check = useCallback((list: string[] = slugs) => {
    const snap = snapRef.current;
    let count = 0;
    list.forEach((slug) => {
      const p = getProduct(slug);
      if (!p) return;
      const prev = snap[slug];
      if (prev) {
        if (p.price < prev.price) {
          notify({ title: "Harga turun!", body: `${p.name} kini ${rupiah(p.price)} (dari ${rupiah(prev.price)}).`, href: `/products/${p.slug}` });
          count++;
        } else if (prev.stock === 0 && p.stock > 0) {
          notify({ title: "Stok tersedia lagi", body: `${p.name} sudah bisa dipesan kembali.`, href: `/products/${p.slug}` });
          count++;
        }
      }
      snap[slug] = { price: p.price, stock: p.stock };
    });
    save(snap);
    setWatched(list.length);
    return count;
  }, [slugs]);

  useEffect(() => {
    if (!ready) return;
    snapRef.current = load();
    check(slugs);
  }, [ready, slugs, check]);

  const simulateDrop = useCallback(() => {
    const pool = slugs.length ? slugs : products.map((p) => p.slug);
    const slug = pool[Math.floor(Math.random() * pool.length)];
    const p = getProduct(slug);
    if (!p) return null;
    snapRef.current[slug] = { price: Math.round(p.price * 1.15), stock: p.stock };
    save(snapRef.current);
    check(slugs.length ? slugs : [slug]);
    return p.name;
  }, [slugs, check]);

  const value = useMemo<Ctx>(() => ({ watched, check, simulateDrop }), [watched, check, simulateDrop]);
  return <PriceWatchContext.Provider value={value}>{children}</PriceWatchContext.Provider>;
}

export const usePriceWatch = () => {
  const c = useContext(PriceWatchContext);
  if (!c) throw new Error("usePriceWatch harus dipakai di dalam PriceWatchProvider");
  return c;
};
