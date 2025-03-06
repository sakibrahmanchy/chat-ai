import { JobDetailsPreview } from "@/components/jobs/details-preview";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@supabase/supabase-js';
// Create a server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SkillAnalysis {
  skill: string;
  score: number;
  matchRate: number;
  candidateCount: number;
}

interface Distribution {
  label: string;
  value: number;
  color: string;
  count: number;
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = await params;
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

    // Get top candidates with their scores
    const { data: topCandidates } = await supabase
      .from('resumes')
      .select(`
        id,
        parsed_content,
        scores,
        availability_weeks,
        searchable_skills,
        experience_months,
        current_position,
        overall_score,
        location,
        job_resume_matches(status)
      `)
      .eq('job_id', jobId)
      .order('overall_score', { ascending: false })
      .limit(3);

    // Get candidates for skills analysis
    const { data: candidatesWithScores } = await supabase
      .from('resumes')
      .select('scores')
      .eq('job_id', jobId)
      .not('scores', 'is', null);

    // Get skills analysis from job requirements and calculate match rates
    const skillsAnalysis: SkillAnalysis[] = job.required_skills?.map((skill: string) => {
      // Count how many candidates have this skill
      const matchedCandidates = candidatesWithScores?.filter(candidate => 
        candidate.scores?.analysis?.matched_skills?.includes(skill.toLowerCase())
      ) || [];

      // Calculate match percentage
      const matchRate = candidatesWithScores?.length 
        ? (matchedCandidates.length / candidatesWithScores.length) * 100
        : 0;

      // Calculate average score for this skill across candidates
      const averageScore = matchedCandidates.reduce((acc, candidate) => {
        const skillScore = candidate.scores?.skills_scores?.[skill.toLowerCase()] || 0;
        return acc + skillScore;
      }, 0) / (matchedCandidates.length || 1);

      return {
        skill,
        score: Math.round(averageScore * 10),
        matchRate: Math.round(matchRate),
        candidateCount: matchedCandidates.length
      };
    }) || [];

    // Sort skills by score
    skillsAnalysis.sort((a, b) => b.score - a.score);

    // Get total number of candidates
    const { count: totalCandidates } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    // Get candidates for distribution analysis
    const { data: candidatesForDistribution } = await supabase
      .from('resumes')
      .select('overall_score')
      .eq('job_id', jobId)
      .not('overall_score', 'is', null);

    // Calculate candidate distribution
    const distribution: Distribution[] = calculateCandidateDistribution(candidatesForDistribution || []);

    const timeToHire = job.application_deadline ? 
      (() => {
        const daysLeft = Math.ceil((new Date(job.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 'Deadline passed';
        if (daysLeft === 0) return 'Due today';
        if (daysLeft < 30) return `${daysLeft} days left`;
        const months = Math.floor(daysLeft / 30);
        const remainingDays = daysLeft % 30;
        return `${months} month${months > 1 ? 's' : ''}${remainingDays ? ` and ${remainingDays} days` : ''} left`;
      })()
      : '30 days (estimated)';
    const metrics = {
      totalCandidates: totalCandidates || 0,
      timeToHire: timeToHire,
      matchRate: job.average_match_score || 0,
    };

    const previewData = {
      job,
      metrics,
      candidates: topCandidates?.map(candidate => ({
        id: candidate.id,
        name: candidate.parsed_content?.full_name || '',
        role: candidate.current_position || '',
        email: candidate.parsed_content?.personal_emails?.length ? candidate.parsed_content?.personal_emails[0] : '',
        phone: candidate.parsed_content?.personal_numbers?.length ? candidate.parsed_content?.personal_numbers[0] : ''  ,
        location: formatLocation(candidate.location),
        experience: formatExperience(candidate.experience_months),
        company: candidate.parsed_content?.experiences?.[0]?.company || '',
        education: candidate.parsed_content?.education?.[0]?.degree_name || '',
        availability: candidate.availability_weeks ? `${candidate.availability_weeks} weeks` : 'Immediate',
        score: candidate.overall_score || 0,
        skills: candidate.searchable_skills || [],
        scores: {
          skillsScore: candidate.scores?.skills_score || 0,
          experienceScore: candidate.scores?.experience_score || 0,
          educationScore: candidate.scores?.education_score || 0,
          analysis: {
            strengths: candidate.scores?.analysis?.strengths || [],
            weaknesses: candidate.scores?.analysis?.weaknesses || [],
            overall_feedback: candidate.scores?.analysis?.overall_feedback || ''
          }
        },
        status: candidate.job_resume_matches?.[0]?.status || 'pending'
      })) || [],
      skillsAnalysis,
      distribution,
      isLoading: false,
    };

    return (
      <div className="min-h-screen">
        <JobDetailsPreview {...previewData} />
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

function formatLocation(location: { city: string, state: string, country: string }) {
  if (!location) return '';
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  return parts.join(', ');
}

function formatExperience(months: number) {
  if (!months) return '0 years';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years} years ${remainingMonths} months`;
}

function calculateCandidateDistribution(candidates: { overall_score: number }[]): Distribution[] {
  if (!candidates.length) return [];

  const highlyQualified = candidates.filter(c => c.overall_score >= 8).length;
  const qualified = candidates.filter(c => c.overall_score >= 6 && c.overall_score < 8).length;
  const potential = candidates.filter(c => c.overall_score < 6).length;
  const total = candidates.length;

  return [
    {
      label: "Highly Qualified",
      value: Math.round((highlyQualified / total) * 100),
      color: "bg-emerald-500",
      count: highlyQualified
    },
    {
      label: "Qualified",
      value: Math.round((qualified / total) * 100),
      color: "bg-blue-500",
      count: qualified
    },
    {
      label: "Potential",
      value: Math.round((potential / total) * 100),
      color: "bg-amber-500",
      count: potential
    }
  ];
} 