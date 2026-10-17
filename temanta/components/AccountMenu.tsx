"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="btn-outline h-9 px-4 text-ink">Masuk</Link>
        <Link href="/login?mode=register" className="btn-primary hidden h-9 px-4 sm:inline-flex">Daftar</Link>
      </div>
    );
  }

  const links: { href: string; label: string }[] = [
    { href: "/account", label: "Akun saya" },
    ...(user.isAdmin ? [{ href: "/admin", label: "Panel admin" }] : []),
    { href: "/orders", label: "Pesanan saya" },
    { href: "/wishlist", label: "Favorit saya" },
    { href: "/chat", label: "Chat penjual" },
    { href: "/notifications", label: "Notifikasi" },
  ];

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 text-sm transition-colors hover:border-brand/50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-[110px] truncate font-medium text-ink lg:block">{user.name.split(" ")[0]}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden rounded-sm border border-line bg-surface py-1 text-sm shadow-float animate-fade-in"
          onMouseLeave={(e) => {
            const related = e.relatedTarget as Node | null;
            if (!menuRef.current?.contains(related) && !rootRef.current?.contains(related)) {
              setOpen(false);
            }
          }}
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-ink/80 transition-colors hover:bg-brand-light hover:text-brand-ontint">
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); setOpen(false); }}
            role="menuitem"
            className="mt-1 block w-full border-t border-line px-4 py-2.5 text-left text-ink/80 transition-colors hover:bg-brand-light hover:text-brand-ontint"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
