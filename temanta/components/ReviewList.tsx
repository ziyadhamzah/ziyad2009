"use client";
import { useState } from "react";
import Stars from "./Stars";
import { Review } from "@/lib/reviews";

const filters = [
  { label: "Semua", v: 0 },
  { label: "5 Bintang", v: 5 },
  { label: "4 Bintang", v: 4 },
  { label: "Komentar", v: -1 },
];

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function ReviewList({
  reviews, avg, total, showBreakdown = true,
  canRemove, onRemove, removeBusyId,
}: {
  reviews: Review[]; avg: number; total: number; showBreakdown?: boolean;
  canRemove?: (r: Review) => boolean; onRemove?: (r: Review) => void; removeBusyId?: string | null;
}) {
  const [f, setF] = useState(0);
  const list = f === 0 ? reviews : f === -1 ? reviews.filter((r) => r.text && r.text.trim().length > 0) : reviews.filter((r) => r.rating === f);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0 text-center sm:w-40">
          <p className="text-4xl font-bold">{avg ? avg.toFixed(2) : "0.00"}<span className="text-lg text-muted">/5</span></p>
          <div className="mt-1 flex justify-center"><Stars value={avg} /></div>
          <p className="mt-1 text-sm text-muted">{total} Penilaian</p>
        </div>
        {showBreakdown && (
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => {
              const n = reviews.filter((r) => r.rating === s).length;
              return (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 text-muted">{s} Bintang</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct(n)}%` }} />
                  </span>
                  <span className="w-8 shrink-0 text-right text-muted">{n}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((x) => (
          <button key={x.label} onClick={() => setF(x.v)}
            className={`rounded-sm px-3 py-1.5 text-sm transition ${f === x.v ? "bg-brand text-white" : "border border-line text-ink/70 hover:border-brand hover:text-brand"}`}>
            {x.label}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-line">
        {list.map((r) => (
          <li key={r.id} className="flex gap-3 py-5">
            <Avatar name={r.name} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-medium">{r.name}</span>
                {r.city && <span className="text-xs text-muted">{r.city}</span>}
                {r.verified && (
                  <span className="flex items-center gap-1 rounded-sm bg-brand-light px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 13 4 4L19 7" /></svg>
                    Pembelian terverifikasi
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                <Stars value={r.rating} size="h-3.5 w-3.5" />
                <span>{r.date}</span>
              </div>
              {r.variant && <span className="mt-2 inline-block rounded-sm bg-paper px-2 py-0.5 text-xs text-muted">Variasi: {r.variant}</span>}
              <p className="mt-2 text-sm leading-relaxed text-ink/85">{r.text}</p>
              {r.reply && (
                <div className="mt-3 rounded-sm bg-paper p-3 text-sm text-ink/80">
                  <span className="font-semibold text-brand">Balasan Penjual</span>
                  <p className="mt-1 leading-relaxed">{r.reply}</p>
                </div>
              )}
              {r.active && <p className="mt-2 text-xs text-muted">{r.active}</p>}
              {canRemove?.(r) && (
                <button onClick={() => onRemove?.(r)} disabled={removeBusyId === r.id}
                  className="mt-3 text-xs text-muted underline hover:text-red-600 disabled:opacity-50">
                  {removeBusyId === r.id ? "Menghapus…" : "Hapus ulasan"}
                </button>
              )}
            </div>
          </li>
        ))}
        {!list.length && <li className="py-8 text-center text-sm text-muted">Belum ada ulasan dengan filter ini.</li>}
      </ul>
    </div>
  );
}