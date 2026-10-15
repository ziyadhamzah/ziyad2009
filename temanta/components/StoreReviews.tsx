"use client";
import { useState } from "react";
import { useReviews } from "@/lib/review-store";
import { useAuth } from "@/lib/auth";
import { ratingSummary, Review } from "@/lib/reviews";
import ReviewList from "./ReviewList";

export default function StoreReviews() {
  const { all, ready, remove } = useReviews();
  const { user } = useAuth();
  const [removeBusy, setRemoveBusy] = useState<string | null>(null);
  const reviews = all();
  const summary = ratingSummary(reviews);

  const removeReview = async (r: Review) => {
    setRemoveBusy(r.id);
    await remove(r.id);
    setRemoveBusy(null);
  };

  if (!ready) return <p className="py-6 text-sm text-muted">Memuat ulasan…</p>;
  if (!reviews.length) return <p className="py-6 text-sm text-muted">Belum ada ulasan dari pembeli.</p>;
  return (
    <ReviewList
      reviews={reviews} avg={summary.avg} total={summary.total}
      canRemove={() => Boolean(user?.isAdmin)}
      onRemove={removeReview} removeBusyId={removeBusy} />
  );
}