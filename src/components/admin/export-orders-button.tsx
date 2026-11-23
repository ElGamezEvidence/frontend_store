"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportOrdersButton({
  status,
  q,
  pendingTajir,
  label = "Exporter Excel",
}: {
  status?: string;
  q?: string;
  pendingTajir?: boolean;
  label?: string;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (pendingTajir) params.set("pendingTajir", "1");

  const href = `/api/admin/orders/export${params.toString() ? `?${params}` : ""}`;

  return (
    <Button asChild variant="outline">
      <a href={href}>
        <Download className="h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
