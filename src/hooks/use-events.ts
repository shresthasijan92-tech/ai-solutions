'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Event } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useEvents() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setEvents([]);
        return;
    };

    const eventsQuery = query(collection(firestore, 'events'), orderBy('date', 'desc'));

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
  }, [firestore]);

  return { events, isLoading, error };
}
