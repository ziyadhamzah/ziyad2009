export type Variant = { id: string; label: string };
export type Product = {
  id: string; slug: string; name: string; price: number; basePrice: number; category: string;
  description: string; tone: string; rating: number; stock: number; sold: number;
  image?: string; variants?: Variant[];
};
export const categories = ["Dapur", "Meja Makan", "Dekorasi", "Tekstil", "Aroma"] as const;
export const products: Product[] = [
  { id: "p1", slug: "panci-besi-cor-24cm", image: "/products/panci-besi-cor-24cm.jpg", name: "Panci Besi Cor 24 cm", price: 489000, basePrice: 629000, category: "Dapur", tone: "#2B2D2C", rating: 4.9, stock: 14, sold: 1280, description: "Panci besi cor dengan tutup berat yang menjaga panas dan uap. Cocok untuk semur, rendang, dan nasi liwet. Bisa dipakai di kompor gas, induksi, dan oven." },
  { id: "p2", slug: "talenan-jati-besar", image: "/products/talenan-jati-besar.jpg", name: "Talenan Jati Besar", price: 235000, basePrice: 299000, category: "Dapur", tone: "#B08A5E", rating: 4.8, stock: 32, sold: 940, description: "Talenan kayu jati tebal 3 cm dengan alur penampung air. Dipotong dari satu bilah kayu tanpa sambungan." },
  { id: "p3", slug: "set-piring-keramik-6", image: "/products/set-piring-keramik-6.jpg", name: "Set Piring Keramik (6 pcs)", price: 359000, basePrice: 459000, category: "Meja Makan", tone: "#D9D6CC", rating: 4.7, stock: 0, sold: 2110, description: "Piring makan 26 cm glasir matte, aman untuk microwave dan mesin cuci piring. Dibuat oleh pengrajin di Plered, Purwakarta.", variants: [{ id: "abu", label: "Abu Batu" }, { id: "putih", label: "Putih Tulang" }] },
  { id: "p4", slug: "gelas-kaca-tiup-4", image: "/products/gelas-kaca-tiup-4.jpg", name: "Gelas Kaca Tiup (4 pcs)", price: 189000, basePrice: 239000, category: "Meja Makan", tone: "#A9C2BE", rating: 4.6, stock: 48, sold: 612, description: "Gelas tiup tangan berkapasitas 300 ml. Setiap gelas sedikit berbeda bentuknya." },
  { id: "p5", slug: "vas-terakota-tinggi", image: "/products/vas-terakota-tinggi.jpg", name: "Vas Terakota Tinggi", price: 275000, basePrice: 349000, category: "Dekorasi", tone: "#B3694A", rating: 4.8, stock: 9, sold: 305, description: "Vas tanah liat bakar setinggi 38 cm dengan permukaan kasar alami. Bagian dalam dilapisi glasir sehingga bisa diisi air." },
  { id: "p6", slug: "sarung-bantal-linen", image: "/products/sarung-bantal-linen.jpg", name: "Sarung Bantal Linen 45x45", price: 149000, basePrice: 199000, category: "Tekstil", tone: "#C9C3B3", rating: 4.5, stock: 60, sold: 1530, description: "Linen cuci enzim yang lembut sejak pemakaian pertama. Resleting tersembunyi.", variants: [{ id: "pasir", label: "Pasir" }, { id: "zaitun", label: "Zaitun" }, { id: "arang", label: "Arang" }] },
  { id: "p7", slug: "lilin-soya-cendana", image: "/products/lilin-soya-cendana.jpg", name: "Lilin Soya Cendana", price: 129000, basePrice: 159000, category: "Aroma", tone: "#E4DACB", rating: 4.7, stock: 25, sold: 870, description: "Lilin soya 180 g dengan sumbu katun, menyala sekitar 40 jam. Aroma cendana dan sedikit vanila." },
  { id: "p8", slug: "taplak-meja-batik-tulis", image: "/products/taplak-meja-batik-tulis.jpg", name: "Taplak Meja Batik Tulis", price: 325000, basePrice: 425000, category: "Tekstil", tone: "#2F3E5C", rating: 4.9, stock: 6, sold: 188, description: "Batik tulis katun primisima ukuran 140x200 cm, dikerjakan sekitar dua minggu oleh pengrajin Pekalongan." },

  { id: "p9", slug: "wajan-anti-lengket-28", image: "/products/wajan-anti-lengket-28.jpg", name: "Wajan Anti Lengket 28 cm", price: 219000, basePrice: 289000, category: "Dapur", tone: "#33383A", rating: 4.8, stock: 20, sold: 720, description: "Wajan anti lengket berlapis granit dengan gagang tahan panas. Cocok untuk menumis dan menggoreng tanpa banyak minyak." },
  { id: "p10", slug: "pisau-master-chef-20", image: "/products/pisau-master-chef-20.jpg", name: "Pisau Master Chef 20 cm", price: 268000, basePrice: 335000, category: "Dapur", tone: "#454A4D", rating: 4.9, stock: 15, sold: 540, description: "Pisau baja karbon tinggi dengan mata tajam dan gagang kayu keras. Seimbang di tangan untuk memotong cepat.", variants: [{ id: "kayu", label: "Gagang Kayu" }, { id: "hitam", label: "Gagang Hitam" }] },
  { id: "p11", slug: "wadah-bumbu-kaca-3", image: "/products/wadah-bumbu-kaca-3.jpg", name: "Wadah Bumbu Kaca (3 pcs)", price: 139000, basePrice: 179000, category: "Dapur", tone: "#CBB79A", rating: 4.7, stock: 40, sold: 890, description: "Tiga toples kaca bertutup rapat untuk menyimpan bumbu dan rempah agar tetap aromatik dan bebas lembap." },
  { id: "p12", slug: "sutil-sendok-kayu-4", image: "/products/sutil-sendok-kayu-4.jpg", name: "Set Sutil Kayu (4 pcs)", price: 99000, basePrice: 129000, category: "Dapur", tone: "#C39B6B", rating: 4.6, stock: 55, sold: 1120, description: "Set alat masak kayu yang lembut di permukaan anti lengket. Tidak menghantarkan panas dan aman untuk wajan berlapis." },

  { id: "p13", slug: "mangkuk-keramik-4", image: "/products/mangkuk-keramik-4.jpg", name: "Mangkuk Keramik (4 pcs)", price: 179000, basePrice: 229000, category: "Meja Makan", tone: "#D7CFC2", rating: 4.7, stock: 34, sold: 760, description: "Mangkuk keramik kapasitas 500 ml, cocok untuk sup, sereal, atau salad. Bisa ditumpuk untuk menghemat ruang." },
  { id: "p14", slug: "teko-keramik-800", image: "/products/teko-keramik-800.jpg", name: "Teko Keramik 800 ml", price: 265000, basePrice: 339000, category: "Meja Makan", tone: "#C6BBA8", rating: 4.8, stock: 12, sold: 340, description: "Teko keramik dengan corong mulus dan pegangan nyaman. Menjaga suhu minuman hingga 1 jam.", variants: [{ id: "pasir", label: "Pasir" }, { id: "hijau", label: "Hijau Lumut" }] },
  { id: "p15", slug: "set-alat-makan-16", image: "/products/set-alat-makan-16.jpg", name: "Set Alat Makan 16 pcs", price: 349000, basePrice: 459000, category: "Meja Makan", tone: "#B9BEC2", rating: 4.7, stock: 18, sold: 430, description: "Set lengkap 16 potong: sendok, garpu, pisau, dan sendok teh untuk 4 orang. Finishing satin antikarat." },
  { id: "p16", slug: "nampan-saji-jati", image: "/products/nampan-saji-jati.jpg", name: "Nampan Saji Jati", price: 159000, basePrice: 209000, category: "Meja Makan", tone: "#A97C4C", rating: 4.8, stock: 22, sold: 610, description: "Nampan kayu jati dengan permukaan halus dan bibir tinggi. Pas untuk menyajikan minuman atau camilan tamu." },

  { id: "p17", slug: "cermin-dinding-bulat", image: "/products/cermin-dinding-bulat.jpg", name: "Cermin Dinding Bulat", price: 289000, basePrice: 379000, category: "Dekorasi", tone: "#C9C4BB", rating: 4.8, stock: 11, sold: 280, description: "Cermin bulat bergaris tengah 40 cm dengan bingkai kayu alami. Membuat ruangan terasa lebih terang dan lapang." },
  { id: "p18", slug: "lampu-meja-rotan", image: "/products/lampu-meja-rotan.jpg", name: "Lampu Meja Rotan", price: 315000, basePrice: 399000, category: "Dekorasi", tone: "#C79A5E", rating: 4.9, stock: 8, sold: 210, description: "Lampu meja berbahan rotan anyam yang memancarkan cahaya hangat dan berpola. Menggunakan fitting E27." },
  { id: "p19", slug: "bingkai-foto-set-3", image: "/products/bingkai-foto-set-3.jpg", name: "Bingkai Foto Set (3 pcs)", price: 145000, basePrice: 189000, category: "Dekorasi", tone: "#8E8577", rating: 4.6, stock: 26, sold: 520, description: "Tiga bingkai kayu ukuran berbeda untuk dinding galeri kenangan. Kaca bening dan penyangga belakang." },
  { id: "p20", slug: "pot-tanaman-terakota", image: "/products/pot-tanaman-terakota.jpg", name: "Pot Tanaman Terakota", price: 119000, basePrice: 155000, category: "Dekorasi", tone: "#B96A4A", rating: 4.7, stock: 30, sold: 640, description: "Pot tanah liat bernapas dengan lubang drainase, ideal untuk tanaman hias. Warna alami yang menua dengan indah." },

  { id: "p21", slug: "seprai-katun-180", image: "/products/seprai-katun-180.jpg", name: "Seprai Katun 180x200", price: 429000, basePrice: 549000, category: "Tekstil", tone: "#7C8B9A", rating: 4.8, stock: 16, sold: 480, description: "Seprai katun tenun rapat dengan karet sudut, adem dan tidak mudah berkerut. Termasuk 2 sarung bantal.", variants: [{ id: "kabut", label: "Kabut Biru" }, { id: "putih", label: "Putih Tulang" }, { id: "arang", label: "Arang" }] },
  { id: "p22", slug: "selimut-anyaman-katun", image: "/products/selimut-anyaman-katun.jpg", name: "Selimut Anyaman Katun", price: 259000, basePrice: 335000, category: "Tekstil", tone: "#B9A98C", rating: 4.6, stock: 20, sold: 570, description: "Selimut katun bermotif anyaman dengan rumbai di kedua ujung. Ringan namun cukup hangat untuk ruangan ber-AC." },
  { id: "p23", slug: "gorden-linen-140", image: "/products/gorden-linen-140.jpg", name: "Gorden Linen 140x240", price: 199000, basePrice: 269000, category: "Tekstil", tone: "#9AA39B", rating: 4.5, stock: 24, sold: 410, description: "Gorden linen dengan efek jatuh lembut dan sedikit memfilter cahaya. Dijual per lembar, lengkap dengan kait." },

  { id: "p24", slug: "diffuser-reed-100", image: "/products/diffuser-reed-100.jpg", name: "Diffuser Reed 100 ml", price: 149000, basePrice: 189000, category: "Aroma", tone: "#D8C9AE", rating: 4.7, stock: 28, sold: 690, description: "Diffuser dengan batang reed alami, mewangi ruangan hingga 6 minggu tanpa perlu dinyalakan.", variants: [{ id: "lavender", label: "Lavender" }, { id: "bergamot", label: "Bergamot" }, { id: "cendana", label: "Cendana" }] },
  { id: "p25", slug: "lilin-amber-3", image: "/products/lilin-amber-3.jpg", name: "Lilin Aroma Amber 3 pcs", price: 189000, basePrice: 249000, category: "Aroma", tone: "#E0C79A", rating: 4.8, stock: 21, sold: 450, description: "Tiga lilin kecil beraroma amber hangat dalam wadah kaca. Waktu nyala sekitar 15 jam per lilin." },
  { id: "p26", slug: "dupa-sandalwood-40", image: "/products/dupa-sandalwood-40.jpg", name: "Dupa Sandalwood 40 batang", price: 79000, basePrice: 99000, category: "Aroma", tone: "#C8A97E", rating: 4.9, stock: 60, sold: 1230, description: "Dupa sandalwood berkualitas dengan asap tipis dan aroma menenangkan. Termasuk dudukan kayu." },
];
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

