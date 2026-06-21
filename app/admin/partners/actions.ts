"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-guard"
import { prisma } from "@/lib/prisma"
import { uploadPhoto, deletePhoto } from "@/lib/upload"

const BUCKET = "partner-photos"

function parseSkills(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function parseCategoryIds(formData: FormData): string[] {
  return formData.getAll("categoryIds").map((v) => v.toString()).filter(Boolean)
}

export async function createPartnerAction(formData: FormData) {
  await requireAdmin()

  const name = formData.get("name")?.toString().trim()
  const categoryIds = parseCategoryIds(formData)
  const skills = parseSkills(formData.get("skills")?.toString() ?? null)
  const photoFile = formData.get("photo") as File | null

  if (!name) throw new Error("Nama wajib diisi")
  if (!photoFile || photoFile.size === 0) throw new Error("Foto wajib diupload")

  const photoUrl = await uploadPhoto(photoFile, BUCKET)

  await prisma.partner.create({
    data: {
      name,
      photoUrl,
      skills,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
  revalidatePath("/partners")
  redirect("/admin/partners")
}

export async function updatePartnerAction(id: string, formData: FormData) {
  await requireAdmin()

  const name = formData.get("name")?.toString().trim()
  const categoryIds = parseCategoryIds(formData)
  const skills = parseSkills(formData.get("skills")?.toString() ?? null)
  const photoFile = formData.get("photo") as File | null

  if (!name) throw new Error("Nama wajib diisi")

  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) throw new Error("Partner tidak ditemukan")

  let photoUrl = existing.photoUrl
  if (photoFile && photoFile.size > 0) {
    await deletePhoto(existing.photoUrl, BUCKET)
    photoUrl = await uploadPhoto(photoFile, BUCKET)
  }

  await prisma.partner.update({
    where: { id },
    data: {
      name,
      photoUrl,
      skills,
      categories: { set: categoryIds.map((id) => ({ id })) },
    },
  })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
  revalidatePath("/partners")
  redirect("/admin/partners")
}

export async function deletePartnerAction(id: string) {
  await requireAdmin()

  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return

  await deletePhoto(partner.photoUrl, BUCKET)
  await prisma.partner.delete({ where: { id } })

  revalidatePath("/admin/partners")
  revalidatePath("/services", "layout")
  revalidatePath("/partners")
}

export async function togglePartnerAction(id: string) {
  await requireAdmin()

  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return

  await prisma.partner.update({
    where: { id },
    data: { isActive: !partner.isActive },
  })

  revalidatePath("/admin/partners")
}
