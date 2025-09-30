'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Job } from '@/lib/definitions';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const jobsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'jobs'));
  }, [firestore]);


  useEffect(() => {
    if (!jobsQuery) {
        setIsLoading(false);
        return;
    };

    const unsubscribe = onSnapshot(jobsQuery, 
      (snapshot) => {
        const data: Job[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching jobs:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobsQuery]);

  return { jobs, isLoading, error };
}
