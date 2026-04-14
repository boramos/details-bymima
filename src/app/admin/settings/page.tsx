import { requireAdminPageSession } from "@/lib/admin-auth";
import { ConfigService } from "@/services/ConfigService";
import { AdminSettings } from "@/components/admin/AdminSettings";

export default async function SettingsPage() {
  await requireAdminPageSession();
  await ConfigService.initializeDefaults();
  const configs = await ConfigService.listAll();
  
  return <AdminSettings initialConfigs={configs} />;
}
