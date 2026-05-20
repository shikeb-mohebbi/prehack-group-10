import { z } from "zod";

export const calorieAnalyzeSchema = z.object({
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp);base64,/i, "Upload a PNG, JPG, or WebP image")
    .max(8_000_000, "Image must be under 5.5 MB")
    .optional(),
  imageName: z.string().trim().max(160).optional(),
  description: z.string().trim().max(600).optional(),
}).refine((value) => value.imageDataUrl || value.description, {
  message: "Upload a food photo or describe the meal",
  path: ["imageDataUrl"],
});
