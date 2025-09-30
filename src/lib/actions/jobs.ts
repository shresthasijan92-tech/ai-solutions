'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Job } from '../definitions';

export type JobFormState = {
  message: string;
  success: boolean;
};

type JobData = Omit<Job, 'id'>;

function revalidateJobPaths() {
  revalidatePath('/admin/careers');
  revalidatePath('/careers');
}

export async function createJob(data: JobData): Promise<JobFormState> {
  try {
    await addDoc(collection(firestore, 'jobs'), data);
    revalidateJobPaths();
    return { message: 'Successfully created job.', success: true };
  } catch (error) {
    console.error("Create Job Error: ", error);
    return { message: 'Failed to create job on the server.', success: false };
  }
}

export async function updateJob(id: string, data: JobData): Promise<JobFormState> {
  if (!id) return { message: 'Failed to update job: Missing ID.', success: false };

  try {
    await updateDoc(doc(firestore, 'jobs', id), data);
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
