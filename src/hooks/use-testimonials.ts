'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Testimonial } from '@/lib/definitions';
import { testimonials as mockTestimonials } from '@/lib/mock-data';

export function useTestimonials(approvedOnly = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start with mock data to ensure the UI is populated for the demo.
    const filteredMockData = mockTestimonials.filter(t => !approvedOnly || t.status === 'approved');
    setTestimonials(filteredMockData);
    setIsLoading(false);

    const testimonialsCol = collection(db, 'testimonials');
    
    let q;
    if (approvedOnly) {
        q = query(testimonialsCol, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    } else {
        q = query(testimonialsCol, orderBy('createdAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
            const testimonialsList: Testimonial[] = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
              } as Testimonial;
            });
            // If the database has data, use it.
            setTestimonials(testimonialsList);
        }
        // If query is empty, we just keep the mock data that's already set.
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching testimonials from Firestore:', err);
        // Silently fail and rely on the mock data already set.
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [approvedOnly]);

  return { testimonials, isLoading, error };
}
