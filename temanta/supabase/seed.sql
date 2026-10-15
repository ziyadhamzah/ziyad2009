-- AUTO-GENERATED dari lib/products.ts. Regenerate: node scripts/gen-seed.mjs
-- Jalankan SETELAH schema.sql di SQL Editor Supabase.

insert into categories (name, slug) values
  ('Dapur', 'dapur'),
  ('Meja Makan', 'meja-makan'),
  ('Dekorasi', 'dekorasi'),
  ('Tekstil', 'tekstil'),
  ('Aroma', 'aroma')
on conflict (slug) do update set name = excluded.name;

insert into products (category_id, slug, name, description, price, stock, sold, rating, image_urls) values
  ((select id from categories where slug = 'dapur'), 'panci-besi-cor-24cm', 'Panci Besi Cor 24 cm', 'Panci besi cor dengan tutup berat yang menjaga panas dan uap. Cocok untuk semur, rendang, dan nasi liwet. Bisa dipakai di kompor gas, induksi, dan oven.', 489000, 14, 1280, 4.9, array['/products/panci-besi-cor-24cm.jpg']),
  ((select id from categories where slug = 'dapur'), 'talenan-jati-besar', 'Talenan Jati Besar', 'Talenan kayu jati tebal 3 cm dengan alur penampung air. Dipotong dari satu bilah kayu tanpa sambungan.', 235000, 32, 940, 4.8, array['/products/talenan-jati-besar.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'set-piring-keramik-6', 'Set Piring Keramik (6 pcs)', 'Piring makan 26 cm glasir matte, aman untuk microwave dan mesin cuci piring. Dibuat oleh pengrajin di Plered, Purwakarta.', 359000, 0, 2110, 4.7, array['/products/set-piring-keramik-6.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'gelas-kaca-tiup-4', 'Gelas Kaca Tiup (4 pcs)', 'Gelas tiup tangan berkapasitas 300 ml. Setiap gelas sedikit berbeda bentuknya.', 189000, 48, 612, 4.6, array['/products/gelas-kaca-tiup-4.jpg']),
  ((select id from categories where slug = 'dekorasi'), 'vas-terakota-tinggi', 'Vas Terakota Tinggi', 'Vas tanah liat bakar setinggi 38 cm dengan permukaan kasar alami. Bagian dalam dilapisi glasir sehingga bisa diisi air.', 275000, 9, 305, 4.8, array['/products/vas-terakota-tinggi.jpg']),
  ((select id from categories where slug = 'tekstil'), 'sarung-bantal-linen', 'Sarung Bantal Linen 45x45', 'Linen cuci enzim yang lembut sejak pemakaian pertama. Resleting tersembunyi.', 149000, 60, 1530, 4.5, array['/products/sarung-bantal-linen.jpg']),
  ((select id from categories where slug = 'aroma'), 'lilin-soya-cendana', 'Lilin Soya Cendana', 'Lilin soya 180 g dengan sumbu katun, menyala sekitar 40 jam. Aroma cendana dan sedikit vanila.', 129000, 25, 870, 4.7, array['/products/lilin-soya-cendana.jpg']),
  ((select id from categories where slug = 'tekstil'), 'taplak-meja-batik-tulis', 'Taplak Meja Batik Tulis', 'Batik tulis katun primisima ukuran 140x200 cm, dikerjakan sekitar dua minggu oleh pengrajin Pekalongan.', 325000, 6, 188, 4.9, array['/products/taplak-meja-batik-tulis.jpg']),
  ((select id from categories where slug = 'dapur'), 'wajan-anti-lengket-28', 'Wajan Anti Lengket 28 cm', 'Wajan anti lengket berlapis granit dengan gagang tahan panas. Cocok untuk menumis dan menggoreng tanpa banyak minyak.', 219000, 20, 720, 4.8, array['/products/wajan-anti-lengket-28.jpg']),
  ((select id from categories where slug = 'dapur'), 'pisau-master-chef-20', 'Pisau Master Chef 20 cm', 'Pisau baja karbon tinggi dengan mata tajam dan gagang kayu keras. Seimbang di tangan untuk memotong cepat.', 268000, 15, 540, 4.9, array['/products/pisau-master-chef-20.jpg']),
  ((select id from categories where slug = 'dapur'), 'wadah-bumbu-kaca-3', 'Wadah Bumbu Kaca (3 pcs)', 'Tiga toples kaca bertutup rapat untuk menyimpan bumbu dan rempah agar tetap aromatik dan bebas lembap.', 139000, 40, 890, 4.7, array['/products/wadah-bumbu-kaca-3.jpg']),
  ((select id from categories where slug = 'dapur'), 'sutil-sendok-kayu-4', 'Set Sutil Kayu (4 pcs)', 'Set alat masak kayu yang lembut di permukaan anti lengket. Tidak menghantarkan panas dan aman untuk wajan berlapis.', 99000, 55, 1120, 4.6, array['/products/sutil-sendok-kayu-4.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'mangkuk-keramik-4', 'Mangkuk Keramik (4 pcs)', 'Mangkuk keramik kapasitas 500 ml, cocok untuk sup, sereal, atau salad. Bisa ditumpuk untuk menghemat ruang.', 179000, 34, 760, 4.7, array['/products/mangkuk-keramik-4.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'teko-keramik-800', 'Teko Keramik 800 ml', 'Teko keramik dengan corong mulus dan pegangan nyaman. Menjaga suhu minuman hingga 1 jam.', 265000, 12, 340, 4.8, array['/products/teko-keramik-800.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'set-alat-makan-16', 'Set Alat Makan 16 pcs', 'Set lengkap 16 potong: sendok, garpu, pisau, dan sendok teh untuk 4 orang. Finishing satin antikarat.', 349000, 18, 430, 4.7, array['/products/set-alat-makan-16.jpg']),
  ((select id from categories where slug = 'meja-makan'), 'nampan-saji-jati', 'Nampan Saji Jati', 'Nampan kayu jati dengan permukaan halus dan bibir tinggi. Pas untuk menyajikan minuman atau camilan tamu.', 159000, 22, 610, 4.8, array['/products/nampan-saji-jati.jpg']),
  ((select id from categories where slug = 'dekorasi'), 'cermin-dinding-bulat', 'Cermin Dinding Bulat', 'Cermin bulat bergaris tengah 40 cm dengan bingkai kayu alami. Membuat ruangan terasa lebih terang dan lapang.', 289000, 11, 280, 4.8, array['/products/cermin-dinding-bulat.jpg']),
  ((select id from categories where slug = 'dekorasi'), 'lampu-meja-rotan', 'Lampu Meja Rotan', 'Lampu meja berbahan rotan anyam yang memancarkan cahaya hangat dan berpola. Menggunakan fitting E27.', 315000, 8, 210, 4.9, array['/products/lampu-meja-rotan.jpg']),
  ((select id from categories where slug = 'dekorasi'), 'bingkai-foto-set-3', 'Bingkai Foto Set (3 pcs)', 'Tiga bingkai kayu ukuran berbeda untuk dinding galeri kenangan. Kaca bening dan penyangga belakang.', 145000, 26, 520, 4.6, array['/products/bingkai-foto-set-3.jpg']),
  ((select id from categories where slug = 'dekorasi'), 'pot-tanaman-terakota', 'Pot Tanaman Terakota', 'Pot tanah liat bernapas dengan lubang drainase, ideal untuk tanaman hias. Warna alami yang menua dengan indah.', 119000, 30, 640, 4.7, array['/products/pot-tanaman-terakota.jpg']),
  ((select id from categories where slug = 'tekstil'), 'seprai-katun-180', 'Seprai Katun 180x200', 'Seprai katun tenun rapat dengan karet sudut, adem dan tidak mudah berkerut. Termasuk 2 sarung bantal.', 429000, 16, 480, 4.8, array['/products/seprai-katun-180.jpg']),
  ((select id from categories where slug = 'tekstil'), 'selimut-anyaman-katun', 'Selimut Anyaman Katun', 'Selimut katun bermotif anyaman dengan rumbai di kedua ujung. Ringan namun cukup hangat untuk ruangan ber-AC.', 259000, 20, 570, 4.6, array['/products/selimut-anyaman-katun.jpg']),
  ((select id from categories where slug = 'tekstil'), 'gorden-linen-140', 'Gorden Linen 140x240', 'Gorden linen dengan efek jatuh lembut dan sedikit memfilter cahaya. Dijual per lembar, lengkap dengan kait.', 199000, 24, 410, 4.5, array['/products/gorden-linen-140.jpg']),
  ((select id from categories where slug = 'aroma'), 'diffuser-reed-100', 'Diffuser Reed 100 ml', 'Diffuser dengan batang reed alami, mewangi ruangan hingga 6 minggu tanpa perlu dinyalakan.', 149000, 28, 690, 4.7, array['/products/diffuser-reed-100.jpg']),
  ((select id from categories where slug = 'aroma'), 'lilin-amber-3', 'Lilin Aroma Amber 3 pcs', 'Tiga lilin kecil beraroma amber hangat dalam wadah kaca. Waktu nyala sekitar 15 jam per lilin.', 189000, 21, 450, 4.8, array['/products/lilin-amber-3.jpg']),
  ((select id from categories where slug = 'aroma'), 'dupa-sandalwood-40', 'Dupa Sandalwood 40 batang', 'Dupa sandalwood berkualitas dengan asap tipis dan aroma menenangkan. Termasuk dudukan kayu.', 79000, 60, 1230, 4.9, array['/products/dupa-sandalwood-40.jpg'])
on conflict (slug) do update set
  category_id = excluded.category_id, name = excluded.name, description = excluded.description,
  price = excluded.price, stock = excluded.stock, sold = excluded.sold, rating = excluded.rating, image_urls = excluded.image_urls;

delete from product_variants where product_id in (select id from products);
insert into product_variants (product_id, label, stock) values
  ((select id from products where slug = 'set-piring-keramik-6'), 'Abu Batu', 0),
  ((select id from products where slug = 'set-piring-keramik-6'), 'Putih Tulang', 0),
  ((select id from products where slug = 'sarung-bantal-linen'), 'Pasir', 0),
  ((select id from products where slug = 'sarung-bantal-linen'), 'Zaitun', 0),
  ((select id from products where slug = 'sarung-bantal-linen'), 'Arang', 0),
  ((select id from products where slug = 'pisau-master-chef-20'), 'Gagang Kayu', 0),
  ((select id from products where slug = 'pisau-master-chef-20'), 'Gagang Hitam', 0),
  ((select id from products where slug = 'teko-keramik-800'), 'Pasir', 0),
  ((select id from products where slug = 'teko-keramik-800'), 'Hijau Lumut', 0),
  ((select id from products where slug = 'seprai-katun-180'), 'Kabut Biru', 0),
  ((select id from products where slug = 'seprai-katun-180'), 'Putih Tulang', 0),
  ((select id from products where slug = 'seprai-katun-180'), 'Arang', 0),
  ((select id from products where slug = 'diffuser-reed-100'), 'Lavender', 0),
  ((select id from products where slug = 'diffuser-reed-100'), 'Bergamot', 0),
  ((select id from products where slug = 'diffuser-reed-100'), 'Cendana', 0)
;
