import type { Metadata } from "next"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { PartnersGrid } from "@/components/features/PartnersGrid"
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

  const data = partners.map((p) => ({
    id: p.id,
    name: p.name,
    photoUrl: p.photoUrl,
    skills: p.skills,
    categories: p.categories.map((c) => c.name),
  }))

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 py-12 md:px-16">
        <div className="mb-10 text-center animate-fade-up">
          <h1 className="text-4xl font-bold text-[#191c1e] mb-3">Our Partners</h1>
          <p className="text-[#434655] text-lg max-w-xl mx-auto">
            Tim profesional kami siap membantu kebutuhan digital Anda dengan keahlian terbaik.
          </p>
          <p className="text-sm text-[#434655] mt-2">{data.length} partner aktif</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-20 text-slate-400 animate-fade-up">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-lg font-medium">Belum ada partner</p>
          </div>
        ) : (
          <PartnersGrid partners={data} />
        )}
      </main>

      <Footer />
    </>
  )
}
