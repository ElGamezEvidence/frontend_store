"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email ou mot de passe incorrect.",
  BACKEND_UNREACHABLE:
    "Impossible de joindre l'API backend. Vérifiez NEXT_PUBLIC_API_URL / API_URL sur Netlify.",
  API_URL_NOT_CONFIGURED:
    "Variable API_URL manquante sur Netlify (URL Railway du backend).",
};

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const code = String(data.error || "INVALID_CREDENTIALS");
          setError(ERROR_MESSAGES[code] || code);
          return;
        }
        router.replace("/admin");
        router.refresh();
      } catch {
        setError(ERROR_MESSAGES.BACKEND_UNREACHABLE);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-lg"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {BRAND.name}
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accès réservé à l&apos;équipe boutique
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
