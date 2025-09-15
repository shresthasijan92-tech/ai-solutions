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
  Timestamp,
} from 'firebase/firestore';
import { type Article } from '@/lib/definitions';

const ArticleActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  imageUrl: z.string().min(1, 'Image is required'),
  publishedAt: z.date(),
  featured: z.boolean(),
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
  data: unknown
): Promise<ArticleFormState> {
  const validatedFields = ArticleActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const articlesCollection = collection(db, 'articles');
    await addDoc(articlesCollection, {
      ...validatedFields.data,
      // Convert JS Date to Firestore Timestamp for server-side consistency
      publishedAt: Timestamp.fromDate(validatedFields.data.publishedAt),
    });
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
  data: unknown
): Promise<ArticleFormState> {
  const validatedFields = ArticleActionSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const articleDoc = doc(db, 'articles', id);
    await updateDoc(articleDoc, {
        ...validatedFields.data,
        publishedAt: Timestamp.fromDate(validatedFields.data.publishedAt),
    });
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
