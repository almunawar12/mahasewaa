import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderRow } from "@/components/features/order-row";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const orders = await prisma.order
    .findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { service: { select: { title: true, slug: true } } },
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Halo, {session!.user.name}</h1>
        <p className="text-sm text-slate-500">Pantau pesanan dan percakapan Anda.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Belum ada pesanan.</p>
          ) : (
            orders.map((o) => <OrderRow key={o.id} order={o} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
