import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { reviewSchema } from "@/lib/validations/order";
import { ReviewForm } from "@/components/features/review-form";

export const metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const order = await prisma.order
    .findFirst({
      where: { id, clientId: userId },
      include: { service: true, review: true },
    })
    .catch(() => null);

  if (!order) notFound();

  async function submitReviewAction(formData: FormData) {
    "use server";
    const fresh = await auth();
    if (!fresh?.user) throw new Error("Tidak terautentikasi");

    const parsed = reviewSchema.safeParse({
      orderId: formData.get("orderId"),
      serviceId: formData.get("serviceId"),
      rating: formData.get("rating"),
      comment: formData.get("comment") || undefined,
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const existing = await prisma.order.findFirst({
      where: { id: parsed.data.orderId, clientId: fresh.user.id, status: "COMPLETED" },
      include: { review: true },
    });
    if (!existing) throw new Error("Pesanan tidak ditemukan atau belum selesai");
    if (existing.review) throw new Error("Review sudah pernah dikirim");

    await prisma.review.create({
      data: {
        orderId: parsed.data.orderId,
        clientId: fresh.user.id,
        serviceId: parsed.data.serviceId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    revalidatePath(`/dashboard/orders/${parsed.data.orderId}`);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{order.service.title}</h1>
        <p className="text-sm text-slate-500">
          Pesanan #{order.id.slice(0, 8)} · {order.status}
        </p>
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
          {order.briefFileUrl && (
            <div>
              <p className="mb-1 text-slate-500">File Brief</p>
              <a
                href={order.briefFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Lihat Lampiran
              </a>
            </div>
          )}
          {order.deliveryFileUrl && (
            <div>
              <p className="mb-1 text-slate-500">File Deliverable</p>
              <a
                href={order.deliveryFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download Hasil
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {order.status === "COMPLETED" && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
          </CardHeader>
          <CardContent>
            {order.review ? (
              <div className="space-y-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-2xl ${
                        star <= order.review!.rating ? "icon-fill text-amber-400" : "text-slate-300"
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
                {order.review.comment && (
                  <p className="text-sm text-slate-700">{order.review.comment}</p>
                )}
                <p className="text-xs text-slate-400">Review sudah dikirim — terima kasih!</p>
              </div>
            ) : (
              <ReviewForm
                orderId={order.id}
                serviceId={order.serviceId}
                action={submitReviewAction}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
