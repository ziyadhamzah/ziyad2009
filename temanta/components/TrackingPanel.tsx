"use client";
import { useEffect, useRef, useState } from "react";
import { Order } from "@/lib/store";
import { trackingEvents, resiOf, etaOf, etaDate, headlineOf, STAGES, stageIndex } from "@/lib/tracking";
import { cityCoord } from "@/lib/geo";
import DeliveryMap from "./DeliveryMap";

const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

const courierLogo: Record<string, string> = { JNE: "bg-[#e4002b]", "J&T": "bg-[#e4002b]", SiCepat: "bg-[#ff0000]" };

export default function TrackingPanel({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const events = trackingEvents(order);
  const resi = resiOf(order);
  const eta = etaOf(order);
  const etaWhen = etaDate(order);
  const stage = stageIndex(order);
  const delivered = order.status === "delivered";
  const cancelled = order.status === "cancelled";

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(resi); setCopied(true); if (copyTimer.current) clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 1600); } catch {}
  };

  return (
    <section className="mt-8 overflow-hidden rounded-sm bg-surface shadow-card">
      <header className={`px-5 py-4 sm:px-6 ${cancelled ? "bg-paper text-ink" : delivered ? "bg-[#15803d] text-white" : "bg-gradient-to-r from-brand-700 to-brand-deep text-white"}`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cancelled || delivered ? "bg-surface/90 text-brand-ontint" : "bg-surface/20"}`}>
            {cancelled ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="1.8" /><circle cx="17.5" cy="18.5" r="1.8" /></svg>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight">{headlineOf[order.status]}</p>
            {!cancelled && <p className={`text-sm ${delivered ? "text-white/90" : "text-white/85"}`}>{delivered ? "Paket diterima oleh penerima." : etaWhen ? `Perkiraan tiba ${etaWhen} · ${order.courier} ${order.shippingMethod}` : `Perkiraan tiba ${eta} · ${order.courier} ${order.shippingMethod}`}</p>}
          </div>
        </div>
      </header>

      {!cancelled && stage >= 0 && (
        <ol className="flex items-center border-b border-line px-5 py-4 sm:px-6">
          {STAGES.map((s, i) => {
            const done = i <= stage;
            const current = i === stage;
            return (
              <li key={s.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${done ? "bg-brand text-white" : "border-2 border-line bg-surface text-muted"}`}>
                    {done && !current ? (
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12 5 5L20 7" /></svg>
                    ) : i + 1}
                  </span>
                  <span className={`whitespace-nowrap text-[11px] ${current ? "font-semibold text-brand-ontint" : done ? "text-ink" : "text-muted"}`}>{s.label}</span>
                </div>
                {i < STAGES.length - 1 && <span className={`mx-1 mb-4 h-0.5 flex-1 rounded ${i < stage ? "bg-brand" : "bg-line"}`} aria-hidden />}
              </li>
            );
          })}
        </ol>
      )}

      {!cancelled && (
        <div className="border-b border-line">
          <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3z" /><path d="M9 7v13M15 4v13" /></svg>
              Posisi paket
            </p>
            <span className="truncate text-xs text-muted">Tujuan: {cityCoord(order.address.city).label}</span>
          </div>
          <div className="relative z-0 mt-3 h-[300px] w-full overflow-hidden border-t border-line sm:h-[340px]">
            <DeliveryMap order={order} />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 text-xs text-muted sm:px-6">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-inverse" />Gudang asal</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" />Paket / tujuan</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-brand" />Sudah dilalui</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 rounded bg-line [background-image:repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_7px)] text-muted" />Belum dilalui</span>
            <span className="ml-auto hidden sm:inline">Peta &copy; OpenStreetMap</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line px-5 py-4 text-sm sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-9 w-9 items-center justify-center rounded-sm text-xs font-black text-white ${courierLogo[order.courier] ?? "bg-inverse"}`}>{order.courier.slice(0, 4)}</span>
          <span><span className="block text-xs text-muted">Kurir</span><span className="font-medium">{order.courier} {order.shippingMethod}</span></span>
        </div>
        <div>
          <span className="block text-xs text-muted">Nomor resi</span>
          <button onClick={copy} className="group flex items-center gap-2 font-mono font-semibold text-ink hover:text-brand-ontint" title="Salin nomor resi">
            {resi}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted group-hover:text-brand-ontint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            {copied && <span className="font-sans text-xs font-medium text-brand-ontint">Tersalin</span>}
          </button>
        </div>
        <div>
          <span className="block text-xs text-muted">Penerima</span>
          <span className="font-medium">{order.address.name}</span>
        </div>
      </div>

      <ol className="px-5 py-5 sm:px-6">
        {events.slice().reverse().map((e, i) => (
          <li key={`${e.at}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" aria-hidden />}
            <span className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 ${i === 0 && !cancelled ? "border-brand bg-brand" : "border-line bg-surface"}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={`text-sm leading-snug ${i === 0 ? "font-semibold text-ink" : "text-ink/75"}`}>{e.label}</p>
              <p className="mt-0.5 text-xs text-muted">{e.place} · {fmt(e.at)}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="border-t border-line px-5 py-3 text-xs text-muted sm:px-6">Riwayat pelacakan disimulasikan untuk demo (belum terhubung sistem kurir).</p>
    </section>
  );
}
