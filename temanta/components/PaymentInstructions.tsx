"use client";
import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/lib/store";
import { rupiah } from "@/lib/format";
import { PAYMENT_WINDOW_HOURS, paymentIdByLabel, paymentAccount, paymentKind, paymentHolder, paymentLabel } from "@/lib/shipping";

const fmtCountdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
};

function Copy({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}
      className="shrink-0 rounded-sm border border-brand px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
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

  return (
    <section className="mt-8 overflow-hidden rounded-sm bg-surface shadow-card">
      <header className="flex flex-wrap items-center gap-2 border-b border-line bg-amber-50 px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <div className="min-w-0">
          <h2 className="font-semibold text-amber-900">Selesaikan pembayaran</h2>
          <p className="text-sm text-amber-800">Bayar via {paymentLabel(id)} sebelum waktu habis.</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-amber-800">{expired ? "Waktu habis" : "Bayar dalam"}</p>
          <p className={`font-mono text-lg font-bold tabular-nums ${expired ? "text-red-600" : "text-amber-900"}`}>{expired ? "00:00:00" : fmtCountdown(left)}</p>
        </div>
      </header>

      <div className="grid gap-6 p-5 sm:grid-cols-[200px_1fr] sm:p-6">
        <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-line bg-paper p-4">
          {kind === "qris" ? (
            <div className="h-40 w-40 bg-[repeating-conic-gradient(#1B1D1C_0_25%,#fff_0_50%)] bg-[length:16px_16px]" aria-label="Contoh kode QRIS" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-brand shadow-card">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
            </span>
          )}
          <p className="text-center text-xs text-muted">{kind === "qris" ? "Pindai dengan aplikasi bank / e-wallet apa pun" : "Pembayaran aman & terverifikasi"}</p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-sm bg-paper px-4 py-3">
            <span className="text-muted">Total tagihan</span>
            <span className="text-xl font-bold text-brand">{rupiah(order.total)}</span>
          </div>

          {account ? (
            <div>
              <p className="text-muted">{account.label} Â· {paymentLabel(id)}</p>
              <div className="mt-1 flex items-center gap-3">
                <p className="font-mono text-lg font-semibold tracking-wider">{account.value}</p>
                <Copy value={account.value.replace(/-/g, "")} />
              </div>
              <p className="mt-1 text-xs text-muted">a.n. {paymentHolder}</p>
            </div>
          ) : (
            <div>
              <p className="text-muted">Pindai kode QRIS di samping</p>
              <p className="mt-1 text-xs text-muted">a.n. {paymentHolder}</p>
            </div>
          )}

          <ol className="space-y-1.5 border-t border-line pt-4 text-xs text-muted">
            <li>1. Buka aplikasi {kind === "qris" ? "bank / e-wallet" : paymentLabel(id)} Anda.</li>
            <li>2. {kind === "qris" ? "Pindai kode QRIS" : "Masukkan nomor di atas"} lalu masukkan nominal tepat sesuai tagihan.</li>
            <li>3. Simpan bukti pembayaran. Pembayaran diverifikasi manual oleh admin, bukan otomatis.</li>
          </ol>

          {expired && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">Batas waktu pembayaran telah habis. Silakan buat pesanan baru atau batalkan pesanan ini.</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            {confirmCancel ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-muted">Yakin batalkan?</span>
                <button onClick={() => setStatus(order.id, "cancelled")} className="font-semibold text-red-600 underline">Ya, batalkan</button>
                <button onClick={() => setConfirmCancel(false)} className="text-muted underline">Tidak</button>
              </span>
            ) : (
              <button onClick={() => setConfirmCancel(true)} className="text-sm text-muted underline hover:text-brand">Batalkan pesanan</button>
            )}
          </div>
          <p className="text-xs text-muted">Demo tanpa payment gateway: status pembayaran tidak berubah lewat tombol pembeli. Bila transfer sudah masuk, admin akan memverifikasi pesanan (lihat panel simulasi di halaman admin).</p>
        </div>
      </div>
    </section>
  );
}
