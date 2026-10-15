"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/chat";
import { useAuth } from "@/lib/auth";
import { store } from "@/lib/reviews";

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const QUICK = ["Apakah stok tersedia?", "Berapa ongkir ke kota saya?", "Bisa retur kalau rusak?", "Metode pembayaran apa saja?"];

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, typing, send, clear } = useChat();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, typing]);

  const submit = (e: React.FormEvent) => { e.preventDefault(); send(text); setText(""); };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-brand">Beranda</Link> <span className="mx-1">â€º</span>
        <Link href="/toko" className="hover:text-brand"> Toko</Link> <span className="mx-1">â€º</span> <span className="text-ink">Chat</span>
      </nav>

      <div className="flex h-[70vh] flex-col overflow-hidden rounded-sm bg-surface shadow-card">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
          </span>
          <div className="min-w-0 flex-1">
            <Link href="/toko" className="block truncate font-semibold hover:text-brand">{store.name}</Link>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Online Â· biasanya membalas dalam 1 jam
            </p>
          </div>
          <button onClick={clear} className="text-xs text-muted underline hover:text-brand">Bersihkan</button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3.5 py-2 text-sm shadow-sm ${m.from === "user" ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-surface text-ink"}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <p className={`mt-1 text-[10px] ${m.from === "user" ? "text-white/75" : "text-muted"}`}>{fmtTime(m.at)}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-lg rounded-bl-sm bg-surface px-4 py-3 shadow-sm">
                {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line px-4 py-2">
          <div className="mb-2 flex gap-2 overflow-x-auto">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} className="whitespace-nowrap rounded-full border border-line px-3 py-1 text-xs text-ink/75 transition hover:border-brand hover:text-brand">{q}</button>
            ))}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2 pb-1">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis pesanâ€¦" aria-label="Tulis pesan"
              className="h-11 min-w-0 flex-1 rounded-sm border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30" />
            <button type="submit" disabled={!text.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-brand text-white transition hover:bg-brand-dark disabled:opacity-40" aria-label="Kirim">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></svg>
            </button>
          </form>
          {!user && <p className="pb-1 text-center text-xs text-muted">Anda chat sebagai tamu. <Link href="/login" className="text-brand hover:underline">Masuk</Link> agar riwayat tersimpan di akun Anda.</p>}
        </div>
      </div>
    </div>
  );
}
