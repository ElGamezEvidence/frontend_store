"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/actions/products";
import type { ProductFormValues } from "@/validations/product";
import { compressImageFile } from "@/lib/image-compress";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initial?.images?.[0]?.url ?? "");
  const [variants, setVariants] = useState(
    initial?.variants?.length ? initial.variants : [],
  );

  async function onPickFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier image requis (JPG, PNG, WEBP)");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      const form = new FormData();
      form.set("file", file);
      form.set("dataUrl", dataUrl);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error === "FILE_TOO_LARGE" ? "Image trop lourde" : "Import impossible");
        return;
      }
      setImageUrl(String(data.url));
      toast.success("Image importée");
    } catch {
      toast.error("Impossible de lire le fichier");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
      images: imageUrl
        ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }]
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

        <div className="space-y-3 md:col-span-2">
          <Label>Image produit</Label>
          <div className="grid gap-4 rounded-2xl border border-dashed border-border bg-secondary/30 p-4 md:grid-cols-[180px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-xs">Aperçu</span>
                </div>
              )}
              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute end-2 top-2 rounded-full bg-background/90 p-1 shadow"
                  aria-label="Retirer l'image"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    Import…
                  </>
                ) : (
                  <>
                    <ImagePlus className="me-2 h-4 w-4" />
                    Importer depuis le PC
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP — max ~4 Mo. L&apos;image est compressée automatiquement.
              </p>
              <div className="space-y-1">
                <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">
                  Ou coller une URL
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  placeholder="https://…"
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
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

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
