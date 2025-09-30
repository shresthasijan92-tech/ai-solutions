'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { z } from 'zod';

const EventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.date({ required_error: 'Event date is required.' }),
  imageUrl: z.string().url('A valid image URL is required').optional().or(z.literal('')),
  featured: z.boolean().default(false),
});


export type EventFormState = {
  message: string;
  success: boolean;
  errors?: z.ZodError<z.infer<typeof EventSchema>>['formErrors']['fieldErrors'];
};

type EventData = z.infer<typeof EventSchema>;

function revalidateEventPaths(id?: string) {
  revalidatePath('/admin/events');
  revalidatePath('/events');
  if (id) revalidatePath(`/events/${id}`);
  revalidatePath('/');
}

export async function createEvent(data: EventData): Promise<EventFormState> {
  const validatedFields = EventSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const payload = {
      ...validatedFields.data,
      date: Timestamp.fromDate(validatedFields.data.date),
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

  const validatedFields = EventSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const payload = {
      ...validatedFields.data,
      date: Timestamp.fromDate(validatedFields.data.date),
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
