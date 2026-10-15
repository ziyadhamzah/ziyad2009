"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useAuth } from "./auth";

export type ChatMessage = { id: string; from: "user" | "store"; text: string; at: string };
type Ctx = {
  ready: boolean; messages: ChatMessage[]; typing: boolean;
  send: (text: string) => void; clear: () => void;
};
const ChatContext = createContext<Ctx | null>(null);
const KEY = "temanta.chat.v1";

const GREETING = "Halo! Selamat datang di Temanta Home Living. Ada yang bisa kami bantu hari ini?";
const CANNED: { match: RegExp; reply: string }[] = [
  { match: /halo|hai|assalam|pagi|siang|malam/i, reply: "Halo juga! Silakan sampaikan pertanyaan Anda soal produk atau pesanan." },
  { match: /stok|tersedia|ready|kosong/i, reply: "Stok produk kami diperbarui setiap hari. Kalau yang dicari sedang habis, bisa disimpan ke favorit dulu ya." },
  { match: /ongkir|ongkos|kirim|jne|j&t|sicepat|kurir|sampai/i, reply: "Ongkir mulai Rp15.000. Gratis ongkir untuk kurir Reguler pada pembelian di atas Rp500.000." },
  { match: /retur|kembali|rusak|cacat|garansi|tukar/i, reply: "Produk rusak atau tidak sesuai bisa diajukan pengembalian maksimal 7 hari setelah diterima. Sertakan foto ya." },
  { match: /pesanan|order|resi|lacak|tracking|status/i, reply: "Status dan nomor resi bisa dilihat di halaman “Pesanan saya”. Paste nomor resi di panel pelacakan untuk detailnya." },
  { match: /bayar|pembayaran|transfer|qris|gopay|ovo|dana/i, reply: "Kami menerima QRIS, transfer bank (BCA/BRI/BNI/Mandiri), dan e-wallet (GoPay/OVO/DANA/ShopeePay)." },
  { match: /promo|diskon|voucher|murah|sale/i, reply: "Saat ini ada diskon hingga 25% untuk produk pilihan dan gratis ongkir di atas Rp500.000." },
  { match: /kualitas|bahan|ukuran|dimensi/i, reply: "Semua produk dicek satu per satu sebelum dikemas. Detail bahan dan ukuran ada di deskripsi tiap produk." },
  { match: /selesai|terima kasih|makasih|thanks|oke/i, reply: "Dengan senang hati! Jangan ragu chat lagi kalau ada pertanyaan lain." },
];
const replyFor = (text: string) => CANNED.find((c) => c.match.test(text))?.reply ?? "Terima kasih atas pesannya. Tim kami akan segera membalas dengan detail.";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Record<string, ChatMessage[]>>({});
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const key = user?.email ?? "guest";
  const messages = store[key] ?? [];

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setStore(JSON.parse(raw) as Record<string, ChatMessage[]>); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {} }, [store]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setStore((s) => (s[key]?.length ? s : { ...s, [key]: [{ id: crypto.randomUUID(), from: "store", text: GREETING, at: new Date().toISOString() }] }));
  }, [key]);

  const value = useMemo<Ctx>(() => ({
    ready: true, messages, typing,
    send: (text) => {
      const t = text.trim();
      if (!t) return;
      const at = new Date().toISOString();
      setStore((s) => ({ ...s, [key]: [...(s[key] ?? []), { id: crypto.randomUUID(), from: "user", text: t, at }] }));
      setTyping(true);
      const t1 = setTimeout(() => {
        setStore((s) => ({ ...s, [key]: [...(s[key] ?? []), { id: crypto.randomUUID(), from: "store", text: replyFor(t), at: new Date().toISOString() }] }));
        setTyping(false);
      }, 1100 + Math.random() * 700);
      timers.current.push(t1);
    },
    clear: () => setStore((s) => ({ ...s, [key]: [{ id: crypto.randomUUID(), from: "store", text: GREETING, at: new Date().toISOString() }] })),
  }), [key, messages, typing]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
export const useChat = () => {
  const c = useContext(ChatContext);
  if (!c) throw new Error("useChat harus dipakai di dalam ChatProvider");
  return c;
};
