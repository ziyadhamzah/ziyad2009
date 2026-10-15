"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { rupiah } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ReorderButton from "@/components/ReorderButton";

export default function OrdersPage() {
  const router = useRouter();
  const { ready, orders } = useStore();
  const { user, ready: authReady } = useAuth();
  useEffect(() => { if (authReady && !user) router.replace("/login?next=/orders"); }, [authReady, user, router]);
  if (!authReady || !ready || !user) return <p className="mx-auto max-w-6xl px-4 py-24 text-muted">Memuat pesanan…</p>;
  const mine = orders.filter((o) => !o.customer || o.customer.email === user.email);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Pesanan saya</h1>
      {!mine.length ? (
        <div className="mt-10"><p className="font-semibold">Belum ada pesanan</p><p className="mt-1 text-muted">Pesanan yang Anda buat akan muncul di sini.</p>
          <Link href="/products" className="mt-6 inline-block rounded bg-brand px-6 py-3 text-white">Mulai belanja</Link></div>
      ) : (
        <ul className="mt-6 space-y-4">{mine.map((o) => (
          <li key={o.id} className="rounded-sm border border-line bg-surface p-5 transition-colors hover:border-ink/40">
            <Link href={`/orders/${o.id}`} className="block">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold">{o.number}</p><OrderStatusBadge status={o.status} /></div>
              <p className="mt-1 text-sm text-muted">{new Date(o.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })} · {o.paymentMethod} · {o.courier} {o.shippingMethod}</p>
              <p className="mt-3 text-sm">{o.lines[0].name}{o.lines.length > 1 ? ` dan ${o.lines.length - 1} produk lain` : ""}</p>
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <p className="font-bold">{rupiah(o.total)}</p>
              <ReorderButton lines={o.lines} />
            </div>
          </li>))}</ul>
      )}
    </div>
  );
}
