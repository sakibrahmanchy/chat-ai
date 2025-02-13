'use server'
import { OpenAI } from 'openai';
import { Resume } from '@/app/types/resume';
import { Job } from '@/app/types/job';
import { adminDb } from '@/firebase-admin';

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

export async function scoreResume(resume: Resume, job: Job) {
  try {
    // Get AI analysis
    const aiAnalysis = await analyzeResume(resume, job);

    // Get initial score calculation
    const initialScore = calculateInitialScore(resume.parsedContent, job);

    // Combine scores with weights (70% AI, 30% calculated)
    const combinedScores = {
      overallScore: Math.round(((
        aiAnalysis.overallScore * 0.7 + 
        initialScore.overallScore * 0.3
      )) * 10) / 10,

      skillsScore: Math.round(((
        aiAnalysis.skillsScore * 0.7 + 
        initialScore.skillsMatch / 10 * 0.3
      )) * 10) / 10,

      experienceScore: Math.round(((
        aiAnalysis.experienceScore * 0.7 + 
        initialScore.experienceMatch / 10 * 0.3
      )) * 10) / 10,

      educationScore: aiAnalysis.educationScore,
      roleMatchScore: aiAnalysis.roleMatchScore,
    };

    // Combine skill analysis
    const combinedAnalysis = {
      overallFeedback: aiAnalysis.analysis.overallFeedback,
      strengthAreas: [
        ...new Set([
          ...aiAnalysis.analysis.strengthAreas,
          ...(initialScore.matchingSkills.length > 0 ? ['Strong skill match'] : []),
          initialScore.experienceMatch > 80 ? 'Strong experience level' : '',
          initialScore.educationMatch > 80 ? 'Strong educational background' : '',
        ].filter(Boolean))
      ],
      improvementAreas: [
        ...new Set([
          ...aiAnalysis.analysis.improvementAreas,
          ...(initialScore.missingSkills.length > 0 
            ? [`Missing required skills: ${initialScore.missingSkills.join(', ')}`] 
            : []
          ),
          initialScore.experienceMatch < 50 ? 'Need more relevant experience' : '',
          initialScore.educationMatch < 50 ? 'Education could be more relevant' : '',
        ].filter(Boolean))
      ],
      matchedSkills: [
        ...new Set([
          ...aiAnalysis.analysis.matchedSkills,
          ...initialScore.matchingSkills
        ])
      ],
      missingSkills: [
        ...new Set([
          ...aiAnalysis.analysis.missingSkills,
          ...initialScore.missingSkills
        ])
      ],
      skillsAnalysis: aiAnalysis.analysis.skillsAnalysis,
      experienceAnalysis: aiAnalysis.analysis.experienceAnalysis,
      educationAnalysis: aiAnalysis.analysis.educationAnalysis
    };

    // Create final score object
    const finalScores = {
      ...combinedScores,
      analysis: combinedAnalysis,
      lastUpdated: new Date().toISOString(),
      rawScores: {
        ai: aiAnalysis,
        calculated: initialScore
      }
    };
    console.log('finalScores', finalScores);
    // Store the scores in Firestore
    await adminDb
      .collection('resumes')
      .doc(resume.id)
      .update({
        scores: finalScores,
        updatedAt: new Date()
      });

    return finalScores;
  } catch (error) {
    console.error('Error scoring resume:', error);
    throw error;
  }
}

// Helper function to calculate initial score (moved from resume-processor.ts)
function calculateInitialScore(parsedContent: any, job: any) {
  let score = 0;
  const maxScore = 10;

  // Skills match (40% weight)
  const requiredSkills = new Set(job.requiredSkills?.map((s: string) => s.toLowerCase()) || []);
  
  // Handle different skill formats
  let candidateSkills: Set<string>;
  if (Array.isArray(parsedContent.skills)) {
    candidateSkills = new Set(parsedContent.skills.map((s: string) => s.toLowerCase()));
  } else if (parsedContent.skills_with_yoe) {
    // If skills are in skills_with_yoe format
    candidateSkills = new Set(
      Object.values(parsedContent.skills_with_yoe)
        .map((skill: any) => skill.name.toLowerCase())
    );
  } else {
    candidateSkills = new Set();
  }

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
}

// Helper function to analyze resume using AI
async function analyzeResume(resume: Resume, job: Job) {
  try {
    const { parsedContent } = resume;

    const prompt = `
      Analyze this resume against the job requirements and provide a detailed scoring.
      
      Job Details:
      Title: ${job.title}
      Required Skills: ${job.requiredSkills?.join(', ') || ''}
      Description: ${job.description || ''}
      Requirements: ${job.requirements || ''}
      
      Resume Details:
      Name: ${parsedContent?.full_name || ''}
      Current Role: ${parsedContent?.occupation || ''}
      Experience: ${JSON.stringify(parsedContent?.experiences || [])}
      Education: ${JSON.stringify(parsedContent?.education || [])}
      Skills: ${JSON.stringify(parsedContent?.skills || [])}
      
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

    if (!response.choices[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    const result = JSON.parse(response.choices[0].message.content);

    // Provide default values if any scores are missing
    return {
      skillsScore: result.skillsScore || 0,
      experienceScore: result.experienceScore || 0,
      overallScore: result.overallScore || 0,
      educationScore: result.educationScore || 0,
      roleMatchScore: result.roleMatchScore || 0,
      analysis: {
        matchedSkills: result.analysis?.matchedSkills || [],
        missingSkills: result.analysis?.missingSkills || [],
        strengthAreas: result.analysis?.strengthAreas || [],
        improvementAreas: result.analysis?.improvementAreas || [],
        experienceAnalysis: result.analysis?.experienceAnalysis || '',
        overallFeedback: result.analysis?.overallFeedback || '',
        skillsAnalysis: result.analysis?.skillsAnalysis || '',
        educationAnalysis: result.analysis?.educationAnalysis || ''
      },
      averageScore: Number(((
        (result.skillsScore || 0) + 
        (result.experienceScore || 0) + 
        (result.overallScore || 0)
      ) / 3).toFixed(1))
    };
  } catch (error) {
    console.error('Error in analyzeResume:', error);
    // Return default scores if analysis fails
    return {
      skillsScore: 0,
      experienceScore: 0,
      overallScore: 0,
      educationScore: 0,
      roleMatchScore: 0,
      analysis: {
        matchedSkills: [],
        missingSkills: [],
        strengthAreas: [],
        improvementAreas: ['Unable to analyze resume'],
        experienceAnalysis: '',
        overallFeedback: 'Analysis failed',
        skillsAnalysis: '',
        educationAnalysis: ''
      },
      averageScore: 0
    };
  }
} 