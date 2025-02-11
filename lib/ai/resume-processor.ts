import { OpenAI } from 'openai';
import { adminDb } from '@/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { version } from 'os';
const crypto = require('crypto');

const openai = new OpenAI();

interface ParsedResume {
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
    
    // Check cache first
    const hash = crypto
      .createHash('sha256')
      .update(resumeText)
      .digest('hex');
    
    const cachedDoc = await adminDb
      .collection('parsedResumes')
      .doc(hash)
      .get();

    if (cachedDoc.exists) {
      console.log('Found cached resume data');
      const cachedData = cachedDoc.data() as ParsedResume;
      
      if (!cachedData) {
        throw new Error('Cached document exists but data is null');
      }
      
      // Update usage history using imported FieldValue
      await adminDb
        .collection('parsedResumes')
        .doc(hash)
        .update({
          usedBy: FieldValue.arrayUnion({
            userId,
            jobId,
            timestamp: Timestamp.now()
          })
        });
        
      return cachedData;
    }

    // Extract structured data using GPT
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
      response_format: {
        type: "json_schema",
        json_schema: {
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
        }
      }
    });

    const parsedContent = response.choices[0].message.content;
    if (!parsedContent) {
      throw new Error('No content received from OpenAI');
    }

    const parsedData = JSON.parse(parsedContent) as ParsedResume;
    if (!parsedData) {
      throw new Error('Failed to parse OpenAI response');
    }

    parsedData.rawText = resumeText;

    // Validate required fields
    if (!parsedData.full_name || !parsedData.experiences || !parsedData.education || !parsedData.skills) {
      throw new Error('Missing required fields in parsed data');
    }

    const documentData = {
      ...parsedData,
      createdAt: Timestamp.now(),
      usedBy: [{
        userId,
        jobId,
        timestamp: Timestamp.now()
      }]
    };

    // Cache the results
    await adminDb
      .collection('parsedResumes')
      .doc(hash)
      .set(documentData);

    return parsedData;
  } catch (error) {
    console.error('Error in processResume:', error);
    throw error;
  }
} 