import Link from "next/link";
import { activeVouchers } from "@/lib/vouchers";
import { rupiah } from "@/lib/format";

export default function VoucherPromo() {
  const vouchers = activeVouchers();
  if (!vouchers.length) return null;
  return (
    <section className="mt-6 rounded-sm bg-surface shadow-card">
      <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:flex-wrap">
        <div className="flex items-center gap-2 md:min-w-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 12a2 2 0 0 0 0-4V5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v3a2 2 0 0 0 0 4v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3zM13 5v2M13 11v2M13 17v2" /></svg>
          <p className="font-semibold">Kupon yang sedang aktif</p>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          {vouchers.map((v) => (
            <span key={v.code} className="flex items-center gap-2 rounded-sm border border-dashed border-brand/60 px-3 py-1.5 text-sm">
              <span className="font-bold text-brand">{v.code}</span>
              <span className="text-muted">{v.terms}</span>
            </span>
          ))}
        </div>
        <Link href="/checkout" className="text-sm font-semibold text-brand hover:underline">Pakai saat checkout</Link>
      </div>
    </section>
  );
}