'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  publishedAt: z.string().min(1, 'Date is required'),
  featured: z.preprocess((val) => val === 'true', z.boolean()),
});

export type ArticleFormState = {
  message: string;
  errors?: {
    title?: string[];
    excerpt?: string[];
    imageUrl?: string[];
    publishedAt?: string[];
    featured?: string[];
  };
  success?: boolean;
};

export async function createArticle(
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    imageUrl: formData.get('imageUrl'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured'),
  };
  
  const validatedFields = ArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const articlesCollection = collection(db, 'articles');
    await addDoc(articlesCollection, validatedFields.data);
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Article.',
      success: false,
    };
  }

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  revalidatePath('/');
  return { message: 'Successfully created article.', success: true };
}

export async function updateArticle(
  id: string,
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    imageUrl: formData.get('imageUrl'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured'),
  };
  
  const validatedFields = ArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const articleDoc = doc(db, 'articles', id);
    await updateDoc(articleDoc, validatedFields.data);
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Update Article.',
      success: false,
    };
  }

  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  revalidatePath('/');
  return { message: 'Successfully updated article.', success: true };
}

export async function deleteArticle(id: string): Promise<{ message: string, success: boolean }> {
  try {
    const articleDoc = doc(db, 'articles', id);
    await deleteDoc(articleDoc);
    revalidatePath('/admin/articles');
    revalidatePath('/blog');
    revalidatePath('/');
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Article.',
      success: false,
    };
  }
}
