export interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  additionalParameters?: {
    yearsOfExperience?: number;
    educationLevel?: string;
    location?: string;
    [key: string]: any;
  };
  createdAt: Date;
  userId: string;
} 