import ProductImage from "@/components/ProductImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import { rupiah } from "@/lib/format";
import ProductGrid from "@/components/ProductGrid";
import ProductReviews from "@/components/ProductReviews";
import { store } from "@/lib/reviews";
import AddToCart from "./AddToCart";
import RecentTrack from "@/components/RecentTrack";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.id !== p.id);
  const more = (related.length >= 4 ? related : [...related, ...products.filter((x) => x.category !== p.category)]).slice(0, 4);
  const off = p.basePrice > p.price ? Math.round((1 - p.price / p.basePrice) * 100) : 0;
  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <RecentTrack slug={p.slug} />
      <div className="rounded-sm bg-surface p-4 shadow-card sm:p-6">
        <p className="text-sm text-muted">
          <Link href="/" className="hover:text-brand">Beranda</Link> &nbsp;/&nbsp;
          <Link href={`/products?kategori=${p.category}`} className="hover:text-brand"> {p.category}</Link> &nbsp;/&nbsp; {p.name}
        </p>
        <div className="mt-4 grid gap-8 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-sm"><ProductImage slug={p.slug} /></div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[1, 1.7, 2.2, 1.4].map((z) => (
                <div key={z} className="aspect-square overflow-hidden rounded-sm border border-line"><ProductImage slug={p.slug} zoom={z} /></div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-snug">{p.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="flex items-center gap-1 text-[#FFCE3D]">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" /></svg>
                <span className="font-semibold text-ink">{p.rating.toFixed(1)}</span>
              </span>
              <span>|</span>
              <span>{p.sold.toLocaleString("id-ID")} terjual</span>
              <span>|</span>
              <span>Stok {p.stock > 0 ? p.stock : "habis"}</span>
            </div>

            <div className="mt-4 rounded-sm bg-paper p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-bold text-brand">{rupiah(p.price)}</p>
                {off > 0 && <p className="text-sm text-muted line-through">{rupiah(p.basePrice)}</p>}
                {off > 0 && <span className="rounded-sm bg-brand px-1.5 py-0.5 text-xs font-bold text-white">-{off}%</span>}
              </div>
            </div>

            <p className="mt-5 max-w-prose leading-relaxed text-muted">{p.description}</p>

            <div className="mt-5 flex items-center gap-3 rounded-sm border border-line p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <Link href="/toko" className="block truncate font-medium hover:text-brand">{store.name}</Link>
                <p className="text-xs text-muted">{store.itemsSold.toLocaleString("id-ID")} barang terjual</p>
              </div>
              <Link href="/toko" className="shrink-0 rounded-sm border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white">Lihat toko</Link>
            </div>

            <div className="mt-3">
              <Link href="/chat" className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1-4.2a8.4 8.4 0 0 1-.9-3.9A8.4 8.4 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5z" /></svg>
                Chat penjual
              </Link>
            </div>

            <AddToCart p={p} />
            <div className="mt-8 border-t border-line pt-5 text-sm text-muted">
              <p className="font-medium text-ink">Pengiriman</p>
              <p className="mt-1">Dikemas dalam 1â€“2 hari kerja. Estimasi tiba 2â€“5 hari ke Jawa, 4â€“8 hari ke luar Jawa.</p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews p={p} />

      <section className="mt-4 rounded-sm bg-surface p-4 shadow-card">
        <h2 className="mb-4 text-lg font-bold">Produk lain yang mungkin cocok</h2>
        <ProductGrid items={more} />
      </section>
    </div>
  );
}
