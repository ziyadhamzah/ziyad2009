import { rupiah } from "./format";

export type VoucherType = "percent" | "fixed";

export type Voucher = {
  code: string;
  type: VoucherType;
  value: number; // persen (1–100) atau nominal rupiah
  minSpend: number;
  maxDiscount?: number; // batas maksimum untuk tipe persen
  categories?: string[]; // batasi ke kategori tertentu bila diisi
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  label: string;
  /** Ketentuan singkat yang ditampilkan apa adanya ke pengguna. */
  terms: string;
};

// Aturan voucher didefinisikan di satu tempat dan dipakai baik di klien
// (pratinjau) maupun di server (/api/orders) sehingga tidak bisa dimanipulasi
// dari browser — nilai diskon selalu dihitung ulang dari rules ini.
export const VOUCHERS: Voucher[] = [
  {
    code: "TEMANTA10", type: "percent", value: 10, minSpend: 150000, maxDiscount: 50000,
    startsAt: "2026-01-01T00:00:00+07:00", endsAt: "2026-12-31T23:59:59+07:00", active: true,
    label: "Diskon 10% maks. Rp50.000",
    terms: "Min. belanja Rp150.000 · diskon 10% hingga Rp50.000.",
  },
  {
    code: "DAPUR15", type: "percent", value: 15, minSpend: 250000, maxDiscount: 75000, categories: ["Dapur"],
    startsAt: "2026-01-01T00:00:00+07:00", endsAt: "2026-12-31T23:59:59+07:00", active: true,
    label: "Diskon 15% kategori Dapur",
    terms: "Khusus produk Dapur · min. belanja Rp250.000 · maks. Rp75.000.",
  },
  {
    code: "HEMAT20K", type: "fixed", value: 20000, minSpend: 100000,
    startsAt: "2026-01-01T00:00:00+07:00", endsAt: "2026-12-31T23:59:59+07:00", active: true,
    label: "Potongan Rp20.000",
    terms: "Min. belanja Rp100.000 · potongan langsung Rp20.000.",
  },
];

export type VoucherLine = { price: number; qty: number; category: string };

export type VoucherResult = { ok: boolean; discount: number; voucher?: Voucher; message: string };

export const findVoucher = (code: string) =>
  VOUCHERS.find((v) => v.code.toUpperCase() === code.trim().toUpperCase());

export function activeVouchers(now: Date = new Date()): Voucher[] {
  return VOUCHERS.filter((v) => v.active && withinWindow(v, now));
}

function withinWindow(v: Voucher, now: Date) {
  if (v.startsAt && now < new Date(v.startsAt)) return false;
  if (v.endsAt && now > new Date(v.endsAt)) return false;
  return true;
}

export function computeDiscount(v: Voucher, lines: VoucherLine[]) {
  const eligible = v.categories?.length ? lines.filter((l) => v.categories!.includes(l.category)) : lines;
  const eligibleSubtotal = eligible.reduce((n, l) => n + l.price * l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  let discount = v.type === "percent" ? Math.floor((eligibleSubtotal * v.value) / 100) : v.value;
  if (v.maxDiscount != null) discount = Math.min(discount, v.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { discount, eligibleSubtotal, subtotal };
}

export function validateVoucher(code: string, lines: VoucherLine[], now: Date = new Date()): VoucherResult {
  const v = findVoucher(code);
  if (!v) return { ok: false, discount: 0, message: "Kode voucher tidak ditemukan." };
  if (!v.active) return { ok: false, discount: 0, message: "Voucher sudah tidak aktif." };
  if (!withinWindow(v, now)) return { ok: false, discount: 0, message: "Voucher sudah kedaluwarsa atau belum berlaku." };

  const { discount, eligibleSubtotal } = computeDiscount(v, lines);
  if (v.minSpend > 0 && eligibleSubtotal < v.minSpend) {
    return { ok: false, discount: 0, message: `Minimal belanja ${rupiah(v.minSpend)} untuk memakai voucher ini.` };
  }
  if (discount <= 0) {
    return { ok: false, discount: 0, message: "Voucher tidak dapat diterapkan pada pesanan ini." };
  }
  return { ok: true, discount, voucher: v, message: `Voucher ${v.code} diterapkan: hemat ${rupiah(discount)}.` };
}
