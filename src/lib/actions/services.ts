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
} from 'firebase/firestore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageFile: z
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
    ),
  benefits: z.array(z.string().trim()).optional(),
  price: z.string().optional(),
  details: z.string().optional(),
  featured: z.boolean(),
});

export type ServiceFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof ServiceSchema>>['formErrors']['fieldErrors'];
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `services/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
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

function parseServiceFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    imageFile:
      imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
    benefits:
      (formData.get('benefits') as string)
        ?.split(',')
        .map((b) => b.trim())
        .filter(Boolean) ?? [],
    price: formData.get('price') as string,
    details: formData.get('details') as string,
    featured: formData.get('featured') === 'on',
  };
}

export async function createService(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const rawData = parseServiceFormData(formData);
  const validatedFields = ServiceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  const payload: Record<string, any> = { ...rest, updatedAt: serverTimestamp() };

  try {
    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
    }

    payload.createdAt = serverTimestamp();
    const servicesCollection = collection(firestore, 'services');
    await addDoc(servicesCollection, payload);

    revalidatePath('/admin/services');
    revalidatePath('/services');
    revalidatePath('/');
    return {
      message: 'Successfully created service.',
      success: true,
      errors: {},
    };
  } catch (error) {
    console.error('Create Service Error:', error);
    return { message: 'Failed to create service.', success: false };
  }
}

export async function updateService(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const id = formData.get('id') as string;
  if (!id)
    return { message: 'Failed to update service: Missing ID.', success: false };

  const rawData = parseServiceFormData(formData);
  const validatedFields = ServiceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  const serviceDocRef = doc(firestore, 'services', id);
  const payload: Record<string, any> = { ...rest, updatedAt: serverTimestamp() };

  try {
    if (imageFile) {
        const docSnap = await getDoc(serviceDocRef);
        if (docSnap.exists() && docSnap.data().imageUrl) {
            await deleteImageFromStorage(docSnap.data().imageUrl);
        }
        payload.imageUrl = await uploadImage(imageFile);
    }

    await updateDoc(serviceDocRef, payload);

    revalidatePath('/admin/services');
    revalidatePath('/services');
    revalidatePath('/');
    return {
      message: 'Successfully updated service.',
      success: true,
      errors: {},
    };
  } catch (error) {
    console.error('Update Service Error:', error);
    return { message: 'Failed to update service.', success: false };
  }
}

export async function deleteService(
  id: string
): Promise<{ message: string; success: boolean }> {
  try {
    const serviceDocRef = doc(firestore, 'services', id);
    const docSnap = await getDoc(serviceDocRef);

    if (docSnap.exists()) {
      const { imageUrl } = docSnap.data();
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
    }

    await deleteDoc(serviceDocRef);
    revalidatePath('/admin/services');
    revalidatePath('/services');
    revalidatePath('/');
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    return { message: 'Failed to delete service.', success: false };
  }
}
