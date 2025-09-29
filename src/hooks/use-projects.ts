'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Project } from '@/lib/definitions';

export function useProjects(enabled = true) {
  const firestore = useFirestore();
  const projectsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projects') : null),
    [firestore]
  );
  const projectsQuery = useMemoFirebase(
    () => {
      if (!projectsCol || !enabled) return null;
      return query(projectsCol)
    },
    [projectsCol, enabled]
  );

  const {
    data: projects,
    isLoading,
    error,
  } = useCollection<Project>(projectsQuery);

  return { projects, isLoading, error };
}
