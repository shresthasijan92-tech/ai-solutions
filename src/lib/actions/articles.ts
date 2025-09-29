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
  Timestamp,
} from 'firebase/firestore';
import type { Article } from '../definitions';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Base schema for validation, used for both create and update.
// Image is optional for updates, required for creates.
const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.date({ coerce: true }),
  featured: z.boolean(),
  imageUrl: z.string().url('A valid image URL is required.'),
});

const FileSchema = z
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
  );

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleSchema> | 'imageFile', string[]>>;
  success: boolean;
};

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `articles/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string) {
  if (imageUrl && imageUrl.includes('firebasestorage')) {
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
}

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const imageFile = formData.get('imageFile') as File | null;

  const validatedFile = FileSchema.safeParse(imageFile);
  if (!validatedFile.success) {
      return {
          message: 'Invalid image file.',
          errors: validatedFile.error.flatten().fieldErrors,
          success: false,
      };
  }

  if (!imageFile || imageFile.size === 0) {
      return {
          message: 'Image is required.',
          errors: { imageFile: ['An image file is required.'] },
          success: false,
      };
  }

  let imageUrl = '';
  try {
      imageUrl = await uploadImage(imageFile);
  } catch (error) {
      console.error('Image Upload Error:', error);
      return { message: 'Failed to upload image.', success: false };
  }

  const validatedFields = ArticleSchema.safeParse({
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
    imageUrl: imageUrl,
  });

  if (!validatedFields.success) {
    // If validation fails after upload, delete the orphaned image
    await deleteImageFromStorage(imageUrl);
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const { ...rest } = validatedFields.data;
    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, {
        ...rest,
        publishedAt: Timestamp.fromDate(rest.publishedAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully created article.', success: true };
  } catch (error) {
    console.error('Create Article Error:', error);
    // Attempt to delete the uploaded image on DB error
    await deleteImageFromStorage(imageUrl);
    return { message: 'Failed to create article.', success: false };
  }
}

export async function updateArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const id = formData.get('id') as string;
  if (!id) {
    return { message: 'Failed to update article: Missing ID.', success: false };
  }

  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const existingDocSnap = await getDoc(articleDocRef);
    if (!existingDocSnap.exists()) {
      return { message: 'Article not found.', success: false };
    }
    const existingData = existingDocSnap.data();

    const imageFile = formData.get('imageFile') as File | null;
    const validatedFile = FileSchema.safeParse(imageFile);

    if (!validatedFile.success) {
        return {
            message: 'Invalid image file.',
            errors: validatedFile.error.flatten().fieldErrors,
            success: false,
        };
    }

    let newImageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      newImageUrl = await uploadImage(imageFile);
    }

    const dataToValidate = {
      title: formData.get('title'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      publishedAt: formData.get('publishedAt'),
      featured: formData.get('featured') === 'on',
      imageUrl: newImageUrl ?? existingData.imageUrl, // Use new URL or fallback to existing
    };

    const validatedFields = ArticleSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
      // If validation fails but a new image was uploaded, delete it.
      if (newImageUrl) {
        await deleteImageFromStorage(newImageUrl);
      }
      return {
        message: 'Failed to update article. Please check the form.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { ...dataToUpdate } = validatedFields.data;

    await updateDoc(articleDocRef, {
        ...dataToUpdate,
        publishedAt: Timestamp.fromDate(dataToUpdate.publishedAt),
        updatedAt: serverTimestamp(),
    });

    // If a new image was uploaded and the update was successful, delete the old one.
    if (newImageUrl && existingData.imageUrl) {
      await deleteImageFromStorage(existingData.imageUrl);
    }

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated article.', success: true };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(
  id: string
): Promise<{ message: string; success: boolean }> {
  if (!id) {
    return { message: 'Failed to delete article: Missing ID.', success: false };
  }
  try {
    const articleDocRef = doc(firestore, 'articles', id);
    const docSnap = await getDoc(articleDocRef);

    if (docSnap.exists()) {
      const { imageUrl } = docSnap.data();
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
    }

    await deleteDoc(articleDocRef);
    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
