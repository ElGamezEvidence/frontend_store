import { apiFetch } from "./api";
import { getAdminToken } from "./auth-cookie";

async function adminToken() {
  return getAdminToken();
}

export const storeApi = {
  getSettings: () => apiFetch<Record<string, unknown>>("/api/settings"),
  getCategories: () => apiFetch<Array<Record<string, unknown>>>("/api/categories"),
  getProducts: (query = "") => apiFetch<{ items: Array<Record<string, unknown>>; total: number; page: number; pageSize: number; totalPages: number }>(`/api/products${query}`),
  getProductBySlug: (slug: string) => apiFetch<Record<string, unknown>>(`/api/products/slug/${slug}`),
  getShippingZones: () =>
    apiFetch<
      Array<{
        region: string;
        city: string;
        homeDeliveryFee: number;
        pickupPointFee: number | null;
        pickupAvailable: boolean;
      }>
    >("/api/shipping/zones"),
  getOrderByNumber: (orderNumber: string) =>
    apiFetch<Record<string, unknown>>(`/api/orders/confirmation/${orderNumber}`),
  checkout: (payload: unknown) =>
    apiFetch<{ orderNumber: string; orderId: string }>("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // admin
  adminDashboard: async (range = "30d") =>
    apiFetch<Record<string, unknown>>(`/api/analytics/dashboard?range=${range}`, {
      token: await adminToken(),
    }),
  adminOrders: async (query = "") =>
    apiFetch<{ items: Array<Record<string, unknown>>; total: number }>(`/api/orders${query}`, {
      token: await adminToken(),
    }),
  adminOrder: async (id: string) =>
    apiFetch<Record<string, unknown>>(`/api/orders/${id}`, { token: await adminToken() }),
  adminTajirCopy: async (id: string) =>
    apiFetch<{ text: string }>(`/api/orders/${id}/tajir-copy`, { token: await adminToken() }),
  adminUpdateStatus: async (id: string, body: { toStatus: string; comment?: string }) =>
    apiFetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      token: await adminToken(),
      body: JSON.stringify(body),
    }),
  adminSetTajirRef: async (id: string, reference: string) =>
    apiFetch(`/api/orders/${id}/tajir-reference`, {
      method: "PATCH",
      token: await adminToken(),
      body: JSON.stringify({ reference }),
    }),
  adminProducts: async (query = "") =>
    apiFetch<{ items: Array<Record<string, unknown>> }>(`/api/products?status=all${query}`, {
      token: await adminToken(),
    }),
  adminProduct: async (id: string) =>
    apiFetch<Record<string, unknown>>(`/api/products/${id}`, { token: await adminToken() }),
  adminCreateProduct: async (body: unknown) =>
    apiFetch("/api/products", {
      method: "POST",
      token: await adminToken(),
      body: JSON.stringify(body),
    }),
  adminUpdateProduct: async (id: string, body: unknown) =>
    apiFetch(`/api/products/${id}`, {
      method: "PUT",
      token: await adminToken(),
      body: JSON.stringify(body),
    }),
  adminArchiveProduct: async (id: string) =>
    apiFetch(`/api/products/${id}`, { method: "DELETE", token: await adminToken() }),
  adminCustomers: async () =>
    apiFetch<{ items: Array<Record<string, unknown>> }>("/api/customers", {
      token: await adminToken(),
    }),
  adminReviews: async () =>
    apiFetch<Array<Record<string, unknown>>>("/api/reviews", { token: await adminToken() }),
  adminModerateReview: async (id: string, status: string) =>
    apiFetch(`/api/reviews/${id}`, {
      method: "PATCH",
      token: await adminToken(),
      body: JSON.stringify({ status }),
    }),
  adminShippingZones: async () =>
    apiFetch<Array<Record<string, unknown>>>("/api/shipping/zones/admin", {
      token: await adminToken(),
    }),
  adminCreateZone: async (body: unknown) =>
    apiFetch("/api/shipping/zones", {
      method: "POST",
      token: await adminToken(),
      body: JSON.stringify(body),
    }),
  adminUsers: async () =>
    apiFetch<Array<Record<string, unknown>>>("/api/users", { token: await adminToken() }),
  adminUpdateSettings: async (body: unknown) =>
    apiFetch("/api/settings", {
      method: "PUT",
      token: await adminToken(),
      body: JSON.stringify(body),
    }),
  adminMe: async () =>
    apiFetch<{ user: { email: string; name: string; role: string } }>("/api/auth/me", {
      token: await adminToken(),
    }),
};
