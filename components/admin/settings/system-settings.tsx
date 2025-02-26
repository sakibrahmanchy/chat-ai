'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { adminSettingsService } from '@/lib/services/admin/settings.service';
import { toast } from '@/hooks/use-toast';

interface SystemSettingsProps {
  settings: {
    siteName: string;
    maintenanceMode: boolean;
    defaultLanguage: string;
    allowedFileTypes: string[];
    maxFileSize: number;
    defaultCredits: number;
  };
}

export function SystemSettings({ settings }: SystemSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminSettingsService.updateSettings('system', formData);
      toast({
        title: 'Settings updated',
        description: 'System settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="maintenanceMode"
            checked={formData.maintenanceMode}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, maintenanceMode: checked })
            }
          />
          <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
        </div>

        {/* Add other system settings fields */}
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 