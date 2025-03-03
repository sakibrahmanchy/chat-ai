import { Resume } from '@/app/types/resume';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SearchFilters {
  skills?: string[];
  scoreRange?: [number, number];
  experienceMonths?: [number, number];
  searchTerm?: string;
  sortBy?: 'score' | 'date';
  matchType?: 'AND' | 'OR';
  location?: string;
  status?: string;
}

export class ResumeSearchService {
  private ITEMS_PER_PAGE = 20;

  async searchResumes(
    jobId: string,
    filters: SearchFilters,
    page = 1
  ) {
    try {
      let query = supabase
        .from('resumes')
        .select(`
          id,
          hash,
          parsed_content,
          scores,
          searchable_skills,
          experience_months,
          current_position,
          overall_score,
          metadata,
          location,
          created_at,
          updated_at,
          job_resume_matches (
            status
          )
        `, { count: 'exact' })
        .eq('job_id', jobId);

      // Apply status filter
      if (filters.status) {
        query = query.eq('job_resume_matches.status', filters.status);
      } else if (filters.status === '') {
        query = query.is('job_resume_matches.status', null);
      }

      // Apply filters
      if (filters.skills?.length) {
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
      query = query.order('overall_score', { ascending: false });

      // Apply pagination
      const start = (page - 1) * this.ITEMS_PER_PAGE;
      query = query.range(start, start + this.ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;
      console.log({ data })
      if (error) throw error;

      return {
        resumes: data as Resume[],
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
      // console.error('Error getting unique locations:', error);
      return [];
    }
  }
}

export const resumeSearch = new ResumeSearchService(); 