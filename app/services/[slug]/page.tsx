import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/utils";

type Params = { slug: string };

async function getService(slug: string) {
  try {
    return await prisma.service.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Jasa tidak ditemukan" };
  return {
    title: service.title,
    description: service.description.slice(0, 160),
    openGraph: {
      title: service.title,
      description: service.description.slice(0, 160),
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto grid max-w-6xl flex-1 gap-8 px-4 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">{service.title}</h1>
          <Card>
            <CardContent className="prose max-w-none whitespace-pre-wrap p-6 text-slate-700">
              {service.description}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-xs uppercase text-slate-500">Mulai dari</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatIDR(service.basePrice.toString())}
                </p>
              </div>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>⏱ Pengerjaan {service.deliveryDays} hari</li>
                <li>🔁 {service.revisionLimit}× revisi</li>
              </ul>
              <div className="flex flex-col gap-2">
                <Link href={`/checkout/${service.slug}`}>
                  <Button className="w-full">Pesan Sekarang</Button>
                </Link>
                <Link href={`/chat/new?serviceId=${service.id}`}>
                  <Button variant="outline" className="w-full">Diskusi via Chat</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
      <Footer />
    </>
  );
}
