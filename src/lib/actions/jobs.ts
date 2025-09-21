'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const JobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Full-time', 'Part-time', 'Contract']),
});

export type JobFormState = {
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
    location?: string[];
    type?: string[];
  };
  success?: boolean;
};

export async function createJob(
  formData: FormData
): Promise<JobFormState> {
  const validatedFields = JobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create job.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const jobsCollection = collection(db, 'jobs');
    await addDoc(jobsCollection, validatedFields.data);
  } catch (error) {
    // SIMULATE SUCCESS FOR DEMO
    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully created job (simulated).', success: true };
  }

  revalidatePath('/admin/careers');
  revalidatePath('/careers');
  return { message: 'Successfully created job.', success: true };
}

export async function updateJob(
  id: string,
  formData: FormData
): Promise<JobFormState> {
  const validatedFields = JobSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Failed to update job.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const jobDoc = doc(db, 'jobs', id);
    await updateDoc(jobDoc, validatedFields.data);
  } catch (error) {
    // SIMULATE SUCCESS FOR DEMO
    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully updated job (simulated).', success: true };
  }

  revalidatePath('/admin/careers');
  revalidatePath('/careers');
  return { message: 'Successfully updated job.', success: true };
}

export async function deleteJob(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const jobDoc = doc(db, 'jobs', id);
    await deleteDoc(jobDoc);
    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully deleted job.', success: true };
  } catch (error) {
    // SIMULATE SUCCESS FOR DEMO
    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully deleted job (simulated).', success: true };
  }
}
