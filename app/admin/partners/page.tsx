import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deletePartnerAction, togglePartnerAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export default async function PartnersPage() {
  await requireAdmin();

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Partners"
        description={`${partners.length} partner terdaftar`}
        action={
          <Link href="/admin/partners/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Tambah Partner</Button>
          </Link>
        }
      />

      {partners.length === 0 ? (
        <AdminEmptyState
          message="Belum ada partner."
          actionHref="/admin/partners/new"
          actionLabel="Tambah sekarang"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
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
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                        <span className="font-medium text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.categories.length > 0
                        ? p.categories.map((c) => c.name).join(", ")
                        : <span className="italic text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
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
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/partners/${p.id}`}>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await togglePartnerAction(p.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit" className="text-amber-600 hover:text-amber-700">
                            {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deletePartnerAction(p.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:bg-red-50 hover:text-red-700">
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
