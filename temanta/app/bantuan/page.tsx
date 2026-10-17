"use client";
import Link from "next/link";
import { useState } from "react";

const topCards = [
  { id: "cara-belanja", title: "Cara Belanja", desc: "Dari mencari produk sampai pembayaran.", icon: <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /> },
  { id: "pengiriman", title: "Pengiriman", desc: "Estimasi, kurir, dan lacak pesanan.", icon: <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18.5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /> },
  { id: "pengembalian", title: "Pengembalian Dana", desc: "Komplain barang dan pengembalian dana.", icon: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" /> },
  { id: "kontak", title: "Hubungi Kami", desc: "Chat CS, email, dan WhatsApp.", icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
];

const faqs = [
  { q: "Bagaimana cara memesan produk?", a: "Pilih produk di halaman katalog, tentukan jumlah, lalu tekan “Tambah ke keranjang”. Buka keranjang dan lanjutkan ke halaman pembayaran untuk mengisi alamat, memilih pengiriman, dan metode pembayaran." },
  { q: "Apakah pesanan bisa dilacak?", a: "Bisa. Buka menu Pesanan saya, pilih pesanan, lalu lihat panel Pelacakan untuk melihat riwayat status dari diproses hingga tiba di tujuan." },
  { q: "Berapa lama pengiriman?", a: "Reguler 2–4 hari kerja untuk Jawa dan 3–7 hari kerja untuk luar Jawa. Same Day tersedia untuk kota besar. Estimasi pasti ditampilkan saat memilih kurir di halaman pembayaran." },
  { q: "Metode pembayaran apa saja yang tersedia?", a: "QRIS, transfer bank (BCA, Mandiri, BNI, BRI), dan e-wallet (GoPay, OVO, DANA, ShopeePay)." },
  { q: "Bagaimana cara mengajukan pengembalian?", a: "Ajukan komplain maksimal 2×24 jam setelah pesanan diterima melalui Hubungi Kami, sertakan nomor pesanan dan foto barang. Setelah diverifikasi, dana dikembalikan 3–5 hari kerja." },
  { q: "Apakah data akun saya aman?", a: "Pada mode demo, data akun disimpan di perangkat Anda. Saat terhubung ke Supabase, data dikelola dengan aturan akses (RLS) dan tidak dibagikan ke pihak ketiga." },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [topic, setTopic] = useState("");

  const searchTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const v = topic.trim().toLowerCase();
    if (!v) return;
    const hit = faqs.findIndex((f) => f.q.toLowerCase().includes(v) || f.a.toLowerCase().includes(v));
    if (hit >= 0) { setOpen(hit); document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }); }
  };

  return (
    <div className="bg-paper">
      {/* hero */}
      <div className="bg-gradient-to-b from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-3xl font-black sm:text-4xl">Pusat Bantuan Temanta</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Panduan belanja, pengiriman, pengembalian, dan info kontak tim kami — semua ada di sini.</p>
          <form onSubmit={searchTopic} role="search" className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-sm bg-surface p-1.5 shadow-hover">
            <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            <input list="bantuan-topik" value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder="Cari: ongkir, pengembalian dana, pembayaran…" aria-label="Cari topik bantuan"
              className="h-9 min-w-0 flex-1 text-sm text-ink outline-none placeholder:text-muted" />
            <datalist id="bantuan-topik">{faqs.map((f) => <option key={f.q} value={f.q} />)}</datalist>
            <button type="submit" className="h-9 rounded-sm bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark">Cari</button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* kartu topik */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topCards.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="rounded-sm bg-surface p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-hover">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{c.icon}</svg>
              </span>
              <p className="mt-2 text-sm font-semibold">{c.title}</p>
              <p className="mt-0.5 text-xs text-muted">{c.desc}</p>
            </a>
          ))}
        </div>

        {/* cara belanja */}
        <section id="cara-belanja" className="mt-10 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Cara Belanja</h2>
          <ol className="mt-4 space-y-4">
            {[
              ["Cari produk", "Gunakan kolom pencarian atau pilih kategori di navbar, lalu atur filter harga dan urutan."],
              ["Masukkan ke keranjang", "Buka halaman produk, pilih jumlah, dan tekan “Tambah ke keranjang”."],
              ["Pembayaran", "Isi alamat pengiriman, pilih kurir dan metode pembayaran, lalu tekan “Buat pesanan”."],
              ["Bayar & tunggu", "Selesaikan pembayaran sesuai instruksi, lalu lacak pesanan di halaman Pesanan saya."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        {/* pengiriman */}
        <section id="pengiriman" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Pengiriman</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-line text-muted"><tr><th className="py-2 pr-4 font-medium">Layanan</th><th className="py-2 pr-4 font-medium">Estimasi</th><th className="py-2 font-medium">Biaya</th></tr></thead>
              <tbody className="divide-y divide-line">
                <tr><td className="py-3 pr-4">Same Day</td><td className="py-3 pr-4">Hari yang sama</td><td className="py-3">Mulai Rp25.000</td></tr>
                <tr><td className="py-3 pr-4">Reguler</td><td className="py-3 pr-4">2–4 hari (Jawa), 3–7 hari (luar Jawa)</td><td className="py-3">Mulai Rp10.000 · gratis min. Rp500.000</td></tr>
                <tr><td className="py-3 pr-4">Kargo / barang besar</td><td className="py-3 pr-4">3–7 hari kerja</td><td className="py-3">Sesuai berat & volume</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">Semua pesanan mendapatkan nomor resi dan bisa dilacak di halaman detail pesanan.</p>
        </section>

        {/* pengembalian */}
        <section id="pengembalian" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Pengembalian Dana</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/80">
            <li>ajukan komplain maksimal 2×24 jam setelah pesanan diterima;</li>
            <li>barang rusak, salah kirim, atau tidak sesuai deskripsi berhak penuh ditukar atau dikembalikan (refund);</li>
            <li>sertakan nomor pesanan dan foto/video barang saat mengajukan;</li>
            <li>dana dikembalikan 3–5 hari kerja setelah komplain disetujui.</li>
          </ul>
        </section>

        {/* pembayaran */}
        <section id="pembayaran" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Metode Pembayaran</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["QRIS", "BCA", "Mandiri", "BNI", "BRI", "GoPay", "OVO", "DANA"].map((m) => (
              <div key={m} className="rounded-sm border border-line px-4 py-3 text-center text-sm font-semibold">{m}</div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Pembayaran pada demo ini disimulasikan — belum terhubung payment gateway.</p>
        </section>

        {/* tentang / privasi / syarat */}
        <section id="tentang" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Tentang Temanta</h2>
          <p className="mt-3 text-sm text-ink/80">Temanta adalah marketplace perlengkapan rumah yang menggabungkan kerja tangan pengrajin lokal dengan desain sederhana untuk kebutuhan sehari-hari. Semua barang dicek satu per satu sebelum dikemas.</p>
        </section>
        <section id="privasi" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Kebijakan Privasi</h2>
          <p className="mt-3 text-sm text-ink/80">Data akun (nama, email, nomor HP) disimpan di perangkat Anda selama demo ini berjalan dan tidak dibagikan ke pihak ketiga. Informasi pesanan hanya digunakan untuk memproses dan melacak pengiriman.</p>
        </section>
        <section id="syarat" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Syarat &amp; Ketentuan</h2>
          <p className="mt-3 text-sm text-ink/80">Dengan memesan di Temanta, Anda menyetujui ketentuan harga, estimasi pengiriman, serta kebijakan pengembalian yang tertera di halaman ini. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan.</p>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Pertanyaan Umum</h2>
          <div className="mt-3 divide-y divide-line">
            {faqs.map((f, i) => (
              <div key={f.q}>
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm font-semibold" aria-expanded={open === i}>
                  {f.q}
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 text-muted transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {open === i && <p className="pb-4 text-sm leading-relaxed text-muted">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* jual di temanta */}
        <section id="jual" className="mt-6 scroll-mt-24 rounded-sm bg-inverse p-6 text-inverse-fg shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Jual di Temanta</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/85">Punya produk rumah tangga atau karya pengrajin? Daftarkan toko Anda dan jangkau ribuan pembeli. Program penjual masih disiapkan — tinggalkan minat Anda lewat kanal Hubungi Kami di bawah.</p>
          <a href="#kontak" className="mt-4 inline-block rounded-sm bg-surface px-5 py-2.5 text-sm font-semibold text-brand-ontint transition hover:bg-surface/90">Hubungi tim kami</a>
        </section>

        {/* kontak */}
        <section id="kontak" className="mt-6 scroll-mt-24 rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-lg font-bold">Hubungi Kami</h2>
          <p className="mt-1 text-sm text-muted">Tim CS melayani setiap hari 08.00–21.00 WIB.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Chat CS", value: "Obrolan langsung (demo)", note: "Balasan instan di jam kerja", href: null },
              { label: "WhatsApp", value: "0812-0000-0000", note: "Chat langsung ke tim kami", href: "https://wa.me/628120000000" },
              { label: "Email", value: "cs@temanta.id", note: "Balasan maks 1×24 jam", href: "mailto:cs@temanta.id" },
            ].map((c) => (
              c.href ? (
                <a key={c.label} href={c.href} className="rounded-sm border border-line p-4 transition hover:border-brand">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
                  <p className="mt-1 font-semibold text-brand-ontint">{c.value}</p>
                  <p className="text-xs text-muted">{c.note}</p>
                </a>
              ) : (
                <div key={c.label} className="rounded-sm border border-line p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{c.label}</p>
                  <p className="mt-1 font-semibold text-brand-ontint">{c.value}</p>
                  <p className="text-xs text-muted">{c.note}</p>
                </div>
              )
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">Belum punya akun? <Link href="/login?mode=register" className="font-semibold text-brand-ontint hover:underline">Daftar sekarang</Link> atau <Link href="/products" className="font-semibold text-brand-ontint hover:underline">lanjut belanja</Link>.</p>
        </section>
      </div>
    </div>
  );
}
