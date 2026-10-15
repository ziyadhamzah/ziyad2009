"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Ctx = {
  ready: boolean; slugs: string[]; count: number; max: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  toast: string | null;
};
const CompareContext = createContext<Ctx | null>(null);
const KEY = "temanta.compare.v1";
const MAX = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSlugs((JSON.parse(raw) as string[]).slice(0, MAX)); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(slugs)); }, [slugs, ready]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2000); return () => clearTimeout(t); }, [toast]);

  const value = useMemo<Ctx>(() => ({
    ready, slugs, count: slugs.length, max: MAX, toast,
    has: (slug) => slugs.includes(slug),
    toggle: (slug) => {
      setSlugs((prev) => {
        if (prev.includes(slug)) { setToast("Dihapus dari perbandingan"); return prev.filter((s) => s !== slug); }
        if (prev.length >= MAX) { setToast(`Maksimal ${MAX} produk`); return prev; }
        setToast("Ditambahkan ke perbandingan");
        return [...prev, slug];
      });
    },
    remove: (slug) => setSlugs((prev) => prev.filter((s) => s !== slug)),
    clear: () => setSlugs([]),
  }), [ready, slugs, toast]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export const useCompare = () => {
  const c = useContext(CompareContext);
  if (!c) throw new Error("useCompare harus dipakai di dalam CompareProvider");
  return c;
};
