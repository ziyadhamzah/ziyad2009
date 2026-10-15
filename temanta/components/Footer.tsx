import Link from "next/link";

const cols: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Belanja",
    items: [
      { label: "Semua produk", href: "/products" },
      { label: "Kategori Dapur", href: "/products?kategori=Dapur" },
      { label: "Kategori Dekorasi", href: "/products?kategori=Dekorasi" },
      { label: "Produk terbaru", href: "/products?sort=terbaru" },
      { label: "Favorit saya", href: "/wishlist" },
    ],
  },
  {
    title: "Bantuan",
    items: [
      { label: "Pusat Bantuan", href: "/bantuan" },
      { label: "Cara Belanja", href: "/bantuan#cara-belanja" },
      { label: "Pengiriman", href: "/bantuan#pengiriman" },
      { label: "Pengembalian Dana", href: "/bantuan#pengembalian" },
      { label: "Pembayaran", href: "/bantuan#pembayaran" },
    ],
  },
  {
    title: "Tentang Temanta",
    items: [
      { label: "Tentang Kami", href: "/bantuan#tentang" },
      { label: "Toko", href: "/toko" },
      { label: "Kebijakan Privasi", href: "/bantuan#privasi" },
      { label: "Syarat & Ketentuan", href: "/bantuan#syarat" },
      { label: "Hubungi Kami", href: "/bantuan#kontak" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "TikTok", href: "https://tiktok.com" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="Temanta" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black tracking-tight text-ink">Temanta<span className="text-brand">.</span></span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Perabot dan perlengkapan rumah dari pengrajin Indonesia. Dikurasi, dicek satu per satu, dan dikirim ke seluruh negeri.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand hover:text-brand">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold text-ink">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {c.items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="transition-colors hover:text-brand">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>Â© 2026 Temanta. Seluruh hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span>Metode pembayaran:</span>
            {["QRIS", "Transfer Bank", "E-wallet"].map((p) => (
              <span key={p} className="rounded-sm border border-line bg-paper px-2 py-1 font-medium text-ink/70">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
