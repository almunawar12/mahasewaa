import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { setUserRoleAction } from "./actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { AdminEmptyState } from "@/components/shared/admin-empty-state";

export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" />

      {users.length === 0 ? (
        <AdminEmptyState message="Belum ada pengguna." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Gabung</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u.id === session?.user.id;
                  const nextRole = u.role === "ADMIN" ? "CLIENT" : "ADMIN";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            u.role === "ADMIN"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u._count.orders}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400">(akun Anda)</span>
                        ) : (
                          <form
                            action={async (fd) => {
                              "use server";
                              fd.set("role", nextRole);
                              await setUserRoleAction(u.id, fd);
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">
                              Jadikan {nextRole}
                            </Button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
