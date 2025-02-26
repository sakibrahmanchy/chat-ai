'use server'
import { OpenAI } from 'openai';
import { Resume } from '@/app/types/resume';
import { Job } from '@/app/types/job';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

export async function scoreResume(resumeId: string, jobId: string): Promise<ScoreResult> {
  try {
    console.log('scoring resume', resumeId, jobId);
    // Fetch job and resume data
    const { data: job } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        required_skills,
        requirements,
        scoring_instructions
      `)
      .eq('id', jobId)
      .single();

    if (!job) throw new Error('Job not found');

    const { data: resume } = await supabase
      .from('resumes')
      .select(`
        id,
        hash,
        parsed_content,
        searchable_skills,
        experience_months,
        current_position,
        location
      `)
      .eq('id', resumeId)
      .single();

    if (!resume) throw new Error('Resume not found');

    // Get AI analysis
    const startTime = Date.now();
    const aiAnalysis = await analyzeResume(resume, job);

    // Get initial score calculation
    const initialScore = calculateInitialScore(resume.parsed_content, job);

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

    // Store scores in Supabase
    const { error } = await supabase
      .from('resumes')
      .update({
        scores: {
          overall_score: finalScores.overallScore,
          skills_score: finalScores.skillsScore,
          experience_score: finalScores.experienceScore,
          education_score: finalScores.educationScore || 0,
          analysis: {
            matched_skills: finalScores.analysis.matchedSkills,
            missing_skills: finalScores.analysis.missingSkills,
            strengths: finalScores.analysis.strengthAreas,
            weaknesses: finalScores.analysis.improvementAreas,
            experience_analysis: finalScores.analysis.experienceAnalysis,
            education_analysis: finalScores.analysis.educationAnalysis || ''
          },
          metadata: {
            processing_time: Date.now() - startTime,
            confidence_score: aiAnalysis.confidence || 0.8,
            processed_at: new Date().toISOString()
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', resume.id);

    if (error) {
      console.error('Error updating scores in Supabase:', error);
      throw error;
    }

    return finalScores;
  } catch (error) {
    console.error('Error in scoreResume:', error);
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
async function analyzeResume(resume: any, job: any) {
  try {
    const { parsed_content: parsedContent } = resume;

    const prompt = `
      You are analyzing a resume for a job position. The analysis must strictly follow any custom scoring instructions if provided.
      
      ${job.scoring_instructions ? `
      IMPORTANT - Custom Scoring Instructions:
      ${job.scoring_instructions}
      
      These custom instructions take precedence over standard evaluation criteria. Adjust your scoring weights and analysis to prioritize these requirements.
      ` : ''}

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
      
      Provide a comprehensive analysis with the following structure:
      1. First evaluate against any custom scoring instructions (if provided)
      2. Then assess standard criteria:
         - Skills match with required skills
         - Experience relevance and years
         - Overall fit for the role
      
      For each category, provide a score from 0-10 and detailed justification.
      
      In the analysis:
      - Begin the overall feedback by addressing custom instruction criteria first
      - List strengths/weaknesses based on custom instructions as priority items
      - Adjust final scores to give extra weight to custom instruction criteria
      - Provide specific examples of how the candidate meets or fails to meet custom requirements
      
      Remember: Custom scoring instructions should significantly influence the final scores and analysis.
    `;

    console.log('Analyzing resume with prompt:', prompt);

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

// Helper function to get top candidates
export async function getTopCandidates(jobId: string, limit = 10) {
  const { data: candidates, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('job_id', jobId)
    .order('scores->overall_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return candidates;
} 