'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Testimonial } from '@/lib/definitions';

export function useTestimonials(approvedOnly = false) {
  const firestore = useFirestore();
  const testimonialsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'testimonials') : null),
    [firestore]
  );

  const testimonialsQuery = useMemoFirebase(() => {
    if (!testimonialsCol) return null;
    
    if (approvedOnly) {
      // Secure query for public pages: only fetch approved testimonials.
      return query(
        testimonialsCol,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }
    
    // For admin pages, fetch all testimonials, sorted by date.
    // This will only be called within authenticated admin components.
    return query(testimonialsCol, orderBy('createdAt', 'desc'));
  }, [testimonialsCol, approvedOnly]);

  const {
    data: testimonials,
    isLoading,
    error,
  } = useCollection<Testimonial>(testimonialsQuery);

  return { testimonials, isLoading, error };
}
