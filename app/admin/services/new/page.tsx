import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../_form";
import { createServiceAction } from "../actions";
import { AdminPageHeader } from "@/components/shared/admin-page-header";

export const metadata = { title: "Admin · Service Baru" };

export default async function NewServicePage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Tambah Service" backHref="/admin/services" />
      <ServiceForm action={createServiceAction} categories={categories} submitLabel="Buat Service" />
    </div>
  );
}
