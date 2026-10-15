export const FREE_SHIPPING_FROM = 500000;
export const shippingOptions = [
  { id: "reguler", courier: "JNE", name: "Reguler", eta: "2–4 hari", cost: 22000 },
  { id: "ekonomi", courier: "J&T", name: "Ekonomi", eta: "4–7 hari", cost: 15000 },
  { id: "sameday", courier: "SiCepat", name: "Same Day", eta: "Hari ini (Jabodetabek)", cost: 38000 },
] as const;
export const shippingCost = (id: string, subtotal: number) => {
  const o = shippingOptions.find((x) => x.id === id);
  if (!o) return 0;
  return id === "reguler" && subtotal >= FREE_SHIPPING_FROM ? 0 : o.cost;
};
export type PaymentItem = { id: string; label: string };
export type PaymentGroup = { title: string; items: PaymentItem[] };
export const paymentGroups: PaymentGroup[] = [
  { title: "QRIS", items: [{ id: "qris", label: "QRIS" }] },
  { title: "Transfer bank", items: [{ id: "bca", label: "BCA" }, { id: "bri", label: "BRI" }, { id: "bni", label: "BNI" }, { id: "mandiri", label: "Mandiri" }] },
  { title: "E-wallet", items: [{ id: "gopay", label: "GoPay" }, { id: "ovo", label: "OVO" }, { id: "dana", label: "DANA" }, { id: "shopeepay", label: "ShopeePay" }] },
];
export const paymentLabel = (id: string) => paymentGroups.flatMap((g) => g.items).find((i) => i.id === id)?.label ?? id;

export const paymentGroupOf = (id: string) => paymentGroups.find((g) => g.items.some((i) => i.id === id))?.title ?? "";
export type PaymentKind = "qris" | "bank" | "ewallet";
export const paymentKind = (id: string): PaymentKind => {
  const t = paymentGroupOf(id);
  if (t === "QRIS") return "qris";
  if (t === "Transfer bank") return "bank";
  return "ewallet";
};
const bankVaPrefix: Record<string, string> = { bca: "39077", bri: "88810", bni: "88163", mandiri: "14000" };
const walletPhone: Record<string, string> = { gopay: "0812-1111-2233", ovo: "0812-1111-2233", dana: "0812-1111-2233", shopeepay: "0812-1111-2233" };
export const PAYMENT_WINDOW_HOURS = 24;
export function paymentAccount(id: string, seed: string) {
  const digits = seed.replace(/\D/g, "").padStart(8, "0").slice(-8);
  const kind = paymentKind(id);
  if (kind === "bank") return { label: "Nomor Virtual Account", value: `${bankVaPrefix[id] ?? "88810"}${digits}` };
  if (kind === "ewallet") return { label: "Nomor tujuan", value: walletPhone[id] ?? "0812-1111-2233" };
  return null;
}
export const paymentHolder = "Temanta Home Living";
export const paymentIdByLabel = (label: string) => paymentGroups.flatMap((g) => g.items).find((i) => i.label === label)?.id ?? "";
