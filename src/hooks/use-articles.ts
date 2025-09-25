'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Article } from '@/lib/definitions';

export function useArticles() {
  const firestore = useFirestore();
  const articlesCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'articles') : null),
    [firestore]
  );
  const articlesQuery = useMemoFirebase(
    () => (articlesCol ? query(articlesCol, orderBy('publishedAt', 'desc')) : null),
    [articlesCol]
  );

  const {
    data: articles,
    isLoading,
    error,
  } = useCollection<Article>(articlesQuery);

  return { articles, isLoading, error };
}
