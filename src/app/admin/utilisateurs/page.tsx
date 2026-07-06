import { getAdminUsers } from "@/lib/admin";
import UsersAdmin from "@/components/users-admin";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">
        Administration
      </p>
      <h1 className="font-display mt-1 text-3xl font-bold text-ink">
        Utilisateurs
      </h1>
      <p className="mt-2 text-slate-500">
        Crée des apprenants, formateurs et administrateurs, et gère leurs rôles.
      </p>

      <div className="mt-8">
        <UsersAdmin users={users} />
      </div>
    </div>
  );
}
