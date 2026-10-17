"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { products } from "@/lib/products";
import { rupiah } from "@/lib/format";
import ProductImage from "./ProductImage";
import { discountOf } from "./ProductCard";

function useCountdown() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now); end.setHours(24, 0, 0, 0);
      const d = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setT({ h: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60), s: d % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function FlashSale() {
  const { h, m, s } = useCountdown();
  const items = [...products].sort((a, b) => discountOf(b) - discountOf(a));

  return (
    <section className="overflow-hidden rounded-sm bg-surface shadow-card">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-xl font-black italic uppercase tracking-tight text-brand-ontint">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M13 2 3 14h7l-1 8 11-13h-7z" /></svg>
          Flash Sale
        </h2>
        <div className="flex items-center gap-1 text-white">
          <span className="rounded-sm bg-inverse px-1.5 py-0.5 text-sm font-bold">{pad(h)}</span>
          <span className="text-ink">:</span>
          <span className="rounded-sm bg-inverse px-1.5 py-0.5 text-sm font-bold">{pad(m)}</span>
          <span className="text-ink">:</span>
          <span className="rounded-sm bg-inverse px-1.5 py-0.5 text-sm font-bold">{pad(s)}</span>
        </div>
        <Link href="/products" className="ml-auto text-sm text-brand-ontint hover:underline">Lihat semua</Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-4">
        {items.map((p) => {
          const off = discountOf(p);
          return (
            <Link key={p.id} href={`/products/${p.slug}`} className="group w-[45%] shrink-0 snap-start sm:w-[180px]">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-paper">
                <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><ProductImage slug={p.slug} /></div>
                {off > 0 && <span className="absolute bottom-0 right-0 bg-brand px-1.5 py-0.5 text-[11px] font-bold leading-4 text-white">-{off}%</span>}
              </div>
              <p className="mt-2 font-bold text-brand-ontint">{rupiah(p.price)}</p>
              {off > 0 && <p className="text-[11px] text-muted line-through">{rupiah(p.basePrice)}</p>}
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
                <span>Terjual {p.sold.toLocaleString("id-ID")}</span>
                <span className={p.stock <= 10 ? "font-medium text-brand-ontint" : ""}>Sisa {p.stock}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}