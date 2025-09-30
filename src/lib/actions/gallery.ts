'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import type { GalleryImage, GalleryCategory } from '../definitions';

const GalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().url('A valid image URL is required'),
  category: z.enum(["Events", "Tech Solutions", "Team Collaboration"]),
  featured: z.boolean().default(false),
});


export type GalleryImageFormState = {
  message: string;
  success: boolean;
  errors?: z.ZodError<z.infer<typeof GalleryImageSchema>>['formErrors']['fieldErrors'];
};

type GalleryImageData = z.infer<typeof GalleryImageSchema>;

function revalidateGalleryPaths() {
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
}

export async function createGalleryImage(data: GalleryImageData): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse(data);

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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'gallery'), payload);

    revalidateGalleryPaths();
    return { message: 'Successfully created gallery image.', success: true };
  } catch (error) {
    console.error('Create Gallery Image Error:', error);
    return { message: 'Failed to create gallery image.', success: false };
  }
}

export async function updateGalleryImage(id: string, data: GalleryImageData): Promise<GalleryImageFormState> {
  if (!id) return { message: 'Failed to update image: Missing ID.', success: false };

  const validatedFields = GalleryImageSchema.safeParse(data);

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
      updatedAt: serverTimestamp(),
    };

    const galleryDocRef = doc(firestore, 'gallery', id);
    await updateDoc(galleryDocRef, payload);

    revalidateGalleryPaths();
    return { message: 'Successfully updated gallery image.', success: true };
  } catch (error) {
    console.error('Update Gallery Image Error:', error);
    return { message: 'Failed to update gallery image.', success: false };
  }
}

export async function deleteGalleryImage(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete gallery image: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'gallery', id));
    revalidateGalleryPaths();
    return { message: 'Successfully deleted gallery image.', success: true };
  } catch (error) {
    console.error('Delete Gallery Image Error:', error);
    return { message: 'Failed to delete gallery image.', success: false };
  }
}
