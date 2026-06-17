"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";

interface CheckoutFormProps {
  action: (formData: FormData) => Promise<void>;
  userId: string;
}

export function CheckoutForm({ action, userId }: CheckoutFormProps) {
  const [briefFileUrl, setBriefFileUrl] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="briefNotes">Detail kebutuhan Anda</Label>
        <textarea
          id="briefNotes"
          name="briefNotes"
          required
          minLength={10}
          rows={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Lampiran Brief (opsional)</Label>
        <FileUpload
          bucket="uploads"
          path={`briefs/${userId}`}
          accept="image/*,application/pdf,.doc,.docx,.zip"
          label="Upload File Brief"
          onUpload={(url) => setBriefFileUrl(url)}
        />
        <input type="hidden" name="briefFileUrl" value={briefFileUrl} />
      </div>
      <Button type="submit" className="w-full">Buat Pesanan</Button>
    </form>
  );
}
