import { db } from "@/firebase";
import { Job } from "@/app/types/job";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from "firebase/firestore";

const JOBS_COLLECTION = 'jobs';

export async function getJob(jobId: string): Promise<Job | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);

    if (!jobSnap.exists()) {
      return null;
    }

    return {
      id: jobSnap.id,
      ...jobSnap.data(),
      createdAt: jobSnap.data().createdAt?.toDate(),
      updatedAt: jobSnap.data().updatedAt?.toDate(),
    } as Job;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

export async function getJobs(companyId?: string): Promise<Job[]> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    let jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));

    if (companyId) {
      jobsQuery = query(jobsRef, 
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(jobsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Job[];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function createJob(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job | null> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    const docRef = await addDoc(jobsRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newJob = await getJob(docRef.id);
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

export async function updateJob(jobId: string, data: Partial<Job>): Promise<Job | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    
    await updateDoc(jobRef, {
      ...data,
      updatedAt: new Date(),
    });

    const updatedJob = await getJob(jobId);
    return updatedJob;
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await deleteDoc(jobRef);
    return true;
  } catch (error) {
    console.error('Error deleting job:', error);
    return false;
  }
}

// Additional utility functions

export async function getActiveJobs(companyId?: string): Promise<Job[]> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    let jobsQuery = query(
      jobsRef, 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    if (companyId) {
      jobsQuery = query(
        jobsRef,
        where('companyId', '==', companyId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(jobsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Job[];
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    return [];
  }
}

export async function getJobsByStatus(status: string, companyId?: string): Promise<Job[]> {
  try {
    const jobsRef = collection(db, JOBS_COLLECTION);
    let jobsQuery = query(
      jobsRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    if (companyId) {
      jobsQuery = query(
        jobsRef,
        where('companyId', '==', companyId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(jobsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Job[];
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    return [];
  }
} 