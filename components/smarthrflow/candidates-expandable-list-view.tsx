'use client'
import { useEffect, useState } from "react";
import CandidateSingleView from "./candidate-single-view";
import { listService } from "@/lib/services/list.service";

export interface Candidate {
    id: number;
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    company: string;
    education: string;
    availability: string;
    score: number;
    skills: string[];
    status: string;
    scores: {
        skillsScore: number;
        experienceScore: number;
        educationScore: number;
        analysis: {
            strengths: string[];
        };
    };

}

export const CandidatesExpandableListView = ({
    candidates,
    initialExpandedCandidateId,
    jobId,
    companyId
}: {
    candidates: Candidate[];
    initialExpandedCandidateId?: string;
    jobId: string;
    companyId: string;
}) => {
    const [expandedCandidateId, setExpandedCandidateId] = useState<string>(initialExpandedCandidateId || "");
    const [candidateLists, setCandidateLists] = useState<{ [key: string]: string[] }>({});

    const handleExpandCandidate = (id: string) => {
        if (expandedCandidateId === id) {   
            setExpandedCandidateId("");
        } else {
            setExpandedCandidateId(id);
        }
    }

    useEffect(() => {
       if (candidates.length > 0) {
        const candidateIds = candidates.map(candidate => candidate.id);
        getListNamesByCandidateIds(candidateIds).then(lists => {
            const candidateLists = lists.reduce((acc: { [key: string]: string[] }, list: { resume_id: string, lists: string[] }) => {
                acc[list.resume_id] = list.lists;
                return acc;
            }, {});
            setCandidateLists(candidateLists);
        });
       }
    }, [candidates]);

    if (candidates.length === 0) {
        return <div>No candidates found</div>
    }

    const getListNamesByCandidateIds = async (candidateIds: number[]) => {
        const lists = await listService.getListNamesByCandidateIds(candidateIds);
        return lists;
    }

    return (
        <div className="grid gap-4">
            {candidates.map((candidate) => (
                <CandidateSingleView
                    key={candidate.id}
                    candidate={candidate}
                    expandedCandidateId={expandedCandidateId}
                    handleExpandCandidate={handleExpandCandidate}
                    lists={candidateLists[candidate.id]}
                    jobId={jobId}
                    companyId={companyId}
                />
            ))}
        </div>
    )
}

export default CandidatesExpandableListView;