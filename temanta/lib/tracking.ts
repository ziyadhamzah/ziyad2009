import type { Order, OrderStatus } from "./store";
import { shippingOptions } from "./shipping";

export type TrackEvent = { at: string; label: string; place: string };
export type TrackStage = { key: string; label: string };

export const resiOf = (o: Order) => o.resi ?? `TMT${o.number.replace(/\D/g, "").slice(-10)}`;

export function etaOf(o: Order) {
  const opt = shippingOptions.find((s) => s.courier === o.courier && s.name === o.shippingMethod);
  return opt?.eta ?? "2–4 hari";
}

const etaDays = (eta: string) => {
  const m = eta.match(/(\d+)\D+(\d+)/);
  return m ? Number(m[2]) : 4;
};

export function etaDate(o: Order): string | null {
  if (o.status === "delivered" || o.status === "cancelled") return null;
  const opt = shippingOptions.find((s) => s.courier === o.courier && s.name === o.shippingMethod);
  const days = etaDays(opt?.eta ?? "2–4 hari");
  const base = o.events.find((e) => e.status === "shipped")?.at ?? o.createdAt;
  const d = new Date(new Date(base).getTime() + days * 86400000);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

export const STAGES: TrackStage[] = [
  { key: "packed", label: "Dikemas" },
  { key: "transit", label: "Dalam perjalanan" },
  { key: "delivery", label: "Diantar kurir" },
  { key: "done", label: "Diterima" },
];

export function stageIndex(o: Order): number {
  if (o.status === "delivered") return STAGES.length - 1;
  if (o.status === "shipped") return 2;
  if (o.status === "processing") return 0;
  if (o.status === "paid") return 0;
  return -1;
}

const between = (a: string, b: string, f: number) => {
  const ta = new Date(a).getTime(), tb = new Date(b).getTime();
  return new Date(ta + (tb - ta) * f).toISOString();
};

export function trackingEvents(o: Order): TrackEvent[] {
  const at = (s: OrderStatus) => o.events.find((e) => e.status === s)?.at;
  const created = o.createdAt;
  const city = o.address.city || "kota tujuan";

  if (o.status === "cancelled") {
    return [{ at: at("cancelled") ?? created, label: "Pesanan dibatalkan oleh pembeli.", place: "Temanta" }];
  }

  const list: TrackEvent[] = [
    { at: created, label: "Pesanan dibuat. Menunggu pembayaran.", place: "Temanta" },
  ];
  const paid = at("paid");
  if (!paid) return list;
  list.push({ at: paid, label: `Pembayaran via ${o.paymentMethod} berhasil diverifikasi.`, place: "Sistem Temanta" });

  const processing = at("processing");
  if (processing) {
    list.push({ at: between(paid, processing, 0.4), label: "Pesanan dikonfirmasi penjual.", place: "Temanta Home Living · Bandung" });
    list.push({ at: between(paid, processing, 0.75), label: "Paket sedang dikemas di gudang.", place: "Gudang Temanta · Bandung" });
    list.push({ at: processing, label: `Paket diserahkan ke kurir ${o.courier} (pickup).`, place: "Gudang Temanta · Bandung" });
  } else return list;

  const shipped = at("shipped");
  if (!shipped) return list;
  const delivered = at("delivered");
  const span = delivered ?? new Date(new Date(shipped).getTime() + 2 * 86400000).toISOString();
  list.push({ at: between(shipped, span, 0.2), label: "Paket tiba di pusat sortir asal.", place: "Pusat sortir · Bandung" });
  list.push({ at: between(shipped, span, 0.4), label: `Paket keluar dari pusat sortir menuju ${city}.`, place: "Pusat sortir · Bandung" });
  list.push({ at: between(shipped, span, 0.62), label: `Paket tiba di pusat sortir kota tujuan.`, place: `Pusat sortir · ${city}` });
  list.push({ at: between(shipped, span, 0.8), label: `Paket sedang dibawa kurir ${o.courier} untuk diantar.`, place: `Kurir · ${city}` });
  list.push({ at: between(shipped, span, 0.92), label: "Paket berada di kurir, sebentar lagi tiba.", place: city });

  if (delivered) list.push({ at: delivered, label: `Paket telah diterima oleh ${o.address.name}. Terima kasih!`, place: city });
  return list;
}

export const headlineOf: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  paid: "Paket sedang disiapkan",
  processing: "Paket sedang diproses",
  shipped: "Paket sedang dikirim",
  delivered: "Pesanan telah diterima",
  cancelled: "Pesanan dibatalkan",
};
