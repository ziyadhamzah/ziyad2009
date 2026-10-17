"use client";
import Link from "next/link";
import { useMemo } from "react";
import { getProduct } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { slugs, clear, ready } = useWishlist();
  const { add, toast } = useCart();
  const items = useMemo(() => slugs.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => Boolean(p)), [slugs]);

  const moveAll = () => {
    items.forEach((p) => add({ slug: p.slug, name: p.name, price: p.price, tone: p.tone }));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-brand-ontint">Beranda</Link> <span className="mx-1">›</span> <span className="text-ink">Favorit saya</span>
      </nav>
      <div className="rounded-sm bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h1 className="text-xl font-bold">Favorit saya <span className="text-muted">({items.length})</span></h1>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={moveAll} className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">Masukkan semua ke keranjang</button>
              <button onClick={clear} className="text-sm text-muted underline hover:text-brand-ontint">Hapus semua</button>
            </div>
          )}
        </div>
        {toast && <p className="mt-3 rounded-sm bg-brand-light px-3 py-2 text-sm text-brand-ontint">{toast}</p>}

        {ready && items.length === 0 ? (
          <div className="py-16 text-center">
            <svg viewBox="0 0 24 24" className="mx-auto h-16 w-16 text-line" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            <h2 className="mt-5 font-bold">Belum ada produk favorit</h2>
            <p className="mt-2 text-sm text-muted">Tekan ikon hati pada produk untuk menyimpannya di sini.</p>
            <Link href="/products" className="mt-6 inline-block rounded-sm bg-brand px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-dark">Lihat produk</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-5 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <div key={p.id}>
                <ProductCard p={p} />
                <button
                  onClick={() => add({ slug: p.slug, name: p.name, price: p.price, tone: p.tone })}
                  className="mt-2 w-full rounded-sm border border-brand/40 bg-brand-light px-3 py-2 text-sm font-semibold text-brand-ontint transition-colors hover:bg-brand hover:text-white">
                  Tambahkan ke keranjang
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
