"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

const input = "h-12 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30";
const btnBrand = "h-12 w-full rounded-sm bg-brand text-base font-semibold text-white transition hover:bg-brand-dark active:brightness-95 disabled:opacity-60";
const btnSocial = "flex h-11 w-full items-center justify-center gap-2.5 rounded-sm border border-line bg-surface text-sm font-medium text-ink transition hover:border-ink/40 hover:bg-paper";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="shell py-24 text-muted">Memuat…</p>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) router.replace(next); }, [user, next, router]);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = mode === "login" ? await login(form.email, form.password) : await register(form);
    setBusy(false);
    if (err) setError(err);
    else router.push(next);
  };

  const switchMode = (m: "login" | "register") => { setMode(m); setError(""); };

  return (
    <div className="min-h-[calc(100vh-180px)] bg-paper">
      <div className="border-b border-line bg-surface">
        <div className="shell flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span className="text-xl font-black tracking-tight text-brand-ontint">Temanta</span>
          </Link>
          <p className="text-sm text-muted">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")} className="font-semibold text-brand-ontint hover:underline">
              {mode === "login" ? "Daftar" : "Masuk"}
            </button>
          </p>
        </div>
      </div>

      <div className="shell grid gap-8 py-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-14">
        {/* panel kiri: ilustrasi gradien oranye */}
        <div className="relative hidden overflow-hidden rounded-lg bg-gradient-to-br from-brand to-brand-dark px-10 py-12 text-white lg:block">
          <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-surface/10" />
          <span className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-surface/10" />
          <div className="relative">
            <p className="text-4xl font-black leading-tight">Belanja kebutuhan<br />rumah jadi mudah.</p>
            <p className="mt-4 max-w-sm text-white/85">Masuk untuk nikmati gratis ongkir, harga promo produk pilihan, dan simpan semua pesananmu dalam satu akun.</p>

            <svg viewBox="0 0 320 180" className="mt-10 w-full max-w-sm" fill="none" aria-hidden>
              <rect x="24" y="70" width="96" height="76" rx="6" fill="white" fillOpacity=".16" stroke="white" strokeOpacity=".7" strokeWidth="2.5" />
              <path d="M24 86h96M48 70V54a24 24 0 0 1 48 0v16" stroke="white" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="140" y="46" width="72" height="72" rx="6" fill="white" fillOpacity=".22" stroke="white" strokeOpacity=".8" strokeWidth="2.5" />
              <path d="M176 46v72M140 82h72" stroke="white" strokeOpacity=".8" strokeWidth="2.5" />
              <path d="M232 66h56l-8 44a10 10 0 0 1-10 8h-22a10 10 0 0 1-10-8z" fill="white" fillOpacity=".2" stroke="white" strokeOpacity=".8" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="248" cy="132" r="7" fill="white" stroke="white" strokeOpacity=".8" strokeWidth="2.5" />
              <circle cx="276" cy="132" r="7" fill="white" stroke="white" strokeOpacity=".8" strokeWidth="2.5" />
              <path d="M244 78v22M262 78v22M276 78v22" stroke="white" strokeOpacity=".65" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            <ul className="mt-8 space-y-3 text-sm text-white/90">
              {["Gratis ongkir min. Rp500.000", "Harga promo untuk produk pilihan", "Bayar aman: QRIS, transfer bank, e-wallet"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface/25">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* kartu form kanan */}
        <div className="mx-auto w-full max-w-[400px] rounded-sm bg-surface p-6 shadow-card sm:p-8">
          <div role="tablist" aria-label="Mode masuk atau daftar" className="flex gap-6 border-b border-line text-[15px] font-semibold">
            {(["login", "register"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}
                className={`-mb-px border-b-2 pb-3 transition ${mode === m ? "border-brand text-brand-ontint" : "border-transparent text-muted hover:text-ink"}`}>
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-[13px] text-ink/70">Nama lengkap</span>
                <input value={form.name} onChange={set("name")} autoComplete="name" placeholder="Nama Anda" className={input} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-ink/70">Email</span>
              <input value={form.email} onChange={set("email")} type="email" autoComplete="email" placeholder="contoh@email.com" className={input} />
            </label>
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-[13px] text-ink/70">Nomor HP</span>
                <input value={form.phone} onChange={set("phone")} inputMode="numeric" autoComplete="tel" placeholder="08xxxxxxxxxx" className={input} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-ink/70">Kata sandi</span>
              <span className="relative block">
                <input value={form.password} onChange={set("password")} type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Minimal 6 karakter" className={`${input} pr-20`} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-brand-ontint">
                  {show ? "Sembunyikan" : "Tampilkan"}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink/70">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-brand" />
                Ingat saya
              </label>
              {mode === "login" && <button type="button" onClick={() => setError("Fitur reset kata sandi belum tersedia di demo ini.")} className="text-[13px] font-medium text-brand-ontint hover:underline">Lupa kata sandi?</button>}
            </div>

            {error && <p className="rounded-sm bg-danger-bg px-3 py-2 text-sm text-danger-fg">{error}</p>}

            <button type="submit" disabled={busy} className={btnBrand}>{mode === "login" ? "MASUK" : "DAFTAR"}</button>
          </form>

          <div className="my-5 flex items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">atau</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => setError("Masuk dengan Google belum tersedia di demo ini.")} className={btnSocial}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-6-2.1-7-5.1L1.2 17C3.1 21.3 7.2 24 12 24z" /><path fill="#FBBC05" d="M5 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.2 6.7C.4 8.3 0 10.1 0 12s.4 3.7 1.2 5.3z" /><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.2 0 3.1 2.7 1.2 6.7l3.8 3C6 6.7 8.8 4.7 12 4.7z" /></svg>
              Lanjutkan dengan Google
            </button>
            <button type="button" onClick={() => setError("Masuk dengan Facebook belum tersedia di demo ini.")} className={btnSocial}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#1877F2" aria-hidden><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" /></svg>
              Lanjutkan dengan Facebook
            </button>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")} className="font-semibold text-brand-ontint hover:underline">
              {mode === "login" ? "Daftar sekarang" : "Masuk"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
