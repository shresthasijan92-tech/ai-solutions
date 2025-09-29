'use client';

import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Project } from '@/lib/definitions';

export function useProjects() {
  const firestore = useFirestore();
  const projectsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'projects') : null),
    [firestore]
  );
  
  const {
    data: projects,
    isLoading,
    error,
  } = useCollection<Project>(projectsCol);

  return { projects, isLoading, error };
}
