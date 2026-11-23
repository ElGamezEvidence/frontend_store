import Link from "next/link";
import { storeApi } from "@/lib/store-api";
import { formatMoney } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersByDayChart, StatusPieChart } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range || "30d";
  const data = (await storeApi.adminDashboard(range)) as {
    kpis: Record<string, number>;
    ordersByDay: Array<{ date: string; orders: number; sales: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    topProducts: Array<{ name: string; sku: string; quantity: number; sales: number }>;
  };

  const kpis = [
    { label: "Total commandes", value: data.kpis.totalOrders },
    { label: "Nouvelles", value: data.kpis.newOrders },
    { label: "À saisir Tajir", value: data.kpis.pendingTajir },
    { label: "Transmises", value: data.kpis.sentToTajir },
    { label: "Livrées", value: data.kpis.delivered },
    { label: "Annulées", value: data.kpis.cancelled },
    { label: "CA période", value: formatMoney(data.kpis.revenue) },
    { label: "Produits actifs", value: data.kpis.activeProducts },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          {[
            ["today", "Aujourd'hui"],
            ["7d", "7 jours"],
            ["30d", "30 jours"],
            ["month", "Ce mois"],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/admin?range=${value}`}
              className={`rounded-xl px-3 py-1.5 text-sm ${range === value ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Commandes par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersByDayChart data={data.ordersByDay} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={data.statusDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-muted-foreground">
                  <th className="py-2 text-start">Produit</th>
                  <th className="py-2 text-start">SKU</th>
                  <th className="py-2 text-start">Qté</th>
                  <th className="py-2 text-start">Ventes</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p) => (
                  <tr key={p.sku} className="border-b border-border/60">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 font-mono text-xs">{p.sku}</td>
                    <td className="py-2">{p.quantity}</td>
                    <td className="py-2">{formatMoney(p.sales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
