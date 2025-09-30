
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

// --- Zod Schemas for Validation ---

// Base schema for common fields
const ArticleBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.coerce.date(),
  featured: z.boolean(),
});

// Schema for creating: image is required
const ArticleCreateSchema = ArticleBaseSchema.extend({
  imageFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'An image file is required.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

// Schema for updating: image is optional
const ArticleUpdateSchema = ArticleBaseSchema.extend({
  imageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || file.size === 0 || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleBaseSchema>, string[]>>;
  success: boolean;
};

// --- Helper Functions ---

async function uploadImage(file: File): Promise<string> {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `articles/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, fileBuffer, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function deleteImageFromStorage(imageUrl: string | undefined) {
  if (!imageUrl || !imageUrl.includes('firebasestorage')) return;
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.warn('Image to delete was not found in storage:', imageUrl);
    } else {
      console.error('Failed to delete image from storage:', error);
    }
  }
}

// --- Server Actions ---

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
    imageFile: formData.get('imageFile'),
  };

  const validatedFields = ArticleCreateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, publishedAt, ...rest } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile);
    
    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, {
        ...rest,
        imageUrl,
        publishedAt: Timestamp.fromDate(publishedAt),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully created article.', success: true };
  } catch (error) {
    console.error('Create Article Error:', error);
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

  const rawData = {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
    imageFile: formData.get('imageFile'),
  };
  
  const validatedFields = ArticleUpdateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const docSnap = await getDoc(articleDocRef);
    if (!docSnap.exists()) {
      return { message: 'Article not found.', success: false };
    }
    const existingData = docSnap.data() as Article;

    const { imageFile, publishedAt, ...rest } = validatedFields.data;
    
    const payload: Omit<Partial<Article>, 'id'> & { updatedAt: any, publishedAt: Timestamp } = {
        ...rest,
        publishedAt: Timestamp.fromDate(publishedAt),
        updatedAt: serverTimestamp(),
        // Preserve existing image by default
        imageUrl: existingData.imageUrl,
    };
    
    if (imageFile && imageFile.size > 0) {
      payload.imageUrl = await uploadImage(imageFile);
      await deleteImageFromStorage(existingData.imageUrl);
    }

    await updateDoc(articleDocRef, payload);

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
      await deleteImageFromStorage(docSnap.data().imageUrl);
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
