
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import type { Project } from '../definitions';
import { getAuthenticatedAdmin } from '../auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const BaseProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z
    .array(z.string().trim())
    .min(1, 'At least one technology is required'),
  featured: z.boolean(),
  caseStudy: z.string().optional(),
  imageFile: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (file) =>
        !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

const CreateProjectSchema = BaseProjectSchema.extend({
    imageFile: BaseProjectSchema.shape.imageFile.refine((file) => file && file.size > 0, "An image is required for new projects."),
});

export type ProjectFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof BaseProjectSchema>, string[]>>;
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `projects/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string | undefined) {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    return;
  }
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete was not found in storage:', imageUrl);
    } else {
      throw error;
    }
  }
}

function parseFormData(formData: FormData) {
  const imageFile = formData.get('image');
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    technologies: (formData.get('technologies') as string)
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) ?? [],
    featured: formData.get('featured') === 'on',
    caseStudy: (formData.get('caseStudy') as string) || undefined,
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to create a project.', success: false };
  }

  const rawData = parseFormData(formData);
  const validatedFields = CreateProjectSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project. Please check the form for errors.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  
  try {
    const imageUrl = await uploadImage(imageFile!);
    const projectsCollection = collection(firestore, 'projects');
    await addDoc(projectsCollection, {
      ...rest,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath('/');
    return { message: 'Successfully created project.', success: true, errors: {} };
  } catch (error) {
    console.error('Create Project Error:', error);
    return {
      message: 'An unexpected error occurred. Failed to create project.',
      success: false,
    };
  }
}

export async function updateProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to update a project.', success: false };
  }

  const id = formData.get('id') as string;
  if (!id) {
    return { message: 'Failed to update project: Missing ID.', success: false };
  }

  const rawData = parseFormData(formData);
  const validatedFields = BaseProjectSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update project. Please check the form for errors.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  const projectDocRef = doc(firestore, 'projects', id);

  try {
    const docSnap = await getDoc(projectDocRef);
    if (!docSnap.exists()) {
      return { message: 'Project not found.', success: false };
    }
    const existingData = docSnap.data();

    const payload: Partial<Project> & { updatedAt: any } = { ...rest, updatedAt: serverTimestamp() };

    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
      await deleteImageFromStorage(existingData.imageUrl);
    } else {
        payload.imageUrl = existingData.imageUrl;
    }

    await updateDoc(projectDocRef, payload);

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated project.', success: true, errors: {} };
  } catch (error) {
    console.error('Update Project Error:', error);
    return {
      message: 'An unexpected error occurred. Failed to update project.',
      success: false,
    };
  }
}

export async function deleteProject(id: string): Promise<{ message: string; success: boolean }> {
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to delete a project.', success: false };
  }

  if (!id) {
    return { message: 'Failed to delete project: Missing ID.', success: false };
  }
  try {
    const projectDocRef = doc(firestore, 'projects', id);
    const docSnap = await getDoc(projectDocRef);

    if (docSnap.exists()) {
      const { imageUrl } = docSnap.data();
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
    }

    await deleteDoc(projectDocRef);

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/');
    return { message: 'Successfully deleted project.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete project.', success: false };
  }
}
