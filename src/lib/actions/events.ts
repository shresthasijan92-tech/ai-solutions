
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
  getDoc,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// --- Zod Schemas for Validation ---
const EventBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  date: z.coerce.date(),
  featured: z.boolean(),
});

const FileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE,
    `Max image size is 5MB.`
  )
  .refine(
    (file) =>
      !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported.'
  );

const CreateEventSchema = EventBaseSchema.extend({
  imageFile: FileSchema,
});
const UpdateEventSchema = EventBaseSchema.extend({
  imageFile: FileSchema,
});


export type EventFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof EventBaseSchema> | 'imageFile', string[]>>;
  success: boolean;
};

// --- Helper Functions ---
async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `events/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string | undefined) {
  if (!imageUrl || !imageUrl.includes('firebasestorage')) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete was not found in storage.');
    } else {
      console.error("Failed to delete image from storage:", error);
    }
  }
}

function parseFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    date: formData.get('date'),
    imageFile:
      imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
    featured: formData.get('featured') === 'on',
  };
}

// --- Server Actions ---
export async function createEvent(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = CreateEventSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create event. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, date, ...rest } = validatedFields.data;

  try {
    const payload: any = {
      ...rest,
      date: Timestamp.fromDate(date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
    }

    const eventsCollection = collection(firestore, 'events');
    await addDoc(eventsCollection, payload);

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');
    return { message: 'Successfully created event.', success: true };
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
  if (!id) {
    return { message: 'Failed to update event: Missing ID.', success: false };
  }

  const rawData = parseFormData(formData);
  const validatedFields = UpdateEventSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update event. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageFile, date, ...rest } = validatedFields.data;
  const eventDocRef = doc(firestore, 'events', id);

  try {
    const docSnap = await getDoc(eventDocRef);
    if (!docSnap.exists()) {
      return { message: 'Event not found.', success: false };
    }
    const existingData = docSnap.data();

    const payload: any = {
      ...rest,
      date: Timestamp.fromDate(date),
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
      await deleteImageFromStorage(existingData.imageUrl);
    }

    await updateDoc(eventDocRef, payload);

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated event.', success: true };
  } catch (error) {
    console.error('Update Event Error:', error);
    return { message: 'Failed to update event.', success: false };
  }
}

export async function deleteEvent(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete event: Missing ID.', success: false };
  }
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
