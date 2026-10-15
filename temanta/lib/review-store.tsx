"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import type { Review } from "./reviews";
import { getSupabase } from "./supabase";
import { useAuth } from "./auth";
import { useStore } from "./store";

export type NewReview = { slug: string; rating: number; variant?: string; text: string };

type Ctx = {
  ready: boolean;
  bySlug: (slug: string) => Review[];
  all: () => Review[];
  add: (r: NewReview) => Promise<string | null>;
  remove: (id: string) => Promise<string | null>;
};
const ReviewsContext = createContext<Ctx | null>(null);
const KEY = "temanta.reviews.v1";

function readLocal(): Record<string, Review[]> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Review[]>; } catch { return {}; }
}

// Provider ini sengaja ditaruh DI BAWAH StoreProvider di layout agar bisa
// menandai ulasan "pembelian terverifikasi" dari riwayat pesanan pengguna.
export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const { orders } = useStore();
  const [map, setMap] = useState<Record<string, Review[]>>({});
  const [ready, setReady] = useState(false);
  const local = useRef<Record<string, Review[]>>({});

  useEffect(() => { local.current = readLocal(); setMap(local.current); setReady(true); }, []);

  // Slug produk yang sudah diterima (delivered) oleh pengguna saat ini.
  const deliveredKeys = useMemo(
    () => new Set(orders.filter((o) => o.status === "delivered").flatMap((o) => o.lines.map((l) => l.slug))),
    [orders],
  );

  // Bila Supabase aktif & pengguna masuk, jadikan tabel `reviews` sumber kebenaran.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !authReady) return;
    let live = true;
    (async () => {
      const { data } = await sb.from("reviews").select("*").order("created_at", { ascending: false });
      if (!live) return;
      const m = data?.filter((r) => r.product_slug).reduce<Record<string, Review[]>>((acc, r) => {
        const slug = r.product_slug as string;
        (acc[slug] ??= []).push({
          id: r.id, productSlug: slug, name: r.name, city: r.city ?? undefined,
          rating: r.rating, variant: r.variant ?? undefined, text: r.text,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "",
          userId: r.user_id ?? undefined,
        });
        return acc;
      }, {});
      if (m) setMap(m);
      setReady(true);
    })();
    return () => { live = false; };
  }, [authReady]);

  const decorate = useCallback((r: Review): Review => ({
    ...r,
    verified: Boolean(r.userId) && deliveredKeys.has(r.productSlug),
  }), [deliveredKeys]);

  const canPurchase = useCallback((slug: string) => deliveredKeys.has(slug), [deliveredKeys]);

  const add = useCallback<Ctx["add"]>(async ({ slug, rating, variant, text }) => {
    if (!user) return "Silakan masuk terlebih dahulu untuk menulis ulasan.";
    if (!user.isAdmin && !canPurchase(slug)) {
      return "Ulasan hanya bisa ditulis oleh pembeli yang sudah menerima produk ini. Anda bisa menulis ulasan setelah pesanan selesai (Diterima).";
    }
    const sb = getSupabase();
    let prev = local.current[slug] ?? [];
    if (sb) {
      const { data: dup } = await sb.from("reviews").select("id").eq("product_slug", slug).eq("user_id", user.id).maybeSingle();
      if (dup) return "Anda sudah menulis ulasan untuk produk ini.";
    } else {
      prev = readLocal()[slug] ?? [];
      if (prev.some((r) => r.userId === user.id)) return "Anda sudah menulis ulasan untuk produk ini.";
    }

    const reviewId = crypto.randomUUID();
    const date = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const review: Review = { id: reviewId, productSlug: slug, name: user.name, rating, variant, text, date, userId: user.id };
    if (sb) {
      const { error } = await sb.from("reviews").insert({
        id: reviewId, product_slug: slug, user_id: user.id, name: user.name,
        rating, variant: variant ?? null, text, created_at: new Date().toISOString(),
      });
      if (error) return error.message;
    } else {
      try {
        local.current = { ...readLocal(), [slug]: [review, ...(readLocal()[slug] ?? [])] };
        localStorage.setItem(KEY, JSON.stringify(local.current));
      } catch { return "Penyimpanan browser penuh."; }
    }
    setMap((m) => ({ ...m, [slug]: [review, ...(m[slug] ?? [])] }));
    return null;
  }, [user, canPurchase]);

  const remove = useCallback<Ctx["remove"]>(async (id) => {
    const sb = getSupabase();
    if (sb) {
      const { error } = await sb.from("reviews").delete().eq("id", id);
      if (error) return error.message;
    } else {
      const next = readLocal();
      for (const slug of Object.keys(next)) next[slug] = next[slug].filter((r) => r.id !== id);
      local.current = next;
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { return "Penyimpanan browser penuh."; }
    }
    setMap((m) => {
      const out: Record<string, Review[]> = {};
      for (const slug of Object.keys(m)) out[slug] = m[slug].filter((r) => r.id !== id);
      return out;
    });
    return null;
  }, [user]);

  const value = useMemo<Ctx>(() => ({
    ready,
    bySlug: (slug) => (map[slug] ?? []).map(decorate),
    all: () => Object.values(map).flat().sort((a, b) => (a.date < b.date ? 1 : -1)).map(decorate),
    add,
    remove,
  }), [ready, map, decorate, add, remove]);

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export const useReviews = () => {
  const c = useContext(ReviewsContext);
  if (!c) throw new Error("useReviews harus dipakai di dalam ReviewsProvider");
  return c;
};