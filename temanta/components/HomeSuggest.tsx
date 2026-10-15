"use client";

import { useEffect, useState } from "react";
import { getProduct, suggestProducts, bestSellers, type Product } from "@/lib/products";
import { recentViews } from "@/lib/recent";
import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";

export default function HomeSuggest() {
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      const list = recentViews().map((s) => getProduct(s)).filter((p): p is Product => Boolean(p)).slice(0, 4);
      setRecent(list);
    };
    load();
    window.addEventListener("temanta:recent", load);
    return () => window.removeEventListener("temanta:recent", load);
  }, []);

  const recentIds = new Set(recent.map((p) => p.id));
  const cat = recent[0]?.category ?? "";
  const pool = cat ? suggestProducts(cat, 8) : bestSellers(8);
  const fallback = bestSellers(8);
  const items = [
    ...pool.filter((p) => !recentIds.has(p.id)),
    ...fallback.filter((p) => !recentIds.has(p.id) && !pool.some((q) => q.id === p.id)),
  ].slice(0, 4);

  if (!recent.length && !items.length) return null;

  return (
    <section className="mt-10">
      <SectionHeading
        title={recent.length ? `Karena kamu melihat ${recent[0].category}` : "Rekomendasi untukmu"}
        subtitle={recent.length ? "Sesuai minat kamu" : "Pilihan favorit pelanggan Temanta"}
      />
      <ProductGrid items={items} />
      {recent.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Kamu lihat sebelumnya</h3>
          <ProductGrid items={recent.slice(0, 4)} />
        </div>
      )}
    </section>
  );
}
