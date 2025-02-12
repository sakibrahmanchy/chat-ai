'use client';

import { CandidateListView } from "./smarthrflow/candidate-list-view";

const DEMO_RESUMES = [
  {
    id: '1',
    fileName: 'john-doe-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'John',
      middle_name: '',
      last_name: 'Doe',
      full_name: 'John Doe',
      occupation: 'Senior Software Engineer',
      role: 'Backend Developer',
      headline: 'Experienced Backend Developer',
      summary: 'Passionate about building scalable systems',
      country: 'United States',
      city: 'San Francisco',
      state: 'CA',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2020 },
          ends_at: { day: 1, month: 1, year: 2023 },
          company: 'Tech Corp',
          title: 'Senior Backend Developer',
          description: 'Led backend development team',
          location: 'San Francisco, CA',
          technologies: ['Node.js', 'TypeScript', 'AWS'],
          achievements: ['Improved system performance by 40%']
        }
      ],
      education: [],
      certifications: [],
      skills: ['Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      skills_with_yoe: [],
      personal_emails: ['john@example.com'],
      personal_numbers: ['+1234567890'],
      languages: ['English'],
      total_experience_in_months: 60,
      rawText: ''
    },
    scores: {
      skillsScore: 8,
      experienceScore: 7,
      overallScore: 8,
      averageScore: 7.5,
      educationScore: 7,
      technicalScore: 8,
      roleAlignmentScore: 8,
      industryKnowledgeScore: 7,
      analysis: {
        matchedSkills: ['Node.js', 'TypeScript', 'AWS'],
        missingSkills: ['GraphQL'],
        strengthAreas: ['Backend Development', 'Cloud Infrastructure'],
        improvementAreas: ['GraphQL Experience'],
        experienceAnalysis: 'Strong backend experience',
        overallFeedback: 'Excellent candidate with strong technical background'
      }
    }
  },
  {
    id: '2',
    fileName: 'sarah-smith-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Sarah',
      last_name: 'Smith',
      full_name: 'Sarah Smith',
      occupation: 'Full Stack Developer',
      role: 'Backend Developer',
      headline: 'Full Stack Developer with Node.js expertise',
      summary: 'Full stack developer with focus on Node.js and React',
      country: 'Canada',
      city: 'Toronto',
      state: 'ON',
      experiences: [
        {
          starts_at: { day: 1, month: 6, year: 2021 },
          company: 'Web Solutions Inc',
          title: 'Full Stack Developer',
          description: 'Building scalable web applications',
          location: 'Toronto, ON',
          technologies: ['Node.js', 'React', 'MongoDB'],
          achievements: ['Reduced loading time by 60%']
        }
      ],
      skills: ['Node.js', 'React', 'MongoDB', 'TypeScript', 'Express'],
      personal_emails: ['sarah@example.com'],
      personal_numbers: ['+1234567891'],
      total_experience_in_months: 36,
      rawText: ''
    },
    scores: {
      skillsScore: 7,
      experienceScore: 6,
      overallScore: 7,
      averageScore: 6.5,
      technicalScore: 7,
      roleAlignmentScore: 6,
      analysis: {
        matchedSkills: ['Node.js', 'TypeScript'],
        missingSkills: ['AWS', 'Docker'],
        strengthAreas: ['Full Stack Development'],
        improvementAreas: ['Cloud Technologies'],
        experienceAnalysis: 'Good full stack experience',
        overallFeedback: 'Strong candidate needing cloud experience'
      }
    }
  },
  {
    id: '3',
    fileName: 'mike-johnson-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Mike',
      last_name: 'Johnson',
      full_name: 'Mike Johnson',
      occupation: 'Senior Backend Engineer',
      role: 'Backend Developer',
      headline: 'Backend Engineer specializing in Node.js',
      summary: 'Experienced in building microservices',
      country: 'United Kingdom',
      city: 'London',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2019 },
          company: 'Tech Solutions Ltd',
          title: 'Senior Backend Engineer',
          description: 'Leading backend development',
          location: 'London, UK',
          technologies: ['Node.js', 'AWS', 'Docker'],
          achievements: ['Built scalable microservices architecture']
        }
      ],
      skills: ['Node.js', 'AWS', 'Docker', 'Microservices', 'TypeScript'],
      personal_emails: ['mike@example.com'],
      personal_numbers: ['+1234567892'],
      total_experience_in_months: 48,
      rawText: ''
    },
    scores: {
      skillsScore: 9,
      experienceScore: 8,
      overallScore: 9,
      averageScore: 8.5,
      technicalScore: 9,
      roleAlignmentScore: 9,
      analysis: {
        matchedSkills: ['Node.js', 'AWS', 'Docker', 'TypeScript'],
        missingSkills: ['GraphQL'],
        strengthAreas: ['Backend Architecture', 'Cloud Infrastructure'],
        improvementAreas: ['GraphQL'],
        experienceAnalysis: 'Excellent backend experience',
        overallFeedback: 'Perfect fit for the role'
      }
    }
  },
  {
    id: '4',
    fileName: 'alex-chen-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Alex',
      last_name: 'Chen',
      full_name: 'Alex Chen',
      occupation: 'Lead Backend Engineer',
      role: 'Backend Developer',
      headline: 'Lead Backend Engineer with Cloud Expertise',
      summary: 'Experienced in leading distributed teams and cloud architecture',
      country: 'Singapore',
      city: 'Singapore',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2018 },
          company: 'Cloud Tech Solutions',
          title: 'Lead Backend Engineer',
          description: 'Leading cloud infrastructure development',
          location: 'Singapore',
          technologies: ['Node.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'],
          achievements: ['Led migration to microservices architecture']
        }
      ],
      skills: ['Node.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'TypeScript'],
      personal_emails: ['alex@example.com'],
      personal_numbers: ['+1234567893'],
      total_experience_in_months: 72,
      rawText: ''
    },
    scores: {
      skillsScore: 10,
      experienceScore: 9,
      overallScore: 9.5,
      averageScore: 9.5,
      technicalScore: 10,
      roleAlignmentScore: 9,
      analysis: {
        matchedSkills: ['Node.js', 'AWS', 'Docker', 'GraphQL', 'TypeScript'],
        missingSkills: [],
        strengthAreas: ['Cloud Architecture', 'Team Leadership'],
        improvementAreas: [],
        experienceAnalysis: 'Outstanding technical leadership',
        overallFeedback: 'Exceptional candidate with all required skills'
      }
    }
  },
  {
    id: '5',
    fileName: 'emma-wilson-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Emma',
      last_name: 'Wilson',
      full_name: 'Emma Wilson',
      occupation: 'Backend Developer',
      role: 'Backend Developer',
      headline: 'Backend Developer specializing in Node.js',
      summary: 'Passionate about building efficient backend systems',
      country: 'Australia',
      city: 'Melbourne',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2022 },
          company: 'Tech Innovators',
          title: 'Backend Developer',
          description: 'Developing scalable APIs',
          location: 'Melbourne, AU',
          technologies: ['Node.js', 'TypeScript', 'MongoDB'],
          achievements: ['Implemented GraphQL API']
        }
      ],
      skills: ['Node.js', 'TypeScript', 'GraphQL', 'MongoDB', 'Express'],
      personal_emails: ['emma@example.com'],
      personal_numbers: ['+1234567894'],
      total_experience_in_months: 24,
      rawText: ''
    },
    scores: {
      skillsScore: 7,
      experienceScore: 5,
      overallScore: 6,
      averageScore: 6,
      technicalScore: 7,
      roleAlignmentScore: 6,
      analysis: {
        matchedSkills: ['Node.js', 'TypeScript', 'GraphQL'],
        missingSkills: ['AWS', 'Docker'],
        strengthAreas: ['API Development'],
        improvementAreas: ['Cloud Experience'],
        experienceAnalysis: 'Good foundation in backend development',
        overallFeedback: 'Promising candidate with room for growth'
      }
    }
  },
  {
    id: '6',
    fileName: 'raj-patel-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Raj',
      last_name: 'Patel',
      full_name: 'Raj Patel',
      occupation: 'DevOps Engineer',
      role: 'Backend Developer',
      headline: 'DevOps Engineer with Strong Backend Skills',
      summary: 'Specializing in cloud infrastructure and backend development',
      country: 'India',
      city: 'Bangalore',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2020 },
          company: 'Cloud Systems Inc',
          title: 'DevOps Engineer',
          description: 'Managing cloud infrastructure',
          location: 'Bangalore, IN',
          technologies: ['AWS', 'Docker', 'Kubernetes', 'Node.js'],
          achievements: ['Reduced deployment time by 70%']
        }
      ],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Node.js', 'TypeScript'],
      personal_emails: ['raj@example.com'],
      personal_numbers: ['+1234567895'],
      total_experience_in_months: 42,
      rawText: ''
    },
    scores: {
      skillsScore: 8,
      experienceScore: 7,
      overallScore: 8,
      averageScore: 7.5,
      technicalScore: 8,
      roleAlignmentScore: 7,
      analysis: {
        matchedSkills: ['Node.js', 'AWS', 'Docker', 'TypeScript'],
        missingSkills: ['GraphQL'],
        strengthAreas: ['Infrastructure', 'DevOps'],
        improvementAreas: ['Pure Backend Development'],
        experienceAnalysis: 'Strong infrastructure background',
        overallFeedback: 'Strong technical skills with DevOps focus'
      }
    }
  },
  {
    id: '7',
    fileName: 'maria-garcia-resume.pdf',
    fileType: 'pdf',
    fileSize: 1024,
    downloadUrl: '#',
    status: 'processed' as const,
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    updatedAt: new Date(Date.now() - 518400000).toISOString(),
    userId: 'demo',
    jobId: 'demo',
    parsedContent: {
      first_name: 'Maria',
      last_name: 'Garcia',
      full_name: 'Maria Garcia',
      occupation: 'Senior Software Engineer',
      role: 'Backend Developer',
      headline: 'Senior Engineer with Full Stack Experience',
      summary: 'Full stack developer with strong backend focus',
      country: 'Spain',
      city: 'Barcelona',
      experiences: [
        {
          starts_at: { day: 1, month: 1, year: 2019 },
          company: 'Digital Solutions',
          title: 'Senior Software Engineer',
          description: 'Full stack development with backend focus',
          location: 'Barcelona, ES',
          technologies: ['Node.js', 'TypeScript', 'React', 'GraphQL'],
          achievements: ['Built real-time data processing system']
        }
      ],
      skills: ['Node.js', 'TypeScript', 'GraphQL', 'React', 'PostgreSQL'],
      personal_emails: ['maria@example.com'],
      personal_numbers: ['+1234567896'],
      total_experience_in_months: 54,
      rawText: ''
    },
    scores: {
      skillsScore: 8,
      experienceScore: 8,
      overallScore: 7.5,
      averageScore: 7.5,
      technicalScore: 8,
      roleAlignmentScore: 7,
      analysis: {
        matchedSkills: ['Node.js', 'TypeScript', 'GraphQL'],
        missingSkills: ['AWS', 'Docker'],
        strengthAreas: ['Backend Development', 'API Design'],
        improvementAreas: ['Cloud Infrastructure'],
        experienceAnalysis: 'Strong development background',
        overallFeedback: 'Well-rounded candidate with strong technical skills'
      }
    }
  }
];

export function DemoCandidateList() {
  return (
    <div className="w-full h-[600px] rounded-xl border overflow-hidden">
      <CandidateListView
        initialResumes={DEMO_RESUMES}
        jobId="demo"
        jobTitle="Senior Backend Developer - Node.JS (Remote Worldwide)"
        userId="demo"
        jobDescription="We are seeking a Senior Backend Developer with strong experience in Node.js and modern cloud technologies. The ideal candidate will have a proven track record of building scalable microservices and working with cloud platforms.

Key Requirements:
- Strong proficiency in Node.js and TypeScript
- Experience with AWS services
- Knowledge of Docker and containerization
- Understanding of microservices architecture
- Experience with GraphQL is a plus"
        requiredSkills={['Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL']}
        requirements="- 5+ years of experience in backend development
- Strong knowledge of Node.js and TypeScript
- Experience with AWS and cloud infrastructure
- Proficiency in Docker and containerization
- Experience with microservices architecture
- Strong problem-solving abilities
- Excellent communication skills"
        showFiltersDefault={true}
      />
    </div>
  );
} 