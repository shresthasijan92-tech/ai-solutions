'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '../definitions';

// Base schema for service data, used for both create and update
const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
});


export type ServiceFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ServiceSchema>, string[]>>;
  success: boolean;
};

function revalidateServicePaths(id?: string) {
  revalidatePath('/admin/services');
  revalidatePath('/services');
  if (id) revalidatePath(`/services/${id}`);
  revalidatePath('/');
}

export async function createService(data: unknown): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service. Invalid fields.',
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

export async function updateService(id: string, data: unknown): Promise<ServiceFormState> {
  if (!id) return { message: 'Failed to update service: Missing ID.', success: false };

  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service. Invalid fields.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const serviceDocRef = doc(firestore, 'services', id);

  try {
    const payload = {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(serviceDocRef, payload);

    revalidateServicePaths(id);
    return { message: 'Successfully updated service.', success: true };
  } catch (error) {
    console.error('Update Service Error:', error);
    return { message: 'Failed to update service on server.', success: false };
  }
}

export async function deleteService(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete service: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'services', id));
    revalidateServicePaths(id);
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    console.error('Delete Service Error:', error);
    return { message: 'Failed to delete service.', success: false };
  }
}
