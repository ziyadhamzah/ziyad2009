import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";

export const metadata: Metadata = { title: "Katalog Produk · Temanta", description: "Katalog lengkap perlengkapan rumah dari pengrajin Indonesia." };

function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <div className="h-40 animate-pulse rounded-sm bg-surface shadow-card" />
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <CatalogClient />
    </Suspense>
  );
}
