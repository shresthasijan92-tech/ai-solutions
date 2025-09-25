'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Testimonial } from '@/lib/definitions';

export function useTestimonials(approvedOnly = false) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        const testimonialsList: Testimonial[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt, // Pass timestamp directly
          } as Testimonial;
        });
        setTestimonials(testimonialsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching testimonials from Firestore:', err);
        setError('Failed to fetch testimonials. Please try again later.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [approvedOnly]);

  return { testimonials, isLoading, error };
}
