'use server';
import { firestore } from '@/firebase/server';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Testimonial } from './definitions';

// Helper function to safely convert Firestore Timestamps
const toISOStringIfTimestamp = (value: any): string | any => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonialsCol = collection(firestore, 'testimonials');
    const q = query(testimonialsCol, orderBy('createdAt', 'desc'));
    
    const testimonialsSnapshot = await getDocs(q);
    const testimonialsList = testimonialsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const testimonialData = {
        ...data,
        createdAt: toISOStringIfTimestamp(data.createdAt),
      };

      return {
        id: doc.id,
        ...testimonialData,
      } as Testimonial;
    });
    return testimonialsList;
  } catch (error) {
    console.error('Error fetching testimonials from Firestore:', error);
    return [];
  }
}
