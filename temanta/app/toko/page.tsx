import Link from "next/link";
import { products } from "@/lib/products";
import { store } from "@/lib/reviews";
import ProductCard from "@/components/ProductCard";
import StoreReviews from "@/components/StoreReviews";
import FollowButton from "@/components/FollowButton";

export const metadata = { title: `${store.name} · Temanta` };

const tabs = [
  { key: "produk", label: "Produk" },
  { key: "ulasan", label: "Ulasan" },
  { key: "tentang", label: "Tentang Toko" },
];

export default function StorePage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = tabs.some((t) => t.key === searchParams.tab) ? searchParams.tab! : "produk";
  const stats = [
    { label: "Produk", value: String(store.productCount) },
    { label: "Rating", value: store.rating.toFixed(1) },
    { label: "Terjual", value: store.itemsSold.toLocaleString("id-ID") },
    { label: "Kategori", value: String(store.categories.length) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-sm bg-surface shadow-card">
        <div className="relative h-32 bg-gradient-to-r from-brand to-brand-dark sm:h-44">
          <span className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full bg-surface/10" />
          <span className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-surface/10" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white sm:left-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-surface text-brand-ontint shadow-sm sm:h-20 sm:w-20">
              <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-10 sm:w-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
            </span>
            <div>
              <h1 className="flex items-center gap-1.5 text-lg font-bold sm:text-2xl">
                {store.name}
                {store.verified && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-label="Terverifikasi"><path d="m12 2 2.4 1.8 3-.2 1 2.8 2.5 1.6-1 2.9 1 2.9-2.5 1.6-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3.1 16l1-2.9-1-2.9L5.6 8.6l1-2.8 3 .2z" /><path d="m8.5 12.2 2.3 2.3 4.7-4.8" fill="none" stroke="#ee4d2d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </h1>
              <p className="text-xs text-white/90 sm:text-sm">{store.location} · Aktif {store.joined}</p>
            </div>
            <FollowButton />
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-line border-b border-line sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-4 text-center">
              <dt className="text-xs text-muted">{s.label}</dt>
              <dd className="mt-1 text-xl font-bold text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="flex gap-1 overflow-x-auto px-4 py-1.5">
          {tabs.map((t) => (
            <Link key={t.key} href={`/toko?tab=${t.key}`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${tab === t.key ? "bg-brand-light font-semibold text-brand-ontint" : "text-ink/70 hover:bg-paper hover:text-brand-ontint"}`}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {tab === "produk" && (
        <section className="mt-4 rounded-sm bg-surface p-4 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Produk dari toko ini</h2>
            <span className="text-sm text-muted">{products.length} produk</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {tab === "ulasan" && (
        <section className="mt-4 rounded-sm bg-surface p-4 shadow-card sm:p-6">
          <h2 className="mb-5 text-lg font-bold">Penilaian Toko</h2>
          <StoreReviews />
        </section>
      )}

      {tab === "tentang" && (
        <section className="mt-4 rounded-sm bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">Tentang {store.name}</h2>
          <p className="mt-3 max-w-prose leading-relaxed text-muted">{store.desc}</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Lokasi", store.location],
              ["Bergabung sejak", store.since],
              ["Produk aktif", `${store.productCount} produk`],
              ["Kategori", store.categories.join(", ")],
              ["Total barang terjual", store.itemsSold.toLocaleString("id-ID")],
              ["Rating rata-rata katalog", `${store.rating.toFixed(1)}/5`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-sm border border-line px-4 py-3">
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}