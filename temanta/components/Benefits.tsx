const items = [
  {
    title: "Dikurasi pengrajin lokal",
    text: "Setiap barang dibuat tangan oleh perajin Indonesia pilihan.",
    icon: (
      <>
        <path d="M12 3 4 7v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Kirim ke seluruh negeri",
    text: "Pilihan kurir reguler, ekonomi, sampai kilat (same day).",
    icon: (
      <>
        <path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" />
        <circle cx="5.5" cy="18.5" r="1.8" />
        <circle cx="17.5" cy="18.5" r="1.8" />
      </>
    ),
  },
  {
    title: "Pembayaran fleksibel",
    text: "QRIS, transfer bank, dan e-wallet dalam satu halaman pembayaran.",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </>
    ),
  },
  {
    title: "Layanan pelanggan",
    text: "Chat penjual dan pusat bantuan siap membantu pesananmu.",
    icon: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1-4.2a8.4 8.4 0 0 1-.9-3.9A8.4 8.4 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5z" />
      </>
    ),
  },
];

export default function Benefits() {
  return (
    <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((b) => (
        <div key={b.title} className="card flex items-start gap-3 p-4 transition-shadow hover:shadow-card">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{b.icon}</svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{b.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{b.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
