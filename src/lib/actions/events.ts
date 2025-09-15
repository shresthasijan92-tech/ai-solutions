'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const EventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().min(1, 'Date is required'),
  featured: z.preprocess((val) => val === 'true', z.boolean()),
});

export type EventFormState = {
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
    location?: string[];
    date?: string[];
    featured?: string[];
  };
  success?: boolean;
};

export async function createEvent(
  formData: FormData
): Promise<EventFormState> {
  const validatedFields = EventSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    date: formData.get('date'),
    featured: formData.get('featured'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const eventsCollection = collection(db, 'events');
    await addDoc(eventsCollection, validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Event.',
      success: false,
    };
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  return { message: 'Successfully created event.', success: true };
}

export async function updateEvent(
  id: string,
  formData: FormData
): Promise<EventFormState> {
    const validatedFields = EventSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        date: formData.get('date'),
        featured: formData.get('featured'),
    });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const eventDoc = doc(db, 'events', id);
    await updateDoc(eventDoc, validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Event.',
      success: false,
    };
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  return { message: 'Successfully updated event.', success: true };
}

export async function deleteEvent(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const eventDoc = doc(db, 'events', id);
    await deleteDoc(eventDoc);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');
    return { message: 'Successfully deleted event.', success: true };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Event.',
      success: false,
    };
  }
}
