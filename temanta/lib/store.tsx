"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { CartLine } from "./cart";
import { getProduct } from "./products";
import { shippingCost, shippingOptions, paymentLabel } from "./shipping";
import { validateVoucher, type VoucherLine } from "./vouchers";
import { notify } from "./events";
import { useAuth } from "./auth";
import { getSupabase } from "./supabase";
import { rupiah } from "./format";

export type OrderStatus = "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
export type Address = { name: string; phone: string; street: string; district: string; city: string; postal: string };
export type Draft = { address: Address; shippingId: string; paymentId: string; voucherCode: string; step: number };
export type Order = {
  id: string; number: string; createdAt: string; status: OrderStatus; lines: CartLine[]; address: Address;
  courier: string; shippingMethod: string; paymentMethod: string; subtotal: number; discount: number;
  voucherCode?: string | null; shipping: number; total: number;
  events: { status: OrderStatus; at: string }[]; customer?: { name: string; email: string }; resi?: string;
};
export const emptyDraft: Draft = { address: { name: "", phone: "", street: "", district: "", city: "", postal: "" }, shippingId: "reguler", paymentId: "", voucherCode: "", step: 0 };
export const statusLabel: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran", paid: "Dibayar", processing: "Diproses", shipped: "Dikirim", delivered: "Sampai", cancelled: "Dibatalkan",
};
export const flow: OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "delivered"];

type OrderRow = {
  id: string; order_number: string; status: OrderStatus; courier: string | null; shipping_method: string | null;
  shipping_cost: number; total: number; created_at: string;
  discount?: number | null; voucher_code?: string | null;
  order_items?: { name: string; price: number; qty: number; variant: string | null; slug: string | null; tone: string | null }[];
  addresses?: { recipient: string; phone: string; street: string; district: string; city: string; postal_code: string } | null;
  payments?: { method: string; amount: number; paid_at: string | null } | null;
  shipments?: { tracking_number: string | null } | null;
};

function fromRow(r: OrderRow, customer: { name: string; email: string }, events?: { status: OrderStatus; at: string }[]): Order {
  const lines: CartLine[] = (r.order_items ?? []).map((it, i) => ({
    key: `${it.slug ?? it.name}:${it.variant ?? ""}:${i}`, slug: it.slug ?? "", name: it.name,
    price: it.price, qty: it.qty, variant: it.variant ?? undefined, tone: it.tone ?? "",
  }));
  const a = r.addresses;
  const paidAt = r.payments?.paid_at;
  return {
    id: r.id, number: r.order_number, createdAt: r.created_at, status: r.status, lines,
    address: a
      ? { name: a.recipient, phone: a.phone, street: a.street, district: a.district, city: a.city, postal: a.postal_code }
      : { name: customer.name, phone: "", street: "", district: "", city: "", postal: "" },
    courier: r.courier ?? "", shippingMethod: r.shipping_method ?? "", paymentMethod: r.payments?.method ?? "",
    subtotal: lines.reduce((n, l) => n + l.price * l.qty, 0), discount: r.discount ?? 0, voucherCode: r.voucher_code ?? null,
    shipping: r.shipping_cost, total: r.total,
    events: events && events.length ? events
      : [{ status: "pending_payment", at: r.created_at },
         ...(r.status !== "pending_payment" ? [{ status: r.status, at: paidAt ?? r.created_at }] : [])],
    customer, resi: r.shipments?.tracking_number ?? undefined,
  };
}

async function persistOrder(o: Order, userId: string) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    let addressId: string | null = null;
    const { data: addr } = await sb.from("addresses").insert({
      user_id: userId, recipient: o.address.name, phone: o.address.phone, street: o.address.street,
      district: o.address.district, city: o.address.city, postal_code: o.address.postal,
    }).select("id").single();
    if (addr) addressId = addr.id;
    const base = {
      id: o.id, order_number: o.number, user_id: userId, address_id: addressId, status: o.status,
      courier: o.courier, shipping_method: o.shippingMethod, shipping_cost: o.shipping, total: o.total,
      created_at: o.createdAt,
    };
    // Coba simpan dengan kolom diskon/voucher; bila skema belum dimigrasi, ulangi tanpa kolom tersebut.
    let { error } = await sb.from("orders").insert({ ...base, discount: o.discount, voucher_code: o.voucherCode ?? null });
    if (error) ({ error } = await sb.from("orders").insert(base));
    if (error) return;
    await sb.from("order_items").insert(o.lines.map((l) => ({
      order_id: o.id, name: l.name, price: l.price, qty: l.qty,
      variant: l.variant ?? null, slug: l.slug || null, tone: l.tone || null,
    })));
    await sb.from("payments").insert({ order_id: o.id, method: o.paymentMethod, amount: o.total });
    await sb.from("shipments").insert({ order_id: o.id, tracking_number: o.resi ?? null, status: o.status });
    await sb.from("order_events").insert(o.events.map((e) => ({ order_id: o.id, status: e.status, at: e.at })));
  } catch {}
}

