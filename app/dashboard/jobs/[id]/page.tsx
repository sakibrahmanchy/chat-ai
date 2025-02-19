import { JobDetailsPreview } from "@/components/jobs/details-preview";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function JobPage({
  params: { id: jobId },
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  
  if (!userId) return null;

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (jobError || !job) {
      notFound();
    }
    console.log(jobId)
    // Get top candidates sorted by match score
    const { data: topCandidates = [], error: candidatesError } = await supabase
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
      .eq('job_id', jobId)
      // .order('scores->overall_score', { ascending: false })
      .limit(3);

      console.log(topCandidates)

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError);
    }

    // Get total number of candidates
    const { count: totalCandidates } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('status', 'processed');

    const metrics = {
      totalCandidates: totalCandidates || 0,
      timeToHire: 12,
      matchRate: Math.round(
        topCandidates.reduce((acc, curr) => acc + (curr.scores?.overall_score || 0), 0) / 
        (topCandidates.length || 1)
      ),
    };

    // Get skills analysis from job requirements
    const skillsAnalysis = job.required_skills?.map(skill => ({
      skill,
      score: Math.round(
        topCandidates.reduce((acc, curr) => {
          const hasSkill = curr.scores?.analysis?.matched_skills?.includes(skill) || false;
          return acc + (hasSkill ? 100 : 0);
        }, 0) / (topCandidates.length || 1)
      )
    })) || [];

    // Prepare data for the preview component
    const previewData = {
      job: {
        // ...job,
        status: job.status || 'active'
      },
      metrics,
      candidates: topCandidates.map(candidate => ({
        id: candidate.id,
        name: candidate.parsed_content?.full_name || '',
        role: candidate.current_position || '',
        email: candidate.parsed_content?.email || '',
        phone: candidate.parsed_content?.phone || '',
        location: candidate.location ? 
          `${candidate.location.city}, ${candidate.location.state}, ${candidate.location.country}` : '',
        experience: `${Math.floor((candidate.experience_months || 0) / 12)} years`,
        company: candidate.parsed_content?.experiences?.[0]?.company || '',
        education: candidate.parsed_content?.education?.[0]?.degree_name || '',
        availability: '1 month notice',
        score: candidate.scores?.overall_score || 0,
        skills: candidate.searchable_skills || [],
        scores: {
          skillsScore: candidate.scores?.skills_score || 0,
          experienceScore: candidate.scores?.experience_score || 0,
          educationScore: candidate.scores?.education_score || 0,
          analysis: {
            strengths: candidate.scores?.analysis?.strengths || []
          }
        }
      })),
      skillsAnalysis
    };

    return (
      <div className="min-h-screen bg-white">
        <JobDetailsPreview {...previewData} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching job details:', error);
    return null;
  }
} 