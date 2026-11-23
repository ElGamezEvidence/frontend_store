import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { discountPercent, formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";

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
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-[0_10px_40px_-24px_rgba(15,40,35,0.45)] ring-1 ring-border/70 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_-28px_rgba(15,40,35,0.55)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <SafeImage
          src={image?.url}
          alt={image?.alt || name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        {discount ? (
          <Badge className="absolute start-3 top-3" variant="danger">
            -{discount}% {t("discount")}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">{formatMoney(price)}</span>
          {compareAt && compareAt > price ? (
            <span className="text-sm text-muted-foreground line-through">{formatMoney(compareAt)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
