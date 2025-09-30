'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '../definitions';

// This is a simplified schema for the data object, NOT for FormData.
const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  featured: z.boolean(),
  imageUrl: z.string().optional(), // imageUrl is now part of the data object
});

export type ServiceFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ServiceSchema>, string[]>>;
  success: boolean;
};

// This function is no longer used for form parsing but kept for reference if needed elsewhere.
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

function revalidateServicePaths(id?: string) {
  revalidatePath('/admin/services');
  revalidatePath('/services');
  if (id) revalidatePath(`/services/${id}`);
  revalidatePath('/');
}

// Simplified createService that accepts a plain object
export async function createService(data: z.infer<typeof ServiceSchema>): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service. Invalid data.',
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

    await addDoc(collection(firestore, 'services'), payload);

    revalidateServicePaths();
    return { message: 'Successfully created service.', success: true };
  } catch (error) {
    console.error('Create Service Error:', error);
    return { message: 'Failed to create service.', success: false };
  }
}

// Simplified updateService that accepts a plain object
export async function updateService(id: string, data: z.infer<typeof ServiceSchema>): Promise<ServiceFormState> {
  if (!id) return { message: 'Failed to update service: Missing ID.', success: false };

  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service. Invalid data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const serviceDocRef = doc(firestore, 'services', id);

  try {
    const payload: Partial<Omit<Service, 'id'>> & { updatedAt: any } = {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(serviceDocRef, payload);

    revalidateServicePaths(id);
    return { message: 'Successfully updated service.', success: true };
  } catch (error) {
    console.error('Update Service Error:', error);
    return { message: 'Failed to update service.', success: false };
  }
}


export async function deleteService(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete service: Missing ID.', success: false };
  try {
    const serviceDocRef = doc(firestore, 'services', id);
    const docSnap = await getDoc(serviceDocRef);
    if (docSnap.exists()) {
      await deleteImageFromStorage(docSnap.data().imageUrl);
    }
    await deleteDoc(serviceDocRef);
    revalidateServicePaths(id);
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    console.error('Delete Service Error:', error);
    return { message: 'Failed to delete service.', success: false };
  }
}

// New separate function to handle image uploads
export async function uploadServiceImage(formData: FormData): Promise<{ success: boolean, imageUrl?: string, message: string }> {
    const imageFile = formData.get('imageFile') as File | null;
    
    if (!imageFile || imageFile.size === 0) {
        return { success: false, message: 'No image file provided.' };
    }

    // Basic validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (imageFile.size > MAX_FILE_SIZE) {
        return { success: false, message: 'Max image size is 5MB.' };
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
        return { success: false, message: 'Only .jpg, .jpeg, .png and .webp formats are supported.' };
    }

    try {
        const fileBuffer = await imageFile.arrayBuffer();
        const fileName = `services/${Date.now()}-${imageFile.name}`;
        const storageRef = ref(storage, fileName);
        await uploadBytes(storageRef, fileBuffer, { contentType: imageFile.type });
        const downloadUrl = await getDownloadURL(storageRef);
        return { success: true, imageUrl: downloadUrl, message: 'Image uploaded successfully.' };
    } catch (error) {
        console.error('Image Upload Error:', error);
        return { success: false, message: 'Failed to upload image.' };
    }
}
