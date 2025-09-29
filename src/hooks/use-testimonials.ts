
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Testimonial } from '@/lib/definitions';

export function useTestimonials(enabled = true) {
  const firestore = useFirestore();
  const testimonialsCol = useMemoFirebase(
    () => (firestore ? collection(firestore, 'testimonials') : null),
    [firestore]
  );

  const testimonialsQuery = useMemoFirebase(() => {
    if (!testimonialsCol || !enabled) return null;
    return query(testimonialsCol, orderBy('createdAt', 'desc'));
  }, [testimonialsCol, enabled]);

  const {
    data: testimonials,
    isLoading,
    error,
  } = useCollection<Testimonial>(testimonialsQuery);

  return { testimonials, isLoading, error };
}
