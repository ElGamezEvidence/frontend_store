import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MessageCircle, Phone, MapPin, Clock } from "lucide-react";
import { storeApi } from "@/lib/store-api";
import { BRAND } from "@/lib/brand";
import { ContactForm } from "@/components/store/contact-form";

const REAL = {
  email: "issamgamez17@gmail.com",
  phone: "+212610364897",
  phoneDisplay: "+212 6 10 36 48 97",
  city: "Maroc",
} as const;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const settings = await storeApi.getSettings().catch(() => ({} as Record<string, unknown>));

  const email = String(settings.email || REAL.email || BRAND.email);
  const phone = String(settings.phone || REAL.phone);
  const whatsapp = String(settings.whatsapp || REAL.phone);
  const phoneDisplay = BRAND.phoneDisplay;

  const cards = [
    {
      icon: Phone,
      label: t("phoneLabel"),
      value: phoneDisplay,
      href: `tel:${phone.replace(/\s/g, "")}`,
      cta: t("call"),
      ltr: true,
    },
    {
      icon: Mail,
      label: t("emailLabel"),
      value: email,
      href: `mailto:${email}`,
      cta: t("write"),
      ltr: true,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: phoneDisplay,
      href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
      cta: t("whatsapp"),
      ltr: true,
    },
  ];

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#12352f] px-6 py-12 text-white md:px-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="relative max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            {BRAND.name}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base text-white/75 md:text-lg">{t("subtitle")}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map(({ icon: Icon, label, value, href, cta, ltr }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group rounded-[1.5rem] border border-border/80 bg-card p-6 shadow-[0_18px_50px_-36px_rgba(11,31,28,0.5)] transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {label}
            </p>
            <p
              className="mt-2 break-all font-medium text-foreground"
              dir={ltr ? "ltr" : undefined}
              style={ltr ? { unicodeBidi: "isolate" } : undefined}
            >
              {value}
            </p>
            <p className="mt-4 text-sm font-medium text-primary group-hover:underline">{cta}</p>
          </a>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-5 rounded-[1.75rem] bg-secondary/50 p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold">{t("infoTitle")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("infoBody")}
          </p>
          <div className="space-y-4 pt-2 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{t("coverage")}</p>
                <p className="text-muted-foreground">{REAL.city} — COD nationwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{t("hours")}</p>
                <p className="text-muted-foreground">{t("hoursValue")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_20px_60px_-42px_rgba(11,31,28,0.55)] md:p-8">
          <h2 className="font-display text-2xl font-semibold">{t("formTitle")}</h2>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">{t("formSubtitle")}</p>
          <ContactForm whatsappE164={whatsapp || REAL.phone} />
        </div>
      </section>
    </div>
  );
}
