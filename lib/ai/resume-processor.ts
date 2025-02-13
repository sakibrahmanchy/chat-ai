'use server'
import { OpenAI } from 'openai';
import { adminDb } from '@/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
const crypto = require('crypto');

const openai = new OpenAI();

// Add RESPONSE_FORMAT constant
const RESPONSE_FORMAT = {
  name: "resume_parser",
  schema: {
    type: "object",
    properties: {
      first_name: { type: "string" },
      middle_name: { type: "string" },
      last_name: { type: "string" },
      full_name: { type: "string" },
      occupation: { type: "string" },
      role: { type: "string" },
      headline: { type: "string" },
      summary: { type: "string" },
      country: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      experiences: {
        type: "array",
        items: {
          type: "object",
          properties: {
            starts_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              }
            },
            ends_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              },
              nullable: true
            },
            company: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            location: { type: "string" },
            technologies: { type: "array", items: { type: "string" } },
            achievements: { type: "array", items: { type: "string" } }
          }
        }
      },
      education: {
        type: "array",
        items: {
          type: "object",
          properties: {
            starts_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              }
            },
            ends_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              }
            },
            field_of_study: { type: "string" },
            degree_name: { type: "string" },
            school: { type: "string" },
            description: { type: "string" },
            grade: { type: ["string", "null"] },
            achievements: { type: "array", items: { type: "string" } }
          }
        }
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          properties: {
            starts_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              }
            },
            ends_at: {
              type: "object",
              properties: {
                day: { type: "integer" },
                month: { type: "integer" },
                year: { type: "integer" }
              },
              nullable: true
            },
            name: { type: "string" },
            license_number: { type: ["string", "null"] },
            authority: { type: "string" },
            url: { type: ["string", "null"] }
          }
        }
      },
      skills: { type: "array", items: { type: "string" } },
      skills_with_yoe: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            yoe: { type: "number" }
          }
        }
      },
      personal_emails: { type: "array", items: { type: "string" } },
      personal_numbers: { type: "array", items: { type: "string" } },
      languages: { type: "array", items: { type: "string" } },
      total_experience_in_months: { type: "number" }
    },
    required: ["full_name", "experiences", "education", "skills"]
  }
} as const;

export interface ParsedResume {
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  occupation: string;
  role: string;
  headline: string;
  summary: string;
  country: string;
  city: string;
  state: string;
  experiences: Array<{
    starts_at: {
      day: number;
      month: number;
      year: number;
    };
    ends_at?: {
      day: number;
      month: number;
      year: number;
    };
    company: string;
    title: string;
    description: string;
    location: string;
    technologies: string[];
    achievements: string[];
  }>;
  education: Array<{
    starts_at: {
      day: number;
      month: number;
      year: number;
    };
    ends_at: {
      day: number;
      month: number;
      year: number;
    };
    field_of_study: string;
    degree_name: string;
    school: string;
    description: string;
    grade: string | null;
    achievements: string[];
  }>;
  certifications: Array<{
    starts_at: {
      day: number;
      month: number;
      year: number;
    };
    ends_at?: {
      day: number;
      month: number;
      year: number;
    };
    name: string;
    license_number: string | null;
    authority: string;
    url: string | null;
  }>;
  skills: string[];
  skills_with_yoe: Array<{
    name: string;
    yoe: number;
  }>;
  personal_emails: string[];
  personal_numbers: string[];
  languages: string[];
  total_experience_in_months: number;
  rawText: string;
}

// Add this function to calculate initial match score
const calculateInitialScore = (parsedContent: any, job: any) => {
  let score = 0;
  const maxScore = 10;

  // Skills match (40% weight)
  const requiredSkills = new Set(job.requiredSkills.map((s: string) => s.toLowerCase()));
  const candidateSkills = new Set(parsedContent.skills?.map((s: string) => s.toLowerCase()) || []);
  const matchingSkills = [...requiredSkills].filter(skill => candidateSkills.has(skill));
  const skillsScore = requiredSkills.size > 0 ? (matchingSkills.length / requiredSkills.size) * 4 : 4;

  // Experience match (30% weight)
  const experienceScore = Math.min((parsedContent.total_experience_in_months || 0) / 60, 1) * 3;

  // Education level (20% weight)
  const educationScore = parsedContent.education?.length ? 2 : 0;

  // Location match (10% weight)
  const locationScore = 1; // Default for now

  score = skillsScore + experienceScore + educationScore + locationScore;

  return {
    overallScore: Math.min(Math.round(score * 10) / 10, 10),
    skillsMatch: Math.round((skillsScore / 4) * 100),
    experienceMatch: Math.round((experienceScore / 3) * 100),
    educationMatch: Math.round((educationScore / 2) * 100),
    locationMatch: Math.round(locationScore * 100),
    matchingSkills,
    missingSkills: [...requiredSkills].filter(skill => !candidateSkills.has(skill))
  };
};

export async function processResume(fileBuffer: Buffer, jobId: string, userId: string): Promise<ParsedResume> {
  try {
    // Import and parse PDF
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse(fileBuffer, {
      version: true
    });
    
    const resumeText = data.text;
    if (!resumeText) {
      throw new Error('No text content extracted from PDF');
    }
    
    // Generate document ID
    const hash = crypto
      .createHash('sha256')
      .update(resumeText)
      .digest('hex');
    
    // Check cache in resumes collection
    const cachedDoc = await adminDb
      .collection('resumes')
      .doc(hash)
      .get();

    if (cachedDoc.exists) {
      console.log('Found cached resume data');
      const cachedData = cachedDoc.data();
      
      if (!cachedData) {
        throw new Error('Cached document exists but data is null');
      }

      // Track resume usage in separate collection
      await adminDb.collection('resumeUsage').add({
        resumeId: hash,
        userId,
        jobId,
        timestamp: Timestamp.now()
      });

      return cachedData.parsedContent as ParsedResume;
    }

    // Keep existing OpenAI parsing code
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content: "Extract structured information from the resume text. Parse dates carefully and provide detailed information for all fields."
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_schema", json_schema: RESPONSE_FORMAT }
    });

    const parsedContent = response.choices[0].message.content;

    if (!parsedContent) {
      throw new Error('No content received from OpenAI');
    }

    const parsedData = JSON.parse(parsedContent) as ParsedResume;
    parsedData.rawText = resumeText;

    // Validate required fields
    if (!parsedData.full_name || !parsedData.experiences || !parsedData.education || !parsedData.skills) {
      throw new Error('Missing required fields in parsed data');
    }

    // Structure data for storage
    const resumeDoc = {
      // Document metadata
      id: hash,
      userId,
      jobId,
      status: 'processed',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      // Searchable fields (top level for efficient querying)
      searchableSkills: parsedData.skills.map(s => s.toLowerCase()),
      experienceMonths: parsedData.total_experience_in_months,
      location: {
        city: parsedData.city,
        state: parsedData.state,
        country: parsedData.country
      },
      currentRole: parsedData.occupation,

      // File metadata
      metadata: {
        fileName: 'resume.pdf', // TODO: Get actual filename
        fileSize: fileBuffer.length,
        fileHash: hash,
        mimeType: 'application/pdf'
      },

      // Full parsed content
      parsedContent: parsedData
    };

    // Save to Firestore
    await adminDb
      .collection('resumes')
      .doc(hash)
      .set(resumeDoc);

    // Remove the scoring calculation from here since it will be done in resume-scorer.ts
    return parsedData;
  } catch (error) {
    console.error('Error in processResume:', error);
    throw error;
  }
} 