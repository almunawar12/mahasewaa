import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function uploadPhoto(file: File, bucket: string): Promise<string> {
  const supabase = getAdminClient()
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
  const supabase = getAdminClient()
  await supabase.storage.from(bucket).remove([filename])
}
