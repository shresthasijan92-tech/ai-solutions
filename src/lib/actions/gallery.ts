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

const GalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  featured: z.preprocess((val) => val === 'true', z.boolean()),
});

export type GalleryImageFormState = {
  message: string;
  errors?: {
    title?: string[];
    imageUrl?: string[];
    featured?: string[];
  };
  success?: boolean;
};

export async function createGalleryImage(
  formData: FormData
): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse({
    title: formData.get('title'),
    imageUrl: formData.get('imageUrl'),
    featured: formData.get('featured'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const galleryCollection = collection(db, 'gallery');
    await addDoc(galleryCollection, validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Gallery Image.',
      success: false,
    };
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { message: 'Successfully created gallery image.', success: true };
}

export async function updateGalleryImage(
  id: string,
  formData: FormData
): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse({
    title: formData.get('title'),
    imageUrl: formData.get('imageUrl'),
    featured: formData.get('featured'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const galleryDoc = doc(db, 'gallery', id);
    await updateDoc(galleryDoc, validatedFields.data);
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Gallery Image.',
      success: false,
    };
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { message: 'Successfully updated gallery image.', success: true };
}

export async function deleteGalleryImage(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const galleryDoc = doc(db, 'gallery', id);
    await deleteDoc(galleryDoc);
    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { message: 'Successfully deleted gallery image.', success: true };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Gallery Image.',
      success: false,
    };
  }
}
