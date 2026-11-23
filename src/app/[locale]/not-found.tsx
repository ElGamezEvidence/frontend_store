import { Link } from "@/i18n/navigation";

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-4xl font-semibold">404</h1>
      <p className="text-muted-foreground">Page introuvable</p>
      <Link href="/" className="rounded-xl bg-primary px-5 py-2.5 text-sm text-primary-foreground">
        Accueil
      </Link>
    </div>
  );
}
