import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { updateOrderStatusAction, setDeliverableAction } from "../actions";
import { DeliverableForm } from "./_deliverable-form";

export const metadata = { title: "Admin · Detail Order" };

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      client: { select: { fullName: true, email: true } },
      review: true,
    },
  });
  if (!order) notFound();

  async function statusAction(formData: FormData) {
    "use server";
    await updateOrderStatusAction(id, formData);
  }
  async function deliverableAction(formData: FormData) {
    "use server";
    await setDeliverableAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{order.service.title}</h1>
        <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Client" value={`${order.client.fullName} (${order.client.email})`} />
            <Row label="Total" value={formatIDR(order.totalAmount.toString())} />
            <Row label="Status" value={order.status} />
            <Row label="Due Date" value={order.dueDate ? new Date(order.dueDate).toLocaleString("id-ID") : "—"} />
            <div>
              <p className="mb-1 text-slate-500">Brief</p>
              <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-3">{order.briefNotes ?? "—"}</p>
            </div>
            {order.briefFileUrl && (
              <div>
                <p className="mb-1 text-slate-500">File Brief</p>
                <a href={order.briefFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Lihat Lampiran
                </a>
              </div>
            )}
            {order.deliveryFileUrl && (
              <Row
                label="Deliverable"
                value={
                  <a href={order.deliveryFileUrl} target="_blank" className="text-emerald-600 hover:underline">
                    Download
                  </a>
                }
              />
            )}
            {order.review && (
              <div className="rounded-md bg-amber-50 p-3 text-sm">
                ⭐ {order.review.rating}/5 — {order.review.comment}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubah Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={statusAction} className="flex gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="submit" size="sm">Update</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Deliverable</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliverableForm
                orderId={order.id}
                currentUrl={order.deliveryFileUrl}
                action={deliverableAction}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
