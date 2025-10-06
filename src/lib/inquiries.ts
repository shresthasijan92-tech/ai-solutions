'use server';
import { firestore } from '@/firebase/server';
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Inquiry } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

// Helper function to safely convert Firestore Timestamps
const toISOStringIfTimestamp = (value: any): string | any => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
};

export async function getInquiries(): Promise<Inquiry[]> {
  if (!isFirebaseConfigured || !firestore) {
    return [];
  }
  try {
    const inquiriesCol = collection(firestore, 'inquiries');
    const q = query(inquiriesCol, orderBy('submittedAt', 'desc'));
    
    const inquiriesSnapshot = await getDocs(q);
    const inquiriesList = inquiriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      const inquiryData = {
        ...data,
        submittedAt: toISOStringIfTimestamp(data.submittedAt),
      };

      return {
        id: doc.id,
        ...inquiryData,
      } as Inquiry;
    });
    return inquiriesList;
  } catch (error) {
    console.error('Error fetching inquiries from Firestore:', error);
    return [];
  }
}
