import { getTranslations, setRequestLocale } from "next-intl/server";
import { storeApi } from "@/lib/store-api";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const settings = await storeApi.getSettings().catch(() => ({} as Record<string, unknown>));

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-card p-8">
      <h1 className="font-display text-3xl font-semibold">{t("contactTitle")}</h1>
      <p>Email: {String(settings.email || "")}</p>
      <p>Tél: {String(settings.phone || "")}</p>
      <p>WhatsApp: {String(settings.whatsapp || "")}</p>
    </div>
  );
}
