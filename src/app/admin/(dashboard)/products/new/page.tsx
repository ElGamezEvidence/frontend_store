import { storeApi } from "@/lib/store-api";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await storeApi.getCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Nouveau produit</h1>
      <ProductForm
        categories={categories.map((c) => ({ id: String(c.id), name: String(c.name) }))}
      />
    </div>
  );
}
