
'use server';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Testimonial } from './definitions';

export async function getTestimonials(approvedOnly = false): Promise<Testimonial[]> {
  try {
    const testimonialsCol = collection(db, 'testimonials');
    let q;

    if (approvedOnly) {
      q = query(testimonialsCol, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    } else {
      q = query(testimonialsCol, orderBy('createdAt', 'desc'));
    }
    
    const testimonialsSnapshot = await getDocs(q);
    const testimonialsList = testimonialsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        company: data.company,
        feedback: data.feedback,
        rating: data.rating,
        createdAt: data.createdAt.toDate().toISOString(),
        status: data.status,
      } as Testimonial;
    });
    return testimonialsList;
  } catch (error) {
    console.error("Error fetching testimonials from Firestore:", error);
    return [];
  }
}
