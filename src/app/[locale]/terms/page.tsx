import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("termsTitle")}</h1>
      <p className="text-muted-foreground">
        En passant commande, vous acceptez le paiement à la livraison et la confirmation téléphonique
        avant expédition.
      </p>
    </article>
  );
}
