"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/products";
import { rupiah } from "@/lib/format";
import { shippingCost, FREE_SHIPPING_FROM } from "@/lib/shipping";
import { store } from "@/lib/reviews";

function Check({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} aria-label={label} onClick={onClick}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition ${on ? "border-brand bg-brand text-white" : "border-line bg-surface hover:border-brand"}`}>
      {on && <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>}
    </button>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { lines, subtotal, setQty, remove, selected, toggleSel, selectAll, selectedLines, selectedSubtotal } = useCart();
  const shipping = shippingCost("reguler", selectedSubtotal);
  const allOn = lines.length > 0 && selected.length === lines.length;
  const freeShip = selectedSubtotal >= FREE_SHIPPING_FROM;
  const toFreeShip = Math.max(0, FREE_SHIPPING_FROM - selectedSubtotal);
  const freePct = Math.min(100, Math.round((selectedSubtotal / FREE_SHIPPING_FROM) * 100));

  if (!lines.length)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-sm bg-surface p-12 text-center shadow-card">
          <svg viewBox="0 0 24 24" className="mx-auto h-16 w-16 text-line" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
          <h1 className="mt-5 text-xl font-bold">Keranjang masih kosong</h1>
          <p className="mt-2 text-muted">Pilih produk dulu, nanti muncul di sini.</p>
          <Link href="/products" className="mt-6 inline-block rounded-sm bg-brand px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-dark">Mulai belanja</Link>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-sm bg-surface shadow-card">
        <div className="hidden grid-cols-[1fr_120px_140px_120px] items-center gap-4 border-b border-line px-4 py-3 text-sm font-semibold text-ink/70 sm:grid">
          <div className="flex items-center gap-3">
            <Check on={allOn} onClick={() => selectAll(!allOn)} label="Pilih semua" />
            <span>Semua produk ({lines.length})</span>
          </div>
          <span>Harga satuan</span>
          <span>Jumlah</span>
          <span className="text-right">Total</span>
        </div>

        <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-2.5 text-sm">
          <Check on={allOn} onClick={() => selectAll(!allOn)} label="Pilih semua" />
          <Link href="/toko" className="flex items-center gap-2 font-medium hover:text-brand-ontint">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 9 4.5 4h15L21 9M4 9h16v11H4z" /></svg>
            {store.name}
          </Link>
          <Link href="/chat" className="ml-auto rounded-sm border border-brand px-2 py-0.5 text-xs text-brand-ontint transition-colors hover:bg-brand hover:text-white">Chat</Link>
        </div>

        <ul className="divide-y divide-line">
          {lines.map((l) => {
            const on = selected.includes(l.key);
            const p = getProduct(l.slug);
            const base = p?.basePrice ?? l.price;
            const off = p && base > l.price ? Math.round((1 - l.price / base) * 100) : 0;
            const stock = p?.stock ?? 0;
            return (
              <li key={l.key} className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[1fr_120px_140px_120px] sm:items-center sm:gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Check on={on} onClick={() => toggleSel(l.key)} label={`Pilih ${l.name}`} />
                  <Link href={`/products/${l.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-paper">
                    <ProductImage slug={l.slug} />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/products/${l.slug}`} className="line-clamp-2 text-sm hover:text-brand-ontint">{l.name}</Link>
                    {l.variant && <p className="mt-0.5 text-xs text-muted">Variasi: {l.variant}</p>}
                    <button onClick={() => remove(l.key)} className="mt-1 text-xs text-muted underline hover:text-brand-ontint">Hapus</button>
                  </div>
                </div>

                <p className="pl-8 text-sm sm:pl-0">
                  {off > 0 ? (
                    <><span className="text-muted line-through">{rupiah(base)}</span> <span className="text-ink">{rupiah(l.price)}</span></>
                  ) : (
                    <span className="text-ink">{rupiah(l.price)}</span>
                  )}
                </p>

                <div className="flex items-center gap-3 pl-8 sm:pl-0">
                  <div className="flex items-center rounded-sm border border-line text-sm">
                    <button aria-label="Kurangi" className="h-8 w-8 text-ink/70 hover:bg-paper disabled:opacity-40" disabled={l.qty <= 1} onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                    <span className="w-8 text-center">{l.qty}</span>
                    <button aria-label="Tambah" className="h-8 w-8 text-ink/70 hover:bg-paper disabled:opacity-40" disabled={stock > 0 && l.qty >= stock} onClick={() => setQty(l.key, l.qty + 1)}>+</button>
                  </div>
                  <span className="text-xs text-muted">{stock > 0 ? `Stok ${stock}` : "Stok habis"}</span>
                </div>

                <div className="flex flex-col pl-8 sm:pl-0 sm:items-end sm:text-right">
                  <span className="font-semibold text-brand-ontint">{rupiah(l.price * l.qty)}</span>
                  {off > 0 && <span className="text-xs text-brand-ontint">Diskon {off}%</span>}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-line bg-paper px-4 py-3.5">
          {freeShip ? (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 13 4 4L19 7" /></svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ok-fg">Selamat! Kamu dapat gratis ongkir reguler</p>
                <p className="text-xs text-muted">Otomatis berlaku ke seluruh Indonesia, tanpa kode.</p>
              </div>
              <span className="ml-auto hidden rounded-full bg-ok-bg px-3 py-1 text-xs font-semibold text-ok-fg sm:inline-block">Gratis ongkir</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">
                  Tambah <span className="font-semibold text-brand-ontint">{rupiah(toFreeShip)}</span> lagi untuk <span className="font-semibold">gratis ongkir</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-[width] duration-500" style={{ width: `${freePct}%` }} />
                  </span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-brand-ontint">{freePct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-4 flex flex-col gap-3 rounded-sm bg-surface px-4 py-4 shadow-card sm:flex-row sm:items-center sm:justify-end sm:gap-6">
        <div className="flex items-center gap-3 sm:hidden">
          <Check on={allOn} onClick={() => selectAll(!allOn)} label="Pilih semua" />
          <span className="text-sm text-muted">Pilih semua ({lines.length})</span>
        </div>
        <div className="flex flex-col gap-1 sm:text-right">
          <p className="text-sm text-muted">Total ({selectedLines.length} produk): <span className="font-bold text-brand-ontint">{rupiah(selectedSubtotal + shipping)}</span></p>
          <p className="text-xs text-muted">{shipping ? `Termasuk ongkir ${rupiah(shipping)}` : "Gratis ongkir"}</p>
        </div>
        <button disabled={!selectedLines.length}
          onClick={() => router.push("/checkout")}
          className="rounded-sm bg-brand px-8 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">
          Lanjut ke pembayaran ({selectedLines.length})
        </button>
      </div>
    </div>
  );
}