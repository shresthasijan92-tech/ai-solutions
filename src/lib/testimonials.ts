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

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonialsCol = collection(firestore, 'testimonials');
    const q = query(testimonialsCol, orderBy('createdAt', 'desc'));
    
    const testimonialsSnapshot = await getDocs(q);
    const testimonialsList = testimonialsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
      return {
        id: doc.id,
        ...data,
        createdAt
      } as Testimonial;
    });
    return testimonialsList;
  } catch (error) {
    console.error('Error fetching testimonials from Firestore:', error);
    return [];
  }
}
