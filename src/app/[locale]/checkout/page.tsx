import { setRequestLocale } from "next-intl/server";
import { storeApi } from "@/lib/store-api";
import { CheckoutForm } from "@/components/store/checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const zones = await storeApi.getShippingZones();
  return <CheckoutForm zones={zones} />;
}
