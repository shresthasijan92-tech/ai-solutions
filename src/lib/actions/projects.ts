'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db, app } from '@/lib/firebase';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

const storage = getStorage(app);

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  technologies: z
    .array(z.string())
    .min(1, 'At least one technology is required'),
  link: z.string().url('Must be a valid URL'),
  featured: z.boolean(),
  caseStudy: z.string().optional(),
});

export type ProjectFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof ProjectSchema>>['formErrors']['fieldErrors'];
  success?: boolean;
};

async function handleImageUpload(
  dataUri: string,
  folder: string
): Promise<string> {
  const fileName = `${folder}/${Date.now()}`;
  const storageRef = ref(storage, fileName);
  const uploadResult = await uploadString(storageRef, dataUri, 'data_url');
  return getDownloadURL(uploadResult.ref);
}

export async function createProject(
  data: z.infer<typeof ProjectSchema>
): Promise<ProjectFormState> {
  const validatedFields = ProjectSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create project.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'projects');
    }
    
    const projectsCollection = collection(db, 'projects');
    await addDoc(projectsCollection, { ...rest, imageUrl: finalImageUrl });

  } catch (error) {
    console.error(error);
    return { message: 'Failed to create project.', success: false };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
  return { message: 'Successfully created project.', success: true };
}

export async function updateProject(
  id: string,
  data: z.infer<typeof ProjectSchema>
): Promise<ProjectFormState> {
  const validatedFields = ProjectSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update project.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    const projectDocRef = doc(db, 'projects', id);
    const existingDoc = await getDoc(projectDocRef);
    
    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'projects');
      if (existingDoc.exists()) {
        const existingData = existingDoc.data();
        if (existingData?.imageUrl && existingData.imageUrl.includes('firebasestorage')) {
          try {
            const oldImageRef = ref(storage, existingData.imageUrl);
            await deleteObject(oldImageRef);
          } catch (storageError: any) {
            if (storageError.code !== 'storage/object-not-found') {
              console.warn('Could not delete old image, may not exist:', storageError);
            }
          }
        }
      }
    }
    
    const projectData = { ...rest, imageUrl: finalImageUrl };

    if (existingDoc.exists()) {
        await updateDoc(projectDocRef, projectData);
    } else {
        await setDoc(projectDocRef, projectData);
    }

  } catch (error) {
    console.error(error);
    return { message: 'Failed to update project.', success: false };
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
  revalidatePath(`/projects/${id}`);
  return { message: 'Successfully updated project.', success: true };
}

async function deleteImageFromStorage(imageUrl: string) {
    if (imageUrl.includes('firebasestorage')) {
        try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.warn("Image to delete was not found in storage.");
            } else {
                throw error;
            }
        }
    }
}

export async function deleteProject(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const projectDocRef = doc(db, 'projects', id);
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
