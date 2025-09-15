'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Event } from '@/lib/definitions';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventsCol = collection(db, 'events');
    const q = query(eventsCol, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const eventsList: Event[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Event));
        setEvents(eventsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { events, isLoading, error };
}
