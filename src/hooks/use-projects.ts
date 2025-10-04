'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Project } from '@/lib/definitions';

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const projectsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'projects'));
  }, [firestore]);


  useEffect(() => {
    if (!projectsQuery) {
        setIsLoading(false);
        setProjects([]);
        return;
    };

    const unsubscribe = onSnapshot(projectsQuery, 
      (snapshot) => {
        const data: Project[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectsQuery]);

  return { projects, isLoading, error };
}
