'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Article } from '@/lib/definitions';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const articlesCol = collection(db, 'articles');
    const q = query(articlesCol, orderBy('publishedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const articlesList: Article[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt, // This can be a Timestamp
          } as Article
        });
        setArticles(articlesList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { articles, isLoading, error };
}