// Urutan katalog dianggap sebagai urutan penambahan: indeks lebih besar = lebih baru.
const recency = new Map(products.map((p, i) => [p.id, i] as const));

export const priceBounds = products.reduce(
  (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
  { min: Infinity, max: 0 },
);

export type SortKey = "relevan" | "terbaru" | "murah" | "mahal" | "rating" | "terlaris";
export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "relevan", label: "Paling relevan" },
  { value: "terlaris", label: "Terlaris" },
  { value: "terbaru", label: "Terbaru" },
  { value: "rating", label: "Rating tertinggi" },
  { value: "murah", label: "Harga terendah" },
  { value: "mahal", label: "Harga tertinggi" },
];

export type ProductQuery = {
  q?: string;
  kategori?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

const termsOf = (q: string) => q.trim().toLowerCase().split(/\s+/).filter(Boolean);

const relevance = (p: Product, terms: string[]) => {
  if (!terms.length) return 0;
  const name = p.name.toLowerCase();
  const category = p.category.toLowerCase();
  const desc = p.description.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (name === t) score += 6;
    else if (name.startsWith(t)) score += 4;
    else if (name.includes(t)) score += 3;
    if (category.includes(t)) score += 2;
    if (desc.includes(t)) score += 1;
  }
  return score;
};

