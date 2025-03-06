import { Company } from "./company";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
  company_id: string;
  company: Company;
  role: string;
  status: string;
}

