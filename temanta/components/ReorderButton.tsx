"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart, type CartLine } from "@/lib/cart";
import { getProduct } from "@/lib/products";

export default function ReorderButton({ lines, label = "Beli lagi", className = "" }: { lines: CartLine[]; label?: string; className?: string }) {
  const { add } = useCart();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const run = () => {
    let added = 0;
    let skipped = 0;
    lines.forEach((l) => {
      const p = getProduct(l.slug);
      if (!p || p.stock <= 0) { skipped++; return; }
      add({ slug: l.slug, name: p.name, price: p.price, tone: p.tone, variant: l.variant }, Math.max(1, Math.min(l.qty, p.stock)));
      added++;
    });
    if (added) setMsg({ ok: true, text: `Ditambahkan ke keranjang (${added})${skipped ? `, ${skipped} habis` : ""}` });
    else setMsg({ ok: false, text: "Produk sudah tidak tersedia." });
  };

  if (msg) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className={msg.ok ? "text-green-600" : "text-red-600"}>{msg.text}</span>
        <Link href="/cart" className="font-semibold text-brand underline">Lihat keranjang</Link>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-sm border border-brand px-4 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v6h6" /><path d="M3.5 13a9 9 0 1 0 2.1-6.4L3 9" /></svg>
      {label}
    </button>
  );
}
