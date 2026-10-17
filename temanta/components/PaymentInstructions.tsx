"use client";
import { useEffect, useRef, useState } from "react";
import { Order, OrderStatus } from "@/lib/store";
import { rupiah } from "@/lib/format";
import { PAYMENT_WINDOW_HOURS, paymentIdByLabel, paymentAccount, paymentKind, paymentHolder, paymentLabel } from "@/lib/shipping";

const hashSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const makeRng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function QrisCode({ seed, className }: { seed: string; className?: string }) {
  const N = 29;
  const next = makeRng(hashSeed(seed || "temanta"));
  const inBox = (x: number, y: number, ox: number, oy: number, s: number) => x >= ox && x < ox + s && y >= oy && y < oy + s;
  const inFinder = (x: number, y: number) => inBox(x, y, 0, 0, 7) || inBox(x, y, N - 7, 0, 7) || inBox(x, y, 0, N - 7, 7);
  const inAlign = (x: number, y: number) => inBox(x, y, N - 9, N - 9, 5);

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y) || inAlign(x, y)) continue;
      if (x === 6 || y === 6) {
        if ((x + y) % 2 === 0) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
        continue;
      }
      if (next() > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }

  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width={7} height={7} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </g>
  );

  return (
    <svg viewBox={`0 0 ${N} ${N}`} className={className} role="img" aria-label="Kode QRIS" shapeRendering="crispEdges" fill="#1B1D1C">
      <rect x={0} y={0} width={N} height={N} fill="#fff" />
      {cells}
      <Finder x={0} y={0} />
      <Finder x={N - 7} y={0} />
      <Finder x={0} y={N - 7} />
      <rect x={N - 9} y={N - 9} width={5} height={5} />
      <rect x={N - 8} y={N - 8} width={3} height={3} fill="#fff" />
    </svg>
  );
}

const fmtCountdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

const BRANDS: Record<string, { name: string; color: string; color2: string }> = {
  bca: { name: "BCA", color: "#0060AF", color2: "#003D6E" },
  bri: { name: "BRI", color: "#00529C", color2: "#003561" },
  bni: { name: "BNI", color: "#F15A24", color2: "#B23C12" },
  mandiri: { name: "Mandiri", color: "#003D79", color2: "#002A54" },
  gopay: { name: "GoPay", color: "#00AED6", color2: "#0080A0" },
  ovo: { name: "OVO", color: "#4C3494", color2: "#33225F" },
  dana: { name: "DANA", color: "#118EEA", color2: "#0A5FA0" },
  shopeepay: { name: "ShopeePay", color: "#EE4D2D", color2: "#B8361C" },
};
const brandOf = (key: string) => BRANDS[key] ?? { name: paymentLabel(key), color: "#1B1D1C", color2: "#000000" };

function Copy({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <button type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 1500); } catch {} }}
      className="shrink-0 rounded-sm border border-brand px-3 py-1.5 text-xs font-semibold text-brand-ontint transition-colors hover:bg-brand hover:text-white">
      {done ? "Tersalin" : "Salin"}
    </button>
  );
}

