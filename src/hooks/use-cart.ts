"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  sku: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

function sameLine(a: CartLine, productId: string, variantId?: string | null) {
  return a.productId === productId && (a.variantId ?? null) === (variantId ?? null);
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) =>
            sameLine(i, item.productId, item.variantId),
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.variantId)
                  ? { ...i, quantity: Math.min(50, i.quantity + (item.quantity ?? 1)) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: item.quantity ?? 1, variantId: item.variantId ?? null },
            ],
          };
        });
      },
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, variantId)),
        }));
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, productId, variantId)
              ? { ...i, quantity: Math.min(50, quantity) }
              : i,
          ),
        }));
      },
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "ghazala-cart" },
  ),
);
