import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "fr", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Keep Arabic as entry locale (ignore browser Accept-Language → /en)
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
