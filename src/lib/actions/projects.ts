'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import type { Project } from '../definitions';

export type ProjectFormState = {
  message: string;
  success: boolean;
};

type ProjectData = Omit<Project, 'id'>;

function revalidateProjectPaths(id?: string) {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  if (id) revalidatePath(`/projects/${id}`);
  revalidatePath('/');
}

export async function createProject(data: ProjectData): Promise<ProjectFormState> {
  try {
    const payload = {
      ...data,
      technologies: data.technologies || [],
      featured: data.featured || false,
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

export async function updateProject(id: string, data: ProjectData): Promise<ProjectFormState> {
  if (!id) return { message: 'Failed to update project: Missing ID.', success: false };

  try {
    const payload = {
      ...data,
      technologies: data.technologies || [],
      featured: data.featured || false,
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
