import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { PartnerForm } from "../_form";
import { createPartnerAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export default async function NewPartnerPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <AdminPageHeader title="Tambah Partner" backHref="/admin/partners" />
      <PartnerForm
        action={createPartnerAction}
        submitLabel="Tambah Partner"
        categories={categories}
      />
    </div>
  );
}
