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
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q, cat } = await searchParams;
  const query = q?.trim();
  const catSlug = cat?.trim();

  const [services, activeCategory] = await Promise.all([
    prisma.service
      .findMany({
        where: {
          isActive: true,
          ...(catSlug ? { category: { slug: catSlug } } : {}),
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
      .catch(() => []),
    catSlug
      ? prisma.category.findUnique({ where: { slug: catSlug }, select: { name: true } }).catch(() => null)
      : null,
  ]);

  const heading = activeCategory
    ? activeCategory.name
    : query
      ? `"${query}" — ${services.length} hasil ditemukan`
      : "Semua Jasa";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{heading}</h1>
          {(catSlug || query) && (
            <a href="/services" className="text-sm text-[#434655] hover:text-[#004ac6]">
              ← Semua Jasa
            </a>
          )}
        </div>

        {activeCategory && query && (
          <p className="mb-4 text-sm text-[#434655]">
            {services.length} hasil untuk &ldquo;{query}&rdquo; dalam kategori ini
          </p>
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
