"use client";

import { Search, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const locales = [
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
] as const;

export function StoreHeader({ storeName }: { storeName: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const count = useCart((s) => s.count());

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-primary md:text-2xl">
          {storeName || t("common.brand")}
        </Link>

        <nav className="ms-4 hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/" className="hover:text-foreground">
            {t("nav.home")}
          </Link>
          <Link href="/collections" className="hover:text-foreground">
            {t("nav.collections")}
          </Link>
          <Link href="/about" className="hover:text-foreground">
            {t("nav.about")}
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <form
            className="relative hidden w-56 lg:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString() ?? "";
              router.push(`/collections?q=${encodeURIComponent(q)}`);
            }}
          >
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" placeholder={t("common.search")} className="ps-9" />
          </form>

          <div className="flex overflow-hidden rounded-xl border border-border">
            {locales.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => router.replace(pathname, { locale: item.code })}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-semibold",
                  locale === item.code ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button asChild variant="outline" size="icon" className="relative">
            <Link href="/cart" aria-label={t("nav.cart")}>
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
