import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function StoreFooter({ storeName }: { storeName: string }) {
  const t = await getTranslations();

  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-xl font-semibold text-primary">{storeName}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("pages.aboutBody")}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link href="/about">{t("footer.about")}</Link>
          <Link href="/contact">{t("nav.contact")}</Link>
          <Link href="/faq">{t("nav.faq")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
          <Link href="/terms">{t("footer.terms")}</Link>
          <Link href="/shipping-policy">{t("footer.shippingPolicy")}</Link>
          <Link href="/returns">{t("footer.returnPolicy")}</Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>COD · MAD · Maroc</p>
          <p className="mt-4">© {new Date().getFullYear()} {storeName}. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
