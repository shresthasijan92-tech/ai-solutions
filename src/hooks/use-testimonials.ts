'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy, type DocumentData, type FirestoreError } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Testimonial } from '@/lib/definitions';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const firestore = useFirestore();

  const testimonialsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'testimonials'), orderBy('createdAt', 'desc'));
  }, [firestore]);


  useEffect(() => {
    if (!testimonialsQuery) {
        setIsLoading(false);
        return;
    };

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
  }, [testimonialsQuery]);

  return { testimonials, isLoading, error };
}
