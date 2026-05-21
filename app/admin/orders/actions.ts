"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;
const statusSchema = z.enum(STATUSES);

export async function updateOrderStatusAction(id: string, formData: FormData) {
  await requireAdmin();
  const status = statusSchema.parse(formData.get("status"));
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setDeliverableAction(id: string, formData: FormData) {
  await requireAdmin();
  const url = z.string().url().parse(formData.get("deliveryFileUrl"));
  await prisma.order.update({
    where: { id },
    data: { deliveryFileUrl: url, status: "REVIEW" },
  });
  revalidatePath(`/admin/orders/${id}`);
}
