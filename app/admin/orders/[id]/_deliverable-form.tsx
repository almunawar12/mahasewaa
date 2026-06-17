"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { toast } from "sonner";

interface DeliverableFormProps {
  orderId: string;
  currentUrl: string | null;
  action: (formData: FormData) => Promise<void>;
}

export function DeliverableForm({ orderId, currentUrl, action }: DeliverableFormProps) {
  const [deliveryFileUrl, setDeliveryFileUrl] = useState(currentUrl ?? "");
  const [isUploaded, setIsUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!deliveryFileUrl) {
      toast.error("Upload file deliverable terlebih dahulu");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.set("deliveryFileUrl", deliveryFileUrl);
    try {
      await action(formData);
      toast.success("Deliverable dikirim. Status order → REVIEW");
      setIsUploaded(false);
      setSubmitting(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim deliverable");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FileUpload
        bucket="uploads"
        path={`deliverables/${orderId}`}
        accept="image/*,application/pdf,.zip,.doc,.docx"
        label="Upload File Deliverable"
        onUpload={(url) => {
          setDeliveryFileUrl(url);
          setIsUploaded(true);
        }}
      />
      {currentUrl && (
        <p className="text-xs text-slate-500 break-all">
          File saat ini:{" "}
          <a href={currentUrl} target="_blank" className="text-emerald-600 underline">
            {currentUrl.split("/").pop()}
          </a>
        </p>
      )}
      <Button type="submit" disabled={!isUploaded || submitting} className="w-full" size="sm">
        {submitting ? "Mengirim…" : "Submit & Set REVIEW"}
      </Button>
    </form>
  );
}
