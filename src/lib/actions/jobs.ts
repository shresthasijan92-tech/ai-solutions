
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const JobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['Full-time', 'Part-time', 'Contract']),
});

export type JobFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof JobSchema>>['formErrors']['fieldErrors'];
  success: boolean;
};

// This action is now designed to work with useActionState and react-hook-form
// It receives validated data directly, not a FormData object
export async function createJob(
  prevState: JobFormState,
  data: z.infer<typeof JobSchema>
): Promise<JobFormState> {
  const validatedFields = JobSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create job. Invalid data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const jobsCollection = collection(firestore, 'jobs');
    await addDoc(jobsCollection, {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully created job.', success: true };
  } catch (error) {
    console.error("Create Job Error: ", error);
    return { message: 'Failed to create job on the server.', success: false };
  }
}

// This action is now designed to work with useActionState and react-hook-form
export async function updateJob(
  id: string,
  prevState: JobFormState,
  data: z.infer<typeof JobSchema>
): Promise<JobFormState> {
  if (!id) {
    return { message: 'Failed to update job: Missing ID.', success: false };
  }
  const validatedFields = JobSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update job. Invalid data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const jobDoc = doc(firestore, 'jobs', id);
    await updateDoc(jobDoc, { ...validatedFields.data, updatedAt: serverTimestamp() });

    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully updated job.', success: true };
  } catch (error) {
    console.error("Update Job Error: ", error);
    return { message: 'Failed to update job on the server.', success: false };
  }
}

export async function deleteJob(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete job: Missing ID.', success: false };
  }
  try {
    const jobDoc = doc(firestore, 'jobs', id);
    await deleteDoc(jobDoc);
    revalidatePath('/admin/careers');
    revalidatePath('/careers');
    return { message: 'Successfully deleted job.', success: true };
  } catch (error) {
    console.error("Delete Job Error: ", error);
    return { message: 'Failed to delete job.', success: false };
  }
}
