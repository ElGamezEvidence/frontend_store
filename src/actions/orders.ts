"use server";

import { revalidatePath } from "next/cache";
import { storeApi } from "@/lib/store-api";
import type { CheckoutPayload } from "@/types";

export async function createOrderAction(payload: CheckoutPayload) {
  try {
    const result = await storeApi.checkout(payload);
    return { ok: true as const, orderNumber: result.orderNumber, orderId: result.orderId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}

export async function updateOrderStatusAction(input: {
  orderId: string;
  toStatus: string;
  comment?: string;
}) {
  try {
    await storeApi.adminUpdateStatus(input.orderId, {
      toStatus: input.toStatus,
      comment: input.comment,
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${input.orderId}`);
    revalidatePath("/admin/tajir");
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}

export async function setTajirReferenceAction(orderId: string, reference: string) {
  try {
    await storeApi.adminSetTajirRef(orderId, reference);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/tajir");
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}

export async function getTajirCopyTextAction(orderId: string) {
  try {
    const result = await storeApi.adminTajirCopy(orderId);
    return { ok: true as const, text: result.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return { ok: false as const, error: message };
  }
}
