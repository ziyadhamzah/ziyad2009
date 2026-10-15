"use client";

import { useEffect } from "react";
import { markViewed } from "@/lib/recent";

// Mencatat produk yang dilihat pengguna untuk rekomendasi "Untuk Anda".
export default function RecentTrack({ slug }: { slug: string }) {
  useEffect(() => { markViewed(slug); }, [slug]);
  return null;
}