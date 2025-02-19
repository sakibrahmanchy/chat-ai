import { db } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { Resume } from '@/app/types/entities';

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

const EXPERIENCE_RANGES = {
  entry: [0, 24], // 0-2 years
  mid: [24, 60],  // 2-5 years
  senior: [60, 96], // 5-8 years
  lead: [96, 999]  // 8+ years
};

export class ResumeSearchService {
  private ITEMS_PER_PAGE = 20;

  buildQuery(
    userId: string,
    jobId: string,
    filters: SearchFilters,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Query<DocumentData> {
    const resumesRef = collection(db, 'resumes');
    
    // Always start with jobId and sort by score
    let q = query(
      resumesRef, 
      where('jobId', '==', jobId),
      orderBy('scores.overallScore', 'desc')
    );

    // For skills, we'll use a separate index
    if (filters.skills?.length && filters.matchType === 'OR') {
      q = query(
        resumesRef,
        where('jobId', '==', jobId),
        where('parsedData.skills', 'array-contains-any', filters.skills),
        orderBy('scores.overallScore', 'desc')
      );
    }

    // Add pagination
    q = query(q, limit(this.ITEMS_PER_PAGE));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  }

  private applyClientSideFilters(resumes: Resume[], filters: SearchFilters): Resume[] {
    let filtered = resumes;
    console.log('Initial resumes count:', resumes.length);

    // Apply AND logic for skills
    if (filters.skills?.length && filters.matchType === 'AND') {
      filtered = filtered.filter(resume => 
        filters.skills!.every(skill => 
          resume.parsedData?.skills?.includes(skill)
        )
      );
      console.log('After skills filter:', filtered.length);
    }

    // Apply experience filter
    if (filters.experienceMonths && 
        (filters.experienceMonths[0] > 0 || filters.experienceMonths[1] < 999)) {
      console.log('Applying experience filter:', filters.experienceMonths);
      filtered = filtered.filter(resume => {
        const months = resume.parsedData?.total_experience_in_months || 0;
        console.log('Resume months:', months, 'Resume:', resume.id);
        const isInRange = months >= filters.experienceMonths![0] && 
                         months <= filters.experienceMonths![1];
        console.log('Is in range:', isInRange);
        return isInRange;
      });
      console.log('After experience filter:', filtered.length);
    }

    // Apply location filter
    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(resume => {
        const location = resume.parsedData?.location;
        console.log('Resume location:', location, 'Filter location:', filters.location);
        return location === filters.location;
      });
      console.log('After location filter:', filtered.length);
    }

    // Apply score range filter
    if (filters.scoreRange && 
        (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 10)) {
      filtered = filtered.filter(resume => {
        const score = resume.scores?.overallScore || 0;
        return score >= filters.scoreRange![0] && 
               score <= filters.scoreRange![1];
      });
      console.log('After score filter:', filtered.length);
    }

    return filtered;
  }

  // Helper method to convert years to months
  private yearsToMonths(years: number): number {
    return years * 12;
  }

  // Helper method to get experience range in months
  private getExperienceRange(level: string): [number, number] {
    switch (level) {
      case 'entry':
        return [0, this.yearsToMonths(2)];
      case 'mid':
        return [this.yearsToMonths(2), this.yearsToMonths(5)];
      case 'senior':
        return [this.yearsToMonths(5), this.yearsToMonths(8)];
      case 'lead':
        return [this.yearsToMonths(8), this.yearsToMonths(99)];
      default:
        return [0, this.yearsToMonths(99)];
    }
  }

  async search(
    userId: string,
    jobId: string,
    filters: SearchFilters,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    resumes: Resume[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
  }> {
    try {
      // Log the filters
      console.log('Search filters:', JSON.stringify(filters, null, 2));

      const q = this.buildQuery(userId, jobId, filters, lastDoc);
      const snapshot = await getDocs(q);

      let resumes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resume[];

      console.log('Raw resumes count:', resumes.length);
      
      // Log a sample resume to check structure
      if (resumes.length > 0) {
        console.log('Sample resume structure:', JSON.stringify(resumes[0], null, 2));
      }

      // Apply client-side filtering for complex conditions
      resumes = this.applyClientSideFilters(resumes, filters);

      console.log('Final resumes count:', resumes.length);

      return {
        resumes,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === this.ITEMS_PER_PAGE
      };
    } catch (error: any) {
      console.error('Error searching resumes:', error);
      throw error;
    }
  }

  async getUniqueLocations(userId: string, jobId: string): Promise<string[]> {
    const resumesRef = collection(db, 'resumes');
    const q = query(resumesRef, where('jobId', '==', jobId));
    const snapshot = await getDocs(q);
    
    const locations = new Set<string>();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const location = data.parsedData?.location;
      if (location) {
        locations.add(location);
      }
    });

    return Array.from(locations).sort();
  }

  // Add this method to help debug
  async logDocumentStructure(jobId: string) {
    const resumesRef = collection(db, 'resumes');
    const q = query(resumesRef, where('jobId', '==', jobId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No documents found');
      return;
    }

    const sampleDoc = snapshot.docs[0].data();
    console.log('Document structure:', JSON.stringify(sampleDoc, null, 2));
  }
}

export const resumeSearch = new ResumeSearchService(); 