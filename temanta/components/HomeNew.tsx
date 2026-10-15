import ProductGrid from "./ProductGrid";
import SectionHeading from "./SectionHeading";
import { newArrivals } from "@/lib/products";

export default function HomeNew() {
  const items = newArrivals(4);
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <SectionHeading title="Baru di Temanta" subtitle="Rilis terbaru dari perajin pilihan" href="/products?sort=terbaru" />
      <ProductGrid items={items} />
    </section>
  );
}
