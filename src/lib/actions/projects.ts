'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore, storage } from '@/firebase/server';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { Project } from '../definitions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const FileSchema = z.instanceof(File)
  .refine(file => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
  .refine(
    file => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .jpg, .jpeg, .png and .webp formats are supported.'
  );

const ProjectBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  caseStudy: z.string().optional(),
  featured: z.boolean(),
});

const CreateProjectSchema = ProjectBaseSchema.extend({
  imageFile: FileSchema,
});

const UpdateProjectSchema = ProjectBaseSchema.extend({
  imageFile: FileSchema.optional(),
});


export type ProjectFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ProjectBaseSchema> | 'imageFile', string[]>>;
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
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete was not found in storage:', imageUrl);
    } else {
      console.error("Failed to delete image from storage:", error);
    }
  }
}

function parseFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  const technologies = formData.get('technologies') as string;
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    technologies: technologies ? technologies.split(',').map(t => t.trim()).filter(Boolean) : [],
    caseStudy: (formData.get('caseStudy') as string) || undefined,
    featured: formData.get('featured') === 'on',
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

function revalidateProjectPaths(id?: string) {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  if (id) revalidatePath(`/projects/${id}`);
  revalidatePath('/');
}

export async function createProject(prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const rawData = parseFormData(formData);
  
  if (!rawData.imageFile) {
    return {
      message: 'Failed to create project. Image is required.',
      errors: { imageFile: ['An image file is required.'] },
      success: false,
    };
  }

  const validatedFields = CreateProjectSchema.safeParse({ ...rawData, imageFile: rawData.imageFile });

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...data } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile);
    const payload = {
      ...data,
      imageUrl,
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

  const rawData = parseFormData(formData);
  const validatedFields = UpdateProjectSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update project. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageFile, ...data } = validatedFields.data;
  const projectDocRef = doc(firestore, 'projects', id);

  try {
    const docSnap = await getDoc(projectDocRef);
    if (!docSnap.exists()) {
      return { message: 'Project not found.', success: false };
    }
    const existingData = docSnap.data() as Project;

    const payload: Partial<Omit<Project, 'id'>> & { updatedAt: any } = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      payload.imageUrl = await uploadImage(imageFile);
      if (existingData.imageUrl) {
        await deleteImageFromStorage(existingData.imageUrl);
      }
    } else {
      payload.imageUrl = existingData.imageUrl;
    }

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
    const projectDocRef = doc(firestore, 'projects', id);
    const docSnap = await getDoc(projectDocRef);
    if (docSnap.exists()) {
      await deleteImageFromStorage(docSnap.data().imageUrl);
    }
    await deleteDoc(projectDocRef);
    revalidateProjectPaths(id);
    return { message: 'Successfully deleted project.', success: true };
  } catch (error) {
    console.error('Delete Project Error:', error);
    return { message: 'Failed to delete project.', success: false };
  }
}
