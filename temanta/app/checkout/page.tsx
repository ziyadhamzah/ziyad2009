"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useStore, Address, Order } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useAddresses } from "@/lib/addresses";
import { getProduct } from "@/lib/products";
import { rupiah } from "@/lib/format";
import { shippingOptions, shippingCost, paymentGroups, paymentLabel } from "@/lib/shipping";
import { validateVoucher, type VoucherLine } from "@/lib/vouchers";
import Stepper from "@/components/Stepper";
import ProductImage from "@/components/ProductImage";

const fields: { key: keyof Address; label: string; wide?: boolean }[] = [
  { key: "name", label: "Nama penerima" }, { key: "phone", label: "Nomor HP" },
  { key: "street", label: "Alamat lengkap", wide: true }, { key: "district", label: "Kecamatan" },
  { key: "city", label: "Kota" }, { key: "postal", label: "Kode pos" },
];

function validate(a: Address) {
  const e: Partial<Record<keyof Address, string>> = {};
  fields.forEach((f) => { if (!a[f.key].trim()) e[f.key] = "Wajib diisi"; });
  if (a.phone && !/^(\+62|62|0)8\d{7,12}$/.test(a.phone.replace(/\s|-/g, ""))) e.phone = "Format nomor HP belum benar";
  if (a.postal && !/^\d{5}$/.test(a.postal)) e.postal = "Kode pos 5 digit";
  return e;
}

