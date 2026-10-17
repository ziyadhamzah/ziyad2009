"use client";
import { useReviews } from "@/lib/review-store";
import { ratingSummary } from "@/lib/reviews";
import Stars from "./Stars";

export default function ProductRatingSummary({ slug }: { slug: string }) {
  const { bySlug, ready } = useReviews();

  if (!ready) {
    return <span className="inline-block h-5 w-40 animate-pulse rounded-sm bg-line" aria-hidden />;
  }

  const summary = ratingSummary(bySlug(slug));

  if (summary.total === 0) {
    return (
      <a href="#ulasan" className="inline-flex items-center gap-1.5 text-muted hover:text-brand-ontint">
        <Stars value={0} size="h-4 w-4" />
        <span>Belum ada ulasan</span>
      </a>
    );
  }

  return (
    <a href="#ulasan" className="group inline-flex items-center gap-2 transition-opacity hover:opacity-90">
      <Stars value={summary.avg} size="h-4 w-4" />
      <span className="font-semibold text-ink">{summary.avg.toFixed(1)}</span>
      <span className="text-muted underline-offset-2 group-hover:text-brand-ontint group-hover:underline">
        ({summary.total} ulasan)
      </span>
    </a>
  );
}
