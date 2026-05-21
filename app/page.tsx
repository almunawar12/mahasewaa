import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

async function getFeaturedServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, slug: true, basePrice: true, deliveryDays: true },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getFeaturedServices();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Marketplace Jasa Digital
              </span>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Cari jasa, nego harga, kerja beres — semua di satu tempat.
              </h1>
              <p className="text-lg text-slate-600">
                MahaSewa menghubungkan klien dengan penyedia jasa digital terpercaya.
                Diskusi langsung, kesepakatan brief, transaksi aman.
              </p>
              <div className="flex gap-3">
                <Link href="/services">
                  <Button size="lg">Mulai Jelajah</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">Masuk</Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-8 text-center text-slate-500">
              <p className="text-sm">Mockup ilustrasi · lihat <code>html/landing-page.html</code></p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-6 text-2xl font-bold">Jasa Pilihan</h2>
          {services.length === 0 ? (
            <p className="text-slate-500">Belum ada jasa. Tambahkan data lewat seed Prisma.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
