import { ParsedResume } from "@/lib/ai/resume-processor";

export interface Resume {
  id: string;
  // Frequently queried fields (top level)
  searchableSkills: string[];  // Denormalized, lowercase for searching
  experienceMonths: number;    // Pre-calculated
  matchScore: number;         // Pre-calculated
  status: string;
  createdAt: string;
  
  // Metadata (top level for quick access)
  metadata: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
  };

  // Detailed content (accessed less frequently)
  parsedContent: {
    full_name: string;
    occupation: string;
    // ... other parsed fields
  };

  // Detailed scores (accessed when viewing details)
  scores?: {
    skillsScore: number;
    experienceScore: number;
    // ... other scores
  };
} 