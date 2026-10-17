"use client";
import { useState } from "react";
import { useAddresses, SavedAddress } from "@/lib/addresses";
import type { Address } from "@/lib/store";

const input = "h-11 w-full rounded-sm border border-line bg-surface px-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-1 focus:ring-brand/30";
const btnBrand = "h-11 rounded-sm bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60";
const btnGhost = "h-11 rounded-sm border border-line bg-surface px-6 text-sm font-semibold text-ink transition hover:border-ink/40";

const fields: { key: keyof Address; label: string; wide?: boolean }[] = [
  { key: "name", label: "Nama penerima" },
  { key: "phone", label: "Nomor HP" },
  { key: "street", label: "Alamat lengkap", wide: true },
  { key: "district", label: "Kecamatan" },
  { key: "city", label: "Kota" },
  { key: "postal", label: "Kode pos" },
];

function validate(a: Address) {
  const e: Partial<Record<keyof Address, string>> = {};
  fields.forEach((f) => { if (!a[f.key].trim()) e[f.key] = "Wajib diisi"; });
  if (a.phone && !/^(\+62|62|0)8\d{7,12}$/.test(a.phone.replace(/\s|-/g, ""))) e.phone = "Format nomor HP belum benar";
  if (a.postal && !/^\d{5}$/.test(a.postal)) e.postal = "Kode pos 5 digit";
  return e;
}

const blank: Address = { name: "", phone: "", street: "", district: "", city: "", postal: "" };

export default function AddressBook() {
  const { ready, list, add, update, remove, setPrimary } = useAddresses();
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Address>(blank);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const startAdd = () => { setEditingId(null); setForm(blank); setErrors({}); setMode("form"); };
  const startEdit = (a: SavedAddress) => {
    setEditingId(a.id);
    setForm({ name: a.name, phone: a.phone, street: a.street, district: a.district, city: a.city, postal: a.postal });
    setErrors({});
    setMode("form");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    setErrors(err);
    if (Object.keys(err).length) return;
    if (editingId) update(editingId, form);
    else add({ ...form, primary: list.length === 0 });
    setMode("list");
  };

  if (!ready) return <p className="text-sm text-muted">Memuat buku alamat…</p>;

  if (mode === "form") {
    return (
      <form onSubmit={submit} className="mt-6 max-w-xl">
        <p className="mb-4 text-sm font-semibold text-ink">{editingId ? "Ubah alamat" : "Alamat baru"}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <span className="mb-1.5 block text-[13px] text-ink/70">{f.label}</span>
              <input value={form[f.key]} onChange={(e) => setForm((v) => ({ ...v, [f.key]: e.target.value }))}
                inputMode={f.key === "phone" || f.key === "postal" ? "numeric" : undefined}
                className={`${input} ${errors[f.key] ? "border-danger-fg" : ""}`} />
              {errors[f.key] && <span className="mt-1 block text-xs text-danger-fg">{errors[f.key]}</span>}
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          <button type="submit" className={btnBrand}>{editingId ? "Simpan perubahan" : "Simpan alamat"}</button>
          <button type="button" onClick={() => setMode("list")} className={btnGhost}>Batal</button>
        </div>
      </form>
    );
  }

  if (!list.length) {
    return (
      <div className="mt-6">
        <p className="text-sm text-muted">Belum ada alamat tersimpan.               Tambahkan alamat agar belanja lebih cepat.</p>
        <button type="button" onClick={startAdd} className={`${btnBrand} mt-4`}>+ Tambah alamat</button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{list.length} alamat tersimpan</p>
        <button type="button" onClick={startAdd} className="text-sm font-semibold text-brand-ontint hover:underline">+ Tambah alamat</button>
      </div>

      <div className="mt-3 space-y-3">
        {list.map((a) => (
          <div key={a.id} className={`rounded-sm border p-4 ${a.primary ? "border-brand bg-brand-light/50" : "border-line bg-surface"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{a.name}</span>
              <span className="text-sm text-muted">{a.phone}</span>
              {a.primary && <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">Utama</span>}
            </div>
            <p className="mt-1 text-sm text-ink/80">{a.street}, {a.district}, {a.city} {a.postal}</p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold">
              {!a.primary && (
                <button type="button" onClick={() => setPrimary(a.id)} className="text-brand-ontint hover:underline">Jadikan utama</button>
              )}
              <button type="button" onClick={() => startEdit(a)} className="text-ink/70 hover:text-brand-ontint">Ubah</button>
              <button type="button" onClick={() => remove(a.id)} className="text-ink/70 hover:text-danger-fg">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
