import Link from "next/link";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export default async function TajirQueuePage() {
  const result = await storeApi.adminOrders("?pendingTajir=1&pageSize=50");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Commandes à envoyer à Tajir COD</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {result.total} commande(s) en attente. La copie ne marque pas comme transmis.
        </p>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Aucune commande en attente.
        </div>
      ) : (
        <div className="space-y-3">
          {result.items.map((order) => {
            const items = (order.items as Array<Record<string, unknown>>) || [];
            return (
              <Link
                key={String(order.id)}
                href={`/admin/orders/${String(order.id)}`}
                className="block rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold text-primary">{String(order.orderNumber)}</p>
                    <p className="mt-1">
                      {String(order.customerName)} · {String(order.customerPhone)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {String(order.city)} · {items.map((i) => String(i.sku)).join(", ")}
                    </p>
                  </div>
                  <div className="text-end">
                    <Badge variant="warning">{String(order.status)}</Badge>
                    <p className="mt-2 font-semibold">{formatMoney(toNumber(order.total as never))}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
