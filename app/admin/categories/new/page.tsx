import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "../_form";

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
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/categories" className="text-sm text-slate-500 hover:text-slate-900">
          ← Kategori
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">Tambah Kategori</h1>
      </div>
      <div className="max-w-xl">
        <CategoryForm action={createCategory} submitLabel="Buat Kategori" />
      </div>
    </div>
  );
}
