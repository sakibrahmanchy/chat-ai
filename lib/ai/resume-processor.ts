'use server'
import { OpenAI } from 'openai';
import { adminDb, adminStorage } from '@/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
const crypto = require('crypto');

const openai = new OpenAI();

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function processResume(fileBuffer: Buffer, jobId: string, userId: string): Promise<{ parsedData: ParsedResume, hash: string, id: string }> {
  try {
    const fileType = await detectFileType(fileBuffer);
    let resumeText = '';
    if (fileType === 'pdf') {
      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(fileBuffer);
      resumeText = data.text;
    } else if (fileType === 'docx') {
      // Parse DOCX
      const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
      resumeText = value;
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    console.log('resumeText', resumeText);
    // Generate document ID
    const hash = crypto
      .createHash('sha256')
      .update(resumeText)
      .digest('hex');

    // Upload file to Firebase Storage
    const bucket = adminStorage.bucket();
    const filePath = `resumes/${userId}/${hash}${fileType === 'pdf' ? '.pdf' : '.docx'}`;
    const file = bucket.file(filePath);
    await file.save(fileBuffer);

    // Get the public URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future expiration
    });

    // Check cache in resumes collection
    const { data: cachedResume } = await supabase
      .from('resumes')
      .select('id, parsed_content')
      .eq('hash', hash)
      .single();

    if (cachedResume) {
      console.log('Found cached resume data');
      return {
        parsedData: cachedResume.parsed_content as ParsedResume,
        hash,
        id: cachedResume.id
      };
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
      hash,
      user_id: userId,
      job_id: jobId,
      searchable_skills: parsedData.skills.map(s => s.toLowerCase()),
      experience_months: Number(parsedData.total_experience_in_months),
      location: {
        city: parsedData.city,
        state: parsedData.state,
        country: parsedData.country
      },
      current_position: parsedData.occupation,
      metadata: {
        file_name: `resume.${fileType === 'pdf' ? 'pdf' : 'docx'}`,
        file_size: fileBuffer.length,
        file_hash: hash,
        mime_type: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_url: url
      },
      parsed_content: parsedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to Supabase
    const { error, data } = await supabase
      .from('resumes')
      .insert(resumeDoc)
      .select('id');

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    return {
      parsedData,
      hash,
      id: data[0].id
    };
  } catch (error) {
    console.error('Error processing resume:', error);
    throw error;
  }
}

// Helper function to detect file type from buffer
async function detectFileType(buffer: Buffer): Promise<'pdf' | 'docx'> {
  // Check for PDF magic number
  if (buffer.toString('hex', 0, 4) === '25504446') {
    return 'pdf';
  }

  if (buffer.toString('hex', 0, 2) === '504b') {
    return 'docx';
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}