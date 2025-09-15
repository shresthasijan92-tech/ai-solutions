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

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  technologies: z
    .array(z.string())
    .min(1, 'At least one technology is required'),
  link: z.string().url('Must be a valid URL'),
  featured: z.boolean(),
});

export type ProjectFormState = {
  message: string;
  errors?: {
    title?: string[];
    description?: string[];
    imageUrl?: string[];
    technologies?: string[];
    link?: string[];
    featured?: string[];
  };
  success?: boolean;
};

export async function createProject(
  data: unknown
): Promise<ProjectFormState> {
  const validatedFields = ProjectSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const projectsCollection = collection(db, 'projects');
    await addDoc(projectsCollection, validatedFields.data);
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Project.',
      success: false,
    };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
  return { message: 'Successfully created project.', success: true };
}

export async function updateProject(
  id: string,
  data: unknown
): Promise<ProjectFormState> {
  const validatedFields = ProjectSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update project.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const projectDoc = doc(db, 'projects', id);
    await updateDoc(projectDoc, validatedFields.data);
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Update Project.',
      success: false,
    };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
  return { message: 'Successfully updated project.', success: true };
}

export async function deleteProject(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const projectDoc = doc(db, 'projects', id);
    await deleteDoc(projectDoc);
    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    return { message: 'Successfully deleted project.', success: true };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Project.',
      success: false,
    };
  }
}
