import { CandidateComparison } from "@/components/smarthrflow/candidate-comparison";
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
  Timestamp
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

export default async function JobComparisonPage({
  params: { id: jobId },
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    // Get job details - jobs are stored under user's collection
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    
    console.log('Job ID:', jobId);
    console.log('Job exists:', jobSnap.exists());
    
    if (!jobSnap.exists()) {
      console.log('Job not found');
      return null;
    }

    const job = {
      id: jobSnap.id,
      ...serializeData(jobSnap.data()),
    } as Job;

    console.log('Job data:', job);

    // Get resumes for this job - resumes are stored as a subcollection of the job
    const resumesRef = collection(db, 'users', userId, 'jobs', jobId, 'resumes');
    const resumesQuery = query(
      resumesRef, 
      orderBy('createdAt', 'desc')
    );
    
    const resumesSnap = await getDocs(resumesQuery);
    console.log('Resumes count:', resumesSnap.size);
    
    const resumes = resumesSnap.docs.map(doc => ({
      id: doc.id,
      ...serializeData(doc.data()),
    })) as Resume[];

    console.log('Processed resumes:', resumes.length);

    return (
      <CandidateComparison 
        resumes={resumes} 
        jobId={jobId} 
        jobTitle={job.title} 
      />
    );
  } catch (error) {
    console.error('Error fetching job and resumes:', error);
    return null;
  }
} 