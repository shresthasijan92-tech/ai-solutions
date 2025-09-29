'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import {
  ref,
  uploadBytes,
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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const EventActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.date({ coerce: true }),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (file) =>
        !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
  featured: z.boolean(),
  prevImageUrl: z.string().url().optional().or(z.literal('')),
});

export type EventFormState = {
  message: string;
  errors?: z.ZodError<
    z.infer<typeof EventActionSchema>
  >['formErrors']['fieldErrors'];
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `events/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage')) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn('Image to delete was not found in storage.');
      } else {
        throw error;
      }
    }
  }
}

function parseEventFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    date: formData.get('date'),
    imageUrl: formData.get('imageUrl'),
    imageFile:
      imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
    featured: formData.get('featured') === 'on',
    prevImageUrl: formData.get('prevImageUrl') as string,
  };
}

export async function createEvent(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const rawData = parseEventFormData(formData);
  const validatedFields = EventActionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, imageUrl, ...rest } = validatedFields.data;
  const payload: Record<string, any> = {
    ...rest,
    date: Timestamp.fromDate(rest.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
    } else if (imageUrl) {
      payload.imageUrl = imageUrl;
    }

    const eventsCollection = collection(firestore, 'events');
    await addDoc(eventsCollection, payload);

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');
    return { message: 'Successfully created event.', success: true, errors: {} };
  } catch (error) {
    console.error('Create Event Error:', error);
    return { message: 'Failed to create event.', success: false };
  }
}

export async function updateEvent(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const id = formData.get('id') as string;
  if (!id)
    return { message: 'Failed to update event: Missing ID.', success: false };

  const rawData = parseEventFormData(formData);
  const validatedFields = EventActionSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update event.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, imageUrl, prevImageUrl, ...rest } = validatedFields.data;
  const eventDocRef = doc(firestore, 'events', id);
  const payload: Record<string, any> = {
    ...rest,
    date: Timestamp.fromDate(rest.date),
    updatedAt: serverTimestamp(),
  };

  try {
    let finalImageUrl = prevImageUrl;

    if (imageFile) {
      if (prevImageUrl) {
        await deleteImageFromStorage(prevImageUrl);
      }
      finalImageUrl = await uploadImage(imageFile);
    } else if (imageUrl && imageUrl !== prevImageUrl) {
      if (prevImageUrl) {
        await deleteImageFromStorage(prevImageUrl);
      }
      finalImageUrl = imageUrl;
    } else if (!imageUrl && !imageFile && prevImageUrl) {
      await deleteImageFromStorage(prevImageUrl);
      finalImageUrl = '';
    }

    payload.imageUrl = finalImageUrl;

    await updateDoc(eventDocRef, payload);

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated event.', success: true, errors: {} };
  } catch (error) {
    console.error('Update Event Error:', error);
    return { message: 'Failed to update event.', success: false };
  }
}

export async function deleteEvent(
  id: string
): Promise<{ message: string; success: boolean }> {
  try {
    const eventDocRef = doc(firestore, 'events', id);
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
