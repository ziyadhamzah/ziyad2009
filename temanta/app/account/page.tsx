"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useWishlist } from "@/lib/wishlist";
import { rupiah } from "@/lib/format";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import AddressBook from "@/components/AddressBook";

const input = "h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30";
const btnBrand = "h-11 rounded-sm bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-dark active:brightness-95 disabled:opacity-60";
const btnGhost = "h-11 rounded-sm border border-line bg-surface px-6 text-sm font-semibold text-ink transition hover:border-ink/40";

type Tab = "profil" | "sandi" | "alamat";

export default function AccountPage() {
  const router = useRouter();
  const { user, ready: authReady, updateProfile, changePassword, logout } = useAuth();
  const { ready: storeReady, orders } = useStore();
  const { count: favCount } = useWishlist();
  const [tab, setTab] = useState<Tab>("profil");
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<"profile" | "password" | null>(null);

  useEffect(() => { if (authReady && !user) router.replace("/login?next=/account"); }, [authReady, user, router]);
  useEffect(() => { if (user) setProfile({ name: user.name, phone: user.phone }); }, [user]);

  if (!authReady || !user) return <p className="shell py-24 text-muted">Memuat akun…</p>;

  const mine = storeReady ? orders.filter((o) => !o.customer || o.customer.email === user.email) : [];
  const active = mine.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
  const spent = mine.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy("profile");
    const err = await updateProfile(profile);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Profil berhasil disimpan." });
    setBusy(null);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (pw.next !== pw.confirm) return setMsg({ ok: false, text: "Konfirmasi kata sandi baru tidak cocok." });
    setBusy("password");
    const err = await changePassword(pw.current, pw.next);
    if (err) { setMsg({ ok: false, text: err }); setBusy(null); return; }
    setPw({ current: "", next: "", confirm: "" });
    setMsg({ ok: true, text: "Kata sandi berhasil diubah." });
    setBusy(null);
  };

  return (
    <div className="bg-paper">
      <div className="shell py-8">
        <nav className="mb-4 text-sm text-muted">
          <Link href="/" className="hover:text-brand-ontint">Beranda</Link> <span className="mx-1">›</span> <span className="text-ink">Akun saya</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* kartu samping */}
          <aside className="h-fit rounded-sm bg-surface shadow-card">
            <div className="flex items-center gap-3 border-b border-line p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-line border-b border-line text-center">
              <div className="p-4">
                <p className="text-xl font-bold text-brand-ontint">{active}</p>
                <p className="text-xs text-muted">pesanan aktif</p>
              </div>
              <div className="p-4">
                <p className="text-xl font-bold text-brand-ontint">{rupiah(spent)}</p>
                <p className="text-xs text-muted">total belanja</p>
              </div>
            </div>

            <nav className="p-2 text-sm">
              {([
                ["profil", "Profil saya", <path key="a" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />, <circle key="b" cx="12" cy="7" r="4" />],
                ["sandi", "Ganti kata sandi", <path key="a" d="M21 2l-2 2m-7.6 7.6a5 5 0 1 1-7.1 7.1 5 5 0 0 1 7.1-7.1zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3" />, null],
                ["alamat", "Alamat saya", <path key="a" d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />, <circle key="b" cx="12" cy="10" r="3" />],
              ] as const).map(([id, label, p1, p2]) => (
                <button key={id} onClick={() => { setTab(id); setMsg(null); }}
                  className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition ${tab === id ? "bg-brand-light font-semibold text-brand-ontint" : "text-ink/75 hover:bg-paper"}`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{p1}{p2}</svg>
                  {label}
                </button>
              ))}
              <Link href="/orders" className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-ink/75 transition hover:bg-paper">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /></svg>
                Pesanan saya
              </Link>
              <Link href="/wishlist" className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-ink/75 transition hover:bg-paper">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                Favorit saya {favCount > 0 && <span className="ml-auto rounded-sm bg-brand-light px-1.5 text-xs font-semibold text-brand-ontint">{favCount}</span>}
              </Link>
              <Link href="/chat" className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-ink/75 transition hover:bg-paper">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1-4.2a8.4 8.4 0 0 1-.9-3.9A8.4 8.4 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5z" /></svg>
                Chat penjual
              </Link>
              <Link href="/cart" className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-ink/75 transition hover:bg-paper">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></svg>
                Keranjang saya
              </Link>
              <button onClick={() => { logout(); router.push("/"); }}
                className="flex w-full items-center gap-3 rounded-sm border-t border-line px-3 py-2.5 text-left text-ink/75 transition hover:bg-paper hover:text-brand-ontint">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                Keluar
              </button>
            </nav>
          </aside>

          {/* konten kanan */}
          <section className="rounded-sm bg-surface p-6 shadow-card sm:p-8">
            <h1 className="text-xl font-bold">{tab === "profil" ? "Profil saya" : tab === "alamat" ? "Alamat saya" : "Ganti kata sandi"}</h1>
            <p className="mt-1 text-sm text-muted">
              {tab === "profil"
                ? "Perbarui nama dan nomor HP yang dipakai untuk pesanan."
                : tab === "alamat"
                  ? "Kelola alamat pengiriman supaya belanja lebih cepat."
                  : "Pilih kata sandi yang belum pernah dipakai di situs lain."}
            </p>

            {msg && (
              <p className={`mt-4 rounded-sm px-3 py-2 text-sm ${msg.ok ? "bg-ok-bg text-ok-fg" : "bg-danger-bg text-danger-fg"}`}>{msg.text}</p>
            )}

            {tab === "profil" ? (
              <form onSubmit={saveProfile} className="mt-6 max-w-md space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Nama lengkap</span>
                  <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} autoComplete="name" className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Email</span>
                  <input value={user.email} disabled className={`${input} cursor-not-allowed bg-paper text-muted`} />
                  <span className="mt-1 block text-xs text-muted">Email tidak dapat diubah.</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Nomor HP</span>
                  <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} inputMode="numeric" autoComplete="tel" placeholder="08xxxxxxxxxx" className={input} />
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={busy === "profile"} className={btnBrand}>{busy === "profile" ? "Menyimpan…" : "Simpan perubahan"}</button>
                  <button type="button" onClick={() => { setProfile({ name: user.name, phone: user.phone }); setMsg(null); }} className={btnGhost}>Batal</button>
                </div>
              </form>
            ) : tab === "alamat" ? (
              <AddressBook />
            ) : (
              <form onSubmit={savePassword} className="mt-6 max-w-md space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Kata sandi saat ini</span>
                  <input value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} type="password" autoComplete="current-password" className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Kata sandi baru</span>
                  <input value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} type="password" autoComplete="new-password" placeholder="Minimal 6 karakter" className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[13px] text-ink/70">Ulangi kata sandi baru</span>
                  <input value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} type="password" autoComplete="new-password" className={input} />
                </label>
                <div className="pt-2">
                  <button type="submit" disabled={busy === "password"} className={btnBrand}>{busy === "password" ? "Menyimpan…" : "Ubah kata sandi"}</button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* pesanan terbaru */}
        {mine.length > 0 && (
          <section className="mt-6 rounded-sm bg-surface p-6 shadow-card sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Pesanan terbaru</h2>
              <Link href="/orders" className="text-sm font-semibold text-brand-ontint hover:underline">Lihat semua</Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {mine.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand-ontint">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{o.number}</p>
                      <p className="truncate text-xs text-muted">{new Date(o.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })} · {o.lines[0].name}{o.lines.length > 1 ? ` +${o.lines.length - 1} lain` : ""}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="text-sm font-bold">{rupiah(o.total)}</span>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
