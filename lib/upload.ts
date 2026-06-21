import { supabase } from "@/lib/supabase"

export async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg"
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload gagal: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function deletePhoto(url: string, bucket: string): Promise<void> {
  const filename = url.split("/").pop()
  if (!filename) return
  await supabase.storage.from(bucket).remove([filename])
}
