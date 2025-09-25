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

const ServiceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  imageUrl: z.string().optional(),
  benefits: z.string().optional(),
  price: z.string().optional(),
  details: z.string().optional(),
  featured: z.boolean(),
});

export type ServiceFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof ServiceSchema>>['formErrors']['fieldErrors'];
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

export async function createService(
  data: z.infer<typeof ServiceSchema>
): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create service.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, benefits, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'services');
    }
    
    const servicesCollection = collection(db, 'services');
    await addDoc(servicesCollection, { 
        ...rest, 
        imageUrl: finalImageUrl,
        benefits: benefits ? benefits.split(',').map(b => b.trim()) : [],
    });
  } catch (error) {
    console.error(error);
    return { message: 'Failed to create service.', success: false };
  }

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
  return { message: 'Successfully created service.', success: true };
}

export async function updateService(
  id: string,
  data: z.infer<typeof ServiceSchema>
): Promise<ServiceFormState> {
  const validatedFields = ServiceSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update service.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageUrl, benefits, ...rest } = validatedFields.data;
  let finalImageUrl = imageUrl;

  try {
    const serviceDocRef = doc(db, 'services', id);
    const existingDoc = await getDoc(serviceDocRef);

    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await handleImageUpload(imageUrl, 'services');
      
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
    
    const serviceData = { 
        ...rest, 
        imageUrl: finalImageUrl,
        benefits: benefits ? benefits.split(',').map(b => b.trim()) : [],
    };
    
    if (existingDoc.exists()) {
        await updateDoc(serviceDocRef, serviceData);
    } else {
        await setDoc(serviceDocRef, serviceData);
    }

  } catch (error) {
    console.error(error);
    return { message: 'Failed to update service.', success: false };
  }

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
  return { message: 'Successfully updated service.', success: true };
}

async function deleteImageFromStorage(imageUrl: string) {
    if (imageUrl && imageUrl.includes('firebasestorage')) {
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

export async function deleteService(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const serviceDocRef = doc(db, 'services', id);
    const docSnap = await getDoc(serviceDocRef);

    if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        if (imageUrl) {
            await deleteImageFromStorage(imageUrl);
        }
    }
    
    await deleteDoc(serviceDocRef);
    revalidatePath('/admin/services');
    revalidatePath('/services');
    revalidatePath('/');
    return { message: 'Successfully deleted service.', success: true };
  } catch (error) {
    return { message: 'Failed to delete service.', success: false };
  }
}
