"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { getProduct } from "./products";
import { useAuth } from "./auth";
import { getSupabase } from "./supabase";

export type CartLine = { key: string; slug: string; name: string; price: number; qty: number; variant?: string; tone: string };
type Ctx = {
  lines: CartLine[]; count: number; subtotal: number; toast: string | null;
  add: (l: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void; remove: (key: string) => void; clear: () => void;
  selected: string[]; toggleSel: (key: string) => void; selectAll: (on: boolean) => void;
  selectOnly: (key: string) => void;
  selectedLines: CartLine[]; selectedSubtotal: number; removeKeys: (keys: string[]) => void;
};
const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "temanta.cart.v1";
const lineKey = (slug: string, variant?: string) => `${slug}:${variant ?? ""}`;
const clampQty = (slug: string, qty: number) => Math.max(1, Math.min(getProduct(slug)?.stock ?? 999, qty));

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setLines(JSON.parse(raw) as CartLine[]); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); }, [lines, ready]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    setSelected((prev) => {
      const keys = lines.map((l) => l.key);
      const next = prev.filter((k) => keys.includes(k));
      return next.length === 0 && keys.length ? keys : next;
    });
  }, [lines]);

  // Muat keranjang dari Supabase bila aktif (env diisi) & pengguna sudah masuk.
  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !authReady || !user) { setDbReady(false); return; }
    let live = true;
    (async () => {
      try {
        const { data: cart } = await sb.from("carts").select("id").eq("user_id", user.id).maybeSingle();
        if (!live) return;
        if (cart) {
          const { data: items } = await sb.from("cart_items")
            .select("qty, products(slug, name, price), product_variants(label)")
            .eq("cart_id", cart.id);
          const mapped = (items ?? []).map((it): CartLine | null => {
            const row = it as unknown as { qty: number; products: { slug: string; name: string; price: number } | null; product_variants: { label: string } | null };
            const slug = row.products?.slug ?? "";
            if (!slug) return null;
            const p = getProduct(slug);
            const variant = row.product_variants?.label ?? undefined;
            return {
              key: lineKey(slug, variant), slug, name: p?.name ?? row.products?.name ?? "",
              price: p?.price ?? row.products?.price ?? 0, qty: Math.max(1, row.qty),
              variant, tone: p?.tone ?? "",
            };
          }).filter((x): x is CartLine => Boolean(x));
          if (live && mapped.length) setLines(mapped);
        }
      } catch {}
      if (live) { hydrated.current = true; setDbReady(true); }
    })();
    return () => { live = false; };
  }, [authReady, user]);

  // Simpan perubahan keranjang ke Supabase (ganti seluruh isi keranjang pengguna).
  useEffect(() => {
    if (!dbReady || !user || !hydrated.current) return;
    const sb = getSupabase();
    if (!sb) return;
    const snapshot = lines;
    (async () => {
      try {
        let { data: cart } = await sb.from("carts").select("id").eq("user_id", user.id).maybeSingle();
        if (!cart) {
          const { data } = await sb.from("carts").insert({ user_id: user.id }).select("id").single();
          cart = data;
        }
        if (!cart) return;
        await sb.from("cart_items").delete().eq("cart_id", cart.id);
        if (!snapshot.length) return;
        const slugs = [...new Set(snapshot.map((l) => l.slug))];
        const { data: prods } = await sb.from("products").select("id, slug").in("slug", slugs);
        const idBySlug = new Map((prods ?? []).map((p) => [(p as { slug: string }).slug, (p as { id: string }).id]));
        const rows: { cart_id: string; product_id: string; variant_id: string | null; qty: number }[] = [];
        for (const l of snapshot) {
          const pid = idBySlug.get(l.slug);
          if (!pid) continue;
          let vid: string | null = null;
          if (l.variant) {
            const { data: v } = await sb.from("product_variants").select("id").eq("product_id", pid).eq("label", l.variant).maybeSingle();
            vid = (v as { id: string } | null)?.id ?? null;
          }
          rows.push({ cart_id: cart.id, product_id: pid, variant_id: vid, qty: l.qty });
        }
        if (rows.length) await sb.from("cart_items").insert(rows);
      } catch {}
    })();
  }, [lines, dbReady, user]);

  const value = useMemo<Ctx>(() => ({
    lines, toast, selected,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
    selectedLines: lines.filter((l) => selected.includes(l.key)),
    selectedSubtotal: lines.filter((l) => selected.includes(l.key)).reduce((n, l) => n + l.qty * l.price, 0),
    toggleSel: (key) => setSelected((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key])),
    selectAll: (on) => setSelected(on ? lines.map((l) => l.key) : []),
    selectOnly: (key) => setSelected([key]),
    add: (l, qty = 1) => {
      const key = lineKey(l.slug, l.variant);
      setLines((prev) => prev.some((x) => x.key === key)
        ? prev.map((x) => (x.key === key ? { ...x, qty: clampQty(l.slug, x.qty + qty) } : x))
        : [...prev, { ...l, key, qty: clampQty(l.slug, qty) }]);
      setSelected((p) => (p.includes(key) ? p : [...p, key]));
      setToast(`${l.name} masuk keranjang`);
    },
    setQty: (key, qty) => setLines((p) => p.map((x) => (x.key === key ? { ...x, qty: clampQty(x.slug, qty) } : x))),
    remove: (key) => { setLines((p) => p.filter((x) => x.key !== key)); setToast("Produk dihapus dari keranjang"); },
    removeKeys: (keys) => setLines((p) => p.filter((x) => !keys.includes(x.key))),
    clear: () => setLines([]),
  }), [lines, selected, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart harus dipakai di dalam CartProvider");
  return c;
};
