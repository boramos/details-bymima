import { requireAdminPageSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AdminUsers } from "@/components/admin/AdminUsers";

export default async function UsersPage() {
  const session = await requireAdminPageSession();
  const [totalUsers, totalAdmins, activePassports] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.passportSubscription.count({ where: { status: "ACTIVE" } }),
  ]);
  
  return (
    <AdminUsers 
      stats={{ totalUsers, totalAdmins, activePassports }} 
      currentUserId={session.user.id} 
    />
  );
}
