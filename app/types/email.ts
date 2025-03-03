export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailVariables {
  [key: string]: string | undefined;
  CANDIDATE_NAME?: string;
  CANDIDATE_EMAIL?: string;
  JOB_TITLE?: string;
  COMPANY_NAME?: string;
  INTERVIEW_DATE?: string;
  INTERVIEW_TIME?: string;
  INTERVIEW_LOCATION?: string;
} 