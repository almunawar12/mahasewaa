import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validations/order";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { CheckoutForm } from "./_checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const service = await prisma.service.findUnique({ where: { slug } }).catch(() => null);
  if (!service) notFound();

  async function createOrder(formData: FormData) {
    "use server";
    const fresh = await auth();
    if (!fresh?.user) redirect("/login");

    const parsed = orderCreateSchema.safeParse({
      serviceId: service!.id,
      briefNotes: formData.get("briefNotes"),
      briefFileUrl: formData.get("briefFileUrl") || undefined,
      totalAmount: service!.basePrice.toString(),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const order = await prisma.order.create({
      data: {
        clientId: fresh.user.id,
        serviceId: parsed.data.serviceId,
        totalAmount: parsed.data.totalAmount,
        briefNotes: parsed.data.briefNotes,
        briefFileUrl: parsed.data.briefFileUrl ?? null,
        status: "PENDING",
      },
    });

    redirect(`/dashboard/orders/${order.id}`);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto grid w-full max-w-4xl flex-1 gap-6 px-4 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Brief Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm action={createOrder} userId={userId} />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{service.title}</p>
              <div className="flex justify-between text-slate-600">
                <span>Harga dasar</span>
                <span>{formatIDR(service.basePrice.toString())}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatIDR(service.basePrice.toString())}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
