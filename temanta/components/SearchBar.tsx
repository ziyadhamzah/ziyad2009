"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { suggestProducts } from "@/lib/products";
import { rupiah } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function SearchBar({
  placeholder = "Cari produk, kategori, atau merekâ€¦",
  action = "/products",
  autoFocus = false,
  className = "",
}: {
  placeholder?: string;
  action?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => (term.trim() ? suggestProducts(term, 6) : []), [term]);
  const showList = open && suggestions.length > 0;

  const go = (href: string) => {
    setOpen(false);
    setTerm("");
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (index >= 0 && suggestions[index]) go(`/products/${suggestions[index].slug}`);
    else if (term.trim()) go(`${action}?q=${encodeURIComponent(term.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showList) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => (i - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Escape") setOpen(false);
  };

  return (
    <form onSubmit={submit} role="search" className={`relative ${className}`}>
      <div className="flex items-center overflow-hidden rounded-sm border border-transparent bg-paper ring-1 ring-inset ring-line transition focus-within:bg-surface focus-within:ring-2 focus-within:ring-brand">
        <span className="pl-3 text-muted" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        </span>
        <input
          value={term}
          onChange={(e) => { setTerm(e.target.value); setIndex(-1); setOpen(true); }}
          onFocus={() => { setOpen(true); if (blurTimer.current) clearTimeout(blurTimer.current); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 160); }}
          onKeyDown={onKeyDown}
          type="search"
          name="q"
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Cari produk"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted"
        />
        <button type="submit" aria-label="Cari" className="mr-0.5 hidden h-9 shrink-0 items-center rounded-sm bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:flex">
          Cari
        </button>
        <button type="submit" aria-label="Cari" className="flex h-10 w-11 shrink-0 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-dark sm:hidden">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        </button>
      </div>

      {showList && (
        <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-sm border border-line bg-surface py-1 shadow-float">
          {suggestions.map((p, i) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.slug}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm ${i === index ? "bg-paper" : ""}`}
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-paper"><ProductImage slug={p.slug} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink">{p.name}</span>
                  <span className="text-xs text-muted">{p.category}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-brand">{rupiah(p.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
