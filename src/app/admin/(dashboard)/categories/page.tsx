import { storeApi } from "@/lib/store-api";

export default async function AdminCategoriesPage() {
  const categories = await storeApi.getCategories();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Catégories</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map((c) => (
          <div key={String(c.id)} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-medium">{String(c.name)}</p>
            <p className="text-xs text-muted-foreground">{String(c.slug)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
