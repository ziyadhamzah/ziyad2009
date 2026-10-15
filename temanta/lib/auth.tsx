"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type PublicUser = { id: string; name: string; email: string; phone: string; isAdmin?: boolean };
type StoredUser = PublicUser & { passHash: string; createdAt: string };

type Ctx = {
  ready: boolean; user: PublicUser | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (d: { name: string; email: string; phone: string; password: string }) => Promise<string | null>;
  updateProfile: (p: { name?: string; phone?: string }) => Promise<string | null>;
  changePassword: (current: string, next: string) => Promise<string | null>;
  logout: () => void;
};
const AuthContext = createContext<Ctx | null>(null);
const USERS_KEY = "temanta.users.v1", SESSION_KEY = "temanta.session.v1";

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}
export const normEmail = (e: string) => e.trim().toLowerCase();
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const phoneOk = (p: string) => /^(\+62|62|0)8\d{7,12}$/.test(p.replace(/[\s-]/g, ""));

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[]; } catch { return []; }
}
function writeUsers(u: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function toPublic(u: StoredUser): PublicUser {
  // Mode fallback lokal (tanpa Supabase): seluruh backend adalah sandbox demo,
  // sehingga panel simulasi status admin ditampilkan untuk menguji alur lengkap.
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, isAdmin: true };
}

async function profileOf(sb: NonNullable<ReturnType<typeof getSupabase>>, u: SupabaseUser): Promise<PublicUser> {
  const email = normEmail(u.email ?? "");
  const meta = (u.user_metadata ?? {}) as { name?: string; phone?: string };
  const { data } = await sb.from("profiles").select("full_name, phone, is_admin").eq("id", u.id).maybeSingle();
  if (!data) {
    await sb.from("profiles").upsert({ id: u.id, full_name: meta.name ?? "", phone: meta.phone ?? "" });
    return { id: u.id, name: meta.name ?? email.split("@")[0], email, phone: meta.phone ?? "", isAdmin: false };
  }
  return {
    id: u.id, name: data.full_name || meta.name || email.split("@")[0], email,
    phone: data.phone || meta.phone || "", isAdmin: data.is_admin ?? false,
  };
}

