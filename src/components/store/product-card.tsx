import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { discountPercent, formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    price: unknown;
    compareAtPrice?: unknown;
    images: { url: string; alt?: string | null }[];
    isOnSale?: boolean;
  };
};

export async function ProductCard({ product }: ProductCardProps) {
  const t = await getTranslations("product");
  const locale = await getLocale();
  const price = toNumber(product.price as never);
  const compareAt = product.compareAtPrice != null ? toNumber(product.compareAtPrice as never) : null;
  const discount = discountPercent(price, compareAt);
  const name =
    locale === "ar" && product.nameAr
      ? product.nameAr
      : locale === "en" && product.nameEn
        ? product.nameEn
        : product.name;
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        {discount ? (
          <Badge className="absolute start-3 top-3" variant="danger">
            -{discount}% {t("discount")}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-sm font-medium">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatMoney(price)}</span>
          {compareAt && compareAt > price ? (
            <span className="text-sm text-muted-foreground line-through">{formatMoney(compareAt)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
