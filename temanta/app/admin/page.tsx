"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore, flow, statusLabel, OrderStatus } from "@/lib/store";
import { useReviews } from "@/lib/review-store";
import { products } from "@/lib/products";
import { rupiah } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";

const allStatuses: OrderStatus[] = [...flow, "cancelled"];

export default function AdminPage() {
  const { user, ready: authReady } = useAuth();
  const { orders, setStatus, ready } = useStore();
  const { all, remove } = useReviews();
  const router = useRouter();
  const [tab, setTab] = useState<"pesanan" | "ulasan">("pesanan");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !user) router.replace("/login?next=/admin");
  }, [authReady, user, router]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled");
    const revenue = active.reduce((n, o) => n + o.total, 0);
    const byStatus = allStatuses.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
    return {
      productCount: products.length,
      sold: products.reduce((n, p) => n + p.sold, 0),
      orderCount: orders.length,
      revenue,
      byStatus,
    };
  }, [orders]);

  const reviews = all();

  if (!authReady || !ready || !user) return <p className="mx-auto max-w-6xl px-4 py-24 text-muted">Memuat…</p>;
  if (!user.isAdmin) return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Akses ditolak</h1>
      <p className="mt-2 text-muted">Halaman ini hanya untuk admin toko.</p>
      <Link href="/" className="mt-6 inline-block rounded-sm bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">Kembali ke beranda</Link>
    </div>
  );

  const change = async (id: string, s: OrderStatus) => {
    setBusy(id);
    setStatus(id, s);
    setBusy(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-brand-ontint">Beranda</Link> <span className="mx-1">›</span> <span className="text-ink">Panel admin</span>
      </nav>

      <h1 className="text-2xl font-bold">Panel admin</h1>
      <p className="mt-1 text-sm text-muted">Ringkasan dihitung dari data toko yang sebenarnya (katalog, pesanan, dan ulasan).</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Produk katalog", value: stats.productCount.toLocaleString("id-ID") },
          { label: "Total terjual", value: stats.sold.toLocaleString("id-ID") },
          { label: "Pesanan (browser ini)", value: stats.orderCount.toLocaleString("id-ID") },
          { label: "Nilai pesanan aktif", value: rupiah(stats.revenue) },
        ].map((c) => (
          <div key={c.label} className="rounded-sm bg-surface p-4 shadow-card">
            <p className="text-xs text-muted">{c.label}</p>
            <p className="mt-1 text-xl font-bold text-brand-ontint">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        {stats.byStatus.map(({ s, n }) => (
          <span key={s} className="rounded-sm border border-line bg-surface px-2.5 py-1">{statusLabel[s]}: <b className="text-ink">{n}</b></span>
        ))}
      </div>

      <div className="mt-6 flex gap-2 border-b border-line">
        <button onClick={() => setTab("pesanan")} className={`px-4 py-2 text-sm font-semibold ${tab === "pesanan" ? "border-b-2 border-brand text-brand-ontint" : "text-muted hover:text-ink"}`}>Kelola pesanan</button>
        <button onClick={() => setTab("ulasan")} className={`px-4 py-2 text-sm font-semibold ${tab === "ulasan" ? "border-b-2 border-brand text-brand-ontint" : "text-muted hover:text-ink"}`}>Moderasi ulasan ({reviews.length})</button>
      </div>

      {tab === "pesanan" && (
        <div className="mt-4 overflow-x-auto rounded-sm bg-surface shadow-card">
          {orders.length === 0 ? (
            <p className="p-10 text-center text-muted">Belum ada pesanan.</p>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="px-4 py-3">Nomor</th>
                  <th scope="col" className="px-4 py-3">Tanggal</th>
                  <th scope="col" className="px-4 py-3">Pembeli</th>
                  <th scope="col" className="px-4 py-3">Total</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Ubah status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3"><Link href={`/orders/${o.id}`} className="font-medium text-brand-ontint hover:underline">{o.number}</Link></td>
                    <td className="px-4 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3">{o.customer?.name ?? o.address.name}</td>
                    <td className="px-4 py-3 font-medium">{rupiah(o.total)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        disabled={busy === o.id}
                        aria-label={`Ubah status pesanan ${o.number}`}
                        onChange={(e) => change(o.id, e.target.value as OrderStatus)}
                        className="h-9 rounded-sm border border-line bg-surface px-2 text-sm outline-none focus:border-brand disabled:opacity-50">
                        {allStatuses.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "ulasan" && (
        <div className="mt-4 rounded-sm bg-surface shadow-card">
          {reviews.length === 0 ? (
            <p className="p-10 text-center text-muted">Belum ada ulasan.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="flex items-start gap-4 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{r.name} · {r.rating}/5 {r.variant && <span className="text-muted">({r.variant})</span>}</p>
                    <p className="mt-0.5 text-xs text-muted">{r.productSlug} · {r.date}{r.verified ? " · Pembelian terverifikasi" : ""}</p>
                    <p className="mt-2 text-sm text-ink/85">{r.text}</p>
                  </div>
                  <button onClick={() => remove(r.id)} className="shrink-0 text-xs text-muted underline hover:text-danger-fg">Hapus</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}