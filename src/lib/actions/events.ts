'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const EventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.string().transform((str) => new Date(str)),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.preprocess((val) => val === 'on', z.boolean()),
});


export type EventFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof EventSchema>, string[]>>;
  success: boolean;
};

function revalidateEventPaths(id?: string) {
  revalidatePath('/admin/events');
  revalidatePath('/events');
  if (id) revalidatePath(`/events/${id}`);
  revalidatePath('/');
}

export async function createEvent(prevState: EventFormState, formData: FormData): Promise<EventFormState> {
  const validatedFields = EventSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to create event. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { date, ...data } = validatedFields.data;

  try {
    const payload = {
      ...data,
      date: Timestamp.fromDate(date),
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

export async function updateEvent(prevState: EventFormState, formData: FormData): Promise<EventFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update event: Missing ID.', success: false };

  const validatedFields = EventSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to update event. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { date, ...data } = validatedFields.data;
  const eventDocRef = doc(firestore, 'events', id);

  try {
    const payload = {
      ...data,
      date: Timestamp.fromDate(date),
      updatedAt: serverTimestamp(),
    };

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
