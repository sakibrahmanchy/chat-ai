'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { activityService, ActivityType } from '@/lib/services/activity.service';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    activityService.logActivity({
      user_id: 'unknown', // You'll need to get the actual user ID
      company_id: 'unknown', // You'll need to get the actual company ID
      type: ActivityType.ERROR_OCCURRED,
      description: 'Frontend error occurred',
      metadata: {
        error: error.message,
        stack: error.stack || '',
        digest: error.digest || '',
      },
    });
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We have been notified and will fix this as soon as possible.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
} 