"use client";
import dynamic from "next/dynamic";
import type { Order } from "@/lib/store";

const Inner = dynamic(() => import("./DeliveryMapInner"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-paper text-sm text-muted">Memuat peta…</div>,
});

export default function DeliveryMap({ order }: { order: Order }) {
  return <Inner order={order} />;
}
