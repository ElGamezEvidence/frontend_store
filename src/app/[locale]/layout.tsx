import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Fraunces, Manrope } from "next/font/google";
import { routing } from "@/i18n/routing";
import { storeApi } from "@/lib/store-api";
import { StoreHeader } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";

export const dynamic = "force-dynamic";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "ar" | "en")) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  let storeName = "Soukly";
  try {
    const settings = await storeApi.getSettings();
    storeName = String(settings.storeName || storeName);
  } catch {
    /* backend may be offline — keep fallback brand */
  }
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      lang={locale}
      dir={dir}
      className={`${display.variable} ${body.variable} min-h-screen overflow-x-hidden store-gradient`}
    >
      <NextIntlClientProvider messages={messages}>
        <StoreHeader storeName={storeName} />
        <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-0 md:px-6 md:py-0">
          <div className="py-6 md:py-10">{children}</div>
        </main>
        <StoreFooter storeName={storeName} />
      </NextIntlClientProvider>
    </div>
  );
}
