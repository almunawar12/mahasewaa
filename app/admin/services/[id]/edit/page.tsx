import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../../_form";
import { updateServiceAction } from "../../actions";

export const metadata = { title: "Admin · Edit Service" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
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
        defaults={{
          title: service.title,
          slug: service.slug,
          description: service.description,
          basePrice: service.basePrice.toString(),
          revisionLimit: service.revisionLimit,
          deliveryDays: service.deliveryDays,
          imageUrls: images,
        }}
        submitLabel="Update Service"
      />
    </div>
  );
}
