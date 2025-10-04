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

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  caseStudy: z.string().optional(),
  imageUrl: z.string().url('A valid image URL is required.'),
  technologies: z.preprocess(
    (val) => (typeof val === 'string' && val ? val.split(',').map((s) => s.trim()).filter(Boolean) : val),
    z.array(z.string()).min(1, 'At least one technology is required.')
  ),
  featured: z.boolean().default(false),
});

export type ProjectFormState = {
  message: string;
  success: boolean;
  errors?: z.ZodError<z.infer<typeof ProjectSchema>>['formErrors']['fieldErrors'];
};

type ProjectData = Omit<z.infer<typeof ProjectSchema>, 'technologies'> & { technologies: string | string[] };


function revalidateProjectPaths(id?: string) {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  if (id) revalidatePath(`/projects/${id}`);
  revalidatePath('/');
}

export async function createProject(
  data: ProjectData
): Promise<ProjectFormState> {
   const validatedFields = ProjectSchema.safeParse(data);

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

    await addDoc(collection(firestore, 'projects'), payload);

    revalidateProjectPaths();
    return { message: 'Successfully created project.', success: true };
  } catch (error) {
    console.error('Create Project Error:', error);
    return { message: 'Failed to create project.', success: false };
  }
}

export async function updateProject(
  id: string,
  data: ProjectData
): Promise<ProjectFormState> {
  if (!id) {
    return { message: 'Failed to update project: Missing ID.', success: false };
  }

  const validatedFields = ProjectSchema.safeParse(data);

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

    const projectDocRef = doc(firestore, 'projects', id);
    await updateDoc(projectDocRef, payload);

    revalidateProjectPaths(id);
    return { message: 'Successfully updated project.', success: true };
  } catch (error) {
    console.error('Update Project Error:', error);
    return { message: 'Failed to update project.', success: false };
  }
}

export async function deleteProject(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete project: Missing ID.', success: false };
  }
  try {
    await deleteDoc(doc(firestore, 'projects', id));
    revalidateProjectPaths(id);
    return { message: 'Successfully deleted project.', success: true };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { message: 'Failed to delete project.', success: false };
  }
}
