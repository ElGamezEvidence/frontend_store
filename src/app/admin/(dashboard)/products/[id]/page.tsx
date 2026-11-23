import { notFound } from "next/navigation";
import { storeApi } from "@/lib/store-api";
import { toNumber } from "@/lib/money";
import { ProductForm } from "@/components/admin/product-form";
import { archiveProductAction } from "@/actions/products";
import { Button } from "@/components/ui/button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product: Record<string, unknown>;
  let categories: Array<Record<string, unknown>>;
  try {
    [product, categories] = await Promise.all([storeApi.adminProduct(id), storeApi.getCategories()]);
  } catch {
    notFound();
  }

  const images = (product.images as Array<Record<string, unknown>>) || [];
  const variants = (product.variants as Array<Record<string, unknown>>) || [];
  const productCategories = (product.categories as Array<{ categoryId: string }>) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Modifier · {String(product.name)}</h1>
        <form
          action={async () => {
            "use server";
            await archiveProductAction(id);
          }}
        >
          <Button type="submit" variant="destructive">
            Archiver
          </Button>
        </form>
      </div>
      <ProductForm
        productId={id}
        categories={categories.map((c) => ({ id: String(c.id), name: String(c.name) }))}
        initial={{
          name: String(product.name),
          slug: String(product.slug),
          shortDescription: product.shortDescription ? String(product.shortDescription) : null,
          description: product.description ? String(product.description) : null,
          features: product.features ? String(product.features) : null,
          price: toNumber(product.price as never),
          compareAtPrice: product.compareAtPrice != null ? toNumber(product.compareAtPrice as never) : null,
          costPrice: product.costPrice != null ? toNumber(product.costPrice as never) : null,
          sku: String(product.sku),
          status: product.status as "DRAFT" | "ACTIVE" | "ARCHIVED",
          isFeatured: Boolean(product.isFeatured),
          isPopular: Boolean(product.isPopular),
          isOnSale: Boolean(product.isOnSale),
          categoryIds: productCategories.map((c) => c.categoryId),
          images: images.map((img, index) => ({
            url: String(img.url),
            alt: img.alt ? String(img.alt) : null,
            sortOrder: Number(img.sortOrder ?? index),
            isPrimary: Boolean(img.isPrimary),
          })),
          variants: variants.map((v, index) => ({
            id: String(v.id),
            name: String(v.name),
            sku: String(v.sku),
            price: v.price != null ? toNumber(v.price as never) : null,
            isAvailable: Boolean(v.isAvailable),
            sortOrder: Number(v.sortOrder ?? index),
          })),
        }}
      />
    </div>
  );
}
