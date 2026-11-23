"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getTajirCopyTextAction,
  setTajirReferenceAction,
  updateOrderStatusAction,
} from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TajirActions({
  orderId,
  tajirUrl,
  tajirReference,
  alreadySent,
}: {
  orderId: string;
  tajirUrl: string;
  tajirReference?: string | null;
  alreadySent: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [reference, setReference] = useState(tajirReference ?? "");

  async function copyText() {
    const result = await getTajirCopyTextAction(orderId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await navigator.clipboard.writeText(result.text);
    toast.success("Informations copiées (non transmises automatiquement)");
  }

  async function copyField(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copié`);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <h3 className="font-semibold">Workflow manuel Tajir COD</h3>
      <p className="text-sm text-muted-foreground">
        Copier n&apos;enregistre pas la transmission. Vous devez confirmer manuellement après saisie sur Tajir.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={copyText} disabled={pending}>
          Copier les informations pour Tajir COD
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={tajirUrl} target="_blank" rel="noreferrer">
            Ouvrir Tajir COD
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => copyField(orderId, "ID")}>
          Copier ID
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Référence commande Tajir COD"
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await setTajirReferenceAction(orderId, reference);
              if (!result.ok) toast.error(result.error);
              else toast.success("Référence enregistrée");
            })
          }
        >
          Enregistrer référence
        </Button>
      </div>
      <Button
        type="button"
        disabled={pending || alreadySent}
        onClick={() =>
          startTransition(async () => {
            const result = await updateOrderStatusAction({
              orderId,
              toStatus: "SENT_TO_TAJIR",
              comment: "Transmission manuelle confirmée par l'administrateur",
            });
            if (!result.ok) toast.error(result.error);
            else toast.success("Commande marquée comme transmise à Tajir COD");
          })
        }
      >
        {alreadySent ? "Déjà transmise" : "Marquer comme transmis à Tajir COD"}
      </Button>
    </div>
  );
}

export function CopyButtons({
  orderNumber,
  phone,
  address,
  skus,
}: {
  orderNumber: string;
  phone: string;
  address: string;
  skus: string[];
}) {
  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copié`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => copy(orderNumber, "N° commande")}>
        Copier N° commande
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => copy(phone, "Téléphone")}>
        Copier téléphone
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => copy(address, "Adresse")}>
        Copier adresse
      </Button>
      {skus.map((sku) => (
        <Button key={sku} type="button" size="sm" variant="outline" onClick={() => copy(sku, "SKU")}>
          Copier SKU {sku}
        </Button>
      ))}
    </div>
  );
}
