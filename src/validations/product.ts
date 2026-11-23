import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().min(1).max(80),
  price: z.number().positive().optional().nullable(),
  compareAtPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).optional().nullable(),
  isAvailable: z.boolean().default(true),
  attributes: z.record(z.string(), z.string()).optional().nullable(),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (v) => !v || v.startsWith("data:image/") || /^https?:\/\//i.test(v),
      "Invalid image URL",
    ),
  sortOrder: z.number().int().default(0),
});

const imageUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => v.startsWith("data:image/") || /^https?:\/\//i.test(v),
    "Invalid image URL",
  );

export const productSchema = z.object({
  name: z.string().trim().min(2).max(200),
  nameAr: z.string().trim().max(200).optional().nullable(),
  nameEn: z.string().trim().max(200).optional().nullable(),
  slug: z.string().trim().min(2).max(220).optional(),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().max(10000).optional().nullable(),
  descriptionAr: z.string().trim().max(10000).optional().nullable(),
  descriptionEn: z.string().trim().max(10000).optional().nullable(),
  features: z.string().trim().max(5000).optional().nullable(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  sku: z.string().trim().min(1).max(80),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  stockQuantity: z.number().int().min(0).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  categoryIds: z.array(z.string().cuid()).default([]),
  images: z
    .array(
      z.object({
        url: imageUrlSchema,
        alt: z.string().optional().nullable(),
        sortOrder: z.number().int().default(0),
        isPrimary: z.boolean().default(false),
      }),
    )
    .default([]),
  variants: z.array(productVariantSchema).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
