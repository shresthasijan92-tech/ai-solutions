'use server';

import { revalidatePath } from 'next/cache';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { z } from 'zod';
import type { Article } from '../definitions';

const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  publishedAt: z.date(),
  imageUrl: z.string().url('A valid image URL is required.'),
  featured: z.boolean().default(false),
});

export type ArticleFormState = {
  message: string;
  success: boolean;
  errors?: z.ZodError<z.infer<typeof ArticleSchema>>['formErrors']['fieldErrors'];
};

type ArticleData = z.infer<typeof ArticleSchema>;

function revalidateArticlePaths(id?: string) {
  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  if (id) revalidatePath(`/blog/${id}`);
  revalidatePath('/');
}

export async function createArticle(data: ArticleData): Promise<ArticleFormState> {
  const validatedFields = ArticleSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const payload = {
      ...validatedFields.data,
      publishedAt: Timestamp.fromDate(validatedFields.data.publishedAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(firestore, 'articles'), payload);

    revalidateArticlePaths();
    return { message: 'Successfully created article.', success: true };
  } catch (error) {
    console.error('Create Article Error:', error);
    return { message: 'Failed to create article.', success: false };
  }
}

export async function updateArticle(id: string, data: ArticleData): Promise<ArticleFormState> {
  if (!id) return { message: 'Failed to update article: Missing ID.', success: false };

  const validatedFields = ArticleSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  try {
    const payload = {
      ...validatedFields.data,
      publishedAt: Timestamp.fromDate(validatedFields.data.publishedAt),
      updatedAt: serverTimestamp(),
    };

    const articleDocRef = doc(firestore, 'articles', id);
    await updateDoc(articleDocRef, payload);

    revalidateArticlePaths(id);
    return { message: 'Successfully updated article.', success: true };
  } catch (error) {
    console.error('Update Article Error:', error);
    return { message: 'Failed to update article.', success: false };
  }
}

export async function deleteArticle(id: string): Promise<{ message: string; success: boolean }> {
  if (!id) return { message: 'Failed to delete article: Missing ID.', success: false };
  try {
    await deleteDoc(doc(firestore, 'articles', id));
    revalidateArticlePaths(id);
    return { message: 'Successfully deleted article.', success: true };
  } catch (error) {
    console.error('Delete Article Error:', error);
    return { message: 'Failed to delete article.', success: false };
  }
}
