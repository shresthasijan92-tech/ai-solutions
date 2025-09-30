
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { firestore } from '@/firebase/server';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// --- Zod Schema for Validation ---
const ArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Full article content is required.'),
  publishedAt: z.coerce.date(),
  featured: z.boolean(),
  imageUrl: z.string().url('Please enter a valid URL for the article image.'),
});

export type ArticleFormState = {
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ArticleSchema>, string[]>>;
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

// --- Reusable Revalidation ---
function revalidateArticlePaths(id?: string) {
  revalidatePath('/admin/articles');
  revalidatePath('/blog');
  if (id) revalidatePath(`/blog/${id}`);
  revalidatePath('/');
}

// --- Server Actions ---
export async function createArticle(prevState: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const rawData = parseFormData(formData);
  const validatedFields = ArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to create article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { publishedAt, ...data } = validatedFields.data;

  try {
    await addDoc(collection(firestore, 'articles'), {
      ...data,
      publishedAt: Timestamp.fromDate(publishedAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

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

  const rawData = parseFormData(formData);
  const validatedFields = ArticleSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Failed to update article. Please check the form.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { publishedAt, ...data } = validatedFields.data;

  try {
    await updateDoc(doc(firestore, 'articles', id), {
      ...data,
      publishedAt: Timestamp.fromDate(publishedAt),
      updatedAt: serverTimestamp(),
    });

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
