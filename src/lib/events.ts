'use server';
import { db } from './firebase';
import { collection, getDocs, query, doc, getDoc, Timestamp } from 'firebase/firestore';
import type { Event } from './definitions';

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(db, 'events');
    const q = query(eventsCol);
    const eventsSnapshot = await getDocs(q);
    const eventsList = eventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date,
        location: data.location,
        description: data.description,
        featured: data.featured || false,
        imageUrl: data.imageUrl,
      } as Event;
    });
    return eventsList;
  } catch (error) {
    console.error("Error fetching events from Firestore:", error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const eventDocRef = doc(db, 'events', id);
    const docSnap = await getDoc(eventDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const eventDate = data.date instanceof Timestamp ? data.date.toDate().toISOString() : data.date;

    return {
      id: docSnap.id,
      title: data.title,
      date: eventDate,
      location: data.location,
      description: data.description,
      featured: data.featured || false,
      imageUrl: data.imageUrl,
    } as Event;
  } catch (error) {
    console.error(`Error fetching event ${id} from Firestore:`, error);
    return null;
  }
}
