import { notFound } from "next/navigation";
import { Check, PhoneCall, ShieldCheck, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { storeApi } from "@/lib/store-api";
import { toNumber } from "@/lib/money";
import { discountPercent, formatMoney } from "@/lib/utils";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { Badge } from "@/components/ui/badge";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");

  let product: Record<string, unknown>;
  try {
    product = await storeApi.getProductBySlug(slug);
  } catch {
    notFound();
  }

  const price = toNumber(product.price as never);
  const compareAt = product.compareAtPrice != null ? toNumber(product.compareAtPrice as never) : null;
  const discount = discountPercent(price, compareAt);
  const images = (product.images as Array<{ id: string; url: string; alt?: string }>) || [];
  const variants = (product.variants as Array<{
    id: string;
    name: string;
    sku: string;
    price: unknown;
    isAvailable: boolean;
  }>) || [];
  const features = String(product.features || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const similar = await storeApi.getProducts("?pageSize=8").catch(() => ({
    items: [] as Array<Record<string, unknown>>,
  }));

  const name =
    locale === "ar" && product.nameAr
      ? String(product.nameAr)
      : locale === "en" && product.nameEn
        ? String(product.nameEn)
        : String(product.name);

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <ProductGallery images={images} name={name} />

        <div className="space-y-7 lg:sticky lg:top-24">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {discount ? (
                <Badge variant="danger">
                  -{discount}% {t("discount")}
                </Badge>
              ) : null}
              <Badge variant="success">{t("inStock")}</Badge>
            </div>

            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              {name}
            </h1>

            {product.shortDescription ? (
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {String(product.shortDescription)}
              </p>
            ) : null}

            {compareAt && compareAt > price ? (
              <p className="text-sm text-muted-foreground">
                <span className="line-through">{formatMoney(compareAt)}</span>
                <span className="ms-2 font-medium text-primary">
                  -{discount}% {t("discount")}
                </span>
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[0_20px_60px_-40px_rgba(11,31,28,0.55)] md:p-6">
            <ProductPurchase
              product={{
                id: String(product.id),
                name: String(product.name),
                sku: String(product.sku),
                price,
                imageUrl: images[0]?.url,
                variants: variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  sku: v.sku,
                  price: v.price != null ? toNumber(v.price as never) : null,
                  isAvailable: v.isAvailable,
                })),
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: t("inStock") },
              { icon: Truck, label: "COD Maroc" },
              { icon: PhoneCall, label: "Confirm. tel." },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-3 text-sm font-medium"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.75rem] bg-card p-6 ring-1 ring-border/70 md:p-8">
          <h2 className="font-display text-2xl font-semibold">{t("description")}</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:text-base">
            {String(product.description || product.shortDescription || "")}
          </p>
        </div>

        {features.length > 0 ? (
          <div className="space-y-4 rounded-[1.75rem] bg-[#12352f] p-6 text-white md:p-8">
            <h2 className="font-display text-2xl font-semibold">{t("features")}</h2>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/90 md:text-base">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-semibold">{t("similar")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {similar.items
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={String(p.id)} product={p as never} />
            ))}
        </div>
      </section>
    </div>
  );
}
