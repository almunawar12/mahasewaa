import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ServiceGallery } from "@/components/features/service-gallery";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/utils";
import { PartnerCard } from "@/components/features/PartnerCard";

type Params = { slug: string };

async function getService(slug: string) {
  try {
    return await prisma.service.findUnique({
      where: { slug },
      include: {
        reviews: { select: { rating: true } },
      },
    });
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
      images: Array.isArray(service.imageUrls) ? (service.imageUrls as string[]).slice(0, 1) : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const images = Array.isArray(service.imageUrls) ? (service.imageUrls as string[]) : [];

  const partners = service.categoryId
    ? await prisma.partner.findMany({
        where: { categoryId: service.categoryId, isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
    : [];

  const ratingCount = service.reviews.length;
  const ratingAvg =
    ratingCount > 0
      ? service.reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 5.0;

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-8 md:px-16">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-[#434655]">
          <Link href="/" className="transition-colors hover:text-[#004ac6]">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link href="/services" className="transition-colors hover:text-[#004ac6]">Services</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-[#191c1e]">{service.title}</span>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left 70% */}
          <div className="flex w-full flex-col gap-8 lg:w-[70%]">
            {/* Header */}
            <div>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-[#191c1e] md:text-4xl">
                {service.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#434655]">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c3c6d7] bg-[#dbe1ff] text-xs font-semibold text-[#004ac6]">
                    MS
                  </div>
                  <span className="text-sm font-medium text-[#191c1e]">MahaSewa Studio</span>
                </div>
                <div className="flex items-center gap-1 text-[#bc4800]">
                  <span className="material-symbols-outlined icon-fill text-[18px]">star</span>
                  <span className="text-sm font-medium">{ratingAvg.toFixed(1)}</span>
                  <span className="text-[#434655]">({ratingCount} review)</span>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <ServiceGallery images={images} title={service.title} />

            {/* About */}
            <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 md:p-8">
              <h2 className="mb-4 text-2xl font-semibold text-[#191c1e]">Tentang Jasa Ini</h2>
              <div className="space-y-4 whitespace-pre-wrap text-base leading-relaxed text-[#434655]">
                {service.description}
              </div>
            </div>

            {/* Partners */}
            {partners.length > 0 && (
              <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-semibold text-[#191c1e]">Tim Partner Kami</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {partners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      name={partner.name}
                      photoUrl={partner.photoUrl}
                      skills={partner.skills}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews preview */}
            {ratingCount > 0 && (
              <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 md:p-8">
                <h2 className="mb-4 text-2xl font-semibold text-[#191c1e]">Rating Pengguna</h2>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-[#191c1e]">{ratingAvg.toFixed(1)}</div>
                  <div>
                    <div className="flex text-[#bc4800]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-[20px] ${
                            i < Math.round(ratingAvg) ? "icon-fill" : ""
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#434655]">{ratingCount} review</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right 30% — Sticky package */}
          <aside className="w-full lg:w-[30%]">
            <div className="sticky top-24 rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-[#191c1e]">Paket Standar</h3>
                <span className="text-2xl font-semibold text-[#004ac6]">
                  {formatIDR(service.basePrice.toString())}
                </span>
              </div>

              <p className="mb-6 text-sm text-[#434655]">
                Cocok untuk UMKM, startup, dan kebutuhan brand profesional yang ingin hasil cepat dan bersih.
              </p>

              <div className="mb-8 flex flex-col gap-3 text-sm text-[#191c1e]">
                <Feature icon="schedule" text={`${service.deliveryDays} Hari Pengerjaan`} />
                <Feature icon="autorenew" text={`${service.revisionLimit} Kali Revisi`} />
                <Feature icon="check_circle" text="File Sumber Disertakan" />
                <Feature icon="check_circle" text="Resolusi Tinggi" />
                <Feature icon="check_circle" text="Hak Komersial Penuh" />
              </div>

              <Link
                href={`/checkout/${service.slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Pesan Sekarang
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <Link
                href={`/chat/new?serviceId=${service.id}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#c3c6d7] py-3 text-sm font-medium text-[#191c1e] transition-colors hover:border-[#004ac6] hover:text-[#004ac6]"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Diskusi via Chat
              </Link>

              <div className="mt-4 text-center">
                <button className="cursor-pointer border-none bg-transparent text-xs font-medium text-[#434655] transition-colors hover:text-[#004ac6]">
                  Bandingkan Paket
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[20px] text-[#004ac6]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
