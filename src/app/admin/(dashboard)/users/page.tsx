import { storeApi } from "@/lib/store-api";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const users = await storeApi.adminUsers();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Utilisateurs</h1>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start">Nom</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Rôle</th>
              <th className="px-4 py-3 text-start">Actif</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={String(user.id)} className="border-t border-border/70">
                <td className="px-4 py-3">{String(user.name)}</td>
                <td className="px-4 py-3">{String(user.email)}</td>
                <td className="px-4 py-3">
                  <Badge>{String(user.role)}</Badge>
                </td>
                <td className="px-4 py-3">{user.isActive ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
