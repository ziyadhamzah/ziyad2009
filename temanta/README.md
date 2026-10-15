# Temanta
Next.js 14 + TypeScript + Tailwind. Jalankan: `npm install && npm run dev`.

Halaman: beranda `/`, katalog `/products`, detail produk `/products/[slug]`, keranjang `/cart`, checkout `/checkout`, pesanan `/orders` + `/orders/[id]`, lacak pengiriman `/lacak`, toko `/toko`, akun `/account`, bantuan `/bantuan`, masuk/daftar `/login`.

Database (opsional — kalau `.env.local` kosong, app tetap jalan pakai localStorage): jalankan `supabase/schema.sql` di SQL Editor Supabase (termasuk baris `order_events` dan kolom `slug`/`tone` di `order_items`), lalu salin `.env.local.example` jadi `.env.local` dan isi:
NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Begitu env terisi, auth (masuk/daftar/profil/ganti sandi) dan penyimpanan pesanan otomatis pindah ke Supabase (tabel `profiles`, `addresses`, `orders`, `order_items`, `payments`, `shipments`, `order_events`, `reviews`). Keranjang tetap di localStorage karena produk masih static di `lib/products.ts` (belum di-seed ke tabel `products`).

Ulasan produk ditulis oleh pengguna asli (bukan data karangan): tanpa Supabase tersimpan di localStorage (`temanta.reviews.v1`), dan otomatis pindah ke tabel `reviews` saat env terisi. Rating/terjual di halaman toko dihitung dari katalog produk.

Gambar produk: foto asli di `public/products/<slug>.jpg`, ditambahkan lewat field `image` di `lib/products.ts`. Kalau foto gagal dimuat, `components/ProductImage.tsx` otomatis menampilkan ilustrasi SVG cadangan.

Kredit foto (semua lisensi CC0 / public domain, dari Rawpixel & StockSnap.io via Openverse):
- panci-besi-cor-24cm, talenan-jati-besar, set-piring-keramik-6, gelas-kaca-tiup-4, vas-terakota-tinggi, taplak-meja-batik-tulis — Rawpixel
- sarung-bantal-linen, lilin-soya-cendana — StockSnap.io

Pembayaran dan pelacakan kurir masih mode simulasi (belum terhubung payment gateway / sistem kurir). Karena itu status pembayaran tidak bisa diubah lewat tombol pembeli: pesanan tetap `menunggu pembayaran`, admin memverifikasi lewat panel simulasi di halaman pesanan (muncul untuk akun admin; mode localStorage memberi akses admin agar alur demo bisa diuji). Harga, jumlah, dan total pesanan selalu dihitung ulang dari katalog saat checkout.
