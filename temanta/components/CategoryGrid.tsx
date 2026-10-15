import Link from "next/link";
import { categories, products } from "@/lib/products";
import ProductImage from "./ProductImage";
import SectionHeading from "./SectionHeading";

export default function CategoryGrid() {
  return (
    <section className="mt-8">
      <SectionHeading title="Belanja per kategori" href="/products" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {categories.map((c) => {
          const cover = products.find((p) => p.category === c);
          const count = products.filter((p) => p.category === c).length;
          return (
            <Link key={c} href={`/products?kategori=${encodeURIComponent(c)}`} className="group card overflow-hidden p-3 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-hover">
              <span className="block aspect-square overflow-hidden rounded-sm bg-paper">
                {cover && <div className="h-full w-full transition-transform duration-500 group-hover:scale-105"><ProductImage slug={cover.slug} /></div>}
              </span>
              <span className="mt-2.5 block text-sm font-semibold text-ink group-hover:text-brand">{c}</span>
              <span className="text-xs text-muted">{count} produk</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
