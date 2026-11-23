import { notFound } from "next/navigation";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { toNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { CopyButtons, TajirActions } from "@/components/admin/tajir-actions";
import { updateOrderStatusAction } from "@/actions/orders";

const nextStatuses = [
  "CONFIRMED",
  "SENT_TO_TAJIR",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
  "FAILED",
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order: Record<string, unknown>;
  let settings: Record<string, unknown>;
  try {
    [order, settings] = await Promise.all([storeApi.adminOrder(id), storeApi.getSettings()]);
  } catch {
    notFound();
  }

  const items = (order.items as Array<Record<string, unknown>>) || [];
  const history = (order.statusHistory as Array<Record<string, unknown>>) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">{String(order.orderNumber)}</h1>
        </div>
        <Badge>{String(order.status)}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Client</h2>
          <p>{String(order.customerName)}</p>
          <p>{String(order.customerPhone)}</p>
          <p>
            {String(order.addressLine)}, {String(order.city)}, {String(order.region)}
          </p>
          <CopyButtons
            orderNumber={String(order.orderNumber)}
            phone={String(order.customerPhone)}
            address={`${String(order.addressLine)}, ${String(order.city)}, ${String(order.region)}`}
            skus={items.map((i) => String(i.sku))}
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Montants</h2>
          <p>Sous-total: {formatMoney(toNumber(order.subtotal as never))}</p>
          <p>Livraison: {formatMoney(toNumber(order.shippingFee as never))}</p>
          <p className="text-lg font-semibold">Total: {formatMoney(toNumber(order.total as never))}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold">Articles</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={String(item.id)} className="flex justify-between gap-3 border-b border-border/60 py-2">
              <div>
                <p className="font-medium">
                  {String(item.productName)} × {String(item.quantity)}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{String(item.sku)}</p>
              </div>
              <p>{formatMoney(toNumber(item.lineTotal as never))}</p>
            </div>
          ))}
        </div>
      </div>

      <TajirActions
        orderId={String(order.id)}
        tajirUrl={String(settings.tajirCodUrl || "https://tajir.ma")}
        tajirReference={order.tajirReference ? String(order.tajirReference) : null}
        alreadySent={Boolean(order.sentToTajirAt) || order.status === "SENT_TO_TAJIR"}
      />

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold">Changer le statut</h2>
        <div className="flex flex-wrap gap-2">
          {nextStatuses.map((status) => (
            <form
              key={status}
              action={async () => {
                "use server";
                await updateOrderStatusAction({ orderId: id, toStatus: status });
              }}
            >
              <button className="rounded-xl bg-secondary px-3 py-2 text-xs hover:bg-primary hover:text-primary-foreground">
                {status}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 font-semibold">Historique</h2>
        <div className="space-y-2 text-sm">
          {history.map((h) => (
            <div key={String(h.id)} className="rounded-xl bg-secondary/40 px-3 py-2">
              <p>
                {String(h.fromStatus ?? "—")} → <strong>{String(h.toStatus)}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
