"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { onNotify, NotificationItem } from "./events";

type Ctx = {
  ready: boolean; list: NotificationItem[]; unread: number;
  markRead: (id: string) => void; markAllRead: () => void; clear: () => void;
};
const NotifyContext = createContext<Ctx | null>(null);
const KEY = "temanta.notify.v1";
const MAX = 30;

export function NotifyProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [store, setStore] = useState<Record<string, NotificationItem[]>>({});
  const key = user?.email ?? "guest";
  const list = store[key] ?? [];

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setStore(JSON.parse(raw) as Record<string, NotificationItem[]>); } catch {}
  }, [key]);

  useEffect(() => {
    const off = onNotify((e) => {
      const n = e.payload;
      setStore((s) => {
        const cur = s[key] ?? [];
        if (cur.some((x) => x.id === n.id)) return s;
        return { ...s, [key]: [n, ...cur].slice(0, MAX) };
      });
    });
    return off;
  }, [key]);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
  }, [store]);

  const value = useMemo<Ctx>(() => ({
    ready: authReady,
    list,
    unread: list.filter((n) => !n.read).length,
    markRead: (id) => setStore((s) => ({ ...s, [key]: (s[key] ?? []).map((n) => n.id === id ? { ...n, read: true } : n) })),
    markAllRead: () => setStore((s) => ({ ...s, [key]: (s[key] ?? []).map((n) => ({ ...n, read: true })) })),
    clear: () => setStore((s) => ({ ...s, [key]: [] })),
  }), [authReady, list, key]);

  return <NotifyContext.Provider value={value}>{children}</NotifyContext.Provider>;
}
export const useNotifications = () => {
  const c = useContext(NotifyContext);
  if (!c) throw new Error("useNotifications harus dipakai di dalam NotifyProvider");
  return c;
};