'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Job } from '@/lib/definitions';

export function useJobs() {
  const firestore = useFirestore();
  const jobsCol = useMemo(
    () => (firestore ? collection(firestore, 'jobs') : null),
    [firestore]
  );
  const jobsQuery = useMemo(() => (jobsCol ? query(jobsCol) : null), [
    jobsCol,
  ]);

  const { data: jobs, isLoading, error } = useCollection<Job>(jobsQuery);

  return { jobs, isLoading, error };
}
