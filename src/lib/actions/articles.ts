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

const BaseArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.date({ coerce: true }),
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

const CreateArticleSchema = BaseArticleSchema.extend({
  imageFile: BaseArticleSchema.shape.imageFile.refine(
    (file) => file && file.size > 0,
    'An image file is required.'
  ),
});

export type ArticleFormState = {
  message: string;
  errors?: z.ZodError<z.infer<typeof BaseArticleSchema>>['formErrors']['fieldErrors'];
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

function parseFormData(formData: FormData) {
  const imageFile = formData.get('imageFile');
  return {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    content: formData.get('content') as string,
    publishedAt: formData.get('publishedAt') as string,
    featured: formData.get('featured') === 'on',
    imageFile: imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
  };
}

export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = CreateArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;

  try {
    const imageUrl = await uploadImage(imageFile!);
    
    const payload: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
      ...rest,
      imageUrl,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, payload);

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully created article.', success: true, errors: {} };
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

  const rawData = parseFormData(formData);
  const validatedFields = BaseArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { imageFile, ...rest } = validatedFields.data;
  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const payload: Partial<Article> & {updatedAt: any, publishedAt: any} = {
      ...rest,
      publishedAt: Timestamp.fromDate(rest.publishedAt),
      updatedAt: serverTimestamp(),
    };

    if (imageFile) {
      const docSnap = await getDoc(articleDocRef);
      if (docSnap.exists() && docSnap.data().imageUrl) {
        await deleteImageFromStorage(docSnap.data().imageUrl);
      }
      payload.imageUrl = await uploadImage(imageFile);
    }

    await updateDoc(articleDocRef, payload);

    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully updated article.', success: true, errors: {} };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(
  id: string
): Promise<{ message: string; success: boolean }> {
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
    revalidatePath(`/blog/${id}`);
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
