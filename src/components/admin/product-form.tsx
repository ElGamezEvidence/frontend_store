"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/actions/products";
import type { ProductFormValues } from "@/validations/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryOption = { id: string; name: string };

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: CategoryOption[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [variants, setVariants] = useState(
    initial?.variants?.length
      ? initial.variants
      : [],
  );

  function onSubmit(formData: FormData) {
    const categoryIds = formData.getAll("categoryIds").map(String);
    const payload: ProductFormValues = {
      name: String(formData.get("name") || ""),
      nameAr: String(formData.get("nameAr") || "") || null,
      nameEn: String(formData.get("nameEn") || "") || null,
      slug: String(formData.get("slug") || "") || undefined,
      shortDescription: String(formData.get("shortDescription") || "") || null,
      description: String(formData.get("description") || "") || null,
      features: String(formData.get("features") || "") || null,
      price: Number(formData.get("price")),
      compareAtPrice: formData.get("compareAtPrice")
        ? Number(formData.get("compareAtPrice"))
        : null,
      costPrice: formData.get("costPrice") ? Number(formData.get("costPrice")) : null,
      sku: String(formData.get("sku") || ""),
      status: String(formData.get("status") || "DRAFT") as ProductFormValues["status"],
      isFeatured: formData.get("isFeatured") === "on",
      isPopular: formData.get("isPopular") === "on",
      isOnSale: formData.get("isOnSale") === "on",
      categoryIds,
      images: String(formData.get("imageUrl") || "")
        ? [{ url: String(formData.get("imageUrl")), isPrimary: true, sortOrder: 0 }]
        : [],
      variants: variants.map((v, index) => ({
        ...v,
        name: v.name,
        sku: v.sku,
        isAvailable: v.isAvailable ?? true,
        sortOrder: index,
      })),
    };

    startTransition(async () => {
      const result = productId
        ? await updateProductAction(productId, payload)
        : await createProductAction(payload);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Produit enregistré");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU principal</Label>
          <Input id="sku" name="sku" defaultValue={initial?.sku} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={initial?.slug} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Prix</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={initial?.price} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Ancien prix</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            defaultValue={initial?.compareAtPrice ?? undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Prix d&apos;achat</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            defaultValue={initial?.costPrice ?? undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL image</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={initial?.images?.[0]?.url}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="shortDescription">Description courte</Label>
          <Textarea id="shortDescription" name="shortDescription" defaultValue={initial?.shortDescription ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="features">Caractéristiques (une par ligne)</Label>
          <Textarea id="features" name="features" defaultValue={initial?.features ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Catégories</Label>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={initial?.categoryIds?.includes(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured} /> Vedette
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isPopular" defaultChecked={initial?.isPopular} /> Populaire
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isOnSale" defaultChecked={initial?.isOnSale} /> Promo
        </label>
      </div>

      <div className="space-y-3 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Variantes (SKU Tajir)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { name: "", sku: "", isAvailable: true, sortOrder: prev.length },
              ])
            }
          >
            Ajouter variante
          </Button>
        </div>
        {variants.map((variant, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Nom (ex: Rose)"
              value={variant.name}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) => (i === index ? { ...v, name: e.target.value } : v)),
                )
              }
            />
            <Input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) => (i === index ? { ...v, sku: e.target.value } : v)),
                )
              }
            />
            <Input
              placeholder="Prix spécifique (optionnel)"
              type="number"
              step="0.01"
              value={variant.price ?? ""}
              onChange={(e) =>
                setVariants((prev) =>
                  prev.map((v, i) =>
                    i === index
                      ? { ...v, price: e.target.value ? Number(e.target.value) : null }
                      : v,
                  ),
                )
              }
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
