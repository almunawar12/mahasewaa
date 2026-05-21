"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { serviceCreateSchema } from "@/lib/validations/service";

function parseImages(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  return String(raw)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const parsed = serviceCreateSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    revisionLimit: formData.get("revisionLimit"),
    deliveryDays: formData.get("deliveryDays"),
    imageUrls: parseImages(formData.get("imageUrls")),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

  await prisma.service.create({ data: parsed.data });
  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateServiceAction(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = serviceCreateSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    basePrice: formData.get("basePrice"),
    revisionLimit: formData.get("revisionLimit"),
    deliveryDays: formData.get("deliveryDays"),
    imageUrls: parseImages(formData.get("imageUrls")),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Input tidak valid");

  await prisma.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/services");
  revalidatePath(`/services/${parsed.data.slug}`);
  redirect("/admin/services");
}

export async function toggleServiceAction(id: string) {
  await requireAdmin();
  const svc = await prisma.service.findUnique({ where: { id }, select: { isActive: true } });
  if (!svc) return;
  await prisma.service.update({ where: { id }, data: { isActive: !svc.isActive } });
  revalidatePath("/admin/services");
}

export async function deleteServiceAction(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  revalidatePath("/admin/services");
}
