import { OrderStatus, statusLabel } from "@/lib/store";
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "cancelled" ? "bg-red-50 text-red-700" : status === "delivered" ? "bg-brand text-white" : status === "pending_payment" ? "bg-amber-50 text-amber-800" : "bg-paper text-ink";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>{statusLabel[status]}</span>;
}
