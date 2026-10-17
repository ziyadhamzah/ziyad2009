"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProduct } from "@/lib/products";
import { useCompare } from "@/lib/compare";
import ProductImage from "./ProductImage";

export default function CompareBar() {
  const pathname = usePathname();
  const { slugs, count, remove, clear, max } = useCompare();

  if (count === 0 || pathname === "/bandingkan" || pathname === "/cart" || pathname === "/checkout") return null;
  const items = slugs.map(getProduct).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 shadow-float backdrop-blur">
      <div className="shell flex items-center gap-3 py-3">
        <div className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-ink sm:flex">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 7h6M4 7l2-2M4 7l2 2M20 17h-6M20 17l-2-2M20 17l-2 2" /></svg>
          Bandingkan
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          {items.map((p) => (
            <div key={p.slug} className="group relative flex w-14 shrink-0 items-center">
              <Link href={`/products/${p.slug}`} title={p.name} className="block h-14 w-14 overflow-hidden rounded-sm border border-line bg-paper">
                <ProductImage slug={p.slug} />
              </Link>
              <button type="button" onClick={() => remove(p.slug)} aria-label={`Hapus ${p.name}`}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-inverse text-inverse-fg shadow-card transition hover:bg-brand">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          {count < max && (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-dashed border-line text-xs text-muted">
              {count}/{max}
            </span>
          )}
        </div>

        <button type="button" onClick={clear} className="hidden shrink-0 text-sm text-muted underline hover:text-brand-ontint sm:block">Bersihkan</button>
        <Link href="/bandingkan" className="btn-primary h-10 shrink-0 px-5 text-sm">Bandingkan ({count})</Link>
      </div>
    </div>
  );
}
