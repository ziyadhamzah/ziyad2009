"use client";
import Link from "next/link";
import { useCompare } from "@/lib/compare";
import { useCart } from "@/lib/cart";
import { getProduct, type Product } from "@/lib/products";
import { rupiah } from "@/lib/format";
import { discountOf } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";

export default function ComparePage() {
  const { ready, slugs, remove, clear } = useCompare();
  const { add } = useCart();
  const items = slugs.map(getProduct).filter((p): p is Product => Boolean(p));

  const best = {
    price: Math.min(...items.map((p) => p.price)),
    rating: Math.max(...items.map((p) => p.rating)),
    sold: Math.max(...items.map((p) => p.sold)),
    stock: Math.max(...items.map((p) => p.stock)),
  };

  if (!ready) return <p className="shell py-24 text-muted">Memuat perbandinganâ€¦</p>;

  if (items.length < 2) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-2xl font-bold">Bandingkan produk</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          {items.length === 0 ? "Belum ada produk untuk dibandingkan. Tambahkan minimal 2 produk dari katalog." : "Tambahkan minimal satu produk lagi untuk membandingkan."}
        </p>
        {items.length === 1 && (
          <div className="mx-auto mt-6 w-40"><Card p={items[0]} onRemove={() => remove(items[0].slug)} /></div>
        )}
        <Link href="/products" className="btn-primary mt-6 h-11 px-6 text-sm">Lihat katalog</Link>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <nav className="mb-3 text-sm text-muted">
        <Link href="/" className="hover:text-brand">Beranda</Link> <span className="mx-1">â€º</span> <span className="text-ink">Bandingkan produk</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Bandingkan produk</h1>
        <button type="button" onClick={clear} className="text-sm text-muted underline hover:text-brand">Bersihkan semua</button>
      </div>
      <p className="mt-1 text-sm text-muted">Membandingkan {items.length} produk. Sorotan hijau menandai nilai terbaik.</p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-surface shadow-card">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-40 bg-surface p-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-muted" />
              {items.map((p) => (
                <th key={p.slug} className="w-[240px] min-w-[200px] border-l border-line p-3 text-left align-top">
                  <Card p={p} onRemove={() => remove(p.slug)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Harga">
              {items.map((p) => (
                <Cell key={p.slug} isBest={p.price === best.price}>
                  <span className="text-base font-extrabold text-brand">{rupiah(p.price)}</span>
                  {discountOf(p) > 0 && <span className="ml-2 text-xs text-muted line-through">{rupiah(p.basePrice)}</span>}
                </Cell>
              ))}
            </Row>
            <Row label="Diskon">
              {items.map((p) => (
                <Cell key={p.slug}>{discountOf(p) > 0 ? <span className="font-semibold text-brand">-{discountOf(p)}%</span> : <span className="text-muted">â€”</span>}</Cell>
              ))}
            </Row>
            <Row label="Rating">
              {items.map((p) => (
                <Cell key={p.slug} isBest={p.rating === best.rating}>
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="currentColor" aria-hidden><path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" /></svg>
                    {p.rating.toFixed(1)}
                  </span>
                </Cell>
              ))}
            </Row>
            <Row label="Terjual">
              {items.map((p) => <Cell key={p.slug} isBest={p.sold === best.sold}>{p.sold.toLocaleString("id-ID")}</Cell>)}
            </Row>
            <Row label="Stok">
              {items.map((p) => (
                <Cell key={p.slug} isBest={p.stock === best.stock}>
                  {p.stock === 0 ? <span className="font-medium text-red-600">Habis</span> : `${p.stock} unit`}
                </Cell>
              ))}
            </Row>
            <Row label="Kategori">{items.map((p) => <Cell key={p.slug}>{p.category}</Cell>)}</Row>
            <Row label="Variasi">
              {items.map((p) => (
                <Cell key={p.slug}>
                  {p.variants?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {p.variants.map((v) => <span key={v.id} className="rounded-full border border-line px-2 py-0.5 text-xs">{v.label}</span>)}
                    </div>
                  ) : <span className="text-muted">â€”</span>}
                </Cell>
              ))}
            </Row>
            <Row label="Deskripsi">
              {items.map((p) => <Cell key={p.slug}><span className="text-ink/80">{p.description}</span></Cell>)}
            </Row>
            <Row label="">
              {items.map((p) => (
                <Cell key={p.slug}>
                  <button
                    type="button"
                    disabled={p.stock === 0}
                    onClick={() => add({ slug: p.slug, name: p.name, price: p.price, tone: p.tone })}
                    className="btn-primary h-10 w-full px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    {p.stock === 0 ? "Stok habis" : "+ Keranjang"}
                  </button>
                </Cell>
              ))}
            </Row>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ p, onRemove }: { p: Product; onRemove: () => void }) {
  return (
    <div className="relative">
      <Link href={`/products/${p.slug}`} className="block">
        <div className="aspect-square overflow-hidden rounded-sm bg-paper"><ProductImage slug={p.slug} /></div>
        <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-snug text-ink hover:text-brand">{p.name}</p>
      </Link>
      <button type="button" onClick={onRemove} aria-label={`Hapus ${p.name}`}
        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-card transition hover:bg-brand">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="sticky left-0 z-10 bg-surface p-3 text-left align-top text-xs font-medium text-muted">{label}</th>
      {children}
    </tr>
  );
}

function Cell({ isBest, children }: { isBest?: boolean; children: React.ReactNode }) {
  return (
    <td className={`border-l border-line p-3 align-top ${isBest ? "bg-brand-light/60" : ""}`}>
      <div className="flex items-center gap-1">
        {isBest && (
          <span title="Terbaik" className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
          </span>
        )}
        <span>{children}</span>
      </div>
    </td>
  );
}
