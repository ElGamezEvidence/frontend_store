import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">Page introuvable</p>
      <Link href="/fr" className="rounded-xl bg-primary px-5 py-2.5 text-sm text-primary-foreground">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
