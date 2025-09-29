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
  deleteDoc,
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

const BaseGalleryImageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.enum(['Events', 'Tech Solutions', 'Team Collaboration']),
  featured: z.boolean(),
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

const CreateGalleryImageSchema = BaseGalleryImageSchema.extend({
    imageFile: BaseGalleryImageSchema.shape.imageFile.refine((file) => file && file.size > 0, "An image file is required."),
});

export type GalleryImageFormState = {
  message: string;
  errors?: z.ZodError<
    z.infer<typeof BaseGalleryImageSchema>
  >['formErrors']['fieldErrors'];
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `gallery/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        console.warn('Image to delete was not found in storage.');
      } else {
        throw error;
      }
    }
  }
}

function parseGalleryFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title'),
    category: formData.get('category'),
    featured: formData.get('featured') === 'on',
    imageFile:
      imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

export async function createGalleryImage(
  prevState: GalleryImageFormState,
  formData: FormData
): Promise<GalleryImageFormState> {
  const rawData = parseGalleryFormData(formData);
  const validatedFields = CreateGalleryImageSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile!);
    const galleryCollection = collection(firestore, 'gallery');
    await addDoc(galleryCollection, {
      ...rest,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return {
      message: 'Successfully created gallery image.',
      success: true,
      errors: {},
    };
  } catch (error) {
    console.error('Create Gallery Image Error:', error);
    return { message: 'Failed to create gallery image.', success: false };
  }
}

export async function updateGalleryImage(
  prevState: GalleryImageFormState,
  formData: FormData
): Promise<GalleryImageFormState> {
  const id = formData.get('id') as string;
  if (!id)
    return { message: 'Failed to update image: Missing ID', success: false };

  const rawData = parseGalleryFormData(formData);
  const validatedFields = BaseGalleryImageSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update gallery image.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  const galleryDocRef = doc(firestore, 'gallery', id);
  const payload: Record<string, any> = { ...rest, updatedAt: serverTimestamp() };

  try {
    if (imageFile) {
      const docSnap = await getDoc(galleryDocRef);
      if (docSnap.exists() && docSnap.data().imageUrl) {
          await deleteImageFromStorage(docSnap.data().imageUrl);
      }
      payload.imageUrl = await uploadImage(imageFile);
    }

    await updateDoc(galleryDocRef, payload);

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');
    revalidatePath('/');
    return {
      message: 'Successfully updated gallery image.',
      success: true,
      errors: {},
    };
  } catch (error) {
    console.error('Update Gallery Image Error:', error);
    return { message: 'Failed to update gallery image.', success: false };
  }
}

export async function deleteGalleryImage(
  id: string
): Promise<{ message: string; success: boolean }> {
  try {
    const galleryDocRef = doc(firestore, 'gallery', id);
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
