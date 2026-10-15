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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Lacak pesanan</h1>
      <p className="mt-1 text-muted">Masukkan nomor pesanan atau nomor resi untuk melihat posisi paket Anda.</p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Contoh: TMT-20261015-1234 atau JNE1234567890"
          aria-label="Nomor pesanan atau resi"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary h-11 px-6 text-sm">Lacak</button>
      </form>

      {submitted && !ready && <p className="mt-8 text-muted">Memuat data…</p>}

      {submitted && ready && found && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{found.number}</h2>
            <OrderStatusBadge status={found.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {found.lines[0].name}{found.lines.length > 1 ? ` dan ${found.lines.length - 1} produk lain` : ""} · {rupiah(found.total)}
          </p>
          <TrackingPanel order={found} />
          <Link href={`/orders/${found.id}`} className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">Lihat detail pesanan</Link>
        </div>
      )}

      {submitted && ready && !found && (
        <div className="mt-8 rounded-sm border border-dashed border-line bg-paper p-6 text-center">
          <p className="font-semibold">Pesanan tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted">
            Periksa kembali nomor pesanan atau resi. Pastikan Anda mengetik dengan benar, atau lacak langsung dari daftar pesanan.
          </p>
          <Link href="/orders" className="mt-4 inline-block rounded-sm bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">Lihat pesanan saya</Link>
        </div>
      )}
    </div>
  );
}