function keepSession(pub: PublicUser) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(pub)); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sb = getSupabase();
    if (sb) {
      let live = true;
      sb.auth.getSession().then(async ({ data }) => {
        if (!live) return;
        if (data.session?.user) setUser(await profileOf(sb, data.session.user));
        setReady(true);
      });
      const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
        if (session?.user) profileOf(sb, session.user).then(setUser);
        else setUser(null);
      });
      return () => { live = false; sub.subscription.unsubscribe(); };
    }
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as PublicUser);
    } catch {}
    setReady(true);
  }, []);

  const value = useMemo<Ctx>(() => ({
    ready, user,
    login: async (email, password) => {
      const key = normEmail(email);
      const sb = getSupabase();
      if (sb) {
        const { error } = await sb.auth.signInWithPassword({ email: key, password });
        if (error) return "Email atau kata sandi salah.";
        const { data } = await sb.auth.getUser();
        if (data.user) setUser(await profileOf(sb, data.user));
        return null;
      }
      const u = readUsers().find((x) => x.email === key);
      if (!u || u.passHash !== hash(`${key}::${password}`)) return "Email atau kata sandi salah.";
      const pub = toPublic(u);
      setUser(pub);
      keepSession(pub);
      return null;
    },
    register: async ({ name, email, phone, password }) => {
      if (name.trim().length < 2) return "Nama minimal 2 karakter.";
      if (!emailOk(email)) return "Format email belum benar.";
      if (!phoneOk(phone)) return "Format nomor HP belum benar (contoh: 081234567890).";
      if (password.length < 6) return "Kata sandi minimal 6 karakter.";
      const key = normEmail(email);
      const cleanPhone = phone.replace(/[\s-]/g, "");
      const sb = getSupabase();
      if (sb) {
        const { data, error } = await sb.auth.signUp({ email: key, password, options: { data: { name: name.trim(), phone: cleanPhone } } });
        if (error) return error.message === "User already registered" ? "Email ini sudah terdaftar. Silakan masuk." : error.message;
        if (data.user) await sb.from("profiles").upsert({ id: data.user.id, full_name: name.trim(), phone: cleanPhone });
        if (data.session && data.user) { setUser(await profileOf(sb, data.user)); return null; }
        const { error: si } = await sb.auth.signInWithPassword({ email: key, password });
        if (!si) { const { data: g } = await sb.auth.getUser(); if (g.user) setUser(await profileOf(sb, g.user)); return null; }
        return "Pendaftaran berhasil. Cek email Anda untuk konfirmasi, lalu masuk.";
      }
      const users = readUsers();
      if (users.some((x) => x.email === key)) return "Email ini sudah terdaftar. Silakan masuk.";
      const u: StoredUser = {
        id: crypto.randomUUID(), name: name.trim(), email: key, phone: cleanPhone,
        passHash: hash(`${key}::${password}`), createdAt: new Date().toISOString(),
      };
      users.push(u);
      try { writeUsers(users); } catch { return "Penyimpanan browser penuh."; }
      const pub = toPublic(u);
      setUser(pub);
      keepSession(pub);
      return null;
    },
    updateProfile: async ({ name, phone }) => {
      if (!user) return "Silakan masuk terlebih dahulu.";
      if (name !== undefined && name.trim().length < 2) return "Nama minimal 2 karakter.";
      if (phone !== undefined && !phoneOk(phone)) return "Format nomor HP belum benar (contoh: 081234567890).";
      const sb = getSupabase();
      if (sb) {
        const patch: Record<string, string> = {};
        if (name !== undefined) patch.full_name = name.trim();
        if (phone !== undefined) patch.phone = phone.replace(/[\s-]/g, "");
        const { error } = await sb.from("profiles").update(patch).eq("id", user.id);
        if (error) return error.message;
        const pub = { ...user, ...(name !== undefined ? { name: name.trim() } : {}), ...(phone !== undefined ? { phone: patch.phone } : {}) };
        setUser(pub);
        keepSession(pub);
        return null;
      }
      const users = readUsers();
      const i = users.findIndex((x) => x.email === user.email);
      if (i < 0) return "Akun tidak ditemukan.";
      if (name !== undefined) users[i].name = name.trim();
      if (phone !== undefined) users[i].phone = phone.replace(/[\s-]/g, "");
      try { writeUsers(users); } catch { return "Penyimpanan browser penuh."; }
      const pub = toPublic(users[i]);
      setUser(pub);
      keepSession(pub);
      return null;
    },
    changePassword: async (current, next) => {
      if (!user) return "Silakan masuk terlebih dahulu.";
      if (next.length < 6) return "Kata sandi baru minimal 6 karakter.";
      const sb = getSupabase();
      if (sb) {
        const { error: verify } = await sb.auth.signInWithPassword({ email: user.email, password: current });
        if (verify) return "Kata sandi saat ini salah.";
        const { error } = await sb.auth.updateUser({ password: next });
        return error ? error.message : null;
      }
      const users = readUsers();
      const i = users.findIndex((x) => x.email === user.email);
      if (i < 0) return "Akun tidak ditemukan.";
      if (users[i].passHash !== hash(`${user.email}::${current}`)) return "Kata sandi saat ini salah.";
      users[i].passHash = hash(`${user.email}::${next}`);
      try { writeUsers(users); } catch { return "Penyimpanan browser penuh."; }
      return null;
    },
    logout: () => {
      setUser(null);
      try { localStorage.removeItem(SESSION_KEY); } catch {}
      getSupabase()?.auth.signOut().catch(() => {});
    },
  }), [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return c;
};
