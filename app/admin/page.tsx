import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { OrderRow } from "@/components/features/order-row";
import { RevenueChart } from "@/components/features/revenue-chart";
import {
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Users,
  AlertCircle,
} from "lucide-react";

export const metadata = { title: "Admin · Dashboard" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_BAR_COLOR: Record<string, string> = {
  PENDING: "bg-amber-400",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-purple-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

function buildRevenueData(
  orders: { totalAmount: { toString(): string }; createdAt: Date }[],
): { month: string; revenue: number }[] {
  const map: Record<string, number> = {};

  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map[key] = (map[key] ?? 0) + Number(order.totalAmount);
  }

  const result: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    result.push({
      month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      revenue: map[key] ?? 0,
    });
  }
  return result;
}

export default async function AdminDashboardPage() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalOrders,
    totalServices,
    totalUsers,
    pendingCount,
    revenueAgg,
    recentOrders,
    statusGroup,
    completedOrdersForChart,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.service.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
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
    prisma.order.findMany({
      where: { status: "COMPLETED", createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  const revenue = revenueAgg._sum.totalAmount?.toString() ?? "0";
  const revenueData = buildRevenueData(completedOrdersForChart);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("id-ID"),
      sub: "semua status",
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Revenue",
      value: formatIDR(revenue),
      sub: "dari pesanan selesai",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Services",
      value: totalServices.toLocaleString("id-ID"),
      sub: "layanan tersedia",
      icon: Briefcase,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Clients",
      value: totalUsers.toLocaleString("id-ID"),
      sub: "pengguna terdaftar",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          <AlertCircle size={18} className="shrink-0 text-amber-500" />
          <span>
            <strong>{pendingCount}</strong> pesanan menunggu konfirmasi
          </span>
          <span className="ml-auto text-xs text-amber-600 underline">Lihat semua →</span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {s.label}
                    </p>
                    <p className="text-xl font-bold text-slate-800 sm:text-2xl">{s.value}</p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${s.bg}`}>
                    <Icon size={20} className={s.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart + Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusGroup.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada data.</p>
            ) : (
              statusGroup.map((g) => {
                const pct = totalOrders > 0 ? Math.round((g._count._all / totalOrders) * 100) : 0;
                return (
                  <div key={g.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        {STATUS_LABEL[g.status] ?? g.status}
                      </span>
                      <span className="text-slate-500">
                        {g._count._all} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full transition-all ${STATUS_BAR_COLOR[g.status] ?? "bg-slate-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
            <Link href="/admin/orders" className="text-xs text-emerald-600 hover:underline">
              Lihat semua →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
          ) : (
            recentOrders.map((o) => <OrderRow key={o.id} order={o} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
