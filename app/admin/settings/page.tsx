import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { adminSettingsService } from "@/lib/services/admin/settings.service";
import { SystemSettings } from "@/components/admin/settings/system-settings";
import { ApiSettings } from "@/components/admin/settings/api-settings";
import { EmailSettings } from "@/components/admin/settings/email-settings";

export default async function AdminSettingsPage() {
  const settings = await adminSettingsService.getSettings();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemSettings settings={settings.system} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiSettings settings={settings.api} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailSettings settings={settings.email} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 