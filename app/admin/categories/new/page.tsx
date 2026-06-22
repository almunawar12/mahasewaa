import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export const metadata = { title: "Admin · Tambah Kategori" };

export default async function NewCategoryPage() {
  await requireAdmin();

  async function createCategory(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const icon = formData.get("icon") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.category.create({
      data: { name, slug, icon, isActive },
    });

    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Tambah Kategori" backHref="/admin/categories" />
      <div className="max-w-xl">
        <CategoryForm action={createCategory} submitLabel="Buat Kategori" />
      </div>
    </div>
  );
}
