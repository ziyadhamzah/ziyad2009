import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { shippingOptions, shippingCost, paymentGroups, paymentLabel } from "@/lib/shipping";
import { validateVoucher, type VoucherLine } from "@/lib/vouchers";
import type { Address, OrderStatus } from "@/lib/store";

export const dynamic = "force-dynamic";

type IncomingLine = { slug?: unknown; variant?: unknown; qty?: unknown };

const phoneOk = (p: string) => /^(\+62|62|0)8\d{7,12}$/.test(p.replace(/[\s-]/g, ""));

function readAddress(raw: unknown): { address?: Address; error?: string } {
  if (!raw || typeof raw !== "object") return { error: "Alamat pengiriman tidak lengkap." };
  const a = raw as Record<string, unknown>;
  const str = (k: string) => (typeof a[k] === "string" ? (a[k] as string).trim() : "");
  const address: Address = { name: str("name"), phone: str("phone"), street: str("street"), district: str("district"), city: str("city"), postal: str("postal") };
  const required: (keyof Address)[] = ["name", "phone", "street", "district", "city", "postal"];
  if (required.some((k) => !address[k])) return { error: "Data alamat belum lengkap." };
  if (!phoneOk(address.phone)) return { error: "Format nomor HP penerima tidak valid." };
  if (!/^\d{5}$/.test(address.postal)) return { error: "Kode pos harus 5 digit." };
  return { address };
}

// Server adalah sumber kebenaran untuk harga, stok, dan diskon.
// Nilai apa pun yang dikirim browser untuk harga/total diabaikan sepenuhnya.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 }); }

  const { address, error } = readAddress(body.address);
  if (!address) return NextResponse.json({ error }, { status: 400 });

  const rawLines = Array.isArray(body.lines) ? (body.lines as IncomingLine[]) : [];
  const safeLines = rawLines
    .map((l) => {
      const p = typeof l.slug === "string" ? getProduct(l.slug) : undefined;
      if (!p) return null;
      const qty = Math.floor(Number(l.qty) || 0);
      if (p.stock <= 0 || qty <= 0) return null;
      return {
        key: `${p.slug}:${typeof l.variant === "string" ? l.variant : ""}`,
        slug: p.slug, name: p.name, price: p.price, tone: p.tone,
        variant: typeof l.variant === "string" && l.variant ? l.variant : undefined,
        qty: Math.max(1, Math.min(p.stock, qty)), category: p.category,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (!safeLines.length) return NextResponse.json({ error: "Tidak ada produk yang tersedia untuk dipesan." }, { status: 400 });

  const shippingId = typeof body.shippingId === "string" ? body.shippingId : "reguler";
  const ship = shippingOptions.find((s) => s.id === shippingId);
  if (!ship) return NextResponse.json({ error: "Metode pengiriman tidak dikenal." }, { status: 400 });

  const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  const knownPayment = paymentGroups.flatMap((g) => g.items).some((i) => i.id === paymentId);
  if (!knownPayment) return NextResponse.json({ error: "Metode pembayaran tidak dikenal." }, { status: 400 });

  const subtotal = safeLines.reduce((n, l) => n + l.price * l.qty, 0);
  const vLines: VoucherLine[] = safeLines.map((l) => ({ price: l.price, qty: l.qty, category: l.category }));

  let discount = 0;
  let voucherCode: string | null = null;
  if (typeof body.voucherCode === "string" && body.voucherCode.trim()) {
    const v = validateVoucher(body.voucherCode, vLines);
    if (!v.ok) return NextResponse.json({ error: v.message }, { status: 422 });
    discount = v.discount;
    voucherCode = v.voucher?.code ?? null;
  }

  const shipping = shippingCost(ship.id, subtotal);
  const total = Math.max(0, subtotal - discount + shipping);
  const now = new Date().toISOString();
  const ymd = now.slice(0, 10).replace(/-/g, "");
  const status: OrderStatus = "pending_payment";

  const order = {
    id: crypto.randomUUID(),
    number: `TMT-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: now, status, lines: safeLines, address,
    courier: ship.courier, shippingMethod: ship.name, paymentMethod: paymentLabel(paymentId),
    subtotal, discount, shipping, total,
    voucherCode,
    events: [{ status, at: now }],
    resi: `${ship.courier.replace(/[^A-Z]/g, "")}${Math.floor(1000000000 + Math.random() * 8999999999)}`,
  };

  return NextResponse.json({ order });
}
