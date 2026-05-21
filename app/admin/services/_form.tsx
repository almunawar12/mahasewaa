import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ServiceFormDefaults = {
  title?: string;
  slug?: string;
  description?: string;
  basePrice?: string;
  revisionLimit?: number;
  deliveryDays?: number;
  imageUrls?: string[];
};

export function ServiceForm({
  action,
  defaults = {},
  submitLabel = "Simpan",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: ServiceFormDefaults;
  submitLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={defaults.title} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={defaults.slug} required pattern="[a-z0-9-]+" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={defaults.description}
              required
              minLength={20}
              rows={6}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="basePrice">Harga Dasar (Rp)</Label>
              <Input id="basePrice" name="basePrice" type="number" min={0} defaultValue={defaults.basePrice} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revisionLimit">Limit Revisi</Label>
              <Input
                id="revisionLimit"
                name="revisionLimit"
                type="number"
                min={0}
                defaultValue={defaults.revisionLimit ?? 1}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryDays">Lama Pengerjaan (hari)</Label>
              <Input
                id="deliveryDays"
                name="deliveryDays"
                type="number"
                min={1}
                defaultValue={defaults.deliveryDays ?? 7}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrls">Image URLs (satu per baris)</Label>
            <textarea
              id="imageUrls"
              name="imageUrls"
              defaultValue={(defaults.imageUrls ?? []).join("\n")}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              placeholder="https://…"
            />
          </div>

          <Button type="submit">{submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
