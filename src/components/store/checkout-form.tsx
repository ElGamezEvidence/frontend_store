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
import { MOROCCO_CITY_NAMES, regionForCity } from "@/lib/morocco-cities";
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

const DEFAULT_HOME_FEE = 0;
const DEFAULT_PICKUP_FEE = 0;

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
      region: "",
      city: "",
      addressLine: "",
      postalCode: "",
      notes: "",
      shippingType: "HOME",
      items: [],
      idempotencyKey,
      couponCode: "",
    },
  });

  const city = form.watch("city");
  const shippingType = form.watch("shippingType");

  const selectedZone = useMemo(() => {
    if (!city) return undefined;
    return zones.find((z) => z.city.toLowerCase() === city.toLowerCase());
  }, [zones, city]);

  const shippingFee =
    shippingType === "PICKUP_POINT"
      ? selectedZone?.pickupAvailable
        ? selectedZone.pickupPointFee ?? DEFAULT_PICKUP_FEE
        : DEFAULT_PICKUP_FEE
      : selectedZone?.homeDeliveryFee ?? DEFAULT_HOME_FEE;

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
    if (city) {
      form.setValue("region", regionForCity(city));
    }
  }, [city, form]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        {t("cart.empty")}
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const region = values.region || regionForCity(values.city);
      const result = await createOrderAction({
        ...values,
        region,
        phoneSecondary: values.phoneSecondary || undefined,
        postalCode: undefined,
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

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-3xl font-semibold">{t("checkout.title")}</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
            <Input
              id="fullName"
              autoComplete="name"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive">{t(form.formState.errors.fullName.message as never)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("checkout.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="0612345678"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-destructive">{t(form.formState.errors.phone.message as never)}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneSecondary">{t("checkout.phoneSecondary")}</Label>
            <Input
              id="phoneSecondary"
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="0612345678"
              {...form.register("phoneSecondary")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city">{t("checkout.city")}</Label>
            <select
              id="city"
              className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
              {...form.register("city")}
            >
              <option value="">{t("checkout.selectCity")}</option>
              {MOROCCO_CITY_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {form.formState.errors.city && (
              <p className="text-xs text-destructive">{t(form.formState.errors.city.message as never)}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addressLine">{t("checkout.address")}</Label>
            <Textarea
              id="addressLine"
              rows={3}
              placeholder={t("checkout.addressPlaceholder")}
              {...form.register("addressLine")}
            />
            {form.formState.errors.addressLine && (
              <p className="text-xs text-destructive">{t(form.formState.errors.addressLine.message as never)}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">{t("checkout.notes")}</Label>
            <Textarea id="notes" rows={2} {...form.register("notes")} />
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
              disabled={selectedZone ? !selectedZone.pickupAvailable : false}
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
            <span className={shippingFee === 0 ? "font-medium text-primary" : undefined}>
              {shippingFee === 0 ? t("checkout.shippingFree") : formatMoney(shippingFee)}
            </span>
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
