"use client";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistButton({ slug, className = "", size = "md" }: { slug: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const { has, toggle } = useWishlist();
  const on = has(slug);
  const box = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <button
      type="button"
      title={on ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-label={on ? "Hapus dari favorit" : "Tambah ke favorit"}
      aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(slug); }}
      className={`flex shrink-0 items-center justify-center rounded-full transition ${box} ${on ? "bg-brand text-white shadow-card" : "bg-surface/85 text-muted shadow-card backdrop-blur hover:text-brand-ontint"} ${className}`}
    >
      <svg viewBox="0 0 24 24" className={icon} fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
