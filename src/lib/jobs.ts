'use server';
import { firestore } from '@/firebase/server';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Job } from './definitions';

export async function getJobs(): Promise<Job[]> {
  try {
    const jobsCol = collection(firestore, 'jobs');
    const q = query(jobsCol);
    const jobsSnapshot = await getDocs(q);
    const jobsList = jobsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        location: data.location,
        type: data.type,
        description: data.description,
      } as Job;
    });
    return jobsList;
  } catch (error) {
    console.error('Error fetching jobs from Firestore:', error);
    return [];
  }
}
