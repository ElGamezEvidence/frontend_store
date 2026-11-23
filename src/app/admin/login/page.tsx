import { redirect } from "next/navigation";
import { getAdminToken } from "@/lib/auth-cookie";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminLoginPage() {
  const token = await getAdminToken();
  if (token) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={loginAction}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accès réservé à l&apos;équipe boutique</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Se connecter
        </Button>
      </form>
    </div>
  );
}
