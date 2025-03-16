import { Company } from "./company";

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: {
    city: string;
    state: string;
    country: string;
  }
  type: string;
  experience: number;
  salary_min?: number;
  salary_max?: number;
  skills: string[];
  company_id: string;
  required_skills: string[];
  status: string;
  created_at: string;
  updated_at: string;
  scoring_instructions?: string;
  total_applications?: number;
  total_views?: number;
  application_deadline?: string | null;
  department?: string;
  company?: Company;
  should_ask_expected_salary?: boolean;
  salary_currency?: string;
} 