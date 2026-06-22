import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Orders" };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true } },
      client: { select: { fullName: true, email: true } },
    },
  });

  const filters = ["ALL", "PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Orders" />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f === "ALL" && !status) || f === status;
          return (
            <Link
              key={f}
              href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <AdminEmptyState message="Tidak ada order." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.service.title}</p>
                      <p className="text-xs text-slate-500">#{o.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.client.fullName}</p>
                      <p className="text-xs text-slate-500">{o.client.email}</p>
                    </td>
                    <td className="px-4 py-3">{formatIDR(o.totalAmount.toString())}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="text-xs font-semibold text-emerald-600 hover:underline">
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
