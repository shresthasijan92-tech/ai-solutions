
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
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

// --- Zod Schemas for Validation ---
const ArticleFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.coerce.date(),
  featured: z.boolean(),
  imageUrl: z.string().url('Please enter a valid URL for the image.'),
});

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleFormSchema>, string[]>>;
  success: boolean;
};

// --- Helper Functions ---
function parseFormData(formData: FormData) {
  return {
    title: formData.get('title'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    publishedAt: formData.get('publishedAt'),
    featured: formData.get('featured') === 'on',
    imageUrl: formData.get('imageUrl'),
  };
}

// --- Server Actions ---
export async function createArticle(
  prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = ArticleFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { publishedAt, ...rest } = validatedFields.data;

  try {
    const articlesCollection = collection(firestore, 'articles');
    await addDoc(articlesCollection, {
      ...rest,
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

  const rawData = parseFormData(formData);
  const validatedFields = ArticleFormSchema.safeParse(rawData);
  
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

    const { publishedAt, ...rest } = validatedFields.data;
    
    const payload: Omit<Partial<Article>, 'id' | 'publishedAt'> & { updatedAt: any, publishedAt: Timestamp } = {
        ...rest,
        publishedAt: Timestamp.fromDate(publishedAt),
        updatedAt: serverTimestamp(),
    };
    
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
    // No need to delete from storage as we are using URLs now.
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
