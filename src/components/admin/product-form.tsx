"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/actions/products";
import type { ProductFormValues } from "@/validations/product";
import { compressImageFile } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CategoryOption = { id: string; name: string };
type FormImage = { url: string; alt?: string | null; sortOrder: number; isPrimary: boolean };

const MAX_IMAGES = 8;

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
  const [urlDraft, setUrlDraft] = useState("");
  const [images, setImages] = useState<FormImage[]>(() => {
    const list = initial?.images?.length
      ? initial.images.map((img, index) => ({
          url: img.url,
          alt: img.alt ?? null,
          sortOrder: img.sortOrder ?? index,
          isPrimary: Boolean(img.isPrimary),
        }))
      : [];
    if (list.length > 0 && !list.some((i) => i.isPrimary)) {
      list[0].isPrimary = true;
    }
    return list;
  });
  const [variants, setVariants] = useState(
    initial?.variants?.length ? initial.variants : [],
  );

  function normalizePrimary(list: FormImage[]) {
    if (list.length === 0) return list;
    const hasPrimary = list.some((i) => i.isPrimary);
    return list.map((img, index) => ({
      ...img,
      sortOrder: index,
      isPrimary: hasPrimary ? img.isPrimary : index === 0,
    }));
  }

  async function uploadFile(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier image requis (JPG, PNG, WEBP)");
      return null;
    }
    const dataUrl = await compressImageFile(file);
    const form = new FormData();
    form.set("file", file);
    form.set("dataUrl", dataUrl);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error === "FILE_TOO_LARGE" ? "Image trop lourde" : "Import impossible");
      return null;
    }
    return String(data.url);
  }

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      const uploaded: FormImage[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) {
          uploaded.push({
            url,
            alt: null,
            sortOrder: images.length + uploaded.length,
            isPrimary: images.length === 0 && uploaded.length === 0,
          });
        }
      }
      if (uploaded.length) {
        setImages((prev) =>
          normalizePrimary([
            ...prev,
            ...uploaded.map((img, i) => ({
              ...img,
              isPrimary: prev.length === 0 && i === 0,
            })),
          ]),
        );
        toast.success(
          uploaded.length > 1 ? `${uploaded.length} images importées` : "Image importée",
        );
      }
    } catch {
      toast.error("Impossible de lire le fichier");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrlImage() {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("data:image/")) {
      toast.error("URL image invalide");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images`);
      return;
    }
    if (images.some((i) => i.url === url)) {
      toast.error("Cette image est déjà ajoutée");
      return;
    }
    setImages((prev) =>
      normalizePrimary([
        ...prev,
        { url, alt: null, sortOrder: prev.length, isPrimary: prev.length === 0 },
      ]),
    );
    setUrlDraft("");
    toast.success("Image ajoutée");
  }

  function removeImage(index: number) {
    setImages((prev) => normalizePrimary(prev.filter((_, i) => i !== index)));
  }

  function setPrimary(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
        sortOrder: i,
      })),
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return normalizePrimary(next);
    });
  }

  function onSubmit(formData: FormData) {
    const categoryIds = formData.getAll("categoryIds").map(String);
    const ordered = normalizePrimary(images);
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
      images: ordered,
      // Ignore incomplete rows (empty name/SKU) — variants are optional
      variants: variants
        .filter((v) => v.name.trim() && v.sku.trim())
        .map((v, index) => ({
          ...v,
          name: v.name.trim(),
          sku: v.sku.trim(),
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
          <div className="flex items-center justify-between gap-3">
            <Label>Images produit ({images.length}/{MAX_IMAGES})</Label>
            <p className="text-xs text-muted-foreground">1ʳᵉ image = principale · galerie boutique</p>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-4 space-y-4">
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, index) => (
                  <div
                    key={`${img.url.slice(0, 48)}-${index}`}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-xl bg-muted ring-2",
                      img.isPrimary ? "ring-primary" : "ring-transparent",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    {img.isPrimary ? (
                      <span className="absolute start-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Princip
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/55 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        title="Image principale"
                        onClick={() => setPrimary(index)}
                        className="rounded-md bg-white/90 p-1 text-foreground"
                      >
                        <Star className={cn("h-3.5 w-3.5", img.isPrimary && "fill-current text-primary")} />
                      </button>
                      <button
                        type="button"
                        title="Déplacer"
                        disabled={index === 0}
                        onClick={() => moveImage(index, -1)}
                        className="rounded-md bg-white/90 px-1.5 text-xs font-semibold disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        title="Déplacer"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, 1)}
                        className="rounded-md bg-white/90 px-1.5 text-xs font-semibold disabled:opacity-40"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        title="Supprimer"
                        onClick={() => removeImage(index)}
                        className="ms-auto rounded-md bg-white/90 p-1 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <ImagePlus className="h-8 w-8" />
                <p className="text-sm">Aucune image — importez depuis le PC</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading || images.length >= MAX_IMAGES}
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
                    Importer plusieurs images
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP — sélection multiple, max {MAX_IMAGES} · compressées auto
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">
                  Ou coller une URL
                </Label>
                <Input
                  id="imageUrl"
                  value={urlDraft}
                  placeholder="https://…"
                  onChange={(e) => setUrlDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrlImage();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="secondary" onClick={addUrlImage} disabled={!urlDraft.trim()}>
                Ajouter
              </Button>
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-medium">Variantes (SKU Tajir)</h3>
            <p className="text-xs text-muted-foreground">
              Optionnel. Laisse vide si le produit n’a qu’un seul SKU principal.
            </p>
          </div>
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
          <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Supprimer variante"
              onClick={() =>
                setVariants((prev) => prev.filter((_, i) => i !== index))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
