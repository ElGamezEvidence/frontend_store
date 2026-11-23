import { getTranslations, setRequestLocale } from "next-intl/server";
import { Truck, PhoneCall, ShieldCheck, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { storeApi } from "@/lib/store-api";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";

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

  const benefits = [
    { icon: ShieldCheck, label: t("home.benefit1") },
    { icon: Truck, label: t("home.benefit2") },
    { icon: PhoneCall, label: t("home.benefit3") },
    { icon: MessageCircle, label: t("home.benefit4") },
  ];

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="animate-fade-up space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {String(settings?.storeName ?? t("common.brand"))}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
            {String(settings?.heroTitle || t("home.heroTitle"))}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {String(settings?.heroSubtitle || t("home.heroSubtitle"))}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/collections">{t("home.cta")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cart">{t("nav.cart")}</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-card shadow-lg animate-fade-in md:aspect-square">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${String(settings?.heroImageUrl || "https://images.unsplash.com/photo-1556745753-b2904692e6c6?w=1200")})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {settings?.promoBannerText ? (
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="text-sm font-medium">{String(settings.promoBannerText)}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">{t("home.categories")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={String(category.id)}
              href={`/collections?category=${String(category.slug)}`}
              className="rounded-2xl border border-border bg-card px-5 py-6 shadow-sm transition hover:border-primary/40"
            >
              <p className="font-medium">
                {locale === "ar" && category.nameAr
                  ? String(category.nameAr)
                  : locale === "en" && category.nameEn
                    ? String(category.nameEn)
                    : String(category.name)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">{t("home.popular")}</h2>
          <Link href="/collections" className="text-sm font-medium text-primary">
            {t("common.viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {popular.items.map((product) => (
            <ProductCard key={String(product.id)} product={product as never} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">{t("home.onSale")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {onSale.items.map((product) => (
            <ProductCard key={String(product.id)} product={product as never} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/80 p-8 shadow-sm">
        <h2 className="font-display text-2xl font-semibold">{t("home.benefitsTitle")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-2xl bg-secondary/60 p-5">
              <Icon className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
