"use client";
import { useCart } from "@/lib/cart";
export default function Toast() {
  const { toast } = useCart();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {toast && <div className="rounded bg-ink px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
