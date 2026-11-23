import { revalidatePath } from "next/cache";
import { storeApi } from "@/lib/store-api";
import { toNumber } from "@/lib/money";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminShippingPage() {
  const zones = await storeApi.adminShippingZones();

  async function addZone(formData: FormData) {
    "use server";
    await storeApi.adminCreateZone({
      region: String(formData.get("region")),
      city: String(formData.get("city")),
      homeDeliveryFee: Number(formData.get("homeDeliveryFee")),
      pickupPointFee: formData.get("pickupPointFee")
        ? Number(formData.get("pickupPointFee"))
        : null,
      pickupAvailable: formData.get("pickupAvailable") === "on",
    });
    revalidatePath("/admin/shipping");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Zones de livraison</h1>

      <form action={addZone} className="grid max-w-3xl gap-3 rounded-2xl border border-border p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="region">Région</Label>
          <Input id="region" name="region" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="homeDeliveryFee">Frais domicile (MAD)</Label>
          <Input id="homeDeliveryFee" name="homeDeliveryFee" type="number" step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pickupPointFee">Frais point relais</Label>
          <Input id="pickupPointFee" name="pickupPointFee" type="number" step="0.01" />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="pickupAvailable" /> Point relais disponible
        </label>
        <Button type="submit">Ajouter la zone</Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Région</th>
              <th className="px-4 py-3 text-start">Ville</th>
              <th className="px-4 py-3 text-start">Domicile</th>
              <th className="px-4 py-3 text-start">Point relais</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={String(z.id)} className="border-t border-border/70">
                <td className="px-4 py-3">{String(z.region)}</td>
                <td className="px-4 py-3">{String(z.city)}</td>
                <td className="px-4 py-3">{formatMoney(toNumber(z.homeDeliveryFee as never))}</td>
                <td className="px-4 py-3">
                  {z.pickupPointFee != null ? formatMoney(toNumber(z.pickupPointFee as never)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
