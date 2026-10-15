"use client";
import Link from "next/link";
import { useNotifications } from "@/lib/notify";
import { usePriceWatch } from "@/lib/pricewatch";
import { useState } from "react";

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  return `${d} hari lalu`;
};

export default function NotificationsPage() {
  const { ready, list, unread, markRead, markAllRead, clear } = useNotifications();
  const { simulateDrop } = usePriceWatch();
  const [sim, setSim] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-brand">Beranda</Link> <span className="mx-1">â€º</span> <span className="text-ink">Notifikasi</span>
      </nav>
      <div className="rounded-sm bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h1 className="text-xl font-bold">Notifikasi {unread > 0 && <span className="text-brand">({unread} belum dibaca)</span>}</h1>
          {list.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button onClick={markAllRead} className="text-brand hover:underline">Tandai semua dibaca</button>
              <button onClick={clear} className="text-muted underline hover:text-brand">Hapus semua</button>
              <button
                onClick={() => setSim(simulateDrop())}
                className="rounded-sm border border-line px-3 py-1.5 text-ink/80 hover:border-brand hover:text-brand">
                Simulasi pantauan harga (demo)
              </button>
            </div>
          )}
        </div>

        {!ready ? (
          <p className="p-10 text-center text-muted">Memuat…</p>
        ) : list.length === 0 ? (
          <div className="p-10 text-center">
            <svg viewBox="0 0 24 24" className="mx-auto h-14 w-14 text-line" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            <h2 className="mt-4 font-bold">Belum ada notifikasi</h2>
            <p className="mt-1 text-sm text-muted">Status pesanan dan info penting akan muncul di sini.</p>
            {sim && <p className="mt-2 text-xs text-muted">Simulasi untuk: <span className="font-medium text-ink">{sim}</span> — cek notifikasi baru.</p>}
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/products" className="inline-block rounded-sm bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">Mulai belanja</Link>
              <button onClick={() => setSim(simulateDrop())} className="inline-block rounded-sm border border-line px-6 py-2.5 font-semibold text-ink hover:border-brand hover:text-brand">Simulasi demo</button>
            </div>
          </div>
        ) : (
          <>
            {sim && <p className="px-5 py-3 text-xs text-muted">Simulasi untuk: <span className="font-medium text-ink">{sim}</span>. Notifikasi baru mungkin muncul.</p>}
            <ul className="divide-y divide-line">
            {list.map((n) => {
              const inner = (
                <>
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-brand"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm font-semibold ${n.read ? "text-ink/70" : "text-ink"}`}>{n.title}</p>
                      <span className="shrink-0 text-xs text-muted">{timeAgo(n.at)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  </div>
                </>
              );
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => !n.read && markRead(n.id)}
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-brand-light/40">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-5 py-3.5">{inner}</div>
                  )}
                </li>
              );
            })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}