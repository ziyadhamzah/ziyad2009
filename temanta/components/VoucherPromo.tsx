"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { activeVouchers, type Voucher } from "@/lib/vouchers";
import { useStore } from "@/lib/store";
import { rupiah } from "@/lib/format";

function VoucherCard({ v }: { v: Voucher }) {
  const router = useRouter();
  const { patchDraft } = useStore();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const big = v.type === "percent" ? `${v.value}%` : rupiah(v.value);
  const caption = v.type === "percent" ? "DISKON" : "POTONGAN";

  const apply = () => {
    patchDraft({ voucherCode: v.code });
    router.push("/checkout");
  };

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(v.code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={apply}
        aria-label={`Pakai voucher ${v.code}`}
        className="flex w-full overflow-hidden rounded-md border border-line bg-paper text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-brand to-brand-deep px-2 py-4 text-center text-white sm:w-28">
          <span className="text-xl font-black leading-none tracking-tight">{big}</span>
          <span className="text-[10px] font-semibold tracking-widest opacity-90">{caption}</span>
        </div>

        <div className="relative min-w-0 flex-1 border-l border-dashed border-line p-3.5">
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border border-line bg-surface" aria-hidden />
          <span className="absolute -left-2 -bottom-2 h-4 w-4 rounded-full border border-line bg-surface" aria-hidden />

          <div className="flex flex-wrap items-center gap-1.5 pr-8">
            <p className="text-sm font-semibold text-ink">{v.label}</p>
            {!!v.categories?.length && (
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-ontint">
                {v.categories.join(", ")}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{v.terms}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="rounded-sm border border-dashed border-brand/60 bg-surface px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-brand-ontint">
              {v.code}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-ontint">
              Pakai
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={copy}
        title="Salin kode"
        aria-label={`Salin kode ${v.code}`}
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-brand-light hover:text-brand-ontint"
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-ok-fg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 13 4 4L19 7" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        )}
      </button>
    </div>
  );
}

export default function VoucherPromo() {
  const vouchers = activeVouchers();
  if (!vouchers.length) return null;
  return (
    <section className="mt-6 overflow-hidden rounded-md bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 12a2 2 0 0 0 0-4V5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v3a2 2 0 0 0 0 4v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3zM13 5v2M13 11v2M13 17v2" /></svg>
          </span>
          <div>
            <p className="font-bold text-ink">Kupon yang sedang aktif</p>
            <p className="text-xs text-muted">Klik kupon untuk langsung dipakai saat pembayaran.</p>
          </div>
        </div>
        <Link href="/checkout" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ontint hover:underline">
          Pakai saat pembayaran
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>

      <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3">
        {vouchers.map((v) => <VoucherCard key={v.code} v={v} />)}
      </div>
    </section>
  );
}
