'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { GalleryImage } from '../definitions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FileSchema = z.instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
  .refine(
    file => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported.'
  );

const GalleryImageBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['Events', 'Tech Solutions', 'Team Collaboration']),
  featured: z.boolean(),
});

const CreateGalleryImageSchema = GalleryImageBaseSchema.extend({
  imageFile: FileSchema,
});
const UpdateGalleryImageSchema = GalleryImageBaseSchema.extend({ imageFile: FileSchema.optional() });

export type GalleryImageFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof GalleryImageBaseSchema> | 'imageFile', string[]>>;
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `gallery/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string | undefined) {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete was not found in storage:', imageUrl);
    } else {
      console.error("Failed to delete image from storage:", error);
    }
  }
}

function parseFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title') as string,
    category: formData.get('category') as 'Events' | 'Tech Solutions' | 'Team Collaboration',
    featured: formData.get('featured') === 'on',
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

function revalidateGalleryPaths() {
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
}

export async function createGalleryImage(prevState: GalleryImageFormState, formData: FormData): Promise<GalleryImageFormState> {
  const rawData = parseFormData(formData);
  
  if (!rawData.imageFile) {
    return {
      message: 'Failed to create gallery image. Image is required.',
      errors: { imageFile: ['An image file is required.'] },
      success: false,
    };
  }

  const validatedFields = CreateGalleryImageSchema.safeParse({ ...rawData, imageFile: rawData.imageFile });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create gallery image. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...data } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile);
    await addDoc(collection(firestore, 'gallery'), {
      ...data,
      imageUrl,
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

  const rawData = parseFormData(formData);
  const validatedFields = UpdateGalleryImageSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update gallery image. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...data } = validatedFields.data;
  const galleryDocRef = doc(firestore, 'gallery', id);

  try {
    const docSnap = await getDoc(galleryDocRef);
    if (!docSnap.exists()) {
      return { message: 'Image not found.', success: false };
    }
    const existingData = docSnap.data() as GalleryImage;

    const payload: Partial<GalleryImage> & { updatedAt: any } = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
      if (existingData.imageUrl) {
        await deleteImageFromStorage(existingData.imageUrl);
      }
    } else {
      payload.imageUrl = existingData.imageUrl;
    }

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
    const galleryDocRef = doc(firestore, 'gallery', id);
    const docSnap = await getDoc(galleryDocRef);
    if (docSnap.exists()) {
      await deleteImageFromStorage(docSnap.data().imageUrl);
    }
    await deleteDoc(galleryDocRef);
    revalidateGalleryPaths();
    return { message: 'Successfully deleted gallery image.', success: true };
  } catch (error) {
    console.error('Delete Gallery Image Error:', error);
    return { message: 'Failed to delete gallery image.', success: false };
  }
}
