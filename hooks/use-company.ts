import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export function useCompany() {
  const { userId } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    async function getCompanyId() {
      if (!userId) return;
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, companies!inner(id, name)')
        .eq('id', userId)
        .single() as PostgrestSingleResponse<{ id: string, companies: { id: string, name: string } }>;

      if (error) {
        console.error('Error fetching company id', error);
        return;
      }
        
      if (user) {
        setCompanyId(user.companies.id);
        setCompanyName(user.companies.name);
      }
    }

    getCompanyId();
  }, [userId]);

  return { companyId, companyName };
} 