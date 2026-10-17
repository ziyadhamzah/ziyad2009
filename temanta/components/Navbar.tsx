"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useNotifications } from "@/lib/notify";
import AccountMenu from "@/components/AccountMenu";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

const menu = ["Dapur", "Meja Makan", "Dekorasi", "Tekstil", "Aroma"];

function IconButton({ href, label, badge, children }: { href: string; label: string; badge?: number; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label} className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper hover:text-brand-ontint">
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
      <div className="hidden bg-inverse text-inverse-fg md:block">
        <div className="shell flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-inverse-fg/70">
            <Link href="/bantuan#jual" className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-inverse-fg/10 hover:text-inverse-fg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
              Jual di Temanta
            </Link>
            <span className="h-3.5 w-px bg-inverse-fg/15" />
            <Link href="/bantuan" className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-inverse-fg/10 hover:text-inverse-fg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M9.2 9a3 3 0 0 1 5.8 1c0 1.8-2.5 2-2.5 3.5" /><path d="M12 17h.01" /></svg>
              Bantuan
            </Link>
            <span className="h-3.5 w-px bg-inverse-fg/15" />
            <Link href="/lacak" className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-inverse-fg/10 hover:text-inverse-fg">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Lacak pesanan
            </Link>
          </div>
          <div className="flex items-center gap-2 text-inverse-fg/70">
            <span className="mr-0.5 text-inverse-fg/50">Ikuti kami</span>
            <a href="https://instagram.com" aria-label="Instagram" title="Instagram" className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#D62976] to-[#4F5BD5] text-white transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://facebook.com" aria-label="Facebook" title="Facebook" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7.5v3H10v8z" /></svg>
            </a>
            <a href="https://tiktok.com" aria-label="TikTok" title="TikTok" className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white ring-1 ring-inset ring-white/25 transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden><path d="M16.5 3c.3 2.2 1.6 3.6 3.7 3.8v2.3c-1.3.1-2.5-.3-3.6-.9v6.3c0 3.2-2.6 5.7-5.8 5.3-2.7-.4-4.6-2.7-4.4-5.4.2-2.7 2.6-4.8 5.3-4.4.2 0 .4 0 .6.1v2.4c-.3-.1-.6-.2-.9-.2-1.4-.1-2.7.9-2.8 2.3-.1 1.4.9 2.6 2.3 2.8 1.4.1 2.6-.9 2.7-2.3V3z" /></svg>
            </a>
            <span className="mx-0.5 h-3.5 w-px bg-inverse-fg/15" />
            <Link href="/chat" className="flex items-center gap-1.5 rounded-full bg-inverse-fg/10 px-2.5 py-1.5 font-medium text-inverse-fg ring-1 ring-inset ring-inverse-fg/10 transition-colors hover:bg-brand hover:text-white hover:ring-brand">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1-4.2a8.4 8.4 0 0 1-.9-3.9A8.4 8.4 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5z" /></svg>
              Chat penjual
            </Link>
          </div>
        </div>
      </div>

      <div className="shell flex items-center gap-3 py-3 md:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Beranda Temanta">
          <Image src="/logo-mark.png" alt="" width={40} height={40} sizes="40px" priority className="h-9 w-9 object-contain md:h-10 md:w-10" />
          <span className="hidden text-xl font-black tracking-tight text-ink sm:block">Temanta<span className="text-brand-ontint">.</span></span>
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
          <Link href="/products" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 font-semibold text-ink transition-colors hover:bg-brand-light hover:text-brand-ontint">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            Semua produk
          </Link>
          {menu.map((c) => (
            <Link key={c} href={`/products?kategori=${encodeURIComponent(c)}`} className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand-ontint">
              {c}
            </Link>
          ))}
          <Link href="/products?sort=terbaru" className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand-ontint">Produk baru</Link>
          <Link href="/toko" className="whitespace-nowrap rounded-sm px-3 py-1.5 text-ink/70 transition-colors hover:bg-brand-light hover:text-brand-ontint">Toko</Link>
        </div>
      </nav>
    </header>
  );
}
