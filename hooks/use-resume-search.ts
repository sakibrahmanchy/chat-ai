import { useState, useEffect } from 'react';
import { searchResumes } from '@/lib/algolia';
import { useDebounce } from './use-debounce';

export function useResumeSearch({ jobId, initialFilters = {} }) {
  const [query, setQuery] = useState(initialFilters.search || '');
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebounce(query, 300);

  const search = async (resetPage = true) => {
    setLoading(true);
    try {
      const response = await searchResumes({
        query: debouncedQuery,
        filters: {
          jobId,
          ...(filters.skills?.length && {
            searchableSkills: filters.skills
          }),
          ...(filters.experienceLevel && {
            experienceMonths: filters.experienceLevel
          }),
          ...(filters.matchScore && {
            matchScore: filters.matchScore
          })
        },
        page: resetPage ? 0 : page,
        hitsPerPage: 20
      });

      // Extract hits from the first request's results
      const hits = response.results[0].hits;
      
      setResults(resetPage ? hits : [...results, ...hits]);
      setPage(prev => resetPage ? 0 : prev + 1);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search(true);
  }, [debouncedQuery, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    loadMore: () => search(false)
  };
}