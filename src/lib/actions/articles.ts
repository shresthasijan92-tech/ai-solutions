
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getAuthenticatedAdmin } from '../auth';

// --- Zod Schema for Validation ---
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

// --- Helper Function ---
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
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to create an article.', success: false };
  }

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
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to update an article.', success: false };
  }
  
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
    const { publishedAt, ...rest } = validatedFields.data;

    await updateDoc(articleDocRef, {
      ...rest,
      publishedAt: Timestamp.fromDate(publishedAt),
      updatedAt: serverTimestamp(),
    });

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
  try {
    await getAuthenticatedAdmin();
  } catch (e) {
    return { message: 'Unauthorized: You must be logged in to delete an article.', success: false };
  }

  if (!id) {
    return { message: 'Failed to delete article: Missing ID.', success: false };
  }
  try {
    const articleDocRef = doc(firestore, 'articles', id);
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
