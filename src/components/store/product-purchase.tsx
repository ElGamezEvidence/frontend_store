"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  isAvailable: boolean;
};

type Props = {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    imageUrl?: string | null;
    variants: Variant[];
  };
};

export function ProductPurchase({ product }: Props) {
  const t = useTranslations("product");
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selected = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? null,
    [product.variants, variantId],
  );

  const price = selected?.price ?? product.price;
  const sku = selected?.sku ?? product.sku;

  function addToCart() {
    if (product.variants.length > 0 && !selected) {
      toast.error("Variante requise");
      return;
    }
    if (selected && !selected.isAvailable) {
      toast.error(t("outOfStock"));
      return;
    }
    addItem({
      productId: product.id,
      variantId: selected?.id ?? null,
      name: product.name,
      variantName: selected?.name ?? null,
      sku,
      price,
      imageUrl: product.imageUrl,
      quantity,
    });
    toast.success(t("addToCart"));
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-3xl font-semibold">{formatMoney(price)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("sku")}: <span className="font-mono">{sku}</span>
        </p>
      </div>

      {product.variants.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("variants")}</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={!variant.isAvailable}
                onClick={() => setVariantId(variant.id)}
                className={`rounded-xl border px-4 py-2 text-sm ${
                  variantId === variant.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border"
                } disabled:opacity-40`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("quantity")}</p>
        <div className="inline-flex items-center rounded-xl border border-border">
          <button type="button" className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
            -
          </button>
          <span className="min-w-10 text-center text-sm font-medium">{quantity}</span>
          <button type="button" className="px-3 py-2" onClick={() => setQuantity((q) => Math.min(50, q + 1))}>
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" variant="outline" onClick={addToCart} className="flex-1">
          {t("addToCart")}
        </Button>
        <Button size="lg" onClick={buyNow} className="flex-1">
          {t("buyNow")}
        </Button>
      </div>
    </div>
  );
}
