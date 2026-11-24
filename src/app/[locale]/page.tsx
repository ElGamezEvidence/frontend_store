import { getTranslations, setRequestLocale } from "next-intl/server";
import { Truck, PhoneCall, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { storeApi } from "@/lib/store-api";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";

/** Brand cover — local asset (shopping / marketplace vibe for Soukly). */
const HERO_COVER = "/hero-soukly.jpg";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [settings, popular, onSale, categories] = await Promise.all([
    storeApi.getSettings().catch(() => null),
    storeApi.getProducts("?popular=1&pageSize=8").catch(() => ({ items: [] as Array<Record<string, unknown>> })),
    storeApi.getProducts("?onSale=1&pageSize=8").catch(() => ({ items: [] as Array<Record<string, unknown>> })),
    storeApi.getCategories().catch(() => [] as Array<Record<string, unknown>>),
  ]);

  // Always use the brand teal/gold cover (ignore outdated festive/red settings).
  const heroSrc = HERO_COVER;
  const brand = String(settings?.storeName ?? t("common.brand"));
  const benefits = [
    { icon: ShieldCheck, label: t("home.benefit1") },
    { icon: Truck, label: t("home.benefit2") },
    { icon: PhoneCall, label: t("home.benefit3") },
    { icon: MessageCircle, label: t("home.benefit4") },
  ];

  return (
    <div className="space-y-20 md:space-y-28">
      <section className="relative -mx-4 w-[calc(100%+2rem)] md:-mx-6 md:w-[calc(100%+3rem)] lg:left-1/2 lg:w-screen lg:max-w-[100vw] lg:-translate-x-1/2 lg:mx-0">
        <div className="relative min-h-[78vh] overflow-hidden md:min-h-[86vh]">
          {/* Native img avoids Next image optimizer failures on some CDNs */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt={`${brand} — souk en ligne au Maroc`}
            className="absolute inset-0 h-full w-full object-cover object-center animate-kenburns"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f1c]/88 via-[#0b1f1c]/50 to-[#0b1f1c]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f1c]/70 via-transparent to-[#0b1f1c]/20" />

          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 md:min-h-[86vh] md:px-6 md:pb-20">
            <div className="max-w-2xl animate-fade-up space-y-6 text-white">
              <p className="font-display text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                {brand}
              </p>
              <h1 className="max-w-xl text-xl font-medium leading-snug text-white/92 md:text-2xl">
                {String(settings?.heroTitle || t("home.heroTitle"))}
              </h1>
              <p className="max-w-lg text-base text-white/75 md:text-lg">
                {String(settings?.heroSubtitle || t("home.heroSubtitle"))}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button asChild size="lg" className="bg-white text-[#0b1f1c] hover:bg-white/90">
                  <Link href="/collections">
                    {t("home.cta")}
                    <ArrowRight className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/cart">{t("nav.cart")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Soukly</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{t("home.categories")}</h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={String(category.id)}
              href={`/collections?category=${String(category.slug)}`}
              className="group relative overflow-hidden rounded-2xl bg-[#12352f] px-6 py-10 text-white transition duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
              <p className="relative font-display text-xl font-semibold">
                {locale === "ar" && category.nameAr
                  ? String(category.nameAr)
                  : locale === "en" && category.nameEn
                    ? String(category.nameEn)
                    : String(category.name)}
              </p>
              <p className="relative mt-2 text-sm text-white/65">{t("common.viewAll")}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">{t("home.popular")}</h2>
          <Link href="/collections" className="text-sm font-medium text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {popular.items.map((product) => (
            <ProductCard key={String(product.id)} product={product as never} />
          ))}
        </div>
      </section>

      {onSale.items.length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">{t("home.onSale")}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {onSale.items.map((product) => (
              <ProductCard key={String(product.id)} product={product as never} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] bg-[#12352f] px-6 py-10 text-white md:px-10 md:py-12">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">{t("home.benefitsTitle")}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, label }) => (
            <div key={label} className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-white/90">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
