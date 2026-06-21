import Link from "next/link"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { deletePartnerAction, togglePartnerAction } from "./actions"

export default async function PartnersPage() {
  await requireAdmin()

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partners</h1>
          <p className="text-sm text-slate-500">{partners.length} partner terdaftar</p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/admin/partners/new">+ Tambah Partner</Link>
        </Button>
      </div>

      {partners.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium">Belum ada partner</p>
          <p className="text-sm mt-1">Tambah partner pertama Anda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Partner</th>
                <th className="px-4 py-3 text-left font-medium">Kategori</th>
                <th className="px-4 py-3 text-left font-medium">Skills</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <span className="font-medium text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.categories.length > 0
                      ? p.categories.map((c) => c.name).join(", ")
                      : <span className="text-slate-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs"
                        >
                          {s}
                        </span>
                      ))}
                      {p.skills.length > 3 && (
                        <span className="text-xs text-slate-400">+{p.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/partners/${p.id}`}
                        className="text-xs text-slate-600 hover:text-emerald-600 underline"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server"
                          await togglePartnerAction(p.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-slate-600 hover:text-amber-600 underline"
                        >
                          {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server"
                          await deletePartnerAction(p.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
