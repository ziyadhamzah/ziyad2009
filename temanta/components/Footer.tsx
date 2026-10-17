import Link from "next/link";
import Image from "next/image";

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
  {
    label: "Instagram",
    href: "https://instagram.com",
    className: "bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white",
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    className: "bg-[#1877F2] text-white",
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7.5v3H10v8z" /></svg>,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    className: "bg-black text-white ring-1 ring-inset ring-black/10",
    icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M16.5 3c.3 2.2 1.6 3.6 3.7 3.8v2.3c-1.3.1-2.5-.3-3.6-.9v6.3c0 3.2-2.6 5.7-5.8 5.3-2.7-.4-4.6-2.7-4.4-5.4.2-2.7 2.6-4.8 5.3-4.4.2 0 .4 0 .6.1v2.4c-.3-.1-.6-.2-.9-.2-1.4-.1-2.7.9-2.8 2.3-.1 1.4.9 2.6 2.3 2.8 1.4.1 2.6-.9 2.7-2.3V3z" /></svg>,
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Temanta" width={40} height={40} sizes="40px" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black tracking-tight text-ink">Temanta<span className="text-brand-ontint">.</span></span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Perabot dan perlengkapan rumah dari pengrajin Indonesia. Dikurasi, dicek satu per satu, dan dikirim ke seluruh negeri.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${s.className}`}
              >
                {s.icon}
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
                  <Link href={i.href} className="transition-colors hover:text-brand-ontint">{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line bg-paper/60">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p className="text-center sm:text-left">© 2026 Temanta. Seluruh hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-0.5">Metode pembayaran:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-medium text-ink/75 shadow-card">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM18 18h3v3h-3z" />
              </svg>
              QRIS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-medium text-ink/75 shadow-card">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 10 12 5l9 5" /><path d="M5 10v8M9 10v8M15 10v8M19 10v8" /><path d="M3 21h18" />
              </svg>
              Transfer Bank
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-medium text-ink/75 shadow-card">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M16 15h2" />
              </svg>
              E-wallet
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
