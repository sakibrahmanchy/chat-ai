// Add these types for handling JSON fields
type JsonObject = { [key: string]: any };
type IsoDateString = string;

// All timestamps are in ISO format
interface BaseEntity {
  id: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  createdBy: string;
  updatedBy: string;
  metadata?: JsonObject; // For extensibility
}

// User related types
interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'recruiter' | 'hiring_manager';
  companyId: string;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  lastLoginAt: string;
  status: 'active' | 'inactive';
  phoneNumber?: string;
  avatarUrl?: string;
}

// Company/Organization
interface Company extends BaseEntity {
  name: string;
  website?: string;
  industry: string;
  size: string;
  addressId: string; // Reference to Address
  description?: string;
  logoUrl?: string;
  primaryContactId: string; // Reference to User
  status: 'active' | 'inactive';
}

// Location type used across entities
interface Location {
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates?: {
      latitude: number;
      longitude: number;
  };
}

// Job Posting
interface Job extends BaseEntity {
  title: string;
  companyId: string;
  departmentId: string;
  hiringManagerId: string;
  description: string;
  requirements: string;
  responsibilities: JsonObject[]; // Store as JSON in SQL
  skills: {
    required: string[];
    preferred: string[];
  };
  addressId: string; // Reference to Address
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  status: 'draft' | 'active' | 'paused' | 'closed';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: 'hourly' | 'monthly' | 'yearly';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  workplaceType: 'remote' | 'onsite' | 'hybrid';
  applicationDeadline: string;
  startDate?: string;
  numberOfOpenings: number;
  isPublic: boolean;
  externalJobLink?: string;
  benefits?: string;
  // Add embedded data
  additionalDetails?: JsonObject;
}

// Candidate Profile
interface Candidate extends BaseEntity {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  addressId: string; // Reference to Address
  currentTitle?: string;
  currentCompany?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  source: 'application' | 'referral' | 'sourced';
  status: 'active' | 'inactive';
  availabilityDate?: string;
  noticePeriod?: number;
  expectedSalary?: number;
  salaryCurrency?: string;
  preferredWorkplaceType?: 'remote' | 'onsite' | 'hybrid';
}

// Job Application
interface Application extends BaseEntity {
  jobId: string;
  candidateId: string;
  resumeId: string;
  status: 'new' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'hired' | 'rejected';
  currentStage: string;
  rating?: number;
  source: 'career_site' | 'referral' | 'job_board' | 'direct';
  referrerId?: string;
}

// Resume
interface Resume extends BaseEntity {
  candidateId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processingAttempts: number;
  lastProcessedAt?: IsoDateString;
  originalLanguage?: string;
  // Add embedded data for SQL
  parsedData?: JsonObject; // Complete parsed data as JSON
  searchData?: JsonObject; // Searchable data as JSON
}

// Parsed Resume Data - Raw storage
interface ParsedResumeData extends BaseEntity {
  resumeId: string;
  candidateId: string;
  // Queryable fields
  fullName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  totalExperienceMonths: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  // Searchable arrays for filtering
  skills: string[];
  companies: string[];
  industries: string[];
  // Full text search fields
  searchableText: string;
  keywords: string[];
  // Embedded data
  rawData: JsonObject; // Complete parsed data
  experiences: JsonObject[]; // Array of experiences
  education: JsonObject[]; // Array of education
  certifications: JsonObject[]; // Array of certifications
  // Metadata
  confidence: number;
  processingVersion: string;
}

// Parsed Resume Profile - For quick access and filtering
interface ParsedResumeProfile extends BaseEntity {
  resumeId: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string;
  summary?: string;
  occupation: string;
  currentCompany?: string;
  totalExperienceMonths: number;
  currentSalary?: number;
  salaryCurrency?: string;
  city?: string;
  state?: string;
  country?: string;
  searchableText: string; // Normalized, concatenated text for searching
}

// Parsed Resume Experience
interface ParsedResumeExperience extends BaseEntity {
  resumeId: string;
  candidateId: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description: string;
  isCurrentRole: boolean;
  durationMonths: number;
  skills: string[]; // Extracted skills from this experience
  order: number;
}

// Parsed Resume Education
interface ParsedResumeEducation extends BaseEntity {
  resumeId: string;
  candidateId: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startDate: string;
  endDate?: string;
  location?: string;
  grade?: string;
  order: number;
}

// Parsed Resume Skill
interface ParsedResumeSkill extends BaseEntity {
  resumeId: string;
  candidateId: string;
  skillId: string;
  name: string;
  yearsOfExperience?: number;
  lastUsed?: string;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  context: string; // Where this skill was mentioned
  confidence: number;
}

