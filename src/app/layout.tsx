import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ghazala Store",
    template: "%s | Ghazala Store",
  },
  description: "Boutique e-commerce COD au Maroc — affiliation Tajir COD.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
