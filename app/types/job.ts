export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
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
  companyId: string;
  required_skills: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  scoring_instructions?: string;
  total_applications?: number;
  total_views?: number;
} 