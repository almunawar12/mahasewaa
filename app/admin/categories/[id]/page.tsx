import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";

export const metadata = { title: "Admin · Edit Kategori" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  async function updateCategory(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.category.update({
      where: { id },
      data: { name, slug, icon, isActive },
    });

    redirect("/admin/categories");
  }

  async function deleteCategory() {
    "use server";
    await requireAdmin();
    await prisma.category.delete({ where: { id } });
    redirect("/admin/categories");
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categories" className="text-sm text-slate-500 hover:text-slate-900">
          ← Kategori
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">Edit: {category.name}</h1>
      </div>

      <div className="max-w-xl space-y-6">
        <CategoryForm
          action={updateCategory}
          defaults={{
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            isActive: category.isActive,
          }}
          submitLabel="Simpan Perubahan"
        />

        <form action={deleteCategory}>
          <button
            type="submit"
            className="text-sm font-medium text-red-500 hover:underline"
            onClick={(e) => {
              if (!confirm(`Hapus kategori "${category.name}"? Semua jasa di kategori ini akan kehilangan kategorinya.`))
                e.preventDefault();
            }}
          >
            Hapus kategori ini
          </button>
        </form>
      </div>
    </div>
  );
}
