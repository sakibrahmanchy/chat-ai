export interface Resume {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  filePath: string;
  parsedContent?: {
    skills: string[];
    experience: string[];
    education: string[];
    [key: string]: any;
  };
  aiScore?: number;
  aiMatchDetails?: {
    skillMatch: number;
    experienceMatch: number;
    overallFit: number;
    [key: string]: any;
  };
  createdAt: Date;
} 