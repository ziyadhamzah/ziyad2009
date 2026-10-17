import type { Order } from "./store";
import { shippingOptions } from "./shipping";

export type LatLng = [number, number];

// Gudang Temanta (titik asal pengiriman).
export const ORIGIN: LatLng = [-6.9175, 107.6191];
export const ORIGIN_LABEL = "Gudang Temanta · Bandung";

// Koordinat pusat kota besar Indonesia untuk memetakan alamat tujuan.
const CITIES: Record<string, LatLng> = {
  jakarta: [-6.2088, 106.8456],
  "jakarta pusat": [-6.1862, 106.8344],
  "jakarta selatan": [-6.2615, 106.8106],
  "jakarta barat": [-6.1683, 106.7588],
  "jakarta timur": [-6.225, 106.9004],
  "jakarta utara": [-6.1214, 106.7741],
  bogor: [-6.595, 106.8166],
  depok: [-6.4025, 106.7942],
  tangerang: [-6.1781, 106.63],
  "tangerang selatan": [-6.2884, 106.7179],
  bekasi: [-6.2383, 106.9756],
  bandung: [-6.9175, 107.6191],
  cimahi: [-6.8722, 107.5425],
  cirebon: [-6.732, 108.5523],
  tasikmalaya: [-7.3196, 108.2204],
  garut: [-7.2147, 107.9022],
  sukabumi: [-6.9181, 106.9272],
  serang: [-6.11, 106.15],
  cilegon: [-6.0027, 106.0114],
  semarang: [-6.9932, 110.4203],
  solo: [-7.5755, 110.8243],
  surakarta: [-7.5755, 110.8243],
  magelang: [-7.4698, 110.2177],
  tegal: [-6.8694, 109.1402],
  pekalongan: [-6.8886, 109.6753],
  yogyakarta: [-7.7956, 110.3695],
  jogja: [-7.7956, 110.3695],
  surabaya: [-7.2575, 112.7521],
  malang: [-7.9666, 112.6326],
  kediri: [-7.848, 112.0178],
  madiun: [-7.6298, 111.5239],
  jember: [-8.1681, 113.7026],
  probolinggo: [-7.7543, 113.2159],
  denpasar: [-8.6705, 115.2126],
  mataram: [-8.5833, 116.1167],
  medan: [3.5952, 98.6722],
  binjai: [3.6001, 98.4853],
  pematangsiantar: [2.9595, 99.0687],
  pekanbaru: [0.5071, 101.4478],
  dumai: [1.6667, 101.45],
  padang: [-0.9471, 100.4172],
  palembang: [-2.9761, 104.7754],
  "bandar lampung": [-5.3971, 105.2668],
  lampung: [-5.3971, 105.2668],
  bengkulu: [-3.8004, 102.2655],
  jambi: [-1.6101, 103.6131],
  batam: [1.1301, 104.0529],
  "tanjung pinang": [0.9186, 104.4665],
  pontianak: [-0.0263, 109.3425],
  banjarmasin: [-3.3186, 114.5944],
  samarinda: [-0.5022, 117.1536],
  balikpapan: [-1.2379, 116.8529],
  palangkaraya: [-2.208, 113.9166],
  makassar: [-5.1477, 119.4327],
  manado: [1.4748, 124.8421],
  palu: [-0.8917, 119.8707],
  kendari: [-3.945, 122.4989],
  ambon: [-3.6954, 128.1814],
  kupang: [-10.1772, 123.607],
  jayapura: [-2.5916, 140.669],
  sorong: [-0.8762, 131.2558],
  manokwari: [-0.8615, 134.062],
  gorontalo: [0.5435, 123.0568],
};

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Cari koordinat tujuan dari kota/alamat bebas. Fallback ke Jakarta.
export function cityCoord(city: string | undefined): { coord: LatLng; label: string; matched: boolean } {
  const raw = (city ?? "").trim();
  const key = normalize(raw);
  if (key && CITIES[key]) return { coord: CITIES[key], label: raw || "Kota tujuan", matched: true };
  // Coba cocokkan kata kunci di dalam string alamat.
  const hit = Object.keys(CITIES).find((c) => key.includes(c));
  if (hit) return { coord: CITIES[hit], label: raw || hit, matched: true };
  return { coord: CITIES["jakarta"], label: raw || "Jakarta", matched: false };
}

const etaDays = (eta: string) => {
  const m = eta.match(/(\d+)\D+(\d+)/);
  return m ? Number(m[2]) : 4;
};

// Perjalanan paket 0..1 berdasarkan status & waktu sejak dikirim.
export function deliveryProgress(o: Order): number {
  if (o.status === "delivered") return 1;
  if (o.status === "cancelled") return 0;
  if (o.status === "pending_payment" || o.status === "paid") return 0;
  if (o.status === "processing") return 0.06;
  const shipped = o.events.find((e) => e.status === "shipped")?.at;
  if (!shipped) return 0.15;
  const opt = shippingOptions.find((s) => s.courier === o.courier && s.name === o.shippingMethod);
  const total = etaDays(opt?.eta ?? "2–4 hari") * 86400000;
  const elapsed = Date.now() - new Date(shipped).getTime();
  const frac = 0.15 + 0.8 * Math.min(1, Math.max(0, elapsed / total));
  return Math.min(0.95, frac);
}

// Rute lengkung halus antara dua titik (bukan garis lurus).
export function routeBetween(a: LatLng, b: LatLng, steps = 48): LatLng[] {
  const [aLat, aLng] = a;
  const [bLat, bLng] = b;
  const mid: LatLng = [(aLat + bLat) / 2, (aLng + bLng) / 2];
  const dLat = bLat - aLat;
  const dLng = bLng - aLng;
  const dist = Math.hypot(dLat, dLng) || 1;
  // Geser titik tengah tegak lurus agar rute terlihat melengkung seperti jalur.
  const bow = dist * 0.18;
  const ctrl: LatLng = [mid[0] + (-dLng / dist) * bow, mid[1] + (dLat / dist) * bow];
  const out: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    // Kurva kuadratik Bezier.
    const lat = mt * mt * aLat + 2 * mt * t * ctrl[0] + t * t * bLat;
    const lng = mt * mt * aLng + 2 * mt * t * ctrl[1] + t * t * bLng;
    out.push([lat, lng]);
  }
  return out;
}

// Jarak lingkaran besar antara dua titik (km).
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Arah hadap (derajat, 0 = utara) dari titik a ke b.
export function bearingDeg(a: LatLng, b: LatLng): number {
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Titik pada rute sesuai progres 0..1.
export function pointAt(route: LatLng[], t: number): LatLng {
  if (route.length === 0) return ORIGIN;
  const clamped = Math.min(1, Math.max(0, t));
  const idx = clamped * (route.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  const p = route[i];
  const q = route[Math.min(route.length - 1, i + 1)];
  return [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
}
