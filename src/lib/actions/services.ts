'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '../definitions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FileSchema = z.instanceof(File)
  .optional()
  .refine(file => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
  .refine(file => !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Only .jpg, .jpeg, .png and .webp formats are supported.');

const ServiceBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  featured: z.boolean(),
});

const CreateServiceSchema = ServiceBaseSchema.extend({ imageFile: FileSchema });
const UpdateServiceSchema = ServiceBaseSchema.extend({ imageFile: FileSchema });

export type ServiceFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ServiceBaseSchema> | 'imageFile', string[]>>;
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `services/${Date.now()}-${file.name}`;
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
  const benefits = formData.get('benefits') as string;
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    details: (formData.get('details') as string) || undefined,
    price: (formData.get('price') as string) || undefined,
    benefits: benefits ? benefits.split(',').map(b => b.trim()).filter(Boolean) : [],
    featured: formData.get('featured') === 'on',
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

function revalidateServicePaths(id?: string) {
  revalidatePath('/admin/services');
  revalidatePath('/services');
  if (id) revalidatePath(`/services/${id}`);
  revalidatePath('/');
}

export async function createService(prevState: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = CreateServiceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...data } = validatedFields.data;

  try {
    let imageUrl: string | undefined = undefined;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = {
      ...data,
      imageUrl,
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

export async function updateService(prevState: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update service: Missing ID.', success: false };

  const rawData = parseFormData(formData);
  const validatedFields = UpdateServiceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageFile, ...data } = validatedFields.data;
  const serviceDocRef = doc(firestore, 'services', id);

  try {
    const docSnap = await getDoc(serviceDocRef);
    if (!docSnap.exists()) {
      return { message: 'Service not found.', success: false };
    }
    const existingData = docSnap.data() as Service;

    const payload: Partial<Omit<Service, 'id'>> & { updatedAt: any } = {
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
