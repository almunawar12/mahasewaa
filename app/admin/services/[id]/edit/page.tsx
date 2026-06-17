import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../../_form";
import { updateServiceAction } from "../../actions";

export const metadata = { title: "Admin · Edit Service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!service) notFound();

  const images = Array.isArray(service.imageUrls) ? (service.imageUrls as string[]) : [];

  async function action(formData: FormData) {
    "use server";
    await updateServiceAction(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Service</h1>
      <ServiceForm
        action={action}
        categories={categories}
        defaults={{
          title: service.title,
          slug: service.slug,
          description: service.description,
          basePrice: service.basePrice.toString(),
          revisionLimit: service.revisionLimit,
          deliveryDays: service.deliveryDays,
          imageUrls: images,
          categoryId: service.categoryId,
        }}
        submitLabel="Update Service"
      />
    </div>
  );
}
