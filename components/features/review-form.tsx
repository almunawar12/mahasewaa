"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReviewFormProps {
  orderId: string;
  serviceId: string;
  action: (formData: FormData) => Promise<void>;
}

export function ReviewForm({ orderId, serviceId, action }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Pilih rating bintang terlebih dahulu");
      return;
    }
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("rating", String(rating));
    formData.set("orderId", orderId);
    formData.set("serviceId", serviceId);
    try {
      await action(formData);
      toast.success("Review berhasil dikirim!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim review");
      setSubmitting(false);
    }
  }

  const activeStars = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${star} bintang`}
            >
              <span
                className={`material-symbols-outlined text-3xl ${
                  activeStars >= star ? "icon-fill text-amber-400" : "text-slate-300"
                }`}
              >
                star
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="comment" className="text-sm font-medium text-slate-700">
          Komentar (opsional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={500}
          placeholder="Bagaimana pengalaman Anda?"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        />
      </div>

      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting ? "Mengirim…" : "Kirim Review"}
      </Button>
    </form>
  );
}