export function queryProducts(query: ProductQuery = {}) {
  const {
    q = "", kategori, minPrice, maxPrice, minRating,
    sort = "relevan", page = 1, perPage = 12,
  } = query;
  const terms = termsOf(q);

  const list = products.filter((p) => {
    if (kategori && p.category !== kategori) return false;
    if (minPrice != null && p.price < minPrice) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    if (minRating != null && p.rating < minRating) return false;
    if (terms.length) {
      const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  switch (sort) {
    case "murah": list.sort((a, b) => a.price - b.price); break;
    case "mahal": list.sort((a, b) => b.price - a.price); break;
    case "rating": list.sort((a, b) => b.rating - a.rating || b.sold - a.sold); break;
    case "terlaris": list.sort((a, b) => b.sold - a.sold); break;
    case "terbaru": list.sort((a, b) => (recency.get(b.id) ?? 0) - (recency.get(a.id) ?? 0)); break;
    default:
      if (terms.length) list.sort((a, b) => relevance(b, terms) - relevance(a, terms) || b.sold - a.sold);
      else list.sort((a, b) => b.sold - a.sold);
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), pages);
  const items = list.slice((safePage - 1) * perPage, safePage * perPage);
  return { items, total, page: safePage, pages, perPage };
}

export const bestSellers = (n = 8) => [...products].sort((a, b) => b.sold - a.sold).slice(0, n);
export const newArrivals = (n = 8) => [...products].sort((a, b) => (recency.get(b.id) ?? 0) - (recency.get(a.id) ?? 0)).slice(0, n);

// Pencarian ringkas untuk autocomplete navbar/katalog.
export function suggestProducts(q: string, limit = 6) {
  const terms = termsOf(q);
  if (!terms.length) return [];
  return [...products]
    .map((p) => ({ p, s: relevance(p, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.sold - a.p.sold)
    .slice(0, limit)
    .map((x) => x.p);
}

// Dipertahankan untuk kompatibilitas pemanggil lama.
export function searchProducts(q: string, cat?: string, sort?: SortKey) {
  return queryProducts({ q, kategori: cat, sort, perPage: products.length }).items;
}
