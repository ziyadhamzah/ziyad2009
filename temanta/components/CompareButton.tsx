"use client";
import { useCompare } from "@/lib/compare";

export default function CompareButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { has, toggle } = useCompare();
  const on = has(slug);
  return (
    <button
      type="button"
      title={on ? "Hapus dari perbandingan" : "Bandingkan produk"}
      aria-label={on ? "Hapus dari perbandingan" : "Bandingkan produk"}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-card backdrop-blur transition ${on ? "bg-brand text-white" : "bg-surface/85 text-muted hover:text-brand-ontint"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 7h6M4 7l2-2M4 7l2 2M20 17h-6M20 17l-2-2M20 17l-2 2" />
      </svg>
    </button>
  );
}
