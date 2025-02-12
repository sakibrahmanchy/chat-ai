import { CandidateListView } from "@/components/smarthrflow/candidate-list-view";
import { db } from "@/firebase";
import { Resume } from "@/app/types/resume";
import { Job } from "@/app/types/job";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp,
  limit
} from "firebase/firestore";
import { auth } from "@clerk/nextjs/server";

// Helper function to serialize Firestore data
function serializeData(data: any) {
  const newData = { ...data };
  Object.keys(newData).forEach(key => {
    if (newData[key] instanceof Timestamp) {
      newData[key] = newData[key].toDate().toISOString();
    } else if (typeof newData[key] === 'object' && newData[key] !== null) {
      newData[key] = serializeData(newData[key]);
    }
  });
  return newData;
}

const CANDIDATES_PER_PAGE = 20;

export default async function JobPage({
  params: { id: jobId },
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  
  if (!userId) return null;

  try {
    // Get job details
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) return null;

    const job = {
      id: jobSnap.id,
      ...serializeData(jobSnap.data()),
      requiredSkills: jobSnap.data()?.requiredSkills || [],
      requirements: jobSnap.data()?.requirements || '',
      skills: jobSnap.data()?.skills || [],
    } as Job;

    // Get initial resumes (first page)
    const resumesRef = collection(db, 'users', userId, 'jobs', jobId, 'resumes');
    const resumesQuery = query(
      resumesRef, 
      orderBy('createdAt', 'desc'),
      limit(CANDIDATES_PER_PAGE)
    );
    
    const resumesSnap = await getDocs(resumesQuery);
    
    const resumes = resumesSnap.docs.map(doc => ({
      id: doc.id,
      ...serializeData(doc.data()),
    })) as Resume[];

    return (
      <CandidateListView 
        initialResumes={resumes} 
        jobId={jobId} 
        jobTitle={job.title}
        userId={userId}
        jobDescription={job.description}
        requiredSkills={job.requiredSkills}
        requirements={job.requirements}
      />
    );
  } catch (error) {
    console.error('Error fetching job and resumes:', error);
    return null;
  }
} 