export type Locale = "fr" | "ar" | "en";

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "SUPPORT";
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "SENT_TO_TAJIR"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "FAILED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ShippingType = "HOME" | "PICKUP_POINT";

export type CartItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CheckoutPayload = {
  fullName: string;
  phone: string;
  phoneSecondary?: string;
  region: string;
  city: string;
  addressLine: string;
  postalCode?: string;
  notes?: string;
  shippingType: ShippingType;
  items: CartItemInput[];
  idempotencyKey: string;
  couponCode?: string;
};

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};
