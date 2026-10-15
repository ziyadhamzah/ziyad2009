import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import FlashSale from "@/components/FlashSale";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import HomeNew from "@/components/HomeNew";
import HomeSuggest from "@/components/HomeSuggest";
import VoucherPromo from "@/components/VoucherPromo";
import Benefits from "@/components/Benefits";
import SectionHeading from "@/components/SectionHeading";
import { products } from "@/lib/products";

export default function Home() {
  const best = [...products].sort((a, b) => b.sold - a.sold);
  return (
    <>
      <HeroSlider />

      <div className="shell">
        <Benefits />
        <CategoryGrid />

        <div className="mt-10">
          <FlashSale />
        </div>

        <section className="relative mt-6 overflow-hidden rounded-lg bg-ink">
          <span className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-brand/25 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-brand/15 blur-2xl" />
          <div className="relative flex flex-col gap-4 px-6 py-6 text-white sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold sm:text-xl">Gratis ongkir untuk belanja di atas Rp500.000</p>
              <p className="mt-1 text-sm text-white/70">Otomatis berlaku untuk pengiriman reguler ke seluruh Indonesia, tanpa kode.</p>
            </div>
            <Link href="/products" className="btn-primary h-11 shrink-0 px-6 text-sm">Belanja sekarang</Link>
          </div>
        </section>

        <div className="mt-6"><VoucherPromo /></div>

        <HomeNew />

        <section className="mt-10">
          <SectionHeading title="Terlaris" subtitle="Paling banyak dibeli bulan ini" href="/products?sort=terlaris" />
          <ProductGrid items={best.slice(0, 4)} />
        </section>

        <HomeSuggest />
      </div>
    </>
  );
}
