'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Article } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useArticles() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const articlesQuery = useMemo(() => {
    if (!firestore || !isFirebaseConfigured) return null;
    return query(collection(firestore, 'articles'), orderBy('publishedAt', 'desc'));
  }, [firestore]);


  useEffect(() => {
    if (!articlesQuery) {
        setIsLoading(false);
        setArticles([]); 
        return;
    };

    const unsubscribe = onSnapshot(articlesQuery, 
      (snapshot) => {
        const data: Article[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        setArticles(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching articles:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [articlesQuery]);

  return { articles, isLoading, error };
}
