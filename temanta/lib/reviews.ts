import { products } from "./products";

export type Review = {
  id: string;
  productSlug: string;
  name: string;
  city?: string;
  rating: number;
  variant?: string;
  text: string;
  date: string;
  reply?: string;
  active?: string;
  userId?: string;
  verified?: boolean;
};

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

export const store = {
  name: "Temanta Home Living",
  handle: "temanta",
  verified: true,
  since: "2019",
  location: "Bandung, Jawa Barat",
  // Statistik di bawah dihitung dari katalog produk (bukan angka rekaan).
  rating: avg(products.map((p) => p.rating)),
  productCount: products.length,
  itemsSold: products.reduce((n, p) => n + p.sold, 0),
  joined: "3 tahun lalu",
  categories: ["Dapur", "Meja Makan", "Dekorasi", "Tekstil", "Aroma"],
  desc: "Toko perlengkapan rumah tangga yang menggabungkan kerja tangan pengrajin lokal dengan desain sederhana untuk kebutuhan sehari-hari. Semua barang dicek satu per satu sebelum dikemas.",
};

export function ratingSummary(list: Review[]) {
  const total = list.length;
  const avgVal = total ? list.reduce((n, x) => n + x.rating, 0) / total : 0;
  const stars = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: list.filter((x) => x.rating === s).length }));
  return { total, avg: avgVal, stars };
}