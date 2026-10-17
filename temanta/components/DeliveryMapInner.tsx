"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMap } from "react-leaflet";
import { ORIGIN, ORIGIN_LABEL, cityCoord, deliveryProgress, routeBetween, pointAt, haversineKm, bearingDeg, type LatLng } from "@/lib/geo";
import type { Order } from "@/lib/store";
import { useTheme } from "@/lib/theme";

function makeIcons(dark: boolean) {
  const plate = dark ? "#3f3f46" : "#111111";
  const warehouseIcon = L.divIcon({
    className: "",
    html: `<div style="width:38px;height:38px;border-radius:9999px;background:${plate};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-7h6v7"/></svg></div>`,
    iconSize: [38, 38], iconAnchor: [19, 19],
  });

  const destIcon = L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))"><svg width="34" height="34" viewBox="0 0 24 24" fill="#FF6600" stroke="#fff" stroke-width="1.5"><path d="M12 22s8-6.2 8-12a8 8 0 1 0-16 0c0 5.8 8 12 8 12z"/><circle cx="12" cy="10" r="2.6" fill="#fff" stroke="none"/></svg></div>`,
    iconSize: [34, 34], iconAnchor: [17, 32],
  });

  const movingIcon = L.divIcon({
    className: "",
    html: `<div class="tmt-truck" style="position:relative;width:46px;height:46px">
      <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(255,102,0,.4);animation:tmtPulse 1.8s ease-out infinite"></span>
      <div class="tmt-truck-rot" style="position:relative;width:46px;height:46px;border-radius:9999px;background:linear-gradient(140deg,#FF8534,#E05500);border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;transition:transform .3s linear"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h13v13H1z"/><path d="M14 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/></svg></div>
    </div>`,
    iconSize: [46, 46], iconAnchor: [23, 23],
  });

  return { warehouseIcon, destIcon, movingIcon };
}

function FitBounds({ points, boundsKey }: { points: LatLng[]; boundsKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const b = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(b, { padding: [56, 56] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, boundsKey]);
  return null;
}

// Sesuaikan ukuran peta saat container berubah (resize / mode layar penuh).
function AutoResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = setTimeout(() => map.invalidateSize(), 220);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [map]);
  return null;
}

// Marker truk yang menghadap ke arah perjalanan (rotasi mengikuti bearing rute).
function MovingTruck({ position, bearing, courier, icon }: { position: LatLng; bearing: number; courier: string; icon: L.DivIcon }) {
  const ref = useRef<L.Marker | null>(null);
  useEffect(() => {
    const el = ref.current?.getElement()?.querySelector<HTMLElement>(".tmt-truck-rot");
    if (el) el.style.transform = `rotate(${bearing}deg)`;
  }, [bearing]);
  return (
    <Marker position={position} icon={icon} ref={ref}>
      <Popup>
        {courier} sedang dalam perjalanan
        <br />
        <span style={{ color: "#888" }}>Posisi paket saat ini</span>
      </Popup>
    </Marker>
  );
}

// Penentuan lokasi tujuan via OpenStreetMap Nominatim dengan fallback ke pusat kota.
function useDestination(order: Order): { coord: LatLng; label: string; exact: boolean } {
  const fallback = useMemo(() => cityCoord(order.address.city), [order.address.city]);
  const [coord, setCoord] = useState<LatLng>(fallback.coord);
  const [exact, setExact] = useState(false);

  useEffect(() => {
    setCoord(fallback.coord);
    setExact(false);
    const q = [order.address.street, order.address.district, order.address.city, order.address.postal, "Indonesia"]
      .map((s) => (s ?? "").trim()).filter(Boolean).join(", ");
    if (order.address.street.trim().length < 3 || q.length < 6) return;
    const ctrl = new AbortController();
    let alive = true;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal, headers: { Accept: "application/json" } }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { lat: string; lon: string }[];
        if (alive && data?.[0]) { setCoord([parseFloat(data[0].lat), parseFloat(data[0].lon)]); setExact(true); }
      } catch { /* gagal mengambil lokasi, menggunakan perkiraan berdasarkan kota */ }
    })();
    return () => { alive = false; ctrl.abort(); };
  }, [fallback.coord, order.address.street, order.address.district, order.address.city, order.address.postal]);

  return { coord, label: order.address.city || fallback.label, exact };
}

const TILES = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

