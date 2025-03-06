export interface ResumeScore {
    analysis: Analysis
    metadata: Metadata
    skills_score: number
    overall_score: number
    education_score: number
    experience_score: number
}

export interface Analysis {
    strengths: string[]
    weaknesses: string[]
    matched_skills: string[]
    missing_skills: string[]
    overall_feedback: string
    education_analysis: string
    experience_analysis: string
}

export interface Metadata {
    processed_at: string
    processing_time: number
}
