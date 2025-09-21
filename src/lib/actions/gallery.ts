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

const GalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.string().min(1, 'An image is required'),
  featured: z.boolean(),
});

export type GalleryImageFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof GalleryImageSchema>>['formErrors']['fieldErrors'];
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

export async function createGalleryImage(
  data: z.infer<typeof GalleryImageSchema>
): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'gallery');
    }
    
    const galleryCollection = collection(db, 'gallery');
    await addDoc(galleryCollection, { ...rest, imageUrl: finalImageUrl });
  } catch (error) {
    console.error(error);
    return { message: 'Failed to create gallery image.', success: false };
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { message: 'Successfully created gallery image.', success: true };
}

export async function updateGalleryImage(
  id: string,
  data: z.infer<typeof GalleryImageSchema>
): Promise<GalleryImageFormState> {
  const validatedFields = GalleryImageSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    const galleryDocRef = doc(db, 'gallery', id);
    const existingDoc = await getDoc(galleryDocRef);
    

    if (imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'gallery');

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
    
    const galleryData = { ...rest, imageUrl: finalImageUrl };

    if (existingDoc.exists()) {
        await updateDoc(galleryDocRef, galleryData);
    } else {
        await setDoc(galleryDocRef, galleryData);
    }

  } catch (error) {
    console.error(error);
    return { message: 'Failed to update gallery image.', success: false };
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { message: 'Successfully updated gallery image.', success: true };
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

export async function deleteGalleryImage(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const galleryDocRef = doc(db, 'gallery', id);
    const docSnap = await getDoc(galleryDocRef);

    if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        if (imageUrl) {
            await deleteImageFromStorage(imageUrl);
        }
    }

    await deleteDoc(galleryDocRef);

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return { message: 'Successfully deleted gallery image.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete gallery image.', success: false };
  }
}
