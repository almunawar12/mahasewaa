import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { orderCreateSchema } from "@/lib/validations/order";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatIDR } from "@/lib/utils";

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
      totalAmount: service!.basePrice.toString(),
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const order = await prisma.order.create({
      data: {
        clientId: fresh.user.id,
        serviceId: parsed.data.serviceId,
        totalAmount: parsed.data.totalAmount,
        briefNotes: parsed.data.briefNotes,
        status: "PENDING",
      },
    });

    redirect(`/dashboard/orders/${order.id}`);
  }

  void userId;

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
              <form action={createOrder} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="briefNotes">Detail kebutuhan Anda</Label>
                  <textarea
                    id="briefNotes"
                    name="briefNotes"
                    required
                    minLength={10}
                    rows={6}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="briefFileUrl">Lampiran (URL, opsional)</Label>
                  <Input id="briefFileUrl" name="briefFileUrl" placeholder="https://…" />
                </div>
                <Button type="submit" className="w-full">Buat Pesanan</Button>
              </form>
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
