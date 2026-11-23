import { revalidatePath } from "next/cache";
import { storeApi } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function AdminSettingsPage() {
  const settings = await storeApi.getSettings();

  async function save(formData: FormData) {
    "use server";
    await storeApi.adminUpdateSettings({
      storeName: String(formData.get("storeName") || ""),
      description: String(formData.get("description") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      email: String(formData.get("email") || "") || null,
      tajirCodUrl: String(formData.get("tajirCodUrl") || "https://tajir.ma"),
      heroTitle: String(formData.get("heroTitle") || "") || null,
      heroSubtitle: String(formData.get("heroSubtitle") || "") || null,
      promoBannerText: String(formData.get("promoBannerText") || "") || null,
      seoTitle: String(formData.get("seoTitle") || "") || null,
      seoDescription: String(formData.get("seoDescription") || "") || null,
      defaultLocale: String(formData.get("defaultLocale") || "fr"),
      currency: "MAD",
    });
    revalidatePath("/admin/settings");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Paramètres</h1>
      <form action={save} className="grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="storeName">Nom de la boutique</Label>
          <Input id="storeName" name="storeName" defaultValue={String(settings.storeName || "")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={String(settings.description || "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={String(settings.phone || "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={String(settings.whatsapp || "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" defaultValue={String(settings.email || "")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tajirCodUrl">URL Tajir COD</Label>
          <Input id="tajirCodUrl" name="tajirCodUrl" defaultValue={String(settings.tajirCodUrl || "")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="heroTitle">Titre hero</Label>
          <Input id="heroTitle" name="heroTitle" defaultValue={String(settings.heroTitle || "")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="heroSubtitle">Sous-titre hero</Label>
          <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={String(settings.heroSubtitle || "")} />
        </div>
        <div className="md:col-span-2">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </div>
  );
}
