import { redirect } from "next/navigation";
import { getAdminToken } from "@/lib/auth-cookie";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const token = await getAdminToken();
  // Don't auto-redirect if token exists but may be invalid — let dashboard validate.
  // Only skip login form when a token is present AND user navigates here intentionally after success.
  if (token) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AdminLoginForm />
    </div>
  );
}
