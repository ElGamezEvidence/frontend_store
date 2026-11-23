import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const result = await storeApi.adminCustomers();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Clients</h1>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Nom</th>
              <th className="px-4 py-3 text-start">Téléphone</th>
              <th className="px-4 py-3 text-start">Commandes</th>
              <th className="px-4 py-3 text-start">Total achats</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((c) => (
              <tr key={String(c.id)} className="border-t border-border/70">
                <td className="px-4 py-3">{String(c.fullName)}</td>
                <td className="px-4 py-3">{String(c.phone)}</td>
                <td className="px-4 py-3">{String(c.ordersCount)}</td>
                <td className="px-4 py-3">{formatMoney(Number(c.totalSpent || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
