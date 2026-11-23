import { getTranslations, setRequestLocale } from "next-intl/server";

const faqs = [
  { q: "Comment payer ?", a: "Paiement uniquement à la livraison (COD)." },
  { q: "Combien de temps pour la livraison ?", a: "Selon la ville, généralement 1 à 5 jours." },
  { q: "Puis-je annuler ?", a: "Oui, avant l'expédition. Contactez le support." },
];

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-semibold">{t("faqTitle")}</h1>
      {faqs.map((item) => (
        <div key={item.q} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-medium">{item.q}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
        </div>
      ))}
    </div>
  );
}
