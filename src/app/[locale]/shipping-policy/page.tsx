import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ShippingPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("shippingTitle")}</h1>
      <p className="text-muted-foreground">
        Les frais de livraison dépendent de la ville et du mode choisi (domicile ou point relais).
        Les tarifs sont configurés dans l&apos;administration.
      </p>
    </article>
  );
}
