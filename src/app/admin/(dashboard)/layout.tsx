import { redirect } from "next/navigation";
import { getAdminToken } from "@/lib/auth-cookie";
import { storeApi } from "@/lib/store-api";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  let email = "admin";
  try {
    const me = await storeApi.adminMe();
    email = me.user.email;
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-6 py-4 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            Connecté en tant que <span className="font-medium text-foreground">{email}</span>
          </p>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
