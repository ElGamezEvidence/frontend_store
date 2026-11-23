import Link from "next/link";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminProductsPage() {
  const result = await storeApi.adminProducts("&pageSize=50");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Produits</h1>
        <Button asChild>
          <Link href="/admin/products/new">Nouveau produit</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Nom</th>
              <th className="px-4 py-3 text-start">SKU</th>
              <th className="px-4 py-3 text-start">Prix</th>
              <th className="px-4 py-3 text-start">Statut</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((product) => (
              <tr key={String(product.id)} className="border-t border-border/70">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${String(product.id)}`} className="text-primary hover:underline">
                    {String(product.name)}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{String(product.sku)}</td>
                <td className="px-4 py-3">{formatMoney(toNumber(product.price as never))}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.status === "ACTIVE" ? "success" : "secondary"}>
                    {String(product.status)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
