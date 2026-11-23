import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-semibold">{t("privacyTitle")}</h1>
      <p className="text-muted-foreground">
        Nous collectons uniquement les informations nécessaires au traitement des commandes COD
        (nom, téléphone, adresse). Ces données ne sont pas revendues.
      </p>
    </article>
  );
}
