"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  categories, priceBounds, products, queryProducts, sortOptions, suggestProducts,
  type SortKey,
} from "@/lib/products";
import ProductCard, { discountOf } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import SectionHeading from "@/components/SectionHeading";
import VoucherPromo from "@/components/VoucherPromo";
import Benefits from "@/components/Benefits";
import { rupiah } from "@/lib/format";

const PER_PAGE = 12;
const RATINGS = [
  { v: 0, label: "Semua" },
  { v: 4, label: "4 bintang ke atas" },
  { v: 3, label: "3 bintang ke atas" },
];
const PRICE_PRESETS = [
  { label: "Di bawah Rp150rb", min: "", max: "150000" },
  { label: "Rp150rb – 250rb", min: "150000", max: "250000" },
  { label: "Rp250rb – 400rb", min: "250000", max: "400000" },
  { label: "Di atas Rp400rb", min: "400000", max: "" },
];
const fmtNum = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export default function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const kategori = params.get("kategori") ?? undefined;
  const sort = (params.get("sort") ?? "relevan") as SortKey;
  const minPrice = params.get("min") ? Number(params.get("min")) : undefined;
  const maxPrice = params.get("max") ? Number(params.get("max")) : undefined;
  const minRating = params.get("rating") ? Number(params.get("rating")) : undefined;
  const page = params.get("page") ? Number(params.get("page")) : 1;

  const [term, setTerm] = useState(q);
  const [minP, setMinP] = useState(minPrice != null ? String(minPrice) : "");
  const [maxP, setMaxP] = useState(maxPrice != null ? String(maxPrice) : "");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIndex, setSuggestIndex] = useState(-1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setTerm(q); }, [q]);
  useEffect(() => {
    setMinP(minPrice != null ? String(minPrice) : "");
    setMaxP(maxPrice != null ? String(maxPrice) : "");
  }, [minPrice, maxPrice]);

  const update = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      const p = new URLSearchParams(params.toString());
      Object.entries(patch).forEach(([k, v]) => { if (v == null || v === "") p.delete(k); else p.set(k, v); });
      if (resetPage) p.delete("page");
      const qs = p.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

  useEffect(() => {
    const t = setTimeout(() => { if (term.trim() !== q.trim()) update({ q: term }); }, 350);
    return () => clearTimeout(t);
  }, [term, q, update]);

  const result = useMemo(
    () => queryProducts({ q, kategori, sort, minPrice, maxPrice, minRating, page, perPage: PER_PAGE }),
    [q, kategori, sort, minPrice, maxPrice, minRating, page],
  );
  const { items, total, pages, page: safePage } = result;

  const suggestions = useMemo(() => (term.trim() ? suggestProducts(term) : []), [term]);

  const openSuggest = () => { if (blurTimer.current) clearTimeout(blurTimer.current); setSuggestOpen(true); };
  const closeSuggestSoon = () => { if (blurTimer.current) clearTimeout(blurTimer.current); blurTimer.current = setTimeout(() => { setSuggestOpen(false); setSuggestIndex(-1); }, 150); };
  useEffect(() => () => { if (blurTimer.current) clearTimeout(blurTimer.current); }, []);

  const onSuggestKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setSuggestOpen(false); setSuggestIndex(-1); return; }
    if (!suggestOpen || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSuggestIndex((i) => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSuggestIndex((i) => (i - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && suggestIndex >= 0) { e.preventDefault(); router.push(`/products/${suggestions[suggestIndex].slug}`); setSuggestOpen(false); setSuggestIndex(-1); }
  };

  const hasFilter = Boolean(q || kategori || minPrice != null || maxPrice != null || minRating != null || (sort && sort !== "relevan"));
  const resetFilter = () => { setTerm(""); setMinP(""); setMaxP(""); startTransition(() => router.replace(pathname, { scroll: false })); };

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minP.trim() ? String(Math.max(0, Number(minP) || 0)) : undefined;
    const max = maxP.trim() ? String(Math.max(0, Number(maxP) || 0)) : undefined;
    update({ min, max });
  };

  const applyPreset = (p: { min: string; max: string }) => {
    setMinP(p.min);
    setMaxP(p.max);
    update({ min: p.min || undefined, max: p.max || undefined });
  };

  const pageHref = (n: number) => {
    const p = new URLSearchParams(params.toString());
    if (n <= 1) p.delete("page"); else p.set("page", String(n));
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="rounded-sm bg-surface p-4 shadow-card">
        <p className="text-sm text-muted">
          <Link href="/" className="hover:text-brand-ontint">Beranda</Link> &nbsp;/&nbsp; {kategori ?? (q ? `Hasil pencarian “${q}”` : "Semua produk")}
        </p>
        <h1 className="mt-2 text-xl font-bold">{q ? `Hasil untuk “${q}”` : kategori ?? "Semua produk"}</h1>

        {/* Search + autocomplete */}
        <form action="/products" className="relative mt-4 flex rounded-sm border border-line" onSubmit={(e) => { e.preventDefault(); setSuggestOpen(false); update({ q: term }); }}>
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          <input
            name="q" type="search" value={term}
            onChange={(e) => { setTerm(e.target.value); setSuggestOpen(true); setSuggestIndex(-1); }}
            onFocus={openSuggest}
            onBlur={closeSuggestSoon}
            onKeyDown={onSuggestKey}
            role="combobox" aria-expanded={suggestOpen && suggestions.length > 0} aria-controls="catalog-suggest" aria-autocomplete="list"
            placeholder="Cari produk di katalog…" aria-label="Cari produk" autoComplete="off"
            className="h-10 min-w-0 flex-1 rounded-l-sm px-3 text-sm outline-none placeholder:text-muted"
          />
          <button type="submit" className="flex h-10 w-12 shrink-0 items-center justify-center rounded-r-sm bg-brand text-white transition-colors hover:bg-brand-dark" aria-label="Cari">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
          </button>

          {suggestOpen && suggestions.length > 0 && (
            <ul id="catalog-suggest" role="listbox" aria-label="Saran produk" className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-sm border border-line bg-surface py-1 shadow-hover">
              {suggestions.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === suggestIndex}>
                  <Link href={`/products/${p.slug}`} onMouseEnter={() => setSuggestIndex(i)} onClick={() => setSuggestOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${i === suggestIndex ? "bg-paper" : "hover:bg-paper"}`}>
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-paper"><ProductImage slug={p.slug} /></span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <span className="shrink-0 text-xs font-semibold text-brand-ontint">{rupiah(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Kategori */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-line pb-4 text-sm">
          <Link href={buildHref(params, { kategori: undefined })} className={`rounded-sm px-3 py-1.5 ${!kategori ? "bg-brand text-white" : "border border-line hover:border-brand hover:text-brand-ontint"}`}>Semua</Link>
          {categories.map((c) => (
            <Link key={c} href={buildHref(params, { kategori: c })}
              className={`rounded-sm px-3 py-1.5 ${kategori === c ? "bg-brand text-white" : "border border-line hover:border-brand hover:text-brand-ontint"}`}>{c}</Link>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={() => setFiltersOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 hover:border-brand hover:text-brand-ontint sm:hidden">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Filter
          </button>

          <label className="inline-flex items-center gap-2 text-muted">
            <span className="whitespace-nowrap">Urutkan</span>
            <select value={sort} onChange={(e) => update({ sort: e.target.value === "relevan" ? undefined : e.target.value })}
              className="h-9 rounded-sm border border-line bg-surface px-2 text-ink outline-none focus:border-brand">
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

          <span className="ml-auto text-muted">{pending ? "Memuat…" : `${total} produk`}</span>
        </div>

        {/* Panel filter */}
        <div className={`${filtersOpen ? "block" : "hidden"} mt-3 space-y-4 border-t border-line pt-4 sm:block`}>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <form onSubmit={applyPrice} className="w-full sm:w-auto">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16v6l-8 10L4 10z" /><path d="M9 8h.01" /></svg>
                Rentang harga
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-9 items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30">
                  <span className="text-xs font-medium text-muted">Rp</span>
                  <input value={minP ? fmtNum(minP) : ""} onChange={(e) => setMinP(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
                    placeholder={fmtNum(String(priceBounds.min))} aria-label="Harga minimum"
                    className="w-16 bg-transparent text-sm text-ink outline-none placeholder:text-muted/60" />
                </label>
                <span className="text-muted">—</span>
                <label className="flex h-9 items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30">
                  <span className="text-xs font-medium text-muted">Rp</span>
                  <input value={maxP ? fmtNum(maxP) : ""} onChange={(e) => setMaxP(e.target.value.replace(/\D/g, ""))} inputMode="numeric"
                    placeholder={fmtNum(String(priceBounds.max))} aria-label="Harga maksimum"
                    className="w-16 bg-transparent text-sm text-ink outline-none placeholder:text-muted/60" />
                </label>
                <button type="submit" className="h-9 rounded-sm bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">Terapkan</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRICE_PRESETS.map((p) => {
                  const active = (minPrice ?? null) === (p.min ? Number(p.min) : null) && (maxPrice ?? null) === (p.max ? Number(p.max) : null);
                  return (
                    <button key={p.label} type="button" onClick={() => applyPreset(active ? { min: "", max: "" } : p)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${active ? "border-brand bg-brand-light font-semibold text-brand-ontint" : "border-line text-muted hover:border-brand hover:text-brand-ontint"}`}>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">Rating</span>
              {RATINGS.map((r) => (
                <button key={r.v} type="button" onClick={() => update({ rating: r.v ? String(r.v) : undefined })}
                  className={`rounded-sm px-3 py-1.5 text-sm ${((minRating ?? 0) === r.v) ? "bg-brand-light font-semibold text-brand-ontint" : "border border-line hover:border-brand hover:text-brand-ontint"}`}>{r.label}</button>
              ))}
            </div>

            {(hasFilter || minP || maxP) && (
              <button type="button" onClick={resetFilter} className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm text-muted hover:border-brand hover:text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /></svg>
                Reset filter
              </button>
            )}
          </div>
        </div>
      </div>

      {items.length ? (
        <>
          <div className={`mt-3 grid grid-cols-2 gap-2.5 transition-opacity sm:grid-cols-3 lg:grid-cols-5 ${pending ? "opacity-60" : "opacity-100"}`}>
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {pages > 1 && (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Navigasi halaman">
              <PageLink href={pageHref(safePage - 1)} disabled={safePage <= 1} label="Sebelumnya" />
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={pageHref(n)} aria-current={n === safePage ? "page" : undefined}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-sm ${n === safePage ? "border-brand bg-brand text-white" : "border-line hover:border-brand hover:text-brand-ontint"}`}>{n}</Link>
              ))}
              <PageLink href={pageHref(safePage + 1)} disabled={safePage >= pages} label="Berikutnya" next />
            </nav>
          )}
        </>
      ) : (
        <div className="mt-3 rounded-sm bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-semibold">Produk tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted">Coba kata kunci lain, longgarkan filter, atau lihat rekomendasi di bawah.</p>
          <button type="button" onClick={resetFilter} className="mt-4 rounded-sm border border-line px-5 py-2 text-sm font-medium hover:border-brand hover:text-brand-ontint">Reset filter</button>
          <div className="mt-6 grid grid-cols-2 gap-2.5 text-left sm:grid-cols-3 lg:grid-cols-5">
            {[...products].sort((a, b) => discountOf(b) - discountOf(a)).slice(0, 5).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function buildHref(params: URLSearchParams, patch: Record<string, string | undefined>) {
  const p = new URLSearchParams(params.toString());
  Object.entries(patch).forEach(([k, v]) => { if (v == null || v === "") p.delete(k); else p.set(k, v); });
  p.delete("page");
  const qs = p.toString();
  return qs ? `/products?${qs}` : "/products";
}

function PageLink({ href, disabled, label, next }: { href: string; disabled: boolean; label: string; next?: boolean }) {
  const cls = "flex h-9 items-center gap-1 rounded-sm border border-line px-3 text-sm";
  if (disabled) return <span className={`${cls} cursor-not-allowed text-muted opacity-50`}>{!next && <Chevron dir="left" />}{label}{next && <Chevron dir="right" />}</span>;
  return <Link href={href} className={`${cls} hover:border-brand hover:text-brand-ontint`}>{!next && <Chevron dir="left" />}{label}{next && <Chevron dir="right" />}</Link>;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}
