'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Testimonial } from '@/lib/definitions';

export function useTestimonials(approvedOnly = false) {
  const firestore = useFirestore();
  const testimonialsCol = useMemo(
    () => (firestore ? collection(firestore, 'testimonials') : null),
    [firestore]
  );

  const testimonialsQuery = useMemo(() => {
    if (!testimonialsCol) return null;
    if (approvedOnly) {
      return query(
        testimonialsCol,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }
    return query(testimonialsCol, orderBy('createdAt', 'desc'));
  }, [testimonialsCol, approvedOnly]);

  const {
    data: testimonials,
    isLoading,
    error,
  } = useCollection<Testimonial>(testimonialsQuery);

  return { testimonials, isLoading, error };
}
