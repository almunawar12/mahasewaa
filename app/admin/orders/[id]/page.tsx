import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { updateOrderStatusAction, setDeliverableAction } from "../actions";
import { DeliverableForm } from "./_deliverable-form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { ExternalLink, Download } from "lucide-react";

export const metadata = { title: "Admin · Detail Order" };

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

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
      <AdminPageHeader
        title={order.service.title}
        description={`Order #${order.id.slice(0, 8)}`}
        backHref="/admin/orders"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detail Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 text-sm">
            <DetailRow label="Client" value={`${order.client.fullName} (${order.client.email})`} />
            <DetailRow label="Total" value={formatIDR(order.totalAmount.toString())} />
            <DetailRow
              label="Status"
              value={
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
                  {order.status}
                </span>
              }
            />
            <DetailRow
              label="Due Date"
              value={order.dueDate ? new Date(order.dueDate).toLocaleString("id-ID") : "—"}
            />

            {order.briefNotes && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">Brief</p>
                <p className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                  {order.briefNotes}
                </p>
              </div>
            )}

            {order.briefFileUrl && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">File Brief</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.briefFileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="mr-1" />
                    Lihat Lampiran
                  </a>
                </Button>
              </div>
            )}

            {order.deliveryFileUrl && (
              <div className="border-b border-slate-100 py-3">
                <p className="mb-2 text-slate-500">Deliverable</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.deliveryFileUrl} target="_blank" rel="noopener noreferrer">
                    <Download size={14} className="mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            )}

            {order.review && (
              <div className="pt-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-1 text-xs font-medium text-amber-700">Review Client</p>
                  <p className="text-amber-800">
                    {"★".repeat(order.review.rating)}{"☆".repeat(5 - order.review.rating)}
                    <span className="ml-2 text-sm">{order.review.comment}</span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ubah Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? ""}`}>
                Saat ini: {order.status}
              </span>
              <form action={statusAction} className="flex gap-2">
                <select
                  name="status"
                  defaultValue={order.status}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Update
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upload Deliverable</CardTitle>
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
