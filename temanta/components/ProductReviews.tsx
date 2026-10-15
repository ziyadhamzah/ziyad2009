"use client";
import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useReviews } from "@/lib/review-store";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { ratingSummary, Review } from "@/lib/reviews";
import ReviewList from "./ReviewList";
import Stars from "./Stars";

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
    <section className="mt-4 rounded-sm bg-surface p-4 shadow-card sm:p-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h2 className="text-lg font-bold">Rating &amp; Ulasan</h2>
        <span className="text-sm text-muted">{summary.total} ulasan</span>
      </div>

      <div className="pt-5">
{hasReviews ? (
            <ReviewList
              reviews={list} avg={summary.avg} total={summary.total}
              canRemove={canRemove} onRemove={removeReview} removeBusyId={removeBusy} />
          ) : (
          <p className="py-6 text-center text-sm text-muted">
            Belum ada ulasan untuk produk ini. Pembeli pertama bisa menulis ulasannya di bawah.
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-line pt-5">
        {!user ? (
          <p className="text-sm text-muted">
            <Link href="/login" className="text-brand hover:underline">Masuk</Link> untuk menulis ulasan produk ini.
          </p>
        ) : alreadyReviewed ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-medium">Terima kasih! Anda sudah menulis ulasan untuk produk ini.</p>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="font-medium">Terima kasih! Ulasan Anda sudah tersimpan.</p>
            <button onClick={() => setDone(false)} className="text-sm text-brand underline hover:text-brand-dark">Tulis ulasan lagi</button>
          </div>
        ) : !canReview ? (
          <div className="max-w-xl rounded-sm bg-brand-light p-4 text-sm text-ink/85">
            <p className="font-medium text-brand">Hanya pembeli terverifikasi yang bisa menulis ulasan</p>
            <p className="mt-1 text-muted">Ulasan baru bisa ditulis setelah pesanan berisi produk ini berstatus Diterima.</p>
            <Link href="/orders" className="mt-2 inline-block text-brand underline hover:text-brand-dark">Lihat pesanan saya</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="max-w-xl">
            <p className="font-medium">Tulis ulasan</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button type="button" key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)}
                    aria-label={`Beri ${i} bintang`} className="p-0.5">
                    <Stars value={i <= (hover || rating) ? 1 : 0} size="h-7 w-7" />
                  </button>
                ))}
              </div>
              <span className="text-sm text-muted">{rating} dari 5</span>
            </div>

            {p.variants && (
              <label className="mt-3 block text-sm">
                <span className="text-muted">Varian yang dibeli</span>
                <select value={variant} onChange={(e) => setVariant(e.target.value)}
                  className="mt-1 h-10 w-full rounded-sm border border-line bg-surface px-2 text-ink outline-none focus:border-brand">
                  {p.variants.map((v) => <option key={v.id} value={v.label}>{v.label}</option>)}
                </select>
              </label>
            )}

            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
              placeholder="Ceritakan pengalaman Anda memakai produk iniâ€¦"
              className="mt-3 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
            <button type="submit" disabled={busy}
              className="mt-3 rounded-sm bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50">
              {busy ? "Menyimpanâ€¦" : "Kirim ulasan"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}