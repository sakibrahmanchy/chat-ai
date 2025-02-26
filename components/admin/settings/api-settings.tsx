'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminSettingsService } from '@/lib/services/admin/settings.service';
import { toast } from '@/hooks/use-toast';

interface ApiSettingsProps {
  settings: {
    openaiApiKey: string;
    openaiModel: string;
    maxTokens: number;
    temperature: number;
    rateLimits: {
      requests: number;
      duration: string;
    };
  };
}

export function ApiSettings({ settings }: ApiSettingsProps) {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminSettingsService.updateSettings('api', formData);
      toast({
        title: 'Settings updated',
        description: 'API settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update API settings.',
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
          <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
          <Input
            id="openaiApiKey"
            type="password"
            value={formData.openaiApiKey}
            onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="openaiModel">OpenAI Model</Label>
          <Input
            id="openaiModel"
            value={formData.openaiModel}
            onChange={(e) => setFormData({ ...formData, openaiModel: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={formData.maxTokens}
              onChange={(e) => setFormData({ ...formData, maxTokens: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rateLimitRequests">Rate Limit Requests</Label>
            <Input
              id="rateLimitRequests"
              type="number"
              value={formData.rateLimits.requests}
              onChange={(e) => setFormData({
                ...formData,
                rateLimits: {
                  ...formData.rateLimits,
                  requests: Number(e.target.value)
                }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimitDuration">Rate Limit Duration</Label>
            <Input
              id="rateLimitDuration"
              value={formData.rateLimits.duration}
              onChange={(e) => setFormData({
                ...formData,
                rateLimits: {
                  ...formData.rateLimits,
                  duration: e.target.value
                }
              })}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
} 