import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { storeApi } from "@/lib/store-api";
import { toNumber } from "@/lib/money";
import { discountPercent, formatMoney } from "@/lib/utils";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductCard } from "@/components/store/product-card";
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
  const images = (product.images as Array<{ id: string; url: string; alt?: string }> ) || [];
  const variants = (product.variants as Array<{
    id: string;
    name: string;
    sku: string;
    price: unknown;
    isAvailable: boolean;
  }>) || [];
  const similar = await storeApi.getProducts("?pageSize=4").catch(() => ({ items: [] as Array<Record<string, unknown>> }));

  return (
    <div className="space-y-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-muted">
            {images[0] ? (
              <Image src={images[0].url} alt={String(product.name)} fill className="object-cover" priority />
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {discount ? (
                <Badge variant="danger">
                  -{discount}% {t("discount")}
                </Badge>
              ) : null}
              <Badge variant="success">{t("inStock")}</Badge>
            </div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">{String(product.name)}</h1>
            {compareAt && compareAt > price ? (
              <p className="text-muted-foreground line-through">{formatMoney(compareAt)}</p>
            ) : null}
            <p className="text-muted-foreground">{String(product.shortDescription || "")}</p>
          </div>

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

          <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-medium">{t("description")}</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {String(product.description || "")}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">{t("similar")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
