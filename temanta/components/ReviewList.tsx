"use client";
import { useState } from "react";
import Stars from "./Stars";
import { Review } from "@/lib/reviews";

function StarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-ontint ring-1 ring-inset ring-brand/15">
      {initial}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[11px] font-semibold text-brand-ontint">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m5 13 4 4L19 7" />
      </svg>
      Pembelian terverifikasi
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

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { counts[r.rating] = (counts[r.rating] ?? 0) + 1; });
  const commentCount = reviews.filter((r) => r.text && r.text.trim().length > 0).length;

  const filters = [
    { label: "Semua", count: total, v: 0 },
    { label: "5 Bintang", count: counts[5], v: 5 },
    { label: "4 Bintang", count: counts[4], v: 4 },
    { label: "Komentar", count: commentCount, v: -1 },
  ];

  const list = f === 0 ? reviews : f === -1 ? reviews.filter((r) => r.text && r.text.trim().length > 0) : reviews.filter((r) => r.rating === f);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div>
      <div className="rounded-md bg-paper p-4 sm:p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 items-center gap-4 sm:w-32 sm:flex-col sm:gap-1.5">
            <p className="text-4xl font-bold leading-none text-ink">
              {avg ? avg.toFixed(1) : "0.0"}
              <span className="align-top text-base font-semibold text-muted">/5</span>
            </p>
            <div className="flex flex-col items-start gap-1 sm:items-center">
              <Stars value={avg} size="h-4 w-4" />
              <p className="text-xs text-muted">{total} ulasan</p>
            </div>
          </div>

          {showBreakdown && (
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((s) => {
                const n = counts[s];
                const active = f === s;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setF(active ? 0 : s)}
                    aria-pressed={active}
                    className="group flex w-full items-center gap-3 text-sm"
                  >
                    <span className={`flex w-9 shrink-0 items-center justify-end gap-1 tabular-nums transition-colors ${active ? "font-semibold text-brand-ontint" : "text-muted"}`}>
                      {s}
                      <StarIcon className="h-3 w-3 text-[#FFCE3D]" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/70">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${active ? "bg-brand" : "bg-brand/70 group-hover:bg-brand"}`}
                        style={{ width: `${pct(n)}%` }}
                      />
                    </span>
                    <span className={`w-8 shrink-0 text-right tabular-nums transition-colors ${active ? "font-semibold text-brand-ontint" : "text-muted"}`}>
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {filters.map((x) => {
          const active = f === x.v;
          return (
            <button
              key={x.label}
              onClick={() => setF(x.v)}
              aria-pressed={active}
              className={`chip ${active ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink/70 hover:border-brand hover:text-brand-ontint"}`}
            >
              {x.label}
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-white/20 text-white" : "bg-paper text-muted"}`}>
                {x.count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-md border border-line p-4 transition-shadow hover:shadow-card sm:p-5">
            <div className="flex gap-3">
              <Avatar name={r.name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-sm font-semibold text-ink">{r.name}</span>
                  {r.verified && <VerifiedBadge />}
                  {r.city && <span className="text-xs text-muted">• {r.city}</span>}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <Stars value={r.rating} size="h-3.5 w-3.5" />
                  <span className="h-3 w-px bg-line" aria-hidden />
                  <span>{r.date}</span>
                  {r.variant && (
                    <span className="rounded-full bg-paper px-2 py-0.5 text-muted">Varian: {r.variant}</span>
                  )}
                </div>

                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink/85">{r.text}</p>

                {r.reply && (
                  <div className="mt-3 rounded-sm border-l-2 border-brand bg-paper p-3 text-sm text-ink/80">
                    <span className="font-semibold text-brand-ontint">Balasan Penjual</span>
                    <p className="mt-1 leading-relaxed">{r.reply}</p>
                  </div>
                )}
                {r.active && <p className="mt-2 text-xs text-muted">{r.active}</p>}

                {canRemove?.(r) && (
                  <button
                    onClick={() => onRemove?.(r)}
                    disabled={removeBusyId === r.id}
                    className="mt-3 text-xs text-muted underline underline-offset-2 transition-colors hover:text-danger-fg disabled:opacity-50"
                  >
                    {removeBusyId === r.id ? "Menghapus…" : "Hapus ulasan"}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {!list.length && (
          <li className="rounded-md border border-dashed border-line py-10 text-center text-sm text-muted">
            Belum ada ulasan dengan filter ini.
          </li>
        )}
      </ul>
    </div>
  );
}
