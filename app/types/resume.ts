import { ResumeScore } from "./resume-score"

export interface ParsedContent {
  city: string
  role: string
  state: string
  skills: string[]
  country: string
  rawText: string
  summary: string
  headline: string
  education: Education[]
  full_name: string
  languages: any[]
  last_name: string
  first_name: string
  occupation: string
  experiences: Experience[]
  middle_name: string
  certifications: Certification[]
  personal_emails: string[]
  skills_with_yoe: SkillsWithYoe[]
  personal_numbers: string[]
  total_experience_in_months: number
}

export interface Education {
  grade: any
  school: string
  ends_at: EndsAt
  starts_at: StartsAt
  degree_name: string
  description: string
  achievements: any[]
  field_of_study: string
}

export interface EndsAt {
  day: number
  year: number
  month: number
}

export interface StartsAt {
  day: number
  year: number
  month: number
}

export interface Experience {
  title: string
  company: string
  ends_at?: EndsAt2
  location: string
  starts_at: StartsAt2
  description: string
  achievements: any[]
  technologies: string[]
}

export interface EndsAt2 {
  day: number
  year: number
  month: number
}

export interface StartsAt2 {
  day: number
  year: number
  month: number
}

export interface Certification {
  url: any
  name: string
  ends_at: any
  authority: string
  starts_at: StartsAt3
  license_number: any
}

export interface StartsAt3 {
  day: number
  year: number
  month: number
}

export interface SkillsWithYoe {
  yoe: number
  name: string
}


export interface Resume {
  id: number
  searchable_skills: string[];
  experience_months: number;
  current_position: string;
  created_at: string;
  metadata: {
    file_name: string;
    file_size: number;
    file_url: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
  };
  parsed_content: ParsedContent;
  job_id?: string;
  user_id?: string;
  overall_score: number;
  scores: ResumeScore;
} 