// Server Component
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BillingPageClient } from './billing-page-client';
import { supabase } from '@/lib/supabase/client';
import { pricingService } from '@/lib/services/pricing.service';
import { creditService } from '@/lib/services/credits.service';
import { Loader2 } from 'lucide-react';

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Get user's company_id
  const { data: user } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (!user?.company_id) {
    redirect('/onboarding');
  }

  // Get company's current credits
  const { data: company } = await supabase
    .from('companies')
    .select('credits_balance, current_plan')
    .eq('id', user.company_id)
    .single();

  const packages = await pricingService.getAvailablePackages();

  // Access query parameters directly from searchParams
  const { success, canceled, priceId, packageId } = searchParams;

  // If there are success or canceled query parameters, handle accordingly
  if (success && packageId) {
    // Update credits asynchronously
    await creditService.addCreditPackageToCompany(user.company_id, packageId as string);
    
    // After updating credits, redirect to settings
    redirect('/dashboard/settings');
  }

  // If payment was successful and we need to show a success message
  if (success) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='text-2xl font-bold'>Payment successful</h1>
        <p className='text-sm text-gray-500'>Assigning credits to your account...</p>
        <Loader2 className='w-4 h-4 animate-spin' />
      </div>
    );
  }

  // Return the BillingPageClient if not processing payment success
  return (
    <BillingPageClient
      packages={packages}
      currentCredits={company?.credits_balance || 0}
      currentPlan={company?.current_plan}
    />
  );
}
