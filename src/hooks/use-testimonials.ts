'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Testimonial } from '@/lib/definitions';
import { isFirebaseConfigured } from '@/firebase/config';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!isFirebaseConfigured || !firestore) {
        setIsLoading(false);
        setTestimonials([]);
        return;
    };

    const testimonialsQuery = query(collection(firestore, 'testimonials'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(testimonialsQuery, 
      (snapshot) => {
        const data: Testimonial[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching testimonials:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  return { testimonials, isLoading, error };
}
