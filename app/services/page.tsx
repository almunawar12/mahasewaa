import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Jelajah Jasa",
  description: "Telusuri semua jasa digital aktif di MahaSewa.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await prisma.service
    .findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, basePrice: true, deliveryDays: true },
    })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Semua Jasa</h1>
        {services.length === 0 ? (
          <p className="text-slate-500">Belum ada jasa.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
