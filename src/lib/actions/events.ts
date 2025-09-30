'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Event } from '../definitions';

export type EventFormState = {
  message: string;
  success: boolean;
};

type EventData = Omit<Event, 'id' | 'date'> & { date: string };


function revalidateEventPaths(id?: string) {
  revalidatePath('/admin/events');
  revalidatePath('/events');
  if (id) revalidatePath(`/events/${id}`);
  revalidatePath('/');
}

export async function createEvent(data: EventData): Promise<EventFormState> {
  try {
    const payload = {
      ...data,
      featured: data.featured || false,
      date: Timestamp.fromDate(new Date(data.date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'events'), payload);
    revalidateEventPaths();
    return { message: 'Successfully created event.', success: true };
  } catch (error) {
    console.error('Create Event Error:', error);
    return { message: 'Failed to create event.', success: false };
  }
}

export async function updateEvent(id: string, data: EventData): Promise<EventFormState> {
  if (!id) return { message: 'Failed to update event: Missing ID.', success: false };

  try {
    const payload = {
      ...data,
      featured: data.featured || false,
      date: Timestamp.fromDate(new Date(data.date)),
      updatedAt: serverTimestamp(),
    };
  
    const eventDocRef = doc(firestore, 'events', id);
    await updateDoc(eventDocRef, payload);
    
    revalidateEventPaths(id);
    return { message: 'Successfully updated event.', success: true };
  } catch (error) {
    console.error('Update Event Error:', error);
    return { message: 'Failed to update event.', success: false };
  }
}

export async function deleteEvent(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete event: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'events', id));
    revalidateEventPaths(id);
    return { message: 'Successfully deleted event.', success: true };
  } catch (error) {
    console.error('Delete Event Error:', error);
    return { message: 'Failed to delete event.', success: false };
  }
}
