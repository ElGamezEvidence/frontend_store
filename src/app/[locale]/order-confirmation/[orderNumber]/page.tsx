import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let order: Record<string, unknown>;
  try {
    order = await storeApi.getOrderByNumber(orderNumber);
  } catch {
    notFound();
  }

  const items = (order.items as Array<Record<string, unknown>>) || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold">{t("order.confirmationTitle")}</h1>
        <p className="text-muted-foreground">{t("order.thankYou")}</p>
      </div>

      <div className="rounded-2xl bg-secondary/60 p-5 text-center">
        <p className="text-sm text-muted-foreground">{t("order.orderNumber")}</p>
        <p className="mt-1 font-mono text-xl font-semibold">{String(order.orderNumber)}</p>
      </div>

      <div className="space-y-3 text-sm">
        <p>
          <strong>{String(order.customerName)}</strong> · {String(order.customerPhone)}
        </p>
        <p>
          {String(order.addressLine)}, {String(order.city)}, {String(order.region)}
        </p>
        {items.map((item) => (
          <div key={String(item.id)} className="flex justify-between border-b border-border py-2">
            <span>
              {String(item.productName)} × {String(item.quantity)}
              <span className="ms-2 text-xs text-muted-foreground">{String(item.sku)}</span>
            </span>
            <span>{formatMoney(toNumber(item.lineTotal as never))}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatMoney(toNumber(order.total as never))}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/collections">{t("cart.continue")}</Link>
        </Button>
      </div>
    </div>
  );
}
