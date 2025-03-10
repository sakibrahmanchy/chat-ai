'use server'
import { OpenAI } from 'openai';
import { adminStorage } from '@/firebase-admin';
import { createClient } from '@supabase/supabase-js';
import { Resume } from '@/app/types/resume';
import { CreditAction, CreditEntity, creditService } from '../services/credits.service';
import crypto from 'crypto';
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
            location: { 
              type: "object",
              description: `Location of the candidate. Make sure that location names are standardized. 
              For example USA is not standardized, it should be United States of America. Same, CA is not standardized, 
              it should be California and so on. This applies to all cities, states and countries.`,
              properties: {
                city: { type: "string" },
                state: { type: "string" },
                country: { type: "string" }
              }
            },
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

export async function processResume(resumeFile: File, jobId: string, userId: string, companyId: string): Promise<{ parsedData: Resume['parsed_content'], hash: string, id: number }> {
  try {
    const hasEnoughCredits = await creditService.hasEnoughCredits(companyId, CreditAction.SUBMIT_RESUME);
    if (!hasEnoughCredits) {
      throw new Error('Insufficient credits');
    }

    const fileType = resumeFile.type;
    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());
    console.log({ fileType })
    const formData = new FormData();
    formData.append('fileBuffer', resumeFile, `file.${fileType}`);
    formData.append('fileType', fileType);
    formData.append('filename', resumeFile.name);

    const responseFromParser = await fetch(`${process.env.NEXT_PUBLIC_PARSER_API_URL}/extract-text`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: formData
    });

    if (!responseFromParser.ok) {
      throw new Error(`Error parsing resume: ${responseFromParser.statusText}`);
    }

    const parsedText = await responseFromParser.json();
    const resumeText = parsedText.text;

    // resumeText = await extractTextFromFile(fileBuffer, fileType, 'file.pdf');
    // console.log('resumeText', resumeText);
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
      .select('id, parsed_content, email')
      .eq('hash', hash)
      .single();

    if (cachedResume) {
      await creditService.useCredits(companyId, CreditAction.SUBMIT_RESUME, CreditEntity.RESUME, cachedResume.email);
      return {
        parsedData: cachedResume.parsed_content as Resume['parsed_content'],
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
      temperature: 0.1,
      response_format: { type: "json_schema", json_schema: RESPONSE_FORMAT }
    });

    const parsedContent = response.choices[0].message.content;

    if (!parsedContent) {
      throw new Error('No content received from OpenAI');
    }

    const parsedData = JSON.parse(parsedContent) as Resume['parsed_content'];
    parsedData.rawText = resumeText;
  

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
      first_name: parsedData.first_name,
      last_name: parsedData.last_name,
      full_name: parsedData.full_name,
      email: parsedData.personal_emails[0],
      phone: parsedData.personal_numbers[0],
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

    await creditService.useCredits(companyId, CreditAction.SUBMIT_RESUME, CreditEntity.RESUME, resumeDoc.email);
    // Check if resume already exists
    if (resumeDoc.email) {
      const { data: existingResume } = await supabase
        .from('resumes')
        .select('id')
        .eq('email', resumeDoc.email)
        .single();

      if (existingResume) {
        await supabase
          .from('resumes')
          .update({
            ...resumeDoc
          })
          .eq('id', existingResume.id);
        
        
        return {
          parsedData,
          hash,
          id: existingResume.id
        };
      }
    }

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