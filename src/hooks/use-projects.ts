'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Project } from '@/lib/definitions';

export function useProjects() {
  const firestore = useFirestore();
  const projectsCol = useMemo(
    () => (firestore ? collection(firestore, 'projects') : null),
    [firestore]
  );
  const projectsQuery = useMemo(
    () => (projectsCol ? query(projectsCol) : null),
    [projectsCol]
  );

  const {
    data: projects,
    isLoading,
    error,
  } = useCollection<Project>(projectsQuery);

  return { projects, isLoading, error };
}
