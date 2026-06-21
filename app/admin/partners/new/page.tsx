import Link from "next/link"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { PartnerForm } from "../_form"
import { createPartnerAction } from "../actions"

export default async function NewPartnerPage() {
  await requireAdmin()

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/partners" className="hover:text-slate-700">
          Partners
        </Link>
        <span>/</span>
        <span>Tambah Partner</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Tambah Partner</h1>

      <PartnerForm
        action={createPartnerAction}
        submitLabel="Tambah Partner"
        categories={categories}
      />
    </div>
  )
}
