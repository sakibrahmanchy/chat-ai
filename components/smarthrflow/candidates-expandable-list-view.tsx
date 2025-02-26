'use client'
import { useState } from "react";
import CandidateSingleView from "./candidate-single-view";

interface Candidate {
    id: string;
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
}: {
    candidates: Candidate[];
    initialExpandedCandidateId?: string;
}) => {
    const [expandedCandidateId, setExpandedCandidateId] = useState<string>(initialExpandedCandidateId || "");

    const handleExpandCandidate = (id: string) => {
        if (expandedCandidateId === id) {   
            setExpandedCandidateId("");
        } else {
            setExpandedCandidateId(id);
        }
    }

    if (candidates.length === 0) {
        return <div>No candidates found</div>
    }

    return (
        <div className="grid gap-4">
            {candidates.map((candidate) => (
                <CandidateSingleView
                    key={candidate.id}
                    candidate={candidate}
                    expandedCandidateId={expandedCandidateId}
                    handleExpandCandidate={handleExpandCandidate}
                />
            ))}
        </div>
    )
}

export default CandidatesExpandableListView;