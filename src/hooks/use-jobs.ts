'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Job } from '@/lib/definitions';

export function useJobs(enabled = true) {
  const firestore = useFirestore();
  const jobsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'jobs') : null),
    [firestore]
  );
  const jobsQuery = useMemoFirebase(() => {
      if (!jobsCol || !enabled) return null;
      return query(jobsCol);
    },
    [jobsCol, enabled]
  );

  const { data: jobs, isLoading, error } = useCollection<Job>(jobsQuery);

  return { jobs, isLoading, error };
}
