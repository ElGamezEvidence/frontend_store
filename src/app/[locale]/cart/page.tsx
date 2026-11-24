"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const t = useTranslations();
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border p-12 text-center">
        <h1 className="font-display text-2xl font-semibold">{t("cart.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("cart.empty")}</p>
        <Button asChild className="mt-6">
          <Link href="/collections">{t("cart.continue")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("cart.title")}</h1>
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-muted">
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover" /> : null}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantName ? <p className="text-sm text-muted-foreground">{item.variantName}</p> : null}
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <p className="font-semibold">{formatMoney(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-lg border">
                  <button
                    type="button"
                    className="px-2 py-1"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="px-2 text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="px-2 py-1"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="text-sm text-destructive"
                  onClick={() => removeItem(item.productId, item.variantId)}
                >
                  {t("cart.remove")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex justify-between text-sm">
          <span>{t("cart.subtotal")}</span>
          <span className="font-semibold">{formatMoney(subtotal())}</span>
        </div>
        <p className="mt-2 text-xs font-medium text-primary">{t("cart.shippingEstimate")}</p>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatMoney(subtotal())}</span>
        </div>
        <Button asChild className="mt-6 w-full" size="lg">
          <Link href="/checkout">{t("cart.checkout")}</Link>
        </Button>
      </aside>
    </div>
  );
}
