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
} from 'firebase/firestore';

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
  image: z
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
    image: BaseProjectSchema.shape.image.refine((file) => file && file.size > 0, "An image is required for new projects."),
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

async function deleteImageFromStorage(imageUrl: string) {
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
    image: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = CreateProjectSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project. Please check the form for errors.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { image, ...rest } = validatedFields.data;
  
  try {
    const imageUrl = await uploadImage(image!);
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

  const { image, ...rest } = validatedFields.data;
  const projectDocRef = doc(firestore, 'projects', id);

  try {
    const payload: Record<string, any> = { ...rest, updatedAt: serverTimestamp() };

    if (image) {
      const docSnap = await getDoc(projectDocRef);
      if (docSnap.exists() && docSnap.data().imageUrl) {
        await deleteImageFromStorage(docSnap.data().imageUrl);
      }
      payload.imageUrl = await uploadImage(image);
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
