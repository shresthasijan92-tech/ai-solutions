import { db } from './firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import type { Event } from './definitions';

export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const q = query(eventsCol);
  const eventsSnapshot = await getDocs(q);
  const eventsList = eventsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      featured: data.featured || false,
    } as Event;
  });
  return eventsList;
}
