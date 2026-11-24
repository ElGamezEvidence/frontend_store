import { z } from "zod";

const phoneRegex = /^(0|\+212|212)?[5-7]\d{8}$/;

export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional().nullable(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "validation.fullNameMin")
    .max(120, "validation.fullNameMax"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "validation.phoneInvalid"),
  phoneSecondary: z
    .string()
    .trim()
    .regex(phoneRegex, "validation.phoneInvalid")
    .optional()
    .or(z.literal("")),
  region: z.string().trim().min(2).optional().or(z.literal("")),
  city: z.string().trim().min(2, "validation.cityRequired"),
  addressLine: z.string().trim().min(5, "validation.addressMin").max(500),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  shippingType: z.enum(["HOME", "PICKUP_POINT"]),
  items: z.array(cartItemSchema).min(1, "validation.cartEmpty"),
  idempotencyKey: z.string().min(16).max(80),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
