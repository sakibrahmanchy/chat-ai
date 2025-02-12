import { ParsedResume } from "@/lib/ai/resume-processor";

export interface Resume {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  status: 'processing' | 'processed' | 'failed';
  createdAt: string;
  updatedAt: string;
  userId: string;
  jobId: string;
  parsedContent: ParsedResume;
  scores?: {
    skillsScore: number;
    experienceScore: number;
    overallScore: number;
    averageScore: number;
    educationScore?: number;
    technicalScore?: number;
    roleAlignmentScore?: number;
    industryKnowledgeScore?: number;
    analysis: {
      matchedSkills: string[];
      missingSkills: string[];
      strengthAreas: string[];
      improvementAreas: string[];
      experienceAnalysis: string;
      overallFeedback: string;
    };
  };
} 