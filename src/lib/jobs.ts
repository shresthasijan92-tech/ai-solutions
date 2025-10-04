'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Job } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export async function getJobs(): Promise<Job[]> {
  if (!isFirebaseConfigured) {
    return [];
  }
  try {
    const jobsCol = collection(firestore, 'jobs');
    const q = query(jobsCol);
    const jobsSnapshot = await getDocs(q);
    const jobsList = jobsSnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data()
      } as Job;
    });
    return jobsList;
  } catch (error) {
    console.error('Error fetching jobs from Firestore:', error);
    return [];
  }
}
