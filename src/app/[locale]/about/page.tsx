import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert">
      <h1 className="font-display">{t("aboutTitle")}</h1>
      <p>{t("aboutBody")}</p>
    </article>
  );
}
