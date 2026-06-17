import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Jelajah Jasa",
  description: "Telusuri semua jasa digital aktif di MahaSewa.",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const services = await prisma.service
    .findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, basePrice: true, imageUrls: true },
    })
    .catch(() => []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        {query ? (
          <h1 className="mb-6 text-3xl font-bold">
            &ldquo;{query}&rdquo; — {services.length} hasil ditemukan
          </h1>
        ) : (
          <h1 className="mb-6 text-3xl font-bold">Semua Jasa</h1>
        )}
        {services.length === 0 ? (
          <p className="text-slate-500">Tidak ada jasa yang cocok dengan pencarian.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const images = Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : [];
              return (
                <ServiceCard
                  key={s.id}
                  slug={s.slug}
                  title={s.title}
                  basePrice={s.basePrice.toString()}
                  imageUrl={images[0]}
                />
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
