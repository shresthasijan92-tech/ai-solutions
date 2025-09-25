'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, app } from '@/lib/firebase';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

const storage = getStorage(app);

const EventActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.date(),
  imageUrl: z.string().optional(),
  featured: z.boolean(),
});

export type EventFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof EventActionSchema>>['formErrors']['fieldErrors'];
  success?: boolean;
};

async function handleImageUpload(
  dataUri: string,
  folder: string
): Promise<string> {
  const fileName = `${folder}/${Date.now()}`;
  const storageRef = ref(storage, fileName);
  const uploadResult = await uploadString(storageRef, dataUri, 'data_url');
  return getDownloadURL(uploadResult.ref);
}

export async function createEvent(
  data: z.infer<typeof EventActionSchema>
): Promise<EventFormState> {
  const validatedFields = EventActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'events');
    }
    
    const eventsCollection = collection(db, 'events');
    await addDoc(eventsCollection, { 
        ...rest, 
        imageUrl: finalImageUrl,
        date: Timestamp.fromDate(rest.date),
    });

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');
    return { message: 'Successfully created event.', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Failed to create event.', success: false };
  }
}

export async function updateEvent(
  id: string,
  data: z.infer<typeof EventActionSchema>
): Promise<EventFormState> {
    const validatedFields = EventActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    const eventDocRef = doc(db, 'events', id);
    const existingDoc = await getDoc(eventDocRef);

    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'events');
      
      if (existingDoc.exists()) {
        const existingData = existingDoc.data();
        if (existingData?.imageUrl && existingData.imageUrl.includes('firebasestorage')) {
          try {
              const oldImageRef = ref(storage, existingData.imageUrl);
              await deleteObject(oldImageRef);
          } catch (storageError: any) {
              if (storageError.code !== 'storage/object-not-found') {
                  console.warn('Could not delete old image, may not exist:', storageError);
              }
          }
        }
      }
    }
    
    const eventData = { 
      ...rest,
      imageUrl: finalImageUrl,
      date: Timestamp.fromDate(rest.date),
    };
    
    if (existingDoc.exists()) {
        await updateDoc(eventDocRef, eventData);
    } else {
        await setDoc(eventDocRef, eventData);
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');
    revalidatePath(`/events/${id}`);
    return { message: 'Successfully updated event.', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Failed to update event.', success: false };
  }
}

async function deleteImageFromStorage(imageUrl: string) {
    if (imageUrl && imageUrl.includes('firebasestorage')) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.warn("Image to delete was not found in storage.");
            } else {
                throw error;
            }
        }
    }
}

export async function deleteEvent(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const eventDocRef = doc(db, 'events', id);
    const docSnap = await getDoc(eventDocRef);

    if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        if (imageUrl) {
            await deleteImageFromStorage(imageUrl);
        }
    }

    await deleteDoc(eventDocRef);
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${id}`);
    revalidatePath('/');
    return { message: 'Successfully deleted event.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete event.', success: false };
  }
}
