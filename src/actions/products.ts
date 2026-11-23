"use server";

import { revalidatePath } from "next/cache";
import { storeApi } from "@/lib/store-api";
import type { ProductFormValues } from "@/validations/product";

export async function createProductAction(data: ProductFormValues) {
  try {
    const product = (await storeApi.adminCreateProduct(data)) as { id: string; slug: string };
    revalidatePath("/admin/products");
    return { ok: true as const, id: product.id, slug: product.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}

export async function updateProductAction(id: string, data: ProductFormValues) {
  try {
    await storeApi.adminUpdateProduct(id, data);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}

export async function archiveProductAction(id: string) {
  try {
    await storeApi.adminArchiveProduct(id);
    revalidatePath("/admin/products");
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}
