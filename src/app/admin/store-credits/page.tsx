import { requireAdminPageSession } from "@/lib/admin-auth";
import { AdminStoreCredits } from "@/components/admin/AdminStoreCredits";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créditos | Detalles by Mima",
};

export default async function AdminStoreCreditsPage() {
  await requireAdminPageSession();

  return <AdminStoreCredits />;
}