const btnBrand = "inline-flex items-center justify-center gap-2 rounded-sm bg-brand px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark";
const btnGhost = "inline-flex items-center justify-center rounded-sm border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-brand hover:text-brand-ontint";

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{n}</span>
      <h1 className="text-lg font-semibold">{title}</h1>
      <span className="ml-auto text-xs text-muted">Langkah {n} dari 4</span>
    </header>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, selectedLines, removeKeys } = useCart();
  const { ready, draft, patchDraft, patchAddress, placeOrder, commitOrder } = useStore();
  const { user, ready: authReady } = useAuth();
  const { list: savedAddrs, add: addAddress } = useAddresses();
  const [addrMode, setAddrMode] = useState<"pick" | "form">("form");
  const [saveToBook, setSaveToBook] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});
  const [payError, setPayError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [voucherInput, setVoucherInput] = useState(draft.voucherCode ?? "");
  const [voucherMsg, setVoucherMsg] = useState("");
  const step = draft.step;

  useEffect(() => { if (authReady && !user) router.replace("/login?next=/checkout"); }, [authReady, user, router]);
  useEffect(() => {
    if (user && !draft.address.name) patchAddress({ name: user.name, phone: user.phone });
  }, [user, draft.address.name, patchAddress]);

  const showPicker = savedAddrs.length > 0 && addrMode === "pick";

  useEffect(() => {
    if (savedAddrs.length && !draft.address.street) setAddrMode("pick");
  }, [savedAddrs.length, draft.address.street]);

  if (!authReady || !ready || !user) return <p className="mx-auto max-w-6xl px-4 py-24 text-muted">Memuat halaman pembayaran…</p>;
  if (!lines.length) return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-lg bg-surface px-6 py-12 text-center shadow-card">
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted shadow-card ring-1 ring-line">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
          </span>
        </span>
        <h1 className="mt-5 text-xl font-bold text-ink">Keranjang masih kosong</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Belum ada produk untuk dibayar. Yuk isi keranjang dengan perabot dan perlengkapan rumah favoritmu.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/products" className={btnBrand}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
            Belanja sekarang
          </Link>
          <Link href="/wishlist" className={btnGhost}>Lihat favorit</Link>
        </div>
      </div>
    </div>
  );
  const buy = selectedLines.length ? selectedLines : lines;
  const subtotal = buy.reduce((n, l) => n + l.price * l.qty, 0);
  const vLines: VoucherLine[] = buy.map((l) => ({ price: l.price, qty: l.qty, category: getProduct(l.slug)?.category ?? "" }));
  const voucherPreview = draft.voucherCode ? validateVoucher(draft.voucherCode, vLines) : null;
  const discount = voucherPreview?.ok ? voucherPreview.discount : 0;
  const shipping = shippingCost(draft.shippingId, subtotal);
  const ship = shippingOptions.find((s) => s.id === draft.shippingId) ?? shippingOptions[0];
  const total = Math.max(0, subtotal - discount + shipping);
  const next = () => patchDraft({ step: step + 1 });
  const back = () => patchDraft({ step: step - 1 });
  const unavailable = buy.some((l) => (getProduct(l.slug)?.stock ?? 0) === 0);

  const applyVoucher = () => {
    const res = validateVoucher(voucherInput, vLines);
    setVoucherMsg(res.message);
    if (res.ok) patchDraft({ voucherCode: res.voucher!.code });
  };
  const removeVoucher = () => { patchDraft({ voucherCode: "" }); setVoucherInput(""); setVoucherMsg(""); };

  const submitOrder = async () => {
    if (placing || unavailable) return;
    setPlacing(true);
    setOrderError("");
    const payload = {
      lines: buy.map((l) => ({ slug: l.slug, variant: l.variant, qty: l.qty })),
      address: draft.address, shippingId: draft.shippingId, paymentId: draft.paymentId, voucherCode: draft.voucherCode,
    };
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Gagal membuat pesanan.");
      commitOrder({ ...data.order, customer: { name: user.name, email: user.email } });
      removeKeys(buy.map((l) => l.key));
      router.push(`/orders/${data.order.id}`);
    } catch (e) {
      // Bila server tidak tersedia, hitung ulang dari katalog secara lokal.
      try {
        const order = placeOrder(buy);
        removeKeys(buy.map((l) => l.key));
        router.push(`/orders/${order.id}`);
      } catch {
        setOrderError(e instanceof Error ? e.message : "Terjadi kesalahan saat membuat pesanan.");
        setPlacing(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-sm bg-surface px-4 py-4 shadow-card sm:px-6">
        <Stepper current={step + 1} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {step === 0 && (
            <section className="rounded-sm bg-surface shadow-card">
              <StepHeader n={1} title="Alamat Pengiriman" />
              <div className="p-5 sm:p-6">
                {savedAddrs.length > 0 && (
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-ink/80">{showPicker ? "Pilih alamat tersimpan" : "Isi alamat baru"}</p>
                    <button type="button"
                      onClick={() => { setAddrMode(showPicker ? "form" : "pick"); setErrors({}); }}
                      className="text-sm font-medium text-brand-ontint hover:underline">
                      {showPicker ? "+ Alamat baru" : "Pilih alamat tersimpan"}
                    </button>
                  </div>
                )}

                {showPicker ? (
                  <div className="space-y-3">
                    {savedAddrs.map((a) => {
                      const sel = draft.address.name === a.name && draft.address.phone === a.phone && draft.address.street === a.street;
                      const pick = () => { patchAddress({ name: a.name, phone: a.phone, street: a.street, district: a.district, city: a.city, postal: a.postal }); setErrors({}); };
                      return (
                        <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition ${sel ? "border-brand bg-brand-light" : "border-line hover:border-brand/50"}`}>
                          <input type="radio" name="savedAddr" className="sr-only" checked={sel} onChange={pick} />
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-brand" : "border-line"}`}>
                            {sel && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                          </span>
                          <span className="min-w-0 flex-1 text-sm">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-ink">{a.name}</span>
                              <span className="text-muted">{a.phone}</span>
                              {a.primary && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">Utama</span>}
                            </span>
                            <span className="mt-1 block text-ink/80">{a.street}, {a.district}, {a.city} {a.postal}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.map((f) => (
                        <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                          <span className="text-sm font-medium text-ink/80">{f.label}</span>
                          <input value={draft.address[f.key]} onChange={(e) => patchAddress({ [f.key]: e.target.value })}
                            inputMode={f.key === "phone" || f.key === "postal" ? "numeric" : undefined}
                            className={`mt-1 h-11 w-full rounded-sm border bg-surface px-3 text-sm outline-none transition focus:ring-2 ${errors[f.key] ? "border-danger-fg focus:ring-danger-fg/30" : "border-line focus:border-brand focus:ring-brand/20"}`} />
                          {errors[f.key] && <span className="mt-1 block text-xs text-danger-fg">{errors[f.key]}</span>}
                        </label>
                      ))}
                    </div>
                    <label className="mt-4 flex items-center gap-2 text-sm text-ink/80">
                      <input type="checkbox" checked={saveToBook} onChange={(e) => setSaveToBook(e.target.checked)} className="h-4 w-4 rounded border-line accent-brand" />
                      Simpan alamat ini ke buku alamat
                    </label>
                  </>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link href="/cart" className={btnGhost}>Kembali ke keranjang</Link>
                  <button type="button" className={btnBrand} onClick={() => {
                      const e = validate(draft.address);
                      setErrors(e);
                      if (Object.keys(e).length) { if (showPicker) setAddrMode("form"); return; }
                      if (saveToBook && !showPicker) { addAddress({ ...draft.address, label: draft.address.city }); setSaveToBook(false); }
                      next();
                    }}>
                    Lanjut ke pengiriman
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="rounded-sm bg-surface shadow-card">
              <StepHeader n={2} title="Pilih Pengiriman" />
              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  {shippingOptions.map((o) => {
                    const cost = shippingCost(o.id, subtotal);
                    const sel = draft.shippingId === o.id;
                    return (
                      <label key={o.id} className={`flex cursor-pointer items-center gap-4 rounded-sm border p-4 transition ${sel ? "border-brand bg-brand-light" : "border-line hover:border-brand/50"}`}>
                        <input type="radio" name="ship" className="sr-only" checked={sel} onChange={() => patchDraft({ shippingId: o.id })} />
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${sel ? "border-brand" : "border-line"}`}>
                          {sel && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                        </span>
                        <span className="flex-1">
                          <span className="font-medium">{o.courier} · {o.name}</span>
                          <span className="mt-0.5 block text-sm text-muted">Estimasi tiba {o.eta}</span>
                        </span>
                        <span className={`font-semibold ${cost === 0 ? "text-brand-ontint" : "text-ink"}`}>{cost ? rupiah(cost) : "Gratis"}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={back} className={btnGhost}>Kembali</button>
                  <button type="button" className={btnBrand} onClick={next}>Lanjut ke pembayaran
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-sm bg-surface shadow-card">
              <StepHeader n={3} title="Metode Pembayaran" />
              <div className="p-5 sm:p-6">
                <div className="space-y-6">
                  {paymentGroups.map((g) => (
                    <div key={g.title}>
                      <p className="mb-2 text-sm font-medium text-muted">{g.title}</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {g.items.map((i) => {
                          const sel = draft.paymentId === i.id;
                          return (
                            <button key={i.id} type="button" aria-pressed={sel} onClick={() => { patchDraft({ paymentId: i.id }); setPayError(""); }}
                              className={`relative rounded-sm border px-3 py-3 text-sm font-medium transition ${sel ? "border-brand bg-brand-light text-brand-ontint ring-1 ring-brand" : "border-line text-ink hover:border-brand/50"}`}>
                              {i.label}
                              {sel && (
                                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white">
                                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="text-sm font-medium">Kode voucher (opsional)</p>
                  {discount > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-sm bg-brand-light px-3 py-2 text-sm">
                      <span className="font-semibold text-brand-ontint">{draft.voucherCode}</span>
                      <span className="text-ink/80">hemat {rupiah(discount)}</span>
                      <button type="button" onClick={removeVoucher} className="ml-auto text-muted underline hover:text-brand-ontint">Hapus</button>
                    </div>
                  ) : (
                    <div className="mt-2 flex max-w-md gap-2">
                      <input value={voucherInput} onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyVoucher(); } }}
                        placeholder="Contoh: TEMANTA10" aria-label="Kode voucher"
                        className="h-11 min-w-0 flex-1 rounded-sm border border-line bg-surface px-3 text-sm uppercase outline-none focus:border-brand focus:ring-1 focus:ring-brand/30" />
                      <button type="button" onClick={applyVoucher} className={btnGhost}>Terapkan</button>
                    </div>
                  )}
                  {voucherMsg && <p className={`mt-2 text-sm ${discount > 0 ? "text-ok-fg" : "text-danger-fg"}`}>{voucherMsg}</p>}
                </div>

                {payError && <p className="mt-4 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger-fg">{payError}</p>}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={back} className={btnGhost}>Kembali</button>
                  <button type="button" className={btnBrand} onClick={() => draft.paymentId ? next() : setPayError("Pilih salah satu metode pembayaran.")}>Tinjau pesanan
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-sm bg-surface shadow-card">
              <StepHeader n={4} title="Konfirmasi Pesanan" />
              <div className="p-5 sm:p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-4 rounded-sm border border-line p-4">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div><p className="text-muted">Dikirim ke</p><p className="mt-1 font-medium">{draft.address.name} · {draft.address.phone}</p><p className="text-ink/80">{draft.address.street}, {draft.address.district}, {draft.address.city} {draft.address.postal}</p></div>
                  </div>
                  <div className="flex gap-4 rounded-sm border border-line p-4">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></svg>
                    <div><p className="text-muted">Pengiriman</p><p className="mt-1 font-medium">{ship.courier} · {ship.name}</p><p className="text-ink/80">Estimasi tiba {ship.eta}</p></div>
                  </div>
                  <div className="flex gap-4 rounded-sm border border-line p-4">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                    <div><p className="text-muted">Pembayaran</p><p className="mt-1 font-medium">{paymentLabel(draft.paymentId)}</p></div>
                  </div>
                  {discount > 0 && (
                    <div className="flex gap-4 rounded-sm border border-line p-4">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 12a2 2 0 0 0 0-4V5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v3a2 2 0 0 0 0 4v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3zM13 5v2M13 11v2M13 17v2" /></svg>
                      <div><p className="text-muted">Voucher</p><p className="mt-1 font-medium">{draft.voucherCode} · hemat {rupiah(discount)}</p></div>
                    </div>
                  )}
                </div>
                {orderError && <p className="mt-4 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger-fg">{orderError}</p>}
                {!orderError && (unavailable || placing) && (
                  <p className="mt-4 rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger-fg">
                    {unavailable ? "Salah satu produk sudah habis. Kembali ke keranjang untuk menyesuaikan." : "Memproses pesanan…"}
                  </p>
                )}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={back} disabled={placing} className={btnGhost}>Kembali</button>
                  <button
                    type="button"
                    disabled={placing || unavailable}
                    className={`${btnBrand} disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={submitOrder}>
                    {placing ? "Memproses…" : "Buat pesanan"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit overflow-hidden rounded-sm bg-surface shadow-card lg:sticky lg:top-24">
          <h2 className="border-b border-line px-5 py-4 font-semibold sm:px-6">Pesanan Anda</h2>
          <div className="max-h-72 overflow-auto px-5 py-4 sm:px-6">
            <ul className="space-y-3">
              {buy.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-paper"><ProductImage slug={l.slug} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{l.name}{l.variant ? ` (${l.variant})` : ""}</p>
                    <p className="text-xs text-muted">{rupiah(l.price)} × {l.qty}</p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium">{rupiah(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 border-t border-line px-5 py-4 text-sm sm:px-6">
            <div className="flex justify-between"><span className="text-muted">Subtotal ({buy.length} produk)</span><span>{rupiah(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-brand-ontint"><span>Voucher {draft.voucherCode}</span><span>-{rupiah(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted">Ongkir ({ship.name})</span><span className={shipping === 0 ? "font-medium text-brand-ontint" : ""}>{shipping ? rupiah(shipping) : "Gratis"}</span></div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-brand-ontint">{rupiah(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}