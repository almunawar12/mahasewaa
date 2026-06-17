import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceCard } from "@/components/features/service-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

const CATEGORIES = [
  { icon: "design_services", label: "Desain Grafis" },
  { icon: "code", label: "Programming & Tech" },
  { icon: "edit_document", label: "Penulisan & Terjemahan" },
  { icon: "campaign", label: "Digital Marketing" },
];

const POPULAR_TAGS = ["Desain Logo", "Web Development", "Copywriting"];

async function getFeaturedServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        imageUrls: true,
      },
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

      <main className="flex-grow">
        {/* Hero */}
        <section className="mx-auto flex min-h-[614px] max-w-[1280px] flex-col items-center justify-center px-4 py-16 text-center md:px-16 md:py-24">
          <h1 className="mb-6 max-w-4xl text-3xl font-bold tracking-tight text-[#191c1e] md:text-4xl lg:text-5xl">
            Temukan Jasa Digital Terbaik
          </h1>
          <p className="mb-10 max-w-2xl text-base text-[#434655] md:text-lg">
            Solusi profesional untuk kebutuhan bisnis Anda. Temukan desainer, penulis, dan pengembang handal dalam
            hitungan menit.
          </p>

          {/* Mobile search */}
          <div className="relative mb-8 w-full max-w-3xl md:hidden">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#434655]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari layanan apa hari ini?"
              className="w-full rounded-xl border border-[#c3c6d7] bg-white py-4 pl-12 pr-4 text-lg shadow-[0_4px_15px_rgba(0,0,0,0.05)] focus:border-[#004ac6] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10"
            />
          </div>

          {/* Desktop search */}
          <form
            action="/services"
            className="hidden w-full max-w-3xl overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] md:flex"
          >
            <div className="relative flex flex-grow items-center">
              <span className="material-symbols-outlined absolute left-4 text-[#434655]">search</span>
              <input
                type="text"
                name="q"
                placeholder="Cari layanan apa hari ini?"
                className="h-full w-full border-none bg-transparent py-4 pl-12 pr-4 text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2563eb] px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-[#004ac6]"
            >
              Cari
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="py-2 text-xs font-medium uppercase tracking-wider text-[#434655]">Populer:</span>
            {POPULAR_TAGS.map((tag) => (
              <Link
                key={tag}
                href={`/services?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-[#c3c6d7] bg-[#f2f4f6] px-3 py-2 text-xs font-medium transition-colors hover:border-[#004ac6]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="border-y border-[#c3c6d7] bg-[#f7f9fb] px-4 py-12 md:px-16">
          <div className="mx-auto max-w-[1280px]">
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-[#191c1e] md:text-3xl">
              Kategori Populer
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/services?cat=${encodeURIComponent(cat.label)}`}
                  className="group flex flex-col items-center justify-center rounded-xl border border-[#c3c6d7] bg-white p-6 transition-all hover:border-[#004ac6]/50 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)]"
                >
                  <span className="material-symbols-outlined mb-3 text-4xl text-[#505f76] transition-colors group-hover:text-[#004ac6]">
                    {cat.icon}
                  </span>
                  <span className="text-center text-sm font-medium text-[#191c1e]">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gigs */}
        <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-[#191c1e] md:text-3xl">
              Jasa Rekomendasi
            </h2>
            <Link
              href="/services"
              className="hidden text-sm font-medium text-[#004ac6] hover:underline md:block"
            >
              Lihat Semua
            </Link>
          </div>

          {services.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#c3c6d7] bg-[#f7f9fb] py-12 text-center text-[#434655]">
              Belum ada jasa. Jalankan{" "}
              <code className="rounded bg-[#eceef0] px-2 py-0.5 text-xs">npm run db:seed</code>.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s) => {
                const images = Array.isArray(s.imageUrls) ? (s.imageUrls as string[]) : [];
                return (
                  <ServiceCard
                    key={s.id}
                    slug={s.slug}
                    title={s.title}
                    basePrice={s.basePrice.toString()}
                    imageUrl={images[0]}
                    rating={4.9}
                    ratingCount={120}
                  />
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/services"
              className="inline-block w-full rounded-lg border border-[#c3c6d7] px-6 py-3 text-sm font-medium text-[#191c1e] transition-colors hover:bg-[#f2f4f6]"
            >
              Lihat Semua Jasa
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
