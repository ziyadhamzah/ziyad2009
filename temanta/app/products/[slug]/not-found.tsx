import Link from "next/link";
export default function NotFound() {
  return <div className="mx-auto max-w-6xl px-4 py-24"><h1 className="text-2xl font-bold">Produk tidak ditemukan</h1>
    <p className="mt-2 text-muted">Produk ini mungkin sudah tidak dijual.</p>
    <Link href="/products" className="mt-6 inline-block rounded bg-brand px-6 py-3 text-white">Lihat semua produk</Link></div>;
}
