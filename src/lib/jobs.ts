'use server';
import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Job } from './definitions';

export async function getJobs(): Promise<Job[]> {
  try {
    const jobsCol = collection(db, 'jobs');
    const q = query(jobsCol);
    const jobsSnapshot = await getDocs(q);
    const jobsList = jobsSnapshot.docs.map(doc => {
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
    console.error("Error fetching jobs from Firestore:", error);
    return [];
  }
}
