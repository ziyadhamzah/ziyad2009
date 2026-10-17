"use client";
import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useReviews } from "@/lib/review-store";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { ratingSummary, Review } from "@/lib/reviews";
import ReviewList from "./ReviewList";

const ratingLabels = ["", "Sangat buruk", "Buruk", "Cukup", "Bagus", "Sangat bagus"];

export default function ProductReviews({ p }: { p: Product }) {
  const { bySlug, add, remove } = useReviews();
  const { user } = useAuth();
  const { orders } = useStore();
  const [removeBusy, setRemoveBusy] = useState<string | null>(null);
  const list = bySlug(p.slug);
  const summary = ratingSummary(list);
  const hasReviews = summary.total > 0;

  const boughtDelivered = user ? orders.some((o) => o.status === "delivered" && o.lines.some((l) => l.slug === p.slug)) : false;
  const alreadyReviewed = user ? list.some((r) => r.userId === user.id) : false;
  const canReview = Boolean(user) && (boughtDelivered || Boolean(user?.isAdmin)) && !alreadyReviewed;

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [variant, setVariant] = useState(p.variants?.[0]?.label);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 4) { setErr("Tulis ulasan minimal 4 karakter."); return; }
    setBusy(true); setErr(null);
    const res = await add({ slug: p.slug, rating, variant, text: text.trim() });
    setBusy(false);
    if (res) { setErr(res); return; }
    setDone(true); setText(""); setRating(5);
  };

  const removeReview = async (r: Review) => {
    setRemoveBusy(r.id); setErr(null);
    const res = await remove(r.id);
    setRemoveBusy(null);
    if (res) setErr(res);
  };

  const canRemove = (r: Review) => Boolean(user && (user.isAdmin || r.userId === user.id));

  return (
    <section id="ulasan" className="mt-4 scroll-mt-24 rounded-md bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#FFCE3D]" fill="currentColor" aria-hidden>
            <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
          </svg>
          Rating &amp; Ulasan
        </h2>
        <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-muted">
          {summary.total} ulasan
        </span>
      </div>

      <div className="pt-5">
        {hasReviews ? (
          <ReviewList
            reviews={list} avg={summary.avg} total={summary.total}
            canRemove={canRemove} onRemove={removeReview} removeBusyId={removeBusy} />
        ) : (
          <div className="flex flex-col items-center rounded-md border border-dashed border-line px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
              </svg>
            </span>
            <p className="mt-3 font-semibold text-ink">Belum ada ulasan</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Produk ini belum memiliki ulasan. Jadilah pembeli pertama yang membagikan pengalamannya.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-5">
        {!user ? (
          <div className="flex flex-col items-center gap-2 rounded-md bg-paper px-4 py-6 text-center">
            <p className="text-sm text-muted">
              <Link href="/login" className="font-semibold text-brand-ontint hover:underline">Masuk</Link>{" "}
              untuk menulis ulasan produk ini.
            </p>
          </div>
        ) : alreadyReviewed ? (
          <div className="flex flex-col items-center gap-3 rounded-md bg-ok-bg px-4 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ok-fill/15 text-ok-fg">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <p className="font-medium text-ink">Terima kasih! Anda sudah menulis ulasan untuk produk ini.</p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 rounded-md bg-ok-bg px-4 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ok-fill/15 text-ok-fg">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m5 13 4 4L19 7" />
              </svg>
            </span>
            <p className="font-medium text-ink">Terima kasih! Ulasan Anda sudah tersimpan.</p>
            <button onClick={() => setDone(false)} className="text-sm font-medium text-brand-ontint underline underline-offset-2 hover:text-brand-dark">
              Tulis ulasan lagi
            </button>
          </div>
        ) : !canReview ? (
          <div className="flex flex-col gap-2 rounded-md border border-line bg-paper p-4 text-sm sm:flex-row sm:items-start sm:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 15v3m0 0v3m0-3h3m-3 0h-3M5 7l2 3h10l2-3-2-3H7z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-brand-ontint">Hanya pembeli terverifikasi yang bisa menulis ulasan</p>
              <p className="mt-1 text-muted">Ulasan baru bisa ditulis setelah pesanan berisi produk ini berstatus Diterima.</p>
              <Link href="/orders" className="mt-2 inline-block font-medium text-brand-ontint underline underline-offset-2 hover:text-brand-dark">
                Lihat pesanan saya
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mx-auto max-w-xl rounded-md border border-line p-4 sm:p-5">
            <p className="font-semibold text-ink">Tulis ulasan</p>
            <p className="mt-0.5 text-sm text-muted">Bagikan pengalaman Anda memakai produk ini.</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => {
                  const active = i <= (hover || rating);
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      aria-label={`Beri ${i} bintang`}
                      className="p-0.5 transition-transform duration-150 hover:scale-110"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-8 w-8 transition-colors ${active ? "text-[#FFCE3D]" : "text-line"}`}
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
                      </svg>
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-medium text-ink">{ratingLabels[hover || rating]}</span>
            </div>

            {p.variants && (
              <label className="mt-4 block text-sm">
                <span className="label">Varian yang dibeli</span>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value)}
                  className="h-10 w-full rounded-sm border border-line bg-surface px-2.5 text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/30"
                >
                  {p.variants.map((v) => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
              </label>
            )}

            <label className="mt-4 block text-sm">
              <span className="label">Ulasan</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Ceritakan pengalaman Anda memakai produk ini"
                aria-label="Tulis ulasan produk"
                className="w-full resize-y rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30"
              />
            </label>

            <div className="mt-1.5 flex items-center justify-between gap-3">
              {err ? (
                <p className="text-sm text-danger-fg">{err}</p>
              ) : (
                <span className="text-xs text-muted">Minimal 4 karakter</span>
              )}
              <span className="text-xs tabular-nums text-muted">{text.length}/500</span>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busy ? (
                "Menyimpan…"
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                  </svg>
                  Kirim ulasan
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
