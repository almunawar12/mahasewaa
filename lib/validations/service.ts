import { z } from "zod";

export const serviceCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug huruf kecil + dash"),
  description: z.string().min(20),
  basePrice: z.coerce.number().positive(),
  revisionLimit: z.coerce.number().int().min(0).default(1),
  deliveryDays: z.coerce.number().int().min(1).default(7),
  imageUrls: z.array(z.string().url()).default([]),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
