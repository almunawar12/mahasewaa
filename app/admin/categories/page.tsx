import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin · Kategori" };

export default async function CategoriesPage() {
  await requireAdmin();

  async function deleteCategory(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Kategori</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Tambah Kategori
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          Belum ada kategori.{" "}
          <Link href="/admin/categories/new" className="font-medium text-emerald-600 hover:underline">
            Tambah sekarang
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Ikon</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Jasa</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-500">
                      {cat.icon}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{cat._count.services}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {cat.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-500 hover:underline"
                          onClick={(e) => {
                            if (!confirm(`Hapus kategori "${cat.name}"?`)) e.preventDefault();
                          }}
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
  );
}
