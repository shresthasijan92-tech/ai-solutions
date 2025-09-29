
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Event } from '@/lib/definitions';

export function useEvents(enabled = true) {
  const firestore = useFirestore();
  const eventsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'events') : null),
    [firestore]
  );
  const eventsQuery = useMemoFirebase(
    () => {
      if (!eventsCol || !enabled) return null;
      return query(eventsCol, orderBy('date', 'desc'));
    },
    [eventsCol, enabled]
  );

  const { data: events, isLoading, error } = useCollection<Event>(eventsQuery);

  return { events, isLoading, error };
}
