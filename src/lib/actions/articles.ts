'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.string().transform((str) => new Date(str)),
  imageUrl: z.string().url('Invalid URL').min(1, 'Image URL is required'),
  featured: z.preprocess((val) => val === 'on', z.boolean()),
});

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleSchema>, string[]>>;
  success: boolean;
};

function revalidateArticlePaths(id?: string) {
  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  if (id) revalidatePath(`/blog/${id}`);
  revalidatePath('/');
}

export async function createArticle(prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const validatedFields = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { publishedAt, ...data } = validatedFields.data;

  try {
    const payload = {
      ...data,
      publishedAt: Timestamp.fromDate(publishedAt),
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

export async function updateArticle(prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Failed to update article: Missing ID.', success: false };

  const validatedFields = ArticleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { publishedAt, ...data } = validatedFields.data;
  const articleDocRef = doc(firestore, 'articles', id);

  try {
    const payload = {
      ...data,
      publishedAt: Timestamp.fromDate(publishedAt),
      updatedAt: serverTimestamp(),
    };

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
