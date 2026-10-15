"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useNotifications } from "@/lib/notify";
import AccountMenu from "@/components/AccountMenu";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

const menu = ["Dapur", "Meja Makan", "Dekorasi", "Tekstil", "Aroma"];

function IconButton({ href, label, badge, children }: { href: string; label: string; badge?: number; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label} className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper hover:text-brand">
      {children}
      {badge ? (
        <span className="absolute right-0.5 top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold leading-[18px] text-white ring-2 ring-surface">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const { count: favCount } = useWishlist();
  const { unread } = useNotifications();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface shadow-header">
      <div className="hidden bg-ink text-white md:block">
        <div className="shell flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-white/70">
            <Link href="/bantuan#jual" className="transition-colors hover:text-white">Jual di Temanta</Link>
            <span className="h-3 w-px bg-surface/20" />
            <Link href="/bantuan" className="transition-colors hover:text-white">Bantuan</Link>
            <span className="h-3 w-px bg-surface/20" />
            <Link href="/lacak" className="transition-colors hover:text-white">Lacak pesanan</Link>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span className="text-white/50">Ikuti kami</span>
            <a href="https://instagram.com" aria-label="Instagram" className="transition-colors hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook" className="transition-colors hover:text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7.5v3H10v8z" /></svg>
            </a>
            <span className="h-3 w-px bg-surface/20" />
            <Link href="/chat" className="transition-colors hover:text-white">Chat penjual</Link>
          </div>
        </div>
      </div>

      <div className="shell flex items-center gap-3 py-3 md:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Temanta beranda">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" className="h-9 w-9 object-contain md:h-10 md:w-10" />
          <span className="hidden text-xl font-black tracking-tight text-ink sm:block">Temanta<span className="text-brand">.</span></span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-0.5 md:gap-1">
          <ThemeToggle />
          <IconButton href="/wishlist" label="Favorit" badge={favCount}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
          </IconButton>
          <IconButton href="/notifications" label="Notifikasi" badge={unread}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
          </IconButton>
          <IconButton href="/cart" label="Keranjang" badge={count}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
          </IconButton>
          <div className="ml-1 border-l border-line pl-2">
            <AccountMenu />
          </div>
        </div>
      </div>

      <div className="shell pb-3 md:hidden">
        <SearchBar action="/products" />
      </div>

      <nav className="border-t border-line">
        <div className="shell flex items-center gap-1 overflow-x-auto py-1.5 text-sm no-scrollbar">
          <Link href="/products" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-brand-light hover:text-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            Semua produk
          </Link>
          {menu.map((c) => (
            <Link key={c} href={`/products?kategori=${encodeURIComponent(c)}`} className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand">
              {c}
            </Link>
          ))}
          <Link href="/products?sort=terbaru" className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand">Produk baru</Link>
          <Link href="/toko" className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand">Toko</Link>
        </div>
      </nav>
    </header>
  );
}
