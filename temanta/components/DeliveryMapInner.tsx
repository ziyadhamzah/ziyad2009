"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { ORIGIN, ORIGIN_LABEL, cityCoord, deliveryProgress, routeBetween, pointAt, type LatLng } from "@/lib/geo";
import type { Order } from "@/lib/store";

const warehouseIcon = L.divIcon({
  className: "",
  html: `<div style="width:38px;height:38px;border-radius:9999px;background:#111111;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1">&#127978;</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:38px;height:38px;border-radius:9999px;background:#FF6600;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1">&#128205;</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19],
});

const movingIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:46px;height:46px">
    <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(255,102,0,.4);animation:tmtPulse 1.8s ease-out infinite"></span>
    <div style="position:relative;width:46px;height:46px;border-radius:9999px;background:#FF6600;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1">&#128666;</div>
  </div>`,
  iconSize: [46, 46], iconAnchor: [23, 23],
});

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

// Geocode alamat tujuan via OpenStreetMap Nominatim; fallback ke titik pusat kota.
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
      } catch { /* abaikan — pakai fallback kota */ }
    })();
    return () => { alive = false; ctrl.abort(); };
  }, [fallback.coord, order.address.street, order.address.district, order.address.city, order.address.postal]);

  return { coord, label: order.address.city || fallback.label, exact };
}

export default function DeliveryMapInner({ order }: { order: Order }) {
  const dest = useDestination(order);
  const route = useMemo(() => routeBetween(ORIGIN, dest.coord, 64), [dest.coord]);

  const delivered = order.status === "delivered";
  const canMove = order.status === "paid" || order.status === "processing" || order.status === "shipped";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const base = useMemo(() => deliveryProgress(order), [order.id, order.status, order.events.length]);
  const cap = delivered ? 1 : canMove ? 0.97 : base;

  // Posisi truk dianimasikan berjalan menuju alamat tujuan (efek live tracking).
  const [progress, setProgress] = useState(base);
  useEffect(() => {
    if (base >= cap) { setProgress(base); return; }
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

  return (
    <>
      <style>{`@keyframes tmtPulse{0%{transform:scale(.65);opacity:.85}100%{transform:scale(1.7);opacity:0}}`}</style>
      <MapContainer center={current} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%", background: "#EAE8E3" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={route} pathOptions={{ color: "#111111", weight: 3, opacity: 0.25, dashArray: "2 10", lineCap: "round" }} />
        <Polyline positions={traveled} pathOptions={{ color: "#FF6600", weight: 5, opacity: 0.95, lineCap: "round" }} />

        <Marker position={ORIGIN} icon={warehouseIcon}>
          <Popup>{ORIGIN_LABEL}</Popup>
        </Marker>
        <Marker position={dest.coord} icon={destIcon}>
          <Popup>
            Tujuan · {order.address.name}
            <br />
            {[order.address.street, order.address.district, order.address.city].filter(Boolean).join(", ")}
            {!dest.exact && <><br /><span style={{ color: "#888" }}>Perkiraan lokasi (pusat kota)</span></>}
          </Popup>
        </Marker>
        {showTruck && (
          <Marker position={current} icon={movingIcon}>
            <Popup>
              Posisi paket saat ini
              <br />
              {order.courier} {order.shippingMethod}
            </Popup>
          </Marker>
        )}

        <FitBounds points={[ORIGIN, dest.coord]} boundsKey={`${dest.coord[0]},${dest.coord[1]}`} />
      </MapContainer>
    </>
  );
}
