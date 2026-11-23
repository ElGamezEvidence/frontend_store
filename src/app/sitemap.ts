import type { MetadataRoute } from "next";
import { storeApi } from "@/lib/store-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const locales = ["ar", "fr", "en"];
  const staticPaths = ["", "/collections", "/about", "/contact", "/faq", "/privacy", "/terms", "/shipping-policy", "/returns"];

  let products: Array<Record<string, unknown>> = [];
  try {
    const result = await storeApi.getProducts("?pageSize=100");
    products = result.items;
  } catch {
    products = [];
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
    for (const product of products) {
      entries.push({
        url: `${base}/${locale}/products/${String(product.slug)}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }
  return entries;
}
