import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListView } from "@/components/smarthrflow/list-view";
import { supabase } from "@/lib/supabase/client";
import { Metadata } from "next";
import { listService } from "@/lib/services/list.service";
import CandidatesExpandableListView from "@/components/smarthrflow/candidates-expandable-list-view";
import Link from "next/link";

interface PageProps {
  params: {
    listId: string;
  };
}

function formatLocation(location: any) {
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

export const metadata: Metadata = {
  title: "List Details",
  description: "View and manage your candidate list",
};

export default async function ListPage({
  params: { listId },
}: {
  params: { listId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user's company ID
  const { data: user } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', userId)
    .single();

  if (!user?.company_id) {
    redirect("/onboarding");
  }


  const list = await listService.getList(listId);
  // const items = await listService.getListItems(listId);
 

  // Verify user has access to this list
  if (list.company_id !== user.company_id) {
    redirect("/dashboard/lists");
  }

  // Get resumes in this list
  const { data: resumes } = await supabase
    .from('list_items')
    .select(`
        resume:resume_id (
          id,
          parsed_content,
          scores,
          searchable_skills,
          experience_months,
          current_position,
          overall_score,
          location,
          metadata
        )
      `)
    .eq('list_id', listId);


  console.log(resumes);

  const candidates = resumes?.map(candidate => ({
    id: candidate.resume.id,
    name: candidate.resume.parsed_content?.full_name || '',
    role: candidate.resume.current_position || '',
    email: candidate.resume.parsed_content?.personal_emails?.length ? candidate.resume.parsed_content?.personal_emails[0] : '',
    phone: candidate.resume.parsed_content?.personal_numbers?.length ? candidate.resume.parsed_content?.personal_numbers[0] : ''  ,
    location: formatLocation(candidate.resume.location),
    experience: formatExperience(candidate.resume.experience_months),
    company: candidate.resume.parsed_content?.experiences?.[0]?.company || '',
    education: candidate.resume.parsed_content?.education?.[0]?.degree_name || '',
    availability: 'Immediate',
    score: candidate.resume.overall_score || 0,
    skills: candidate.resume.searchable_skills || [],
    scores: {
      skillsScore: candidate.resume.scores?.skills_score || 0,
      experienceScore: candidate.resume.scores?.experience_score || 0,
      educationScore: candidate.resume.scores?.education_score || 0,
      analysis: {
        strengths: candidate.resume.scores?.analysis?.strengths || []
      }
    }
  })) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Link href="/dashboard">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/lists">Lists</Link>
          <span>/</span>
          <span className="text-slate-900">{list.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">{list.name}</h1>
        </div>
      </div>
      <CandidatesExpandableListView
        candidates={candidates}
      />
    </div>
  );
}