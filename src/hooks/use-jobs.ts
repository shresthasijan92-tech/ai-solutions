'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Job } from '@/lib/definitions';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jobsCol = collection(db, 'jobs');
    const q = query(jobsCol);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const jobsList: Job[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Job));
        setJobs(jobsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { jobs, isLoading, error };
}