export default function PaymentInstructions({ order, setStatus }: { order: Order; setStatus: (id: string, s: OrderStatus) => void }) {
  const id = paymentIdByLabel(order.paymentMethod);
  const kind = paymentKind(id);
  const account = paymentAccount(id, order.number);
  const expires = new Date(order.createdAt).getTime() + PAYMENT_WINDOW_HOURS * 3600 * 1000;
  const [now, setNow] = useState(() => Date.now());
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = expires - now;
  const expired = left <= 0;

  const brand = brandOf(id);
  const accDigits = account ? account.value.replace(/\D/g, "") : "";
  const maskedVA = account ? (accDigits.length > 8 ? `${accDigits.slice(0, 4)} •••• ${accDigits.slice(-4)}` : account.value) : "";
  const displayVA = account ? (kind === "bank" ? accDigits.replace(/(\d{4})(?=\d)/g, "$1 ") : account.value) : "";

  return (
    <section className="mt-8 overflow-hidden rounded-sm bg-surface shadow-card">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-warn-bg px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warn-ink text-warn-bg">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-warn-ink">Selesaikan pembayaran</h2>
          <p className="text-sm text-warn-fg">Bayar via {paymentLabel(id)} sebelum waktu habis.</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-warn-fg">{expired ? "Waktu habis" : "Bayar dalam"}</p>
          <p className={`font-mono text-lg font-bold tabular-nums ${expired ? "text-danger-fg" : "text-warn-ink"}`}>{expired ? "00:00:00" : fmtCountdown(left)}</p>
        </div>
      </header>

      <div className="grid gap-6 p-5 sm:grid-cols-[220px_1fr] sm:p-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-line bg-paper p-4">
          {kind === "qris" ? (
            <>
              <div className="w-full max-w-[210px] overflow-hidden rounded-xl bg-white p-3 shadow-card ring-1 ring-line">
                <div className="mb-2 flex items-center justify-between px-0.5">
                  <span className="text-sm font-black tracking-tight text-[#E4002B]">QRIS</span>
                  <span className="rounded bg-[#1B1D1C] px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-white">GPN</span>
                </div>
                <div className="relative overflow-hidden rounded-md">
                  <QrisCode seed={order.number} className="h-40 w-40" />
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-8 animate-scan bg-gradient-to-b from-transparent via-brand/30 to-transparent" />
                  <span className="pointer-events-none absolute left-2 top-2 h-5 w-5 rounded-tl border-l-2 border-t-2 border-brand/70" />
                  <span className="pointer-events-none absolute right-2 top-2 h-5 w-5 rounded-tr border-r-2 border-t-2 border-brand/70" />
                  <span className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 rounded-bl border-b-2 border-l-2 border-brand/70" />
                  <span className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 rounded-br border-b-2 border-r-2 border-brand/70" />
                </div>
                <p className="mt-2 text-center text-[11px] font-semibold tracking-wide text-[#1B1D1C]">{paymentHolder}</p>
                <p className="text-center text-[9px] tracking-wide text-muted">NMID: ID1020{order.number.replace(/\D/g, "").padStart(8, "0").slice(-8)}</p>
              </div>
              <p className="text-center text-xs text-muted">Pindai dengan aplikasi bank / e-wallet apa pun</p>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-[210px] overflow-hidden rounded-xl text-white shadow-card" style={{ backgroundImage: `linear-gradient(135deg, ${brand.color}, ${brand.color2})` }}>
                <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                <div className="relative flex items-center justify-between p-3">
                  <span className="text-base font-black tracking-tight">{brand.name}</span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><rect x="4.5" y="13" width="4" height="3" rx="0.6" />
                  </svg>
                </div>
                <div className="relative px-3 pb-3">
                  <p className="text-[9px] uppercase tracking-widest opacity-80">{account?.label ?? "Nomor tujuan"}</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold tracking-wider">{maskedVA}</p>
                </div>
                <div className="relative bg-black/15 px-3 py-1.5 text-[9px] tracking-wide">a.n. {paymentHolder}</div>
              </div>
              <p className="flex items-center justify-center gap-1 text-center text-xs text-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Pembayaran aman &amp; terverifikasi
              </p>
            </>
          )}
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-sm bg-paper px-4 py-3">
            <span className="text-muted">Total tagihan</span>
            <span className="text-xl font-bold text-brand-ontint">{rupiah(order.total)}</span>
          </div>

          {account ? (
            <div className="rounded-md border border-line bg-paper p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center rounded px-2 text-[10px] font-black tracking-wide text-white" style={{ backgroundColor: brand.color }}>{brand.name}</span>
                <span className="text-xs font-medium text-muted">{account.label}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-3">
                <p className="font-mono text-xl font-bold tracking-wider text-ink tabular-nums">{displayVA}</p>
                <Copy value={accDigits} />
              </div>
              <p className="mt-2 text-xs text-muted">a.n. {paymentHolder}</p>
            </div>
          ) : (
            <div className="rounded-md border border-line bg-paper p-4">
              <p className="text-muted">Pindai kode QRIS di samping</p>
              <p className="mt-1 text-xs text-muted">a.n. {paymentHolder}</p>
            </div>
          )}

          <ol className="space-y-1.5 border-t border-line pt-4 text-xs text-muted">
            <li>1. Buka aplikasi {kind === "qris" ? "bank / e-wallet" : paymentLabel(id)} Anda.</li>
            <li>2. {kind === "qris" ? "Pindai kode QRIS" : "Masukkan nomor di atas"} lalu masukkan nominal tepat sesuai tagihan.</li>
            <li>3. Simpan bukti pembayaran. Pembayaran diverifikasi manual oleh admin, bukan otomatis.</li>
          </ol>

          {expired && <p className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger-fg">Batas waktu pembayaran telah habis. Silakan buat pesanan baru atau batalkan pesanan ini.</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            {confirmCancel ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-muted">Yakin batalkan?</span>
                <button type="button" onClick={() => setStatus(order.id, "cancelled")} className="font-semibold text-danger-fg underline">Ya, batalkan</button>
                <button type="button" onClick={() => setConfirmCancel(false)} className="text-muted underline">Tidak</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmCancel(true)} className="text-sm text-muted underline hover:text-brand-ontint">Batalkan pesanan</button>
            )}
          </div>
          <p className="text-xs text-muted">Demo tanpa payment gateway: status pembayaran tidak berubah lewat tombol pembeli. Bila transfer sudah masuk, admin akan memverifikasi pesanan (lihat panel simulasi di halaman admin).</p>
        </div>
      </div>
    </section>
  );
}
