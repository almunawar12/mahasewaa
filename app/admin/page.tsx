import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { OrderRow } from "@/components/features/order-row";

export const metadata = { title: "Admin · Dashboard" };

export default async function AdminDashboardPage() {
  const [totalOrders, totalServices, totalUsers, revenueAgg, recentOrders, statusGroup] =
    await Promise.all([
      prisma.order.count(),
      prisma.service.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: "COMPLETED" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { service: { select: { title: true, slug: true } } },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  const revenue = revenueAgg._sum.totalAmount?.toString() ?? "0";

  const stats = [
    { label: "Total Orders", value: totalOrders.toLocaleString("id-ID") },
    { label: "Revenue (COMPLETED)", value: formatIDR(revenue) },
    { label: "Active Services", value: totalServices.toLocaleString("id-ID") },
    { label: "Clients", value: totalUsers.toLocaleString("id-ID") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="space-y-1 p-5">
              <p className="text-xs uppercase text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
            ) : (
              recentOrders.map((o) => <OrderRow key={o.id} order={o} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {statusGroup.length === 0 ? (
              <p className="text-slate-500">Tidak ada data.</p>
            ) : (
              statusGroup.map((g) => (
                <div key={g.status} className="flex items-center justify-between">
                  <span className="text-slate-600">{g.status}</span>
                  <span className="font-semibold">{g._count._all}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
