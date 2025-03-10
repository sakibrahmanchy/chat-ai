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
  availability?: number;
  limit?: number;
  fetchStatusCount?: boolean;
}

export class ResumeSearchService {
  private ITEMS_PER_PAGE = 5;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getBaseFilterQuery(query: any, jobId: string, filters: SearchFilters) {
     // Apply additional filters
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

    if (filters.availability) {
      query = query.eq('availability_weeks', filters.availability);
    }

    return query;
  }

  async getFilteredResumeCountsByStatus(jobId: string, filters: SearchFilters) {
    try {
      // Step 1: Fetch resumes based on filters
      let query = supabase
        .from('resumes')
        .select(`id, searchable_skills, overall_score, job_id, experience_months, location, parsed_content, 
          job_resume_matches(job_id, status)`)
        .eq('job_id', jobId)
        .eq('job_resume_matches.job_id', jobId);

      query = this.getBaseFilterQuery(query, jobId, filters);;
  
      // Execute the query to fetch resumes
      const { data, error } = await query;
  
      if (error) throw error;
  
      // Step 2: Group by status and count
      const statusCounts: Record<string, number> = {};
      const statuses = ['pending', 'accepted', 'rejected'];

      statusCounts.all = data.length;
      statuses.forEach(status => {
        statusCounts[status] = 0;
      });
      // Group resumes by status
      data?.forEach(resume => {
        const status = resume.job_resume_matches?.[0]?.status;
        if (status) {
          statusCounts[status]++;
        }
      });
  
      return statusCounts;
    } catch (error) {
      console.error('Error fetching filtered resume counts by status:', error);
      throw {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      };
    }
  }

  async searchResumes(
    jobId: string,
    filters: SearchFilters,
    page = 1,
  ) {
    try {
      let statusCounts: Record<string, number> = {};
      if (filters.fetchStatusCount) {
        statusCounts = await this.getFilteredResumeCountsByStatus(jobId, filters); 
      }

      let query = supabase
        .from('resumes')
        .select(`
          id,
          email,
          phone,
          first_name,
          last_name,
          full_name,
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
          job_resume_matches!inner (
            status  
          ),
          availability_weeks
        `, { count: 'exact' })
        .eq('job_id', jobId)
        .eq('job_resume_matches.job_id', jobId);

      query = this.getBaseFilterQuery(query, jobId, filters);

      if (filters.status) {
        console.log({ status: filters.status })
        query = query.eq('job_resume_matches.status', filters.status);
      }

      // Always sort by score first, then by date
      query = query.order('overall_score', { ascending: false });
          
      const limit = filters.limit || this.ITEMS_PER_PAGE;

      // Apply pagination
      const start = (page - 1) * limit;
      query = query.range(start, start + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error; 

      return {
        resumes: data as Resume[],
        hasMore: count ? (start + limit) < count : false,
        total: count || 0,
        statusCounts
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
      console.log('Error getting unique locations:', error);
      return [];
    }
  }
}

export const resumeSearch = new ResumeSearchService(); 