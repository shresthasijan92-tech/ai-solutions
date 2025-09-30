'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { z } from 'zod';
import type { Service } from '../definitions';

const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  benefits: z.preprocess(
    (val) => (typeof val === 'string' && val ? val.split(',').map((s) => s.trim()) : []),
    z.array(z.string())
  ),
  featured: z.preprocess((val) => val === true, z.boolean()),
});

export type ServiceFormState = {
  message: string;
  success: boolean;
  errors?: z.ZodError<z.infer<typeof ServiceSchema>>['formErrors']['fieldErrors'];
};

type ServiceData = z.infer<typeof ServiceSchema>;

function revalidateServicePaths() {
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function createService(
  data: ServiceData
): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields and try again.',
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
    return { message: 'Failed to create service on server.', success: false };
  }
}

export async function updateService(
  id: string,
  data: ServiceData
): Promise<ServiceFormState> {
  if (!id) {
    return { message: 'Failed to update service: Missing ID.', success: false };
  }

  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check the fields and try again.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const payload = {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    };

    const serviceDocRef = doc(firestore, 'services', id);
    await updateDoc(serviceDocRef, payload);

    revalidateServicePaths();
    return { message: 'Successfully updated service.', success: true };
  } catch (error) {
    console.error('Update Service Error:', error);
    return { message: 'Failed to update service on server.', success: false };
  }
}

export async function deleteService(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete service: Missing ID.', success: false };
  }
  try {
    await deleteDoc(doc(firestore, 'services', id));
    revalidateServicePaths();
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    console.error('Delete Service Error:', error);
    return { message: 'Failed to delete service.', success: false };
  }
}