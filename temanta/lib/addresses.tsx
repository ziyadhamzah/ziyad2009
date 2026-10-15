"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Address } from "@/lib/store";

export type SavedAddress = Address & { id: string; label?: string; primary?: boolean };

type Ctx = {
  ready: boolean;
  list: SavedAddress[];
  primary?: SavedAddress;
  add: (a: Omit<SavedAddress, "id">) => SavedAddress;
  update: (id: string, a: Partial<Address> & { label?: string }) => void;
  remove: (id: string) => void;
  setPrimary: (id: string) => void;
};

const AddressContext = createContext<Ctx | null>(null);
const KEY = "temanta.addresses.v1";

export function AddressProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<SavedAddress[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setList((JSON.parse(raw) as SavedAddress[]).slice(0, 8));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(list)); }, [list, ready]);

  const value = useMemo<Ctx>(() => ({
    ready, list,
    primary: list.find((a) => a.primary) ?? list[0],
    add: (a) => {
      const item: SavedAddress = { ...a, id: `addr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
      setList((prev) => {
        const next = [...prev, item].slice(0, 8);
        if (!next.some((x) => x.primary)) next[0] = { ...next[0], primary: true };
        return next;
      });
      return item;
    },
    update: (id, a) => setList((prev) => prev.map((x) => (x.id === id ? { ...x, ...a } : x))),
    remove: (id) => setList((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (next.length && !next.some((x) => x.primary)) next[0] = { ...next[0], primary: true };
      return next;
    }),
    setPrimary: (id) => setList((prev) => prev.map((x) => ({ ...x, primary: x.id === id }))),
  }), [ready, list]);

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}

export const useAddresses = () => {
  const c = useContext(AddressContext);
  if (!c) throw new Error("useAddresses harus dipakai di dalam AddressProvider");
  return c;
};

export const emptyAddress: Address = { name: "", phone: "", street: "", district: "", city: "", postal: "" };