type Ctx = {
  ready: boolean; draft: Draft; orders: Order[];
  patchDraft: (p: Partial<Draft>) => void; patchAddress: (p: Partial<Address>) => void;
  placeOrder: (lines: CartLine[]) => Order; commitOrder: (order: Order) => void;
  setStatus: (id: string, s: OrderStatus) => void;
};
const StoreContext = createContext<Ctx | null>(null);
const DRAFT_KEY = "temanta.checkout.v1", ORDERS_KEY = "temanta.orders.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const d = localStorage.getItem(DRAFT_KEY), o = localStorage.getItem(ORDERS_KEY);
      if (d) setDraft(JSON.parse(d) as Draft);
      if (o) setOrders(JSON.parse(o) as Order[]);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft, ready]);
  useEffect(() => { if (ready) localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders, ready]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user || !ready) return;
    let live = true;
    (async () => {
      const { data, error } = await sb.from("orders")
        .select("*, order_items(*), addresses(*), payments(*), shipments(*)")
        .order("created_at", { ascending: false });
      if (!live || error || !data?.length) return;
      const ids = data.map((r) => r.id);
      const evMap: Record<string, { status: OrderStatus; at: string }[]> = {};
      const { data: evs } = await sb.from("order_events").select("order_id, status, at").in("order_id", ids).order("at", { ascending: true });
      for (const e of evs ?? []) {
        (evMap[e.order_id] ??= []).push({ status: e.status as OrderStatus, at: e.at });
      }
      if (!live) return;
      const customer = { name: user.name, email: user.email };
      setOrders(data.map((r) => fromRow(r as OrderRow, customer, evMap[r.id])));
    })();
    return () => { live = false; };
  }, [user, ready]);

  const value = useMemo<Ctx>(() => ({
    ready, draft, orders,
    patchDraft: (p) => setDraft((d) => ({ ...d, ...p })),
    patchAddress: (p) => setDraft((d) => ({ ...d, address: { ...d.address, ...p } })),
    placeOrder: (lines) => {
      // Ulangi harga & jumlah dari katalog — jangan percaya nilai dari client (localStorage bisa diubah).
      const resolved = lines
        .map((l) => ({ l, p: getProduct(l.slug) }))
        .filter((x): x is { l: CartLine; p: NonNullable<ReturnType<typeof getProduct>> } => Boolean(x.p));
      const safe: CartLine[] = resolved
        .map(({ l, p }) => ({ ...l, name: p.name, tone: p.tone, price: p.price, qty: Math.max(1, Math.min(p.stock, l.qty)) }))
        .filter((l) => l.qty > 0);
      const vLines: VoucherLine[] = resolved
        .map(({ l, p }) => ({ price: p.price, qty: Math.max(1, Math.min(p.stock, l.qty)), category: p.category }))
        .filter((l) => l.qty > 0);
      const subtotal = safe.reduce((n, l) => n + l.price * l.qty, 0);
      const vres = draft.voucherCode ? validateVoucher(draft.voucherCode, vLines) : null;
      const discount = vres?.ok ? vres.discount : 0;
      const ship = shippingOptions.find((s) => s.id === draft.shippingId) ?? shippingOptions[0];
      const shipping = shippingCost(ship.id, subtotal);
      const now = new Date().toISOString();
      const d = now.slice(0, 10).replace(/-/g, "");
      const order: Order = {
        id: crypto.randomUUID(), number: `TMT-${d}-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: now,
        status: "pending_payment", lines: safe, address: draft.address, courier: ship.courier, shippingMethod: ship.name,
        paymentMethod: paymentLabel(draft.paymentId), subtotal, discount,
        voucherCode: discount > 0 ? draft.voucherCode.toUpperCase() : null,
        shipping, total: Math.max(0, subtotal - discount + shipping),
        events: [{ status: "pending_payment", at: now }],
        customer: user ? { name: user.name, email: user.email } : undefined,
        resi: `${ship.courier.replace(/[^A-Z]/g, "")}${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      };
      setOrders((o) => [order, ...o]);
      setDraft((x) => ({ ...x, step: 0, paymentId: "", voucherCode: "" }));
      if (user) void persistOrder(order, user.id);
      notify({ title: "Pesanan dibuat", body: `Pesanan ${order.number} menunggu pembayaran ${rupiah(order.total)}.`, href: `/orders/${order.id}` });
      return order;
    },
    commitOrder: (order) => {
      setOrders((o) => (o.some((x) => x.id === order.id) ? o : [order, ...o]));
      setDraft((x) => ({ ...x, step: 0, paymentId: "", voucherCode: "" }));
      if (user) void persistOrder(order, user.id);
      notify({ title: "Pesanan dibuat", body: `Pesanan ${order.number} menunggu pembayaran ${rupiah(order.total)}.`, href: `/orders/${order.id}` });
    },
    setStatus: (id, s) => {
      const order = orders.find((o) => o.id === id);
      setOrders((os) => os.map((o) => o.id === id ? { ...o, status: s, events: [...o.events, { status: s, at: new Date().toISOString() }] } : o));
      if (order) notify({ title: `Pesanan ${order.number} ${statusLabel[s]}`, body: `Status pesanan ${order.number} menjadi ${statusLabel[s]}.`, href: `/orders/${order.id}` });
      const sb = getSupabase();
      if (!sb) return;
      (async () => {
        try {
          const now = new Date().toISOString();
          await sb.from("orders").update({ status: s }).eq("id", id);
          if (s === "paid") await sb.from("payments").update({ paid_at: now }).eq("order_id", id);
          await sb.from("shipments").update({ status: s, updated_at: now }).eq("order_id", id);
          await sb.from("order_events").insert({ order_id: id, status: s, at: now });
        } catch {}
      })();
    },
  }), [ready, draft, orders, user]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return c;
};
