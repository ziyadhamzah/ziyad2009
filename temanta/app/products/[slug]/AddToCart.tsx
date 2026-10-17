"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function AddToCart({ p }: { p: Product }) {
  const { add, selectOnly } = useCart();
  const router = useRouter();
  const [variant, setVariant] = useState(p.variants?.[0]?.label);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const out = p.stock === 0;
  const line = { slug: p.slug, name: p.name, price: p.price, variant, tone: p.tone };
  const key = `${p.slug}:${variant ?? ""}`;
  return (
    <div className="mt-6 space-y-5">
      {p.variants && (
        <div><p className="mb-2 text-sm font-medium">Varian</p>
          <div className="flex flex-wrap gap-2">
            {p.variants.map((v) => (
              <button key={v.id} type="button" onClick={() => setVariant(v.label)} aria-pressed={variant === v.label}
                className={`rounded border px-4 py-2 text-sm ${variant === v.label ? "border-brand bg-brand text-white" : "border-line"}`}>{v.label}</button>
            ))}
          </div></div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded border border-line">
          <button type="button" aria-label="Kurangi" className="h-11 w-11" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <span className="w-8 text-center">{qty}</span>
          <button type="button" aria-label="Tambah" className="h-11 w-11" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
        </div>
        <span className="text-sm text-muted">{out ? "Stok habis" : `Stok ${p.stock}`}</span>
      </div>
      <div className="flex gap-3">
        <button type="button" disabled={out} onClick={() => add(line, qty)} className="flex-1 rounded border border-brand py-3 font-medium text-brand-ontint transition-colors hover:bg-brand hover:text-white disabled:opacity-40">Tambah ke keranjang</button>
        <button type="button" disabled={out || busy} onClick={() => { if (busy) return; setBusy(true); add(line, qty); selectOnly(key); router.push("/checkout"); }} className="flex-1 rounded bg-brand py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-40">{busy ? "Memproses…" : "Beli sekarang"}</button>
      </div>
    </div>
  );
}
