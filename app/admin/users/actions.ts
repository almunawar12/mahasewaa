"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const roleSchema = z.enum(["CLIENT", "ADMIN"]);

export async function setUserRoleAction(id: string, formData: FormData) {
  const session = await requireAdmin();
  if (id === session.user.id) throw new Error("Tidak bisa ubah role akun sendiri");
  const role = roleSchema.parse(formData.get("role"));
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}
