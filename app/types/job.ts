export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: string; // full-time, part-time, contract
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  companyId: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  status: string; // active, closed, draft
  createdAt: Date;
  updatedAt: Date;
} 