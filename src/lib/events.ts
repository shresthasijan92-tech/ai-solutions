'use server';
import { firestore } from '@/firebase/server';
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import type { Event } from './definitions';
import { isFirebaseConfigured } from '@/firebase/config';

// Helper function to safely convert Firestore Timestamps
const toISOStringIfTimestamp = (value: any): string | any => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return value;
};

export async function getEvents(): Promise<Event[]> {
  if (!isFirebaseConfigured) {
    return [];
  }
  try {
    const eventsCol = collection(firestore, 'events');
    const q = query(eventsCol, orderBy('date', 'desc'));
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const eventData = {
        ...data,
        date: toISOStringIfTimestamp(data.date),
        createdAt: toISOStringIfTimestamp(data.createdAt),
        updatedAt: toISOStringIfTimestamp(data.updatedAt),
      };
      return {
        id: doc.id,
        ...eventData,
      } as Event;
    });
    return eventsList;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  if (!isFirebaseConfigured) {
    return null;
  }
  try {
    const eventDocRef = doc(firestore, 'events', id);
    const docSnap = await getDoc(eventDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const eventData = {
        ...data,
        date: toISOStringIfTimestamp(data.date),
        createdAt: toISOStringIfTimestamp(data.createdAt),
        updatedAt: toISOStringIfTimestamp(data.updatedAt),
    };

    return {
      id: docSnap.id,
      ...eventData,
    } as Event;
  } catch (error) {
    console.error(`Error fetching event ${id} from Firestore:`, error);
    return null;
  }
}
