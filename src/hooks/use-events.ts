'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Event } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useEvents() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const eventsQuery = useMemo(() => {
    if (!firestore || !isFirebaseConfigured) return null;
    return query(collection(firestore, 'events'), orderBy('date', 'desc'));
  }, [firestore]);


  useEffect(() => {
    if (!eventsQuery) {
        setIsLoading(false);
        setEvents([]);
        return;
    };

    const unsubscribe = onSnapshot(eventsQuery, 
      (snapshot) => {
        const data: Event[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        setEvents(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching events:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventsQuery]);

  return { events, isLoading, error };
}
