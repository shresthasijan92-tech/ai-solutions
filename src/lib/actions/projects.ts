'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.string().transform(val => val.split(',').map(t => t.trim()).filter(Boolean)),
  caseStudy: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').min(1, 'Image URL is required'),
  featured: z.preprocess((val) => val === 'on', z.boolean()),
});


export type ProjectFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ProjectSchema>, string[]>>;
  success: boolean;
};

function revalidateProjectPaths(id?: string) {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  if (id) revalidatePath(`/projects/${id}`);
  revalidatePath('/');
}

export async function createProject(prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const validatedFields = ProjectSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project. Please check the form.',
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

    await addDoc(collection(firestore, 'projects'), payload);

    revalidateProjectPaths();
    return { message: 'Successfully created project.', success: true };
  } catch (error) {
    console.error('Create Project Error:', error);
    return { message: 'Failed to create project.', success: false };
  }
}

export async function updateProject(prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update project: Missing ID.', success: false };

  const validatedFields = ProjectSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to update project. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const projectDocRef = doc(firestore, 'projects', id);

  try {
    const payload = {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(projectDocRef, payload);
    revalidateProjectPaths(id);
    return { message: 'Successfully updated project.', success: true };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { message: 'Failed to update project.', success: false };
  }
}

export async function deleteProject(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete project: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'projects', id));
    revalidateProjectPaths(id);
    return { message: 'Successfully deleted project.', success: true };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { message: 'Failed to delete project.', success: false };
  }
}
