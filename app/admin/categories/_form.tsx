import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ICON_OPTIONS = [
  { value: "design_services", label: "Desain Grafis" },
  { value: "code", label: "Programming" },
  { value: "edit_document", label: "Penulisan" },
  { value: "campaign", label: "Marketing" },
  { value: "photo_camera", label: "Fotografi" },
  { value: "movie", label: "Video" },
  { value: "music_note", label: "Musik / Audio" },
  { value: "translate", label: "Terjemahan" },
  { value: "manage_accounts", label: "Bisnis" },
  { value: "category", label: "Lainnya" },
];

export type CategoryFormDefaults = {
  name?: string;
  slug?: string;
  icon?: string;
  isActive?: boolean;
};

export function CategoryForm({
  action,
  defaults = {},
  submitLabel = "Simpan",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: CategoryFormDefaults;
  submitLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaults.name}
                placeholder="Desain Grafis"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={defaults.slug}
                placeholder="desain-grafis"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="text-xs text-slate-400">Huruf kecil, angka, dan tanda - saja</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon">Ikon (Material Symbols)</Label>
            <select
              id="icon"
              name="icon"
              defaultValue={defaults.icon ?? "category"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={defaults.isActive !== false}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
            />
            <Label htmlFor="isActive">Aktif (tampil di halaman publik)</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{submitLabel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
