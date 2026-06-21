import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { PartnerForm } from "../_form"
import { updatePartnerAction, deletePartnerAction } from "../actions"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPartnerPage({ params }: Props) {
  await requireAdmin()

  const { id } = await params
  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) notFound()

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const updateAction = updatePartnerAction.bind(null, id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/partners" className="hover:text-slate-700">
          Partners
        </Link>
        <span>/</span>
        <span>{partner.name}</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-800">Edit Partner</h1>

      <PartnerForm
        action={updateAction}
        defaults={{
          name: partner.name,
          photoUrl: partner.photoUrl,
          skills: partner.skills,
          categoryId: partner.categoryId,
          isActive: partner.isActive,
        }}
        submitLabel="Simpan Perubahan"
        categories={categories}
      />

      <div className="border border-red-200 rounded-lg p-4 space-y-3 bg-red-50">
        <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
        <p className="text-xs text-red-600">
          Hapus partner ini secara permanen. Foto juga akan dihapus dari storage.
        </p>
        <form
          action={async () => {
            "use server"
            await deletePartnerAction(id)
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
          >
            Hapus Partner
          </button>
        </form>
      </div>
    </div>
  )
}