// Parsed Resume Certification
interface ParsedResumeCertification extends BaseEntity {
  resumeId: string;
  candidateId: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// Parsed Resume Language
interface ParsedResumeLanguage extends BaseEntity {
  resumeId: string;
  candidateId: string;
  language: string;
  proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
}

// Skills Management
interface Skill extends BaseEntity {
  name: string;
  normalizedName: string; // lowercase, no spaces
  type: 'technical' | 'soft' | 'language' | 'certification';
  category: string;
  parentSkillId?: string;
}


// Activity Tracking
interface Activity extends BaseEntity {
  userId: string;
  entityType: 'job' | 'candidate' | 'application' | 'resume';
  entityId: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: string; // JSON string of additional data
}

// Communication
interface Communication extends BaseEntity {
  applicationId: string;
  type: 'email' | 'sms' | 'in_app';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  metadata?: string; // JSON string of additional data
}

// Address
interface Address extends BaseEntity {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
  addressType: 'business' | 'residential';
  entityId: string; // Reference to Company/Candidate
  entityType: 'company' | 'candidate';
}

// Department
interface Department extends BaseEntity {
  name: string;
  companyId: string;
  managerId: string; // Reference to User
  description?: string;
  status: 'active' | 'inactive';
}

// Job Skill
interface JobSkill extends BaseEntity {
  jobId: string;
  skillId: string;
  isRequired: boolean;
  yearsRequired?: number;
  priority: 'must_have' | 'nice_to_have';
}

// Job Responsibility
interface JobResponsibility extends BaseEntity {
  jobId: string;
  description: string;
  order: number;
}

// Candidate Skill
interface CandidateSkill extends BaseEntity {
  candidateId: string;
  skillId: string;
  yearsOfExperience: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastUsed?: string;
}

// Candidate Tag
interface CandidateTag extends BaseEntity {
  candidateId: string;
  tagId: string;
}

// Tag
interface Tag extends BaseEntity {
  name: string;
  type: 'skill' | 'source' | 'status' | 'custom';
  companyId?: string;
  color?: string;
}

// Application Stage
interface ApplicationStage extends BaseEntity {
  applicationId: string;
  stageName: string;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string;
  completedBy?: string;
  order: number;
}

// Application Feedback
interface ApplicationFeedback extends BaseEntity {
  applicationId: string;
  userId: string;
  stageId: string;
  rating: number;
  comment: string;
  isPrivate: boolean;
}

// Interview
interface Interview extends BaseEntity {
  applicationId: string;
  scheduledAt: string;
  duration: number;
  type: 'phone' | 'video' | 'onsite';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  meetingLink?: string;
  notes?: string;
}

// Interview Participant
interface InterviewParticipant extends BaseEntity {
  interviewId: string;
  userId: string;
  role: 'interviewer' | 'candidate' | 'coordinator';
  status: 'pending' | 'accepted' | 'declined';
}

// Skill Alias
interface SkillAlias extends BaseEntity {
  skillId: string;
  alias: string;
}

// Resume Skill Match
interface ResumeSkillMatch extends BaseEntity {
  resumeId: string;
  jobId: string;
  skillId: string;
  score: number;
  confidence: number;
  context: string;
}

// Add a new entity for search optimization
interface SearchIndex extends BaseEntity {
  entityId: string;
  entityType: 'resume' | 'job' | 'candidate';
  // Searchable fields
  text: string;
  keywords: string[];
  skills: string[];
  locations: string[];
  // Numeric fields for filtering
  experienceYears: number;
  salary?: number;
  // Metadata
  lastIndexed: IsoDateString;
  indexVersion: string;
}

// Add a new entity for denormalized view of resume data
interface ResumeView extends BaseEntity {
  resumeId: string;
  candidateId: string;
  // Frequently accessed fields
  name: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  location: string;
  totalExperience: number;
  topSkills: string[];
  latestEducation?: string;
  // Latest scores
  overallScore?: number;
  skillsScore?: number;
  // Status fields
  applicationStatus?: string;
  availability?: string;
  // Embedded complete data
  fullDetails: JsonObject;
}

// Add indexes for SQL
interface DBIndexes {
  Resume: {
    candidateId: true;
    status: true;
    'searchData.skills': true;
    'searchData.location': true;
    'searchData.experienceMonths': true;
  };
  ParsedResumeData: {
    resumeId: true;
    candidateId: true;
    email: true;
    skills: true;
    totalExperienceMonths: true;
    'location.city': true;
    'location.country': true;
  };
  SearchIndex: {
    entityType: true;
    skills: true;
    locations: true;
    experienceYears: true;
    text: 'FULLTEXT';
  };
}