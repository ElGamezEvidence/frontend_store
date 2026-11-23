"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { createOrderAction } from "@/actions/orders";
import { useCart } from "@/hooks/use-cart";
import { checkoutSchema, type CheckoutFormValues } from "@/validations/checkout";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Zone = {
  region: string;
  city: string;
  homeDeliveryFee: number;
  pickupPointFee: number | null;
  pickupAvailable: boolean;
};

export function CheckoutForm({ zones }: { zones: Zone[] }) {
  const t = useTranslations();
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [idempotencyKey] = useState(() => nanoid(24));

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      phoneSecondary: "",
      region: zones[0]?.region ?? "",
      city: zones[0]?.city ?? "",
      addressLine: "",
      postalCode: "",
      notes: "",
      shippingType: "HOME",
      items: [],
      idempotencyKey,
      couponCode: "",
    },
  });

  const region = form.watch("region");
  const city = form.watch("city");
  const shippingType = form.watch("shippingType");

  const cities = useMemo(
    () => zones.filter((z) => z.region === region),
    [zones, region],
  );

  const selectedZone = zones.find(
    (z) => z.region === region && z.city.toLowerCase() === city.toLowerCase(),
  );

  const shippingFee =
    shippingType === "PICKUP_POINT"
      ? selectedZone?.pickupAvailable
        ? selectedZone.pickupPointFee ?? 0
        : 0
      : selectedZone?.homeDeliveryFee ?? 0;

  useEffect(() => {
    form.setValue(
      "items",
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    );
  }, [items, form]);

  useEffect(() => {
    if (cities.length && !cities.some((c) => c.city === city)) {
      form.setValue("city", cities[0].city);
    }
  }, [cities, city, form]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        {t("cart.empty")}
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await createOrderAction({
        ...values,
        phoneSecondary: values.phoneSecondary || undefined,
        postalCode: values.postalCode || undefined,
        notes: values.notes || undefined,
        couponCode: values.couponCode || undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      clear();
      toast.success(t("common.success"));
      router.push(`/order-confirmation/${result.orderNumber}`);
    });
  });

  const regions = Array.from(new Set(zones.map((z) => z.region)));

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-3xl font-semibold">{t("checkout.title")}</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
            <Input id="fullName" {...form.register("fullName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("checkout.phone")}</Label>
            <Input id="phone" {...form.register("phone")} placeholder="0612345678" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneSecondary">{t("checkout.phoneSecondary")}</Label>
            <Input id="phoneSecondary" {...form.register("phoneSecondary")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">{t("checkout.region")}</Label>
            <select
              id="region"
              className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              {...form.register("region")}
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("checkout.city")}</Label>
            <select
              id="city"
              className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              {...form.register("city")}
            >
              {cities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressLine">{t("checkout.address")}</Label>
            <Textarea id="addressLine" {...form.register("addressLine")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">{t("checkout.postalCode")}</Label>
            <Input id="postalCode" {...form.register("postalCode")} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">{t("checkout.notes")}</Label>
            <Textarea id="notes" {...form.register("notes")} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">{t("checkout.shipping")}</p>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
            <input type="radio" value="HOME" {...form.register("shippingType")} />
            <span>{t("checkout.shippingHome")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
            <input
              type="radio"
              value="PICKUP_POINT"
              disabled={!selectedZone?.pickupAvailable}
              {...form.register("shippingType")}
            />
            <span>{t("checkout.shippingPickup")}</span>
          </label>
        </div>

        <p className="rounded-xl bg-secondary/70 px-4 py-3 text-sm">{t("checkout.paymentCod")}</p>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">{t("checkout.summary")}</h2>
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`} className="flex justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">
                {item.name} × {item.quantity}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.variantName ? `${item.variantName} · ` : ""}
                {item.sku}
              </p>
            </div>
            <p>{formatMoney(item.price * item.quantity)}</p>
          </div>
        ))}
        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span>{t("cart.subtotal")}</span>
            <span>{formatMoney(subtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("checkout.shipping")}</span>
            <span>{formatMoney(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>{t("cart.total")}</span>
            <span>{formatMoney(subtotal() + shippingFee)}</span>
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? t("common.loading") : t("checkout.placeOrder")}
        </Button>
      </aside>
    </form>
  );
}
