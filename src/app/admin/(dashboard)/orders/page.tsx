import Link from "next/link";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams({
    page: sp.page || "1",
    ...(sp.status ? { status: sp.status } : {}),
    ...(sp.q ? { q: sp.q } : {}),
  });
  const result = await storeApi.adminOrders(`?${qs.toString()}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Commandes</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Recherche globale…"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          />
          <button className="rounded-xl bg-primary px-4 text-sm text-primary-foreground">Rechercher</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">N°</th>
              <th className="px-4 py-3 text-start">Client</th>
              <th className="px-4 py-3 text-start">Ville</th>
              <th className="px-4 py-3 text-start">Total</th>
              <th className="px-4 py-3 text-start">Statut</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((order) => (
              <tr key={String(order.id)} className="border-t border-border/70 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${String(order.id)}`} className="font-mono text-primary hover:underline">
                    {String(order.orderNumber)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{String(order.customerName)}</div>
                  <div className="text-xs text-muted-foreground">{String(order.customerPhone)}</div>
                </td>
                <td className="px-4 py-3">{String(order.city)}</td>
                <td className="px-4 py-3">{formatMoney(toNumber(order.total as never))}</td>
                <td className="px-4 py-3">
                  <Badge>{String(order.status)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
