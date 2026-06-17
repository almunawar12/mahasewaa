import { z } from "zod";

export const orderCreateSchema = z.object({
  serviceId: z.string().uuid(),
  briefNotes: z.string().min(10).max(2000),
  briefFileUrl: z.string().url().optional(),
  totalAmount: z.coerce.number().positive(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

export const customOfferSchema = z.object({
  roomId: z.string().uuid(),
  offerPrice: z.coerce.number().positive(),
  content: z.string().min(1),
});

export type CustomOfferInput = z.infer<typeof customOfferSchema>;

export const reviewSchema = z.object({
  orderId: z.string().uuid(),
  serviceId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
