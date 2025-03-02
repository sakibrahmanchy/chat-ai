import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/smarthrflow/settings-form";
import { supabase } from "@/lib/supabase/client";
import { CreditPackage } from "@/app/types/credits";


async function getSettings() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      company:companies(
        id,
        name,
        credits:company_credits(
          credits_balance,
          credits_used,
          last_topped_up
        ),
        purchases:credit_purchases(
          credit_packages(*),
          credits_purchased,
          created_at
        ),
        transactions:credit_transactions(*)
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
}

export default async function SettingsPage() {
  const user = await getSettings();
  console.log(user)
  return (
    <div className="container ">
      <SettingsForm initialData={user} />
    </div>
  );
} 