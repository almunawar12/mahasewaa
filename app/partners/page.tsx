import type { Metadata } from "next"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { PartnerCard } from "@/components/features/PartnerCard"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Our Partners — MahaSewa",
  description: "Kenali tim partner profesional kami yang siap membantu kebutuhan digital Anda.",
}

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { name: true } } },
  })

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-12 md:px-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#191c1e] mb-3">Our Partners</h1>
          <p className="text-[#434655] text-lg max-w-xl mx-auto">
            Tim profesional kami siap membantu kebutuhan digital Anda dengan keahlian terbaik.
          </p>
          <p className="text-sm text-[#434655] mt-2">{partners.length} partner aktif</p>
        </div>

        {partners.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-medium">Belum ada partner</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                name={partner.name}
                photoUrl={partner.photoUrl}
                skills={partner.skills}
                categories={partner.categories.map((c) => c.name)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
