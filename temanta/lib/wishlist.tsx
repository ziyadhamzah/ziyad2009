"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { getSupabase } from "./supabase";

type Ctx = {
  ready: boolean; slugs: string[]; count: number;
  has: (slug: string) => boolean; toggle: (slug: string) => void;
  remove: (slug: string) => void; clear: () => void;
  toast: string | null;
};
const WishlistContext = createContext<Ctx | null>(null);
const KEY = "temanta.wishlist.v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [slugMap, setSlugMap] = useState<Record<string, string[]>>({});
  const [loadedUser, setLoadedUser] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const syncing = useRef(false);

  const key = user?.email ?? "guest";
  const slugs = slugMap[key] ?? [];

  // Muat ulang data lokal setiap kali identitas pengguna berubah.
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSlugMap(JSON.parse(raw) as Record<string, string[]>); } catch {}
  }, [key]);

  // Sinkronkan dengan tabel wishlists di Supabase (RLS: hanya baris milik sendiri).
  useEffect(() => {
    if (!authReady || !user) return;
    const sb = getSupabase();
    if (!sb || loadedUser === user.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await sb.from("wishlists").select("product_slug").eq("user_id", user.id);
        if (cancelled || !data) return;
        const remote = data.map((r) => (r as { product_slug: string }).product_slug).filter(Boolean);
        const email = user.email ?? key;
        setSlugMap((m) => ({ ...m, [email]: Array.from(new Set([...remote, ...(m[email] ?? [])])) }));
        setLoadedUser(user.id);
      } catch { /* abaikan bila tabel belum ada/belum dimigrasi */ }
    })();
    return () => { cancelled = true; };
  }, [authReady, user, loadedUser, key]);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(slugMap)); } catch {} }, [slugMap]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const syncToRemote = async (action: "add" | "remove" | "clear", slug?: string) => {
    const sb = getSupabase();
    if (!sb || !user || syncing.current) return;
    syncing.current = true;
    try {
      if (action === "add" && slug) await sb.from("wishlists").upsert({ user_id: user.id, product_slug: slug }, { onConflict: "user_id,product_slug" });
      else if (action === "remove" && slug) await sb.from("wishlists").delete().eq("user_id", user.id).eq("product_slug", slug);
      else if (action === "clear") await sb.from("wishlists").delete().eq("user_id", user.id);
    } catch { /* abaikan kegagalan sinkron */ }
    finally { syncing.current = false; }
  };

  const value = useMemo<Ctx>(() => ({
    ready: authReady, slugs, count: slugs.length, toast,
    has: (slug) => slugs.includes(slug),
    toggle: (slug) => {
      const willAdd = !slugs.includes(slug);
      setSlugMap((m) => {
        const cur = m[key] ?? [];
        const next = willAdd ? [slug, ...cur] : cur.filter((s) => s !== slug);
        return { ...m, [key]: next };
      });
      void syncToRemote(willAdd ? "add" : "remove", slug);
      setToast(willAdd ? "Ditambahkan ke favorit" : "Dihapus dari favorit");
    },
    remove: (slug) => {
      setSlugMap((m) => ({ ...m, [key]: (m[key] ?? []).filter((s) => s !== slug) }));
      void syncToRemote("remove", slug);
    },
    clear: () => {
      setSlugMap((m) => ({ ...m, [key]: [] }));
      void syncToRemote("clear");
    },
  }), [authReady, slugs, key, toast, user]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist harus dipakai di dalam WishlistProvider");
  return c;
};