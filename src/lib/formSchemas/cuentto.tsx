import { z } from "zod";
export const CuenttoSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title cannot be longer than 80 characters"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().optional(),
  moodId: z.coerce.number().min(1, "Select at least one emotion"),
  musicId: z.coerce.number().optional(),
  groupIds: z.array(z.number()).optional(),
});
export type CuenttoCreateData = z.infer<typeof CuenttoSchema>;