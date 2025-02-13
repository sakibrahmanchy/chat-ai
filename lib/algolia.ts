import { algoliasearch } from 'algoliasearch';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
  process.env.NEXT_PUBLIC_ALGOLIA_ADMIN_KEY as string
);

searchClient.setSettings({
  indexName: 'resumes',
  indexSettings: {
    searchableAttributes: [
      'parsedContent.full_name',
      'parsedContent.occupation',
      'searchableSkills',
      'parsedContent.experiences.title',
      'parsedContent.experiences.company'
    ],
    attributesForFaceting: [
      'searchableSkills',
      'experienceMonths',
      'matchScore',
      'jobId'
    ],
    customRanking: [
      'desc(matchScore)',
      'desc(createdAt)'
    ]
  }
});

export const searchResumes = async ({
  query = '',
  filters = {},
  page = 0,
  hitsPerPage = 20
}: {
  query?: string;
  filters?: Record<string, any>;
  page?: number;
  hitsPerPage?: number;
}) => {
  const filterString = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:(${value.join(' OR ')})`;
      }
      return `${key}:${value}`;
    })
    .join(' AND ');

  return searchClient.search({
    requests: [{
      indexName: 'resumes',
      query,
      page,
      hitsPerPage,
      filters: filterString || undefined
    }],
  });
};

export const indexResume = async (resume: any) => {
  return searchClient.saveObject({
    indexName: 'resumes',
    objectID: resume.id,
    ...resume
  });
};

export const deleteResumeFromIndex = async (resumeId: string) => {
  return searchClient.deleteObject({
    indexName: 'resumes',
    objectID: resumeId
  });
};

export const updateResumeInIndex = async (resumeId: string, updates: any) => {
  return searchClient.partialUpdateObject({
    indexName: 'resumes',
    objectID: resumeId,
    ...updates
  });
};