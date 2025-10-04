'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Project } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setProjects([]);
        return;
    };

    const projectsQuery = query(collection(firestore, 'projects'));

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
  }, [firestore]);

  return { projects, isLoading, error };
}
