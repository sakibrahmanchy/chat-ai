'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { adminSettingsService } from '@/lib/services/admin/settings.service';
// import { toast } from '@/hooks/use-toast';

interface EmailSettingsProps {
  settings: {
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    emailTemplates: {
      welcome: string;
      resetPassword: string;
      jobAlert: string;
    };
  };
}

export function EmailSettings({ settings }: EmailSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving] = useState(false);
  const [isTesting] = useState(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSaving(true);
  //   try {
  //     await adminSettingsService.updateSettings('email', formData);
  //     toast({
  //       title: 'Settings updated',
  //       description: 'Email settings have been updated successfully.',
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update email settings.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleTestEmail = async () => {
  //   setIsTesting(true);
  //   try {
  //     const result = await adminSettingsService.testEmailSettings(formData);
  //     if (result.success) {
  //       toast({
  //         title: 'Test successful',
  //         description: 'Email settings are working correctly.',
  //       });
  //     } else {
  //       throw new Error(result.message);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: 'Test failed',
  //       description: error.message || 'Failed to test email settings.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsTesting(false);
  //   }
  // };

  return (
    <form 
      // onSubmit={handleSubmit} 
      className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromEmail">From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            value={formData.fromEmail}
            onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpHost">SMTP Host</Label>
          <Input
            id="smtpHost"
            value={formData.smtpHost}
            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              type="number"
              value={formData.smtpPort}
              onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpUser">SMTP Username</Label>
          <Input
            id="smtpUser"
            value={formData.smtpUser}
            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="smtpPass">SMTP Password</Label>
          <Input
            id="smtpPass"
            type="password"
            value={formData.smtpPass}
            onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Email Templates</h3>
          {Object.entries(formData.emailTemplates).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)} Template</Label>
              <Textarea
                id={key}
                value={value}
                onChange={(e) => setFormData({
                  ...formData,
                  emailTemplates: {
                    ...formData.emailTemplates,
                    [key]: e.target.value
                  }
                })}
                rows={4}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          // onClick={handleTestEmail}
          disabled={isTesting}
        >
          {isTesting ? 'Testing...' : 'Test Settings'}
        </Button>
      </div>
    </form>
  );
} 