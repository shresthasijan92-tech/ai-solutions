'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Event } from '@/lib/definitions';

export function useEvents() {
  const firestore = useFirestore();
  const eventsCol = useMemo(
    () => (firestore ? collection(firestore, 'events') : null),
    [firestore]
  );
  const eventsQuery = useMemo(
    () => (eventsCol ? query(eventsCol, orderBy('date', 'desc')) : null),
    [eventsCol]
  );

  const { data: events, isLoading, error } = useCollection<Event>(eventsQuery);

  return { events, isLoading, error };
}
