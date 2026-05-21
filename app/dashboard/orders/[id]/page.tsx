import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";

export const metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const order = await prisma.order
    .findFirst({
      where: { id, clientId: userId },
      include: { service: true },
    })
    .catch(() => null);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{order.service.title}</h1>
        <p className="text-sm text-slate-500">Pesanan #{order.id.slice(0, 8)} · {order.status}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Total</span>
            <span className="font-semibold">{formatIDR(order.totalAmount.toString())}</span>
          </div>
          <div>
            <p className="mb-1 text-slate-500">Brief</p>
            <p className="whitespace-pre-wrap">{order.briefNotes ?? "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
