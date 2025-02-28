// Server Component
import { pricingService } from '@/lib/services/pricing.service';
import { BillingPageClient } from './billing-page-client';

export default async function BillingPage() {
  const packages = await pricingService.getAvailablePackages();
  
  return <BillingPageClient packages={packages} />;
} 