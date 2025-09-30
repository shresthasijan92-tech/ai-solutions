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

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(firestore, 'events');
    const q = query(eventsCol, orderBy('date', 'desc'));
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const eventDate =
        data.date instanceof Timestamp
            ? data.date.toDate().toISOString()
            : data.date;
      return {
        id: doc.id,
        ...data,
        date: eventDate,
      } as Event;
    });
    return eventsList;
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const eventDocRef = doc(firestore, 'events', id);
    const docSnap = await getDoc(eventDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const eventDate =
      data.date instanceof Timestamp
        ? data.date.toDate().toISOString()
        : data.date;

    return {
      id: docSnap.id,
      ...data,
      date: eventDate,
    } as Event;
  } catch (error) {
    console.error(`Error fetching event ${id} from Firestore:`, error);
    return null;
  }
}
