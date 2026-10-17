"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { resiOf } from "@/lib/tracking";
import { rupiah } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import TrackingPanel from "@/components/TrackingPanel";

export default function LacakPage() {
  const { ready, orders } = useStore();
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pre = sp.get("resi") ?? sp.get("no") ?? sp.get("q");
    if (pre) { setQ(pre); setTerm(pre.trim()); setSubmitted(true); }
  }, []);

  const found = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return null;
    return orders.find((o) => o.number.toLowerCase() === t || o.id.toLowerCase() === t || resiOf(o).toLowerCase() === t) ?? null;
  }, [term, orders]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTerm(q);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand-ontint">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 22s8-6.2 8-12a8 8 0 1 0-16 0c0 5.8 8 12 8 12z" /><circle cx="12" cy="10" r="2.6" />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Lacak pesanan</h1>
          <p className="text-sm text-muted">Lihat posisi paket Anda secara langsung di peta.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 rounded-lg border border-line bg-surface p-3 shadow-card sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Contoh: TMT-20261015-1234 atau JNE1234567890"
              aria-label="Nomor pesanan atau resi"
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary h-11 px-6 text-sm">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            Lacak
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
            Bisa pakai nomor pesanan, nomor resi, atau ID pesanan.
          </span>
          <Link href="/orders" className="font-semibold text-brand-ontint hover:underline">Atau lacak dari pesanan saya</Link>
        </div>
      </form>

      {submitted && !ready && (
        <div className="mt-6 space-y-3">
          <div className="h-20 animate-pulse rounded-lg bg-surface shadow-card" />
          <div className="h-72 animate-pulse rounded-lg bg-surface shadow-card" />
        </div>
      )}

      {submitted && ready && found && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 shadow-card">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-brand-light text-brand-ontint">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></svg>
            </span>
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold">{found.number}</p>
              <p className="truncate text-xs text-muted">
                {found.lines[0].name}{found.lines.length > 1 ? ` dan ${found.lines.length - 1} produk lain` : ""} · {rupiah(found.total)}
              </p>
            </div>
            <div className="ml-auto"><OrderStatusBadge status={found.status} /></div>
          </div>
          <TrackingPanel order={found} />
          <Link href={`/orders/${found.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-ontint hover:underline">
            Lihat detail pesanan
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      )}

      {submitted && ready && !found && (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-paper p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted shadow-card">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </span>
          <p className="mt-4 font-semibold">Pesanan tidak ditemukan</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Periksa kembali nomor pesanan atau resi. Pastikan Anda mengetik dengan benar, atau lacak langsung dari daftar pesanan.
          </p>
          <Link href="/orders" className="mt-5 inline-block rounded-sm bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">Lihat pesanan saya</Link>
        </div>
      )}
    </div>
  );
}
