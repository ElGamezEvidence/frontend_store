import Link from "next/link";

export default function AdminReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold">Rapports</h1>
      <p className="text-muted-foreground">
        Les statistiques détaillées sont disponibles sur le{" "}
        <Link href="/admin" className="text-primary underline">
          dashboard
        </Link>
        . Les exports CSV commandes/produits seront branchés sur les listes existantes.
      </p>
    </div>
  );
}
