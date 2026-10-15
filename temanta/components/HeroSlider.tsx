"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProductImage from "./ProductImage";

type Slide = { slug: string; title: string; text: string; cta: string; href: string };

const slides: Slide[] = [
  { slug: "panci-besi-cor-24cm", title: "Masak lebih enak dengan peralatan besi cor", text: "Besi cor, kayu jati, dan keramik buatan pengrajin Indonesia. Tahan lama dan siap dipakai tiap hari.", cta: "Belanja kategori dapur", href: "/products?kategori=Dapur" },
  { slug: "vas-terakota-tinggi", title: "Percantik ruangan dengan terakota & keramik", text: "Setiap vas dibentuk dan dibakar manual oleh perajin lokal, jadi tiap unitnya unik.", cta: "Lihat dekorasi", href: "/products?kategori=Dekorasi" },
  { slug: "taplak-meja-batik-tulis", title: "Batik tulis Pekalongan, dikerjakan dua minggu", text: "Katun primisima ukuran 140Ã—200 cm, halus dipakai dan tahan lama di meja makan.", cta: "Lihat tekstil", href: "/products?kategori=Tekstil" },
];

const heroStyle = `
@keyframes heroUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-hero > * { animation: heroUp .65s cubic-bezier(.16,.84,.44,1) both; }
.animate-hero > *:nth-child(2) { animation-delay: .08s; }
.animate-hero > *:nth-child(3) { animation-delay: .16s; }
`;

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const paused = useRef(false);
  const count = slides.length;

  const go = (n: number) => setI((p) => (p + n + count) % count);

  useEffect(() => {
    const id = setInterval(() => { if (!paused.current) setI((p) => (p + 1) % count); }, 6500);
    return () => clearInterval(id);
  }, [count]);

  const down = (x: number) => { startX.current = x; paused.current = true; };
  const up = (x: number) => {
    if (startX.current !== null && Math.abs(x - startX.current) > 40) go(x < startX.current ? 1 : -1);
    startX.current = null;
    paused.current = false;
  };

  return (
    <>
      <style>{heroStyle}</style>
      <section className="relative w-full bg-ink">
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => { paused.current = true; }}
          onMouseLeave={() => { paused.current = false; }}
          onTouchStart={(e) => down(e.touches[0].clientX)}
          onTouchEnd={(e) => up(e.changedTouches[0].clientX)}
          onPointerDown={(e) => { if (e.pointerType === "mouse") down(e.clientX); }}
          onPointerUp={(e) => { if (e.pointerType === "mouse") up(e.clientX); }}
          aria-roledescription="carousel"
          aria-label="Sorotan produk"
        >
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
            {slides.map((s) => (
              <div key={s.slug} className="relative min-w-full">
                <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
                  <div className="absolute inset-0"><ProductImage slug={s.slug} /></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="relative z-10 flex h-full items-center">
                    <div className="shell">
                      <div key={i} className="animate-hero max-w-xl">
                        <h1 className="text-3xl font-black leading-[1.1] text-white sm:text-4xl lg:text-[50px]">{s.title}</h1>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{s.text}</p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <Link href={s.href} className="btn-primary h-12 px-7 text-sm">{s.cta}</Link>
                          <Link href="/products" className="btn h-12 rounded-sm border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:bg-surface hover:text-ink">Semua produk</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => go(-1)} aria-label="Slide sebelumnya"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/10 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-surface hover:text-ink sm:flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Slide berikutnya"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/10 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-surface hover:text-ink sm:flex">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
          </button>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-3 py-2 ring-1 ring-white/10 backdrop-blur">
            {slides.map((s, n) => (
              <button key={s.slug} type="button" onClick={() => setI(n)} aria-label={`Ke slide ${n + 1}`}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-surface" : "w-1.5 bg-surface/50 hover:bg-surface/80"}`} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
