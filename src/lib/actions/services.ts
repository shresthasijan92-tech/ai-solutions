'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Service } from '../definitions';

// This is a simplified schema for the data object, NOT for FormData.
const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  details: z.string().optional(),
  price: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  featured: z.preprocess((val) => val === true, z.boolean()),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
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
    await deleteDoc(serviceDocRef);
    revalidateServicePaths(id);
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    console.error('Delete Service Error:', error);
    return { message: 'Failed to delete service.', success: false };
  }
}
