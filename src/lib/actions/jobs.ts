'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const JobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Full-time', 'Part-time', 'Contract']),
});

export type JobFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof JobSchema>, string[]>>;
  success: boolean;
};

function parseFormData(formData: FormData) {
  return {
    title: formData.get('title'),
    description: formData.get('description'),
    location: formData.get('location'),
    type: formData.get('type'),
  };
}

function revalidateJobPaths() {
  revalidatePath('/admin/careers');
  revalidatePath('/careers');
}

export async function createJob(prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = JobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create job. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await addDoc(collection(firestore, 'jobs'), validatedFields.data);
    revalidateJobPaths();
    return { message: 'Successfully created job.', success: true };
  } catch (error) {
    console.error("Create Job Error: ", error);
    return { message: 'Failed to create job on the server.', success: false };
  }
}

export async function updateJob(prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update job: Missing ID.', success: false };

  const rawData = parseFormData(formData);
  const validatedFields = JobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update job. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await updateDoc(doc(firestore, 'jobs', id), validatedFields.data);
    revalidateJobPaths();
    return { message: 'Successfully updated job.', success: true };
  } catch (error) {
    console.error("Update Job Error: ", error);
    return { message: 'Failed to update job on the server.', success: false };
  }
}

export async function deleteJob(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete job: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'jobs', id));
    revalidateJobPaths();
    return { message: 'Successfully deleted job.', success: true };
  } catch (error) {
    console.error("Delete Job Error: ", error);
    return { message: 'Failed to delete job.', success: false };
  }
}
