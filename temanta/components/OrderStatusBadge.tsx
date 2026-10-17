import { OrderStatus, statusLabel } from "@/lib/store";
export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone = status === "cancelled" ? "bg-danger-bg text-danger-fg" : status === "delivered" ? "bg-brand text-white" : status === "pending_payment" ? "bg-warn-bg text-warn-ink" : "bg-paper text-ink";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${tone}`}>{statusLabel[status]}</span>;
}
