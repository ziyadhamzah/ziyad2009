"use client";
import Link from "next/link";
import { useEffect, Fragment, useRef, useState } from "react";
import { useChat } from "@/lib/chat";
import { useAuth } from "@/lib/auth";
import { store } from "@/lib/reviews";

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Hari ini";
  if (same(d, yest)) return "Kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const QUICK = ["Apakah stok tersedia?", "Berapa ongkir ke kota saya?", "Bisa retur kalau rusak?", "Metode pembayaran apa saja?"];

function StoreAvatar() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
    </span>
  );
}

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
        <Link href="/" className="hover:text-brand-ontint">Beranda</Link> <span className="mx-1">›</span>
        <Link href="/toko" className="hover:text-brand-ontint"> Toko</Link> <span className="mx-1">›</span> <span className="text-ink">Chat</span>
      </nav>

      <div className="flex h-[72vh] flex-col overflow-hidden rounded-lg bg-surface shadow-card">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="relative shrink-0">
            <StoreAvatar />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-ok-fill" />
          </span>
          <div className="min-w-0 flex-1">
            <Link href="/toko" className="block truncate font-semibold text-ink hover:text-brand-ontint">{store.name}</Link>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok-fill/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok-fill" />
              </span>
              Online · biasanya membalas dalam 1 jam
            </p>
          </div>
          <Link
            href="/toko"
            className="hidden rounded-sm border border-line px-3 py-1.5 text-xs font-medium text-ink/75 transition-colors hover:border-brand hover:text-brand-ontint sm:inline-block"
          >
            Lihat toko
          </Link>
          <button
            onClick={clear}
            className="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs text-muted transition-colors hover:text-danger-fg"
            aria-label="Bersihkan percakapan"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
            <span className="hidden sm:inline">Bersihkan</span>
          </button>
        </header>

        <div className="flex-1 space-y-1 overflow-y-auto bg-paper px-4 py-4">
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const showDay = !prev || new Date(prev.at).toDateString() !== new Date(m.at).toDateString();
            const isLastOfGroup = !messages[i + 1] || messages[i + 1].from !== m.from;
            const isUser = m.from === "user";
            return (
              <Fragment key={m.id}>
                {showDay && (
                  <div className="flex justify-center py-3">
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium text-muted shadow-card">
                      {fmtDay(m.at)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"} ${isLastOfGroup ? "mb-3" : ""}`}>
                  {!isUser && (
                    <span className="w-8 shrink-0">
                      {isLastOfGroup && <StoreAvatar />}
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${
                      isUser
                        ? "rounded-br-md bg-brand text-white"
                        : "rounded-bl-md border border-line bg-surface text-ink"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p className={`mt-1 text-[10px] ${isUser ? "text-white/75" : "text-muted"}`}>{fmtTime(m.at)}</p>
                  </div>
                </div>
              </Fragment>
            );
          })}

          {typing && (
            <div className="flex items-end gap-2">
              <StoreAvatar />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 shadow-card">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line px-4 py-3">
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-0.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="whitespace-nowrap rounded-full border border-line bg-surface px-3.5 py-2 text-xs text-ink/75 transition-colors hover:border-brand hover:bg-brand-50 hover:text-brand-ontint"
              >
                {q}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis pesan…"
              aria-label="Tulis pesan"
              className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Kirim"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
          {!user && (
            <p className="mt-2 text-center text-xs text-muted">
              Anda mengobrol sebagai tamu. <Link href="/login" className="font-medium text-brand-ontint hover:underline">Masuk</Link> agar riwayat tersimpan di akun Anda.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
