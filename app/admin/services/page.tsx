import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatIDR } from "@/lib/utils";
import { toggleServiceAction, deleteServiceAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Services" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        action={
          <Link href="/admin/services/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">+ Tambah Service</Button>
          </Link>
        }
      />

      {services.length === 0 ? (
        <AdminEmptyState
          message="Belum ada service."
          actionHref="/admin/services/new"
          actionLabel="Tambah sekarang"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-slate-500">/{s.slug}</p>
                    </td>
                    <td className="px-4 py-3">{formatIDR(s.basePrice.toString())}</td>
                    <td className="px-4 py-3">{s.deliveryDays} hari</td>
                    <td className="px-4 py-3">{s._count.orders}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          s.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/services/${s.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await toggleServiceAction(s.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit">
                            {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteServiceAction(s.id);
                          }}
                        >
                          <Button variant="destructive" size="sm" type="submit">
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
