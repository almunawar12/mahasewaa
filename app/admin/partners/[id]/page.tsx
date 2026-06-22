import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { PartnerForm } from "../_form";
import { updatePartnerAction, deletePartnerAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPartnerPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  });
  if (!partner) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const updateAction = updatePartnerAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <AdminPageHeader title="Edit Partner" backHref="/admin/partners" />

      <PartnerForm
        action={updateAction}
        defaults={{
          name: partner.name,
          photoUrl: partner.photoUrl,
          skills: partner.skills,
          categoryIds: partner.categories.map((c) => c.id),
          isActive: partner.isActive,
        }}
        submitLabel="Simpan Perubahan"
        categories={categories}
      />

      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Zona Berbahaya</p>
        <p className="text-xs text-red-600">
          Hapus partner ini secara permanen. Foto juga akan dihapus dari storage.
        </p>
        <form
          action={async () => {
            "use server";
            await deletePartnerAction(id);
          }}
        >
          <Button type="submit" variant="destructive" size="sm">
            Hapus Partner
          </Button>
        </form>
      </div>
    </div>
  );
}
