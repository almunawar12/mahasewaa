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
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      partners: { some: { isActive: true } },
    },
    include: {
      partners: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { categories: false },
      },
    },
    orderBy: { name: "asc" },
  })

  const totalPartners = categories.reduce((sum, c) => sum + c.partners.length, 0)

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-12 md:px-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[#191c1e] mb-3">Our Partners</h1>
          <p className="text-[#434655] text-lg max-w-xl mx-auto">
            Tim profesional kami siap membantu kebutuhan digital Anda dengan keahlian terbaik.
          </p>
          <p className="text-sm text-[#434655] mt-2">{totalPartners} partner aktif</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-medium">Belum ada partner</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category.id}>
                <h2 className="text-xl font-semibold text-[#191c1e] mb-5 pb-2 border-b border-[#c3c6d7]">
                  {category.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {category.partners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      name={partner.name}
                      photoUrl={partner.photoUrl}
                      skills={partner.skills}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
