import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SkillTagInput } from "@/components/features/SkillTagInput"

export type PartnerFormDefaults = {
  name?: string
  photoUrl?: string
  skills?: string[]
  categoryIds?: string[]
  isActive?: boolean
}

type CategoryOption = { id: string; name: string }

interface Props {
  action: (formData: FormData) => Promise<void>
  defaults?: PartnerFormDefaults
  submitLabel?: string
  categories: CategoryOption[]
}

export function PartnerForm({
  action,
  defaults = {},
  submitLabel = "Simpan",
  categories,
}: Props) {
  const selectedIds = defaults.categoryIds ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Partner</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Partner</Label>
            <Input
              id="name"
              name="name"
              defaultValue={defaults.name ?? ""}
              placeholder="Contoh: Andi Pratama"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photo">Foto</Label>
            {defaults.photoUrl && (
              <div className="mb-2">
                <img
                  src={defaults.photoUrl}
                  alt="Foto saat ini"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Foto saat ini. Upload baru untuk mengganti.
                </p>
              </div>
            )}
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              required={!defaults.photoUrl}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Kategori (bisa pilih lebih dari satu)</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada kategori aktif.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={c.id}
                      defaultChecked={selectedIds.includes(c.id)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-sm text-slate-700">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Skills / Keahlian</Label>
            <SkillTagInput name="skills" defaultValue={defaults.skills ?? []} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={defaults.isActive ?? true}
              className="h-4 w-4 accent-emerald-600"
            />
            <Label htmlFor="isActive">Partner Aktif</Label>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
