'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const GalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['Events', 'Tech Solutions', 'Team Collaboration']),
  imageUrl: z.string().url('Invalid URL').min(1, 'Image URL is required'),
  featured: z.preprocess((val) => val === 'on', z.boolean()),
});

export type GalleryImageFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof GalleryImageSchema>, string[]>>;
  success: boolean;
};


function revalidateGalleryPaths() {
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
}

export async function createGalleryImage(prevState: GalleryImageFormState, formData: FormData): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to create gallery image. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await addDoc(collection(firestore, 'gallery'), {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidateGalleryPaths();
    return { message: 'Successfully created gallery image.', success: true };
  } catch (error) {
    console.error('Create Gallery Image Error:', error);
    return { message: 'Failed to create gallery image.', success: false };
  }
}

export async function updateGalleryImage(prevState: GalleryImageFormState, formData: FormData): Promise<GalleryImageFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update image: Missing ID.', success: false };

  const validatedFields = GalleryImageSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to update gallery image. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const galleryDocRef = doc(firestore, 'gallery', id);

  try {
    await updateDoc(galleryDocRef, {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    });
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
