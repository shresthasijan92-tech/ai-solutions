'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { GalleryImage } from '../definitions';

export type GalleryImageFormState = {
  message: string;
  success: boolean;
};

type GalleryImageData = Omit<GalleryImage, 'id'>;

function revalidateGalleryPaths() {
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
}

export async function createGalleryImage(data: GalleryImageData): Promise<GalleryImageFormState> {
  try {
    const payload = {
      ...data,
      featured: data.featured || false,
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

  try {
    const payload = {
       ...data,
      featured: data.featured || false,
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
