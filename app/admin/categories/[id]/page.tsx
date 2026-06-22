import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-6">
      <AdminPageHeader title={`Edit: ${category.name}`} backHref="/admin/categories" />

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

        <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
          <p className="text-xs text-red-600">
            Semua jasa di kategori ini akan kehilangan kategorinya.
          </p>
          <form action={deleteCategory}>
            <Button type="submit" variant="destructive" size="sm">
              Hapus Kategori
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
