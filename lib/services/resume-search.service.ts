import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SearchFilters {
  skills?: string[];
  scoreRange?: [number, number];
  status?: string[];
  experienceMonths?: [number, number];
  searchTerm?: string;
  sortBy?: 'score' | 'date';
  matchType?: 'AND' | 'OR';
  location?: string;
}

interface Resume {
  id: string;
  hash: string;
  parsed_content: {
    full_name: string;
    occupation: string;
    education: Array<{
      degree_name: string;
      school: string;
      starts_at?: string;
      ends_at?: string;
    }>;
    experiences: Array<{
      title: string;
      company: string;
      starts_at: string;
      ends_at?: string;
    }>;
    skills: string[];
  };
  scores: {
    overall_score: number;
    skills_score: number;
    experience_score: number;
    education_score: number;
    analysis: {
      matched_skills: string[];
      missing_skills: string[];
      strengths: string[];
      weaknesses: string[];
    };
  };
  searchable_skills: string[];
  experience_months: number;
  current_position: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export class ResumeSearchService {
  private ITEMS_PER_PAGE = 20;

  async searchResumes(
    jobId: string,
    filters: {
      skills?: string[];
      scoreRange?: [number, number];
      experienceMonths?: [number, number];
      searchTerm?: string;
      sortBy?: 'score' | 'date';
      matchType?: 'AND' | 'OR';
      location?: string;
    },
    page = 1
  ) {
    try {
      let query = supabase
        .from('resumes')
        .select('*', { count: 'exact' })
        .eq('job_id', jobId);

      // Apply filters
      if (filters.skills?.length) {
        // Use containedBy for AND operation (all skills must be present)
        // Use overlap for OR operation (any skill can be present)
        if (filters.matchType === 'AND') {
          filters.skills.forEach(skill => {
            query = query.contains('searchable_skills', [skill.toLowerCase()]);
          });
        } else {
          query = query.overlaps('searchable_skills', filters.skills.map(s => s.toLowerCase()));
        }
      }

      if (filters.scoreRange) {
        query = query
          .gte('overall_score', filters.scoreRange[0])
          .lte('overall_score', filters.scoreRange[1]);
      }

      if (filters.experienceMonths) {
        query = query
          .gte('experience_months', filters.experienceMonths[0])
          .lte('experience_months', filters.experienceMonths[1]);
      }

      if (filters.location && filters.location !== 'all') {
        // Search in the location object's fields
        query = query.or(
          `location->>city.ilike.%${filters.location}%,` +
          `location->>state.ilike.%${filters.location}%,` +
          `location->>country.ilike.%${filters.location}%`
        );
      }

      if (filters.searchTerm) {
        query = query.or(
          `parsed_content->>full_name.ilike.%${filters.searchTerm}%,` +
          `current_position.ilike.%${filters.searchTerm}%,` +
          `searchable_skills.cs.{${filters.searchTerm.toLowerCase()}}`
        );
      }

      // Always sort by score first, then by date
      query = query
        .order('overall_score', { ascending: false })
        // .order('created_at', { ascending: false });

      // Apply pagination
      const start = (page - 1) * this.ITEMS_PER_PAGE;
      query = query.range(start, start + this.ITEMS_PER_PAGE - 1);

      const { data: resumes, error, count } = await query;

      if (error) throw error;

      return {
        resumes,
        hasMore: count ? (start + this.ITEMS_PER_PAGE) < count : false,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw error;
    }
  }

  async getUniqueLocations(jobId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('location')
        .eq('job_id', jobId)
        .not('location', 'is', null);

      if (error) throw error;

      console.log({ data })

      const locations = new Set<string>();
      data?.forEach(item => {
        if (item.location) {
          const { city, state, country } = item.location;
          if (city) locations.add(city);
          if (state) locations.add(state);
          if (country) locations.add(country);
        }
      });

      return Array.from(locations).sort();
    } catch (error) {
      console.error('Error getting unique locations:', error);
      return [];
    }
  }
}

export const resumeSearch = new ResumeSearchService(); 