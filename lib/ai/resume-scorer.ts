'use server'
import { OpenAI } from 'openai';
import { Resume } from '@/app/types/resume';
import { Job } from '@/app/types/job';
console.log({ key: process.env.OPENAI_API_KEY})
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScoreResult {
  skillsScore: number;
  experienceScore: number;
  overallScore: number;
  averageScore: number;
  analysis: {
    matchedSkills: string[];
    missingSkills: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    experienceAnalysis: string;
    overallFeedback: string;
  };
}

const RESPONSE_FORMAT = {
  name: "resume_scorer",
  schema: {
    type: "object",
    properties: {
      skillsScore: {
        type: "number",
        description: "Score out of 10 for skills match"
      },
      experienceScore: {
        type: "number",
        description: "Score out of 10 for experience match"
      },
      overallScore: {
        type: "number",
        description: "Score out of 10 for overall match"
      },
      analysis: {
        type: "object",
        properties: {
          matchedSkills: {
            type: "array",
            items: { type: "string" },
            description: "List of skills that match the job requirements"
          },
          missingSkills: {
            type: "array",
            items: { type: "string" },
            description: "List of required skills that are missing"
          },
          strengthAreas: {
            type: "array",
            items: { type: "string" },
            description: "Areas where the candidate shows strong potential"
          },
          improvementAreas: {
            type: "array",
            items: { type: "string" },
            description: "Areas where the candidate needs improvement"
          },
          experienceAnalysis: {
            type: "string",
            description: "Detailed analysis of candidate's experience"
          },
          overallFeedback: {
            type: "string",
            description: "Overall feedback about the candidate's fit"
          }
        },
        required: ["matchedSkills", "missingSkills", "strengthAreas", "improvementAreas", "experienceAnalysis", "overallFeedback"]
      }
    },
    required: ["skillsScore", "experienceScore", "overallScore", "analysis"]
  }
} as const;

export async function scoreResume(resume: Resume, job: Job): Promise<ScoreResult> {
  const { parsedContent } = resume;

  const prompt = `
    Analyze this resume against the job requirements and provide a detailed scoring.
    
    Job Details:
    Title: ${job.title}
    Required Skills: ${job.requiredSkills.join(', ')}
    Description: ${job.description}
    Requirements: ${job.requirements}
    
    Resume Details:
    Name: ${parsedContent?.full_name}
    Current Role: ${parsedContent?.occupation}
    Experience: ${JSON.stringify(parsedContent?.experience)}
    Education: ${JSON.stringify(parsedContent?.education)}
    Skills: ${JSON.stringify(parsedContent?.skills)}
    
    Provide a detailed analysis focusing on:
    1. Skills match with required skills
    2. Experience relevance and years
    3. Overall fit for the role
    
    Score each category from 0-10 and provide detailed feedback.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content: "You are an expert HR professional and resume analyzer. Provide detailed analysis and accurate scoring based on the match between the resume and job requirements."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_schema", json_schema: RESPONSE_FORMAT }
  });

  const result = JSON.parse(response.choices[0].message.content);

  return {
    ...result,
    averageScore: Number(((result.skillsScore + result.experienceScore + result.overallScore) / 3).toFixed(1))
  };
} 