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

const tabIcon: Record<string, React.ReactNode> = {
  produk: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  ulasan: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />,
  tentang: <><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></>,
};

export default function StorePage({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = tabs.some((t) => t.key === searchParams.tab) ? searchParams.tab! : "produk";
  const stats = [
    { label: "Produk", value: String(store.productCount), icon: <><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></> },
    { label: "Rating", value: store.rating.toFixed(1), icon: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /> },
    { label: "Terjual", value: store.itemsSold.toLocaleString("id-ID"), icon: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></> },
    { label: "Kategori", value: String(store.categories.length), icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-lg bg-surface shadow-card">
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-deep via-brand to-brand-dark sm:h-48">
          <span className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-surface/10" />
          <span className="pointer-events-none absolute -bottom-16 left-1/4 h-36 w-36 rounded-full bg-surface/10" />
          <span className="pointer-events-none absolute right-1/3 top-4 h-16 w-16 rounded-full bg-surface/5" />
          <div className="absolute inset-0 opacity-[0.13] [background-image:repeating-linear-gradient(135deg,#fff_0_2px,transparent_2px_16px)]" />
        </div>

        <div className="relative px-4 pb-4 sm:px-6 sm:pb-5">
          <div className="-mt-10 flex flex-wrap items-end gap-x-4 gap-y-3 sm:-mt-12">
            <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-surface bg-surface text-brand-ontint shadow-float sm:h-24 sm:w-24">
              <svg viewBox="0 0 24 24" className="h-9 w-9 sm:h-11 sm:w-11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
              {store.verified && (
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-brand text-white" title="Toko terverifikasi">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1 pb-1">
              <h1 className="flex items-center gap-1.5 text-xl font-bold sm:text-2xl">
                {store.name}
                {store.verified && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand" fill="currentColor" aria-label="Terverifikasi"><path d="m12 2 2.4 1.8 3-.2 1 2.8 2.5 1.6-1 2.9 1 2.9-2.5 1.6-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3.1 16l1-2.9-1-2.9L5.6 8.6l1-2.8 3 .2z" /><path d="m8.5 12.2 2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-6.2 8-12a8 8 0 1 0-16 0c0 5.8 8 12 8 12z" /><circle cx="12" cy="10" r="2.6" /></svg>
                  {store.location}
                </span>
                <span className="text-line">•</span>
                <span className="text-ok-fg">Aktif {store.joined}</span>
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-2 pb-1 sm:flex">
              <FollowButton />
              <Link href="/chat" className="inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" /></svg>
                Chat
              </Link>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand-ontint">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg>
              {store.rating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
              {store.itemsSold.toLocaleString("id-ID")} terjual
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
              {store.categories.length} kategori
            </span>
            <div className="flex w-full gap-2 sm:hidden">
              <FollowButton />
              <Link href="/chat" className="inline-flex items-center gap-1.5 rounded-sm border border-line px-4 py-1.5 text-sm font-semibold text-ink">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" /></svg>
                Chat
              </Link>
            </div>
          </div>
        </div>

        <dl className="mt-2 grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3 bg-surface px-4 py-4 sm:px-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{s.icon}</svg>
              </span>
              <div className="min-w-0">
                <dd className="text-lg font-bold leading-none text-ink">{s.value}</dd>
                <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              </div>
            </div>
          ))}
        </dl>

        <nav className="flex gap-1 overflow-x-auto px-3 py-2 sm:px-4">
          {tabs.map((t) => (
            <Link key={t.key} href={`/toko?tab=${t.key}`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${tab === t.key ? "bg-brand-light font-semibold text-brand-ontint" : "text-ink/70 hover:bg-paper hover:text-brand-ontint"}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{tabIcon[t.key]}</svg>
              {t.label}
              {t.key === "produk" && <span className={`rounded-full px-1.5 text-[11px] font-semibold ${tab === t.key ? "bg-surface text-brand-ontint" : "bg-paper text-muted"}`}>{products.length}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {tab === "produk" && (
        <section className="mt-4 rounded-lg bg-surface p-4 shadow-card sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-light text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 7l9-4 9 4-9 4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></svg>
              </span>
              Produk dari toko ini
            </h2>
            <span className="shrink-0 rounded-full bg-paper px-3 py-1 text-xs font-medium text-muted">{products.length} produk</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {tab === "ulasan" && (
        <section className="mt-4 rounded-lg bg-surface p-4 shadow-card sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-light text-brand-ontint">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg>
            </span>
            Penilaian Toko
          </h2>
          <StoreReviews />
        </section>
      )}

      {tab === "tentang" && (
        <section className="mt-4 rounded-lg bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold">Tentang {store.name}</h2>
          <p className="mt-3 max-w-prose leading-relaxed text-muted">{store.desc}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Produk dicek manual", icon: <path d="m5 12 5 5L20 7" /> },
              { label: "Pengiriman cepat", icon: <><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></> },
              { label: "Pengrajin lokal", icon: <><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-7h6v7" /></> },
              { label: "Chat penjual aktif", icon: <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z" /> },
            ].map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink/75">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{f.icon}</svg>
                {f.label}
              </span>
            ))}
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Lokasi", store.location],
              ["Bergabung sejak", store.since],
              ["Produk aktif", `${store.productCount} produk`],
              ["Kategori", store.categories.join(", ")],
              ["Total barang terjual", store.itemsSold.toLocaleString("id-ID")],
              ["Rating rata-rata katalog", `${store.rating.toFixed(1)}/5`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-line bg-paper px-4 py-3">
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