export default function DeliveryMapInner({ order }: { order: Order }) {
  const { isDark } = useTheme();
  const icons = useMemo(() => makeIcons(isDark), [isDark]);
  const tiles = isDark ? TILES.dark : TILES.light;

  const dest = useDestination(order);
  const route = useMemo(() => routeBetween(ORIGIN, dest.coord, 96), [dest.coord]);

  const delivered = order.status === "delivered";
  const canMove = order.status === "paid" || order.status === "processing" || order.status === "shipped";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const base = useMemo(() => deliveryProgress(order), [order.id, order.status, order.events.length]);
  const cap = delivered ? 1 : canMove ? 0.97 : base;

  // Posisi truk dianimasikan berjalan menuju alamat tujuan (progres simulasi pengiriman).
  const [progress, setProgress] = useState(base);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || base >= cap) { setProgress(cap); return; }
    let v = base;
    const step = (cap - base) / ((60 * 1000) / 80); // menempuh rute dalam ~60 detik
    setProgress(base);
    const id = setInterval(() => {
      v = Math.min(cap, v + step);
      setProgress(v);
      if (v >= cap) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [base, cap]);

  const current = pointAt(route, progress);
  const traveledCount = Math.max(2, Math.ceil(progress * (route.length - 1)) + 1);
  const traveled = route.slice(0, traveledCount);
  const showTruck = order.status !== "pending_payment";

  // Arah hadap truk: dari posisi sekarang menuju titik sedikit di depannya.
  const bearing = useMemo(() => {
    const ahead = pointAt(route, Math.min(1, progress + 0.03));
    if (Math.abs(ahead[0] - current[0]) < 1e-6 && Math.abs(ahead[1] - current[1]) < 1e-6) return 0;
    return bearingDeg(current, ahead);
  }, [route, progress, current]);

  const distanceKm = Math.round(haversineKm(ORIGIN, dest.coord));
  const pct = Math.round((delivered ? 1 : progress) * 100);

  const destLabel = [order.address.street, order.address.district, order.address.city].filter(Boolean).join(", ");

  return (
    <>
      <style>{`@keyframes tmtPulse{0%{transform:scale(.65);opacity:.85}100%{transform:scale(1.7);opacity:0}}@keyframes tmtDash{to{stroke-dashoffset:-12}}@media (prefers-reduced-motion: reduce){*{animation-duration:.001ms!important}.tmt-route-dash{animation:none}}`}</style>
      <div className="relative h-full w-full" role="img" aria-label={`Peta posisi paket dari ${ORIGIN_LABEL} menuju ${dest.label}`}>
        <MapContainer
          center={current}
          zoom={6}
          scrollWheelZoom={false}
          zoomControl={false}
          style={{ height: "100%", width: "100%", background: isDark ? "#141417" : "#EAE8E3" }}
        >
          <TileLayer key={isDark ? "dark" : "light"} attribution={tiles.attr} url={tiles.url} />
          <ZoomControl position="bottomright" />
          <AutoResize />

          {/* Rute belum dilalui (animasi putus-putus bergerak) */}
          <Polyline positions={route} pathOptions={{ className: "tmt-route-dash", color: isDark ? "#8a8a92" : "#111111", weight: 3, opacity: 0.35, dashArray: "2 10", lineCap: "round" }} />
          {/* Halo agar jalur tetap jelas di atas peta */}
          <Polyline positions={traveled} pathOptions={{ color: isDark ? "#141417" : "#ffffff", weight: 9, opacity: 0.85, lineCap: "round" }} />
          {/* Cahaya lembut di bawah rute yang sudah dilalui */}
          <Polyline positions={traveled} pathOptions={{ color: "#FF6600", weight: 12, opacity: 0.18, lineCap: "round" }} />
          {/* Rute sudah dilalui */}
          <Polyline positions={traveled} pathOptions={{ color: "#FF6600", weight: 5, opacity: 0.95, lineCap: "round" }} />

          <Marker position={ORIGIN} icon={icons.warehouseIcon}>
            <Popup>{ORIGIN_LABEL}</Popup>
          </Marker>
          <Marker position={dest.coord} icon={icons.destIcon}>
            <Popup>
              Tujuan: {order.address.name}
              <br />
              {destLabel}
              {!dest.exact && <><br /><span style={{ color: "#888" }}>Perkiraan lokasi (pusat kota)</span></>}
            </Popup>
          </Marker>
          {showTruck && <MovingTruck position={current} bearing={bearing} courier={`${order.courier} ${order.shippingMethod}`} icon={icons.movingIcon} />}

          <FitBounds points={[ORIGIN, dest.coord]} boundsKey={`${dest.coord[0]},${dest.coord[1]}`} />
        </MapContainer>

        {/* Kartu info mengambang di atas peta */}
        <div className="pointer-events-none absolute left-3 top-3 z-[600] w-[min(80%,270px)]">
          <div className="rounded-md border border-line/70 bg-surface/90 px-3 py-2.5 shadow-float backdrop-blur">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink">
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-inverse" />
              <span>Bandung</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
              <span className="truncate">{dest.label}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {order.courier} {order.shippingMethod} · ±{distanceKm.toLocaleString("id-ID")} km
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-9 shrink-0 text-right text-[10px] font-semibold tabular-nums text-brand-ontint">{delivered ? "Tiba" : `${pct}%`}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
