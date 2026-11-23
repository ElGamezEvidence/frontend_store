import { setRequestLocale, getTranslations } from "next-intl/server";
import { storeApi } from "@/lib/store-api";
import { ProductCard } from "@/components/store/product-card";
import { Link } from "@/i18n/navigation";

export default async function CollectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const page = Number(sp.page || 1);
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "popular"
      ? sp.sort
      : "newest";

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: "12",
    sort,
    ...(sp.q ? { q: sp.q } : {}),
    ...(sp.category ? { category: sp.category } : {}),
  });

  const [result, categories] = await Promise.all([
    storeApi.getProducts(`?${qs.toString()}`).catch(() => ({
      items: [] as Array<Record<string, unknown>>,
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    })),
    storeApi.getCategories().catch(() => [] as Array<Record<string, unknown>>),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">{t("nav.collections")}</h1>
        <p className="mt-2 text-muted-foreground">{result.total} produits</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/collections"
          className={`rounded-full px-4 py-2 text-sm ${!sp.category ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={String(c.id)}
            href={`/collections?category=${String(c.slug)}`}
            className={`rounded-full px-4 py-2 text-sm ${sp.category === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
          >
            {locale === "ar" && c.nameAr
              ? String(c.nameAr)
              : locale === "en" && c.nameEn
                ? String(c.nameEn)
                : String(c.name)}
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          {t("common.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((product) => (
            <ProductCard key={String(product.id)} product={product as never} />
          ))}
        </div>
      )}
    </div>
  );
}
