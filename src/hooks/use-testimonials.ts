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
        if (querySnapshot.empty) {
            setTestimonials(mockTestimonials.filter(t => !approvedOnly || t.status === 'approved'));
        } else {
            const testimonialsList: Testimonial[] = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
              } as Testimonial;
            });
            setTestimonials(testimonialsList);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching testimonials:', err);
        setError('Failed to fetch testimonials. Using mock data as a fallback.');
        setTestimonials(mockTestimonials.filter(t => !approvedOnly || t.status === 'approved'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [approvedOnly]);

  return { testimonials, isLoading, error };
}
