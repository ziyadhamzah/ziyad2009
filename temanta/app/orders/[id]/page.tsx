"use client";
import ProductImage from "@/components/ProductImage";
import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, flow, statusLabel } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { rupiah } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import TrackingPanel from "@/components/TrackingPanel";
import PaymentInstructions from "@/components/PaymentInstructions";
import ReorderButton from "@/components/ReorderButton";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, orders, setStatus } = useStore();
  const { user, ready: authReady } = useAuth();
  useEffect(() => { if (authReady && !user) router.replace(`/login?next=/orders/${id}`); }, [authReady, user, router, id]);
  if (!authReady || !ready || !user) return <p className="mx-auto max-w-6xl px-4 py-24 text-muted">Memuat pesanan…</p>;
  const o = orders.find((x) => x.id === id && (!x.customer || x.customer.email === user.email));
  if (!o) return (
    <div className="mx-auto max-w-3xl px-4 py-24"><h1 className="text-2xl font-bold">Pesanan tidak ditemukan</h1>
      <Link href="/orders" className="mt-6 inline-block rounded bg-brand px-6 py-3 text-white">Lihat semua pesanan</Link></div>
  );
  const idx = flow.indexOf(o.status);
  const nextStatus = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/orders" className="text-sm text-muted hover:text-ink">Semua pesanan</Link>
      <div className="mt-4 flex items-center justify-between gap-3"><h1 className="text-2xl font-bold">{o.number}</h1><OrderStatusBadge status={o.status} /></div>
      <p className="mt-1 text-sm text-muted">{new Date(o.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</p>

      {o.status === "pending_payment" && <PaymentInstructions order={o} setStatus={setStatus} />}

      <TrackingPanel order={o} />
      {user.isAdmin && o.status !== "cancelled" && (
        <section className="mt-4 rounded-sm border border-dashed border-line bg-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Panel admin · simulasi status</p>
          <p className="mt-1 text-xs text-muted">
            Demo tanpa backend. Di produksi status pesanan diperbarui oleh admin/sistem, bukan oleh pembeli.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {nextStatus && (
              <button onClick={() => setStatus(o.id, nextStatus)} className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                Tandai “{statusLabel[nextStatus]}”
              </button>
            )}
            <button onClick={() => setStatus(o.id, "cancelled")} className="rounded-sm border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-danger-fg hover:text-danger-fg">
              Batalkan pesanan
            </button>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Produk</h2>
          <ReorderButton lines={o.lines} />
        </div>
        <ul className="mt-3 divide-y divide-line border-y border-line">{o.lines.map((l) => (
          <li key={l.key} className="flex gap-4 py-4"><div className="h-16 w-16 shrink-0 rounded-sm overflow-hidden"><ProductImage slug={l.slug} /></div>
            <div className="flex-1 text-sm"><p className="font-medium">{l.name}</p>{l.variant && <p className="text-muted">{l.variant}</p>}<p className="text-muted">{l.qty} × {rupiah(l.price)}</p></div>
            <p className="text-sm font-medium">{rupiah(l.qty * l.price)}</p></li>))}</ul>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{rupiah(o.subtotal)}</dd></div>
          {(o.discount ?? 0) > 0 && <div className="flex justify-between text-brand-ontint"><dt>Voucher {o.voucherCode}</dt><dd>-{rupiah(o.discount ?? 0)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Ongkir</dt><dd>{o.shipping ? rupiah(o.shipping) : "Gratis"}</dd></div>
          <div className="flex justify-between pt-2 text-base font-bold"><dt>Total</dt><dd>{rupiah(o.total)}</dd></div></dl>
      </section>
      <section className="mt-10 grid gap-6 text-sm sm:grid-cols-3">
        <div><h3 className="font-semibold">Alamat</h3><p className="mt-1 text-muted">{o.address.name}<br />{o.address.phone}<br />{o.address.street}, {o.address.district}, {o.address.city} {o.address.postal}</p></div>
        <div><h3 className="font-semibold">Pengiriman</h3><p className="mt-1 text-muted">{o.courier} {o.shippingMethod}</p></div>
        <div><h3 className="font-semibold">Pembayaran</h3><p className="mt-1 text-muted">{o.paymentMethod}</p></div>
      </section>
    </div>
  );
}
