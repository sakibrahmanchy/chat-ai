import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getFilteredResumes } from '../lib/resume-queries';
import { Resume } from '../types/resume';
import { Filters } from '../types/filters';

export function useResumes(jobId: string, filters: Filters) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());
  const lastDoc = useRef<any>(null);

  const fetchResumes = useCallback(async (refresh = false) => {
    const cacheKey = JSON.stringify({ jobId, filters });
    
    if (!refresh && cache.current.has(cacheKey)) {
      setResumes(cache.current.get(cacheKey));
      return;
    }

    setLoading(true);
    try {
      const data = await getFilteredResumes({
        jobId,
        filters,
        lastDoc: lastDoc.current
      });

      const newResumes = refresh ? data : [...resumes, ...data];
      setResumes(newResumes);
      cache.current.set(cacheKey, newResumes);
      lastDoc.current = data[data.length - 1];
    } finally {
      setLoading(false);
    }
  }, [jobId, filters]);

  // Clear cache when filters change
  useEffect(() => {
    cache.current.clear();
    fetchResumes(true);
  }, [filters]);

  return {
    resumes,
    loading,
    fetchMore: () => fetchResumes(false)
  };
} 