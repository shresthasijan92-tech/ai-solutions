'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  featured: z.preprocess((val) => val === 'true', z.boolean()),
});

export type ServiceFormState = {
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
    icon?: string[];
    featured?: string[];
  };
};

export async function createService(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    featured: formData.get('featured'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const servicesCollection = collection(db, 'services');
    await addDoc(servicesCollection, validatedFields.data);
  } catch (error) {
    return { message: 'Database Error: Failed to Create Service.' };
  }

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
  return { message: 'Successfully created service.' };
}

export async function updateService(
  id: string,
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    featured: formData.get('featured'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const serviceDoc = doc(db, 'services', id);
    await updateDoc(serviceDoc, validatedFields.data);
  } catch (error) {
    return { message: 'Database Error: Failed to Update Service.' };
  }

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
  return { message: 'Successfully updated service.' };
}

export async function deleteService(id: string) {
  try {
    const serviceDoc = doc(db, 'services', id);
    await deleteDoc(serviceDoc);
    revalidatePath('/admin/services');
    revalidatePath('/services');
    revalidatePath('/');
    return { message: 'Successfully deleted service.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Service.' };
  }
}
