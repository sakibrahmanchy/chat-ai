import { db } from "@/firebase";
import { Resume } from "@/app/types/resume";
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
const RESUMES_COLLECTION = 'resumes';

export async function getResume(jobId: string, resumeId: string): Promise<Resume | null> {
  try {
    const resumeRef = doc(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION, resumeId);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) {
      return null;
    }

    return {
      id: resumeSnap.id,
      ...resumeSnap.data(),
      createdAt: resumeSnap.data().createdAt?.toDate(),
      updatedAt: resumeSnap.data().updatedAt?.toDate(),
    } as Resume;
  } catch (error) {
    console.error('Error fetching resume:', error);
    return null;
  }
}

export async function getResumes(jobId: string): Promise<Resume[]> {
  try {
    const resumesRef = collection(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION);
    const resumesQuery = query(resumesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(resumesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Resume[];
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
}

export async function createResume(
  jobId: string, 
  data: Omit<Resume, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Resume | null> {
  try {
    const resumesRef = collection(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION);
    const docRef = await addDoc(resumesRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: data.status || 'new',
    });

    const newResume = await getResume(jobId, docRef.id);
    return newResume;
  } catch (error) {
    console.error('Error creating resume:', error);
    return null;
  }
}

export async function updateResume(
  jobId: string,
  resumeId: string, 
  data: Partial<Resume>
): Promise<Resume | null> {
  try {
    const resumeRef = doc(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION, resumeId);
    
    await updateDoc(resumeRef, {
      ...data,
      updatedAt: new Date(),
    });

    const updatedResume = await getResume(jobId, resumeId);
    return updatedResume;
  } catch (error) {
    console.error('Error updating resume:', error);
    return null;
  }
}

export async function deleteResume(jobId: string, resumeId: string): Promise<boolean> {
  try {
    const resumeRef = doc(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION, resumeId);
    await deleteDoc(resumeRef);
    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
}

// Additional utility functions

export async function getResumesByStatus(jobId: string, status: string): Promise<Resume[]> {
  try {
    const resumesRef = collection(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION);
    const resumesQuery = query(
      resumesRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(resumesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Resume[];
  } catch (error) {
    console.error('Error fetching resumes by status:', error);
    return [];
  }
}

export async function getResumesByScore(jobId: string, minScore: number): Promise<Resume[]> {
  try {
    const resumesRef = collection(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION);
    const resumesQuery = query(
      resumesRef,
      where('scores.overallScore', '>=', minScore),
      orderBy('scores.overallScore', 'desc')
    );

    const querySnapshot = await getDocs(resumesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Resume[];
  } catch (error) {
    console.error('Error fetching resumes by score:', error);
    return [];
  }
}

export async function getTopResumes(jobId: string, limit: number = 10): Promise<Resume[]> {
  try {
    const resumesRef = collection(db, JOBS_COLLECTION, jobId, RESUMES_COLLECTION);
    const resumesQuery = query(
      resumesRef,
      where('scores', '!=', null),
      orderBy('scores.overallScore', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(resumesQuery);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }))
      .slice(0, limit) as Resume[];
  } catch (error) {
    console.error('Error fetching top resumes:', error);
    return [];
  }
} 