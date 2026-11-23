import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ReturnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("returnsTitle")}</h1>
      <p className="text-muted-foreground">
        Les retours sont traités au cas par cas selon l&apos;état du produit et le motif. Contactez le
        support avant tout renvoi.
      </p>
    </article>
  );
}
