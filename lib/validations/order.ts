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
