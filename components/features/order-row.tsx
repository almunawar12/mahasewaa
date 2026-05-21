import Link from "next/link";
import type { Order, Service } from "@/app/generated/prisma/client";
import { formatIDR } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export function OrderRow({
  order,
}: {
  order: Pick<Order, "id" | "status" | "totalAmount" | "createdAt"> & {
    service: Pick<Service, "title" | "slug">;
  };
}) {
  return (
    <Link
      href={`/dashboard/orders/${order.id}`}
      className="flex items-center justify-between border-b border-slate-200 px-4 py-3 last:border-0 hover:bg-slate-50"
    >
      <div>
        <p className="font-medium">{order.service.title}</p>
        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
          {order.status}
        </span>
        <span className="text-sm font-semibold">{formatIDR(order.totalAmount.toString())}</span>
      </div>
    </Link>
  );
}
