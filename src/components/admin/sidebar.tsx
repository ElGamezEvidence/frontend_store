"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Send,
  Tags,
  Users,
  Star,
  Ticket,
  Truck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/tajir", label: "À envoyer Tajir", icon: Send },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/reviews", label: "Avis", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/shipping", label: "Livraisons", icon: Truck },
  { href: "/admin/reports", label: "Rapports", icon: BarChart3 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-e border-border bg-card dark:bg-card">
      <div className="border-b border-border px-5 py-5">
        <p className="font-display text-lg font-semibold text-primary">Ghazala Admin</p>
        <p className="text-xs text-muted-foreground">COD · Tajir manuel</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="border-t border-border p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </form>
    </aside>
  );
}
