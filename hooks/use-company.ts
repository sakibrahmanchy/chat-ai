import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useCompany() {
  const { userId } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    async function getCompanyId() {
      if (!userId) return;
      
      const { data: user } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();
        
      if (user) {
        setCompanyId(user.company_id);
      }
    }

    getCompanyId();
  }, [userId]);

  return { companyId };
} 