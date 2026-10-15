import Link from "next/link";
import { Product } from "@/lib/products";
import { rupiah } from "@/lib/format";
import { FREE_SHIPPING_FROM } from "@/lib/shipping";
import ProductImage from "./ProductImage";
import WishlistButton from "./WishlistButton";
import CompareButton from "./CompareButton";

export const discountOf = (p: Product) => (p.basePrice > p.price ? Math.round((1 - p.price / p.basePrice) * 100) : 0);

export default function ProductCard({ p }: { p: Product }) {
  const off = discountOf(p);
  const bestSeller = p.sold >= 1000;
  const lowStock = p.stock > 0 && p.stock <= 10;
  const freeShip = p.price >= FREE_SHIPPING_FROM;
  return (
    <div className="group relative">
      <Link
        href={`/products/${p.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-hover"
      >
        <div className="relative aspect-square overflow-hidden bg-paper">
          <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><ProductImage slug={p.slug} /></div>

          {p.stock === 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold leading-none text-white backdrop-blur">Stok habis</span>
          ) : bestSeller ? (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold leading-none text-white shadow-card">Terlaris</span>
          ) : null}

          {off > 0 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-brand px-2 py-1 text-[11px] font-bold leading-none text-white shadow-card">-{off}%</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-brand">{p.name}</p>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="flex items-center gap-0.5 font-semibold text-ink">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="currentColor" aria-hidden><path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" /></svg>
              {p.rating.toFixed(1)}
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="text-muted">{p.sold.toLocaleString("id-ID")} terjual</span>
          </div>

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-base font-extrabold text-brand">{rupiah(p.price)}</span>
            {off > 0 && <span className="text-xs text-muted line-through">{rupiah(p.basePrice)}</span>}
          </div>

          {(freeShip || lowStock) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {freeShip && <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-medium text-muted">Gratis ongkir</span>}
              {lowStock && <span className="rounded-full border border-brand/30 bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">Sisa {p.stock}</span>}
            </div>
          )}
        </div>
      </Link>

      <WishlistButton slug={p.slug} size="sm" className="absolute right-2.5 top-2.5 z-10" />
      <CompareButton slug={p.slug} className="absolute right-2.5 top-11 z-10" />
    </div>
  );
}
